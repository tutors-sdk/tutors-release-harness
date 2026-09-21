import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CACHE_MANIFEST, CACHE_TAR, classifyPullFailure, readManifest, type CacheManifest } from "../src/image-cache.ts";
import { QUAY_IMAGE_TEMPLATE, imagesFor } from "../src/image-ref.ts";
import { DEFAULT_COSIGN_IDENTITY, DEFAULT_COSIGN_ISSUER, ensureImages, memoryLedger, resolveSideProvenance, type Exec, type ExecResult, type TrustPolicy } from "../src/images.ts";
import { evidenceGaps } from "../src/run.ts";
import { capture } from "./support/captures.ts";

/**
 * A pretend Docker daemon and registry that can be up or down, with `docker
 * save` / `load` / `tag` and cosign, behind the injected runner. Nothing here
 * starts a process.
 */
interface Img {
  id: string;
  repoDigests: string[];
}
const digestOf = (n: number) => `sha256:${String(n).repeat(64).slice(0, 64)}`;
const ok = (stdout = ""): ExecResult => ({ status: 0, stdout, stderr: "" });
const no = (stderr: string, status = 1): ExecResult => ({ status, stdout: "", stderr });

const policy: TrustPolicy = { identity: DEFAULT_COSIGN_IDENTITY, issuer: DEFAULT_COSIGN_ISSUER, allowUnsigned: false };
const TAG = "16.2.0";
const IMAGES = imagesFor(TAG, QUAY_IMAGE_TEMPLATE);

function registryOf(base: number): Record<string, Img> {
  return Object.fromEntries(Object.values(IMAGES).map((ref, i) => [ref, { id: `sha256:id-${base + i}`, repoDigests: [`${ref.slice(0, ref.lastIndexOf(":"))}@${digestOf(base + i)}`] }]));
}

function world(init: { registry: Record<string, Img>; down?: string | false; tarHolds?: Record<string, Img>; failFor?: string[] }) {
  const local = new Map<string, Img>();
  const calls: string[] = [];
  const state = { down: init.down ?? false };
  /** What `docker save` last wrote, so `docker load` can bring it back. */
  let saved: Record<string, Img> | undefined = init.tarHolds;
  const signed = new Set(Object.values(init.registry).flatMap((img) => img.repoDigests));

  const exec: Exec = (cmd, args) => {
    calls.push([cmd, ...args].join(" "));
    if (cmd === "docker" && args[0] === "image" && args[1] === "inspect") {
      const img = local.get(args.at(-1)!);
      return img ? ok(JSON.stringify({ Id: img.id, RepoDigests: img.repoDigests, Config: { Labels: {} } })) : no("No such image");
    }
    if (cmd === "docker" && args[0] === "pull") {
      const ref = args.at(-1)!;
      if (state.down && !init.failFor) return no(state.down);
      if (init.failFor?.includes(ref)) return no(state.down || "dial tcp: i/o timeout");
      const img = init.registry[ref];
      if (!img) return no(`manifest for ${ref} not found: manifest unknown`);
      local.set(ref, img);
      return ok();
    }
    if (cmd === "docker" && args[0] === "save") {
      saved = Object.fromEntries(args.slice(3).map((ref) => [ref, local.get(ref)!]));
      writeFileSync(args[2]!, "tar");
      return ok();
    }
    if (cmd === "docker" && args[0] === "load") {
      if (!saved) return no("open: no such file");
      // Loading retags every image in the tar, displacing anything already under that name.
      for (const [ref, img] of Object.entries(saved)) local.set(ref, img);
      return ok("Loaded image");
    }
    if (cmd === "docker" && args[0] === "tag") {
      const [id, ref] = args.slice(1) as [string, string];
      const img = [...local.values(), ...Object.values(init.registry)].find((i) => i.id === id);
      if (img) local.set(ref, img);
      return ok();
    }
    if (cmd === "cosign") return signed.has(args.at(-1)!) ? ok("[]") : no("Error: no matching signatures");
    if (cmd === "bash" && args[0] === "scripts/build-images.sh") return no("no monorepo here", 128);
    throw new Error(`unexpected command: ${cmd} ${args.join(" ")}`);
  };
  return { exec, calls, local, state, saved: () => saved };
}

const quiet = () => undefined;
const tmp = () => mkdtempSync(join(tmpdir(), "harness-cache-"));
const NOW = new Date("2026-09-16T02:30:00.000Z");
const OUTAGE = "Error response from daemon: toomanyrequests: rate limit exceeded";

describe("a night that pulls: the cache is refreshed from what was verified", () => {
  it("saves exactly the verified images and records their ids, digests and identity", () => {
    const dir = tmp();
    const w = world({ registry: registryOf(1) });
    const r = ensureImages([{ spec: TAG }, { spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, cacheDir: dir, now: () => NOW, log: quiet });
    expect(r.ok).toBe(true);
    expect(r.cache).toBe("refreshed");
    expect(w.calls.filter((c) => c.startsWith("docker save"))).toHaveLength(1);
    expect(w.calls.join("\n")).not.toContain("docker load");
    const manifest = JSON.parse(readFileSync(join(dir, CACHE_MANIFEST), "utf8")) as CacheManifest;
    expect(manifest.savedAt).toBe(NOW.toISOString());
    expect(manifest.images.map((i) => i.ref).sort()).toEqual(Object.values(IMAGES).sort());
    expect(manifest.images[0]).toMatchObject({ verifiedIdentity: DEFAULT_COSIGN_IDENTITY });
    expect(existsSync(join(dir, CACHE_TAR))).toBe(true);
    expect(readManifest(dir)?.images).toHaveLength(3);
  });

  it("never caches an image that was not verified (--allow-unsigned)", () => {
    const dir = tmp();
    const w = world({ registry: registryOf(1) });
    const r = ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: (c, a, o) => (c === "cosign" ? no("Error: no matching signatures") : w.exec(c, a, o)), ledger: memoryLedger(), policy: { ...policy, allowUnsigned: true }, cacheDir: dir, log: quiet });
    expect(r.ok).toBe(true);
    expect(Object.values(r.sides[0]!.provenance!.images).every((i) => i.provenance === "pulled-unverified")).toBe(true);
    expect(r.cache).toBe("none");
    expect(existsSync(join(dir, CACHE_TAR))).toBe(false);
    expect(w.calls.some((c) => c.startsWith("docker save"))).toBe(false);
  });
});

describe("a night the registry is down", () => {
  function preparedCache(dir: string) {
    const first = world({ registry: registryOf(1) });
    ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: first.exec, ledger: memoryLedger(), policy, cacheDir: dir, now: () => NOW, log: quiet });
    return first.saved()!;
  }

  it("falls back to the cache, records provenance cached, does not verify, and does not refresh the cache", () => {
    const dir = tmp();
    const tarHolds = preparedCache(dir);
    const w = world({ registry: registryOf(1), down: OUTAGE, tarHolds });
    const ledger = memoryLedger();
    const logs: string[] = [];
    const r = ensureImages([{ spec: TAG }, { spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, cacheDir: dir, now: () => new Date("2026-09-17T02:30:00.000Z"), log: (m) => logs.push(m) });
    expect(r.ok).toBe(true);
    expect(r.exitCode).toBe(0);
    expect(r.cache).toBe("used");
    for (const app of ["reader", "catalogue", "live"] as const) {
      expect(r.sides[0]!.provenance!.images[app]).toMatchObject({ provenance: "cached", cachedAt: NOW.toISOString(), digest: expect.stringMatching(/^sha256:/) });
    }
    expect(r.sides[0]!.provenance!.summary).toContain("cached");
    expect(logs.join("\n")).toContain("REGISTRY UNREACHABLE");
    expect(logs.join("\n")).toContain("DEGRADED");
    // the registry is down: no signature could be checked, and none was pretended
    expect(w.calls.some((c) => c.startsWith("cosign verify"))).toBe(false);
    expect(w.calls.filter((c) => c.startsWith("docker load"))).toHaveLength(1);
    expect(w.calls.filter((c) => c.startsWith("docker save"))).toHaveLength(0);
  });

  it("such a night's images make a noise run DEGRADED, whatever the diff count", () => {
    const dir = tmp();
    const tarHolds = preparedCache(dir);
    const w = world({ registry: registryOf(1), down: OUTAGE, tarHolds });
    const ledger = memoryLedger();
    ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, cacheDir: dir, log: quiet });
    const provenance = resolveSideProvenance(IMAGES, { exec: w.exec, ledger, policy, log: quiet });
    expect(Object.values(provenance.images).every((i) => i.provenance === "cached")).toBe(true);
    const gaps = evidenceGaps(capture("a", { provenance }), capture("b", { provenance }));
    expect(gaps).toHaveLength(2);
    expect(gaps[0]).toContain("cached");
  });

  it("with no cache it degrades the old way: build from the monorepo ref, or fail; never a silent pass", () => {
    const w = world({ registry: registryOf(1), down: OUTAGE });
    const r = ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, cacheDir: tmp(), log: quiet });
    expect(r.ok).toBe(false);
    expect(r.exitCode).toBe(1);
    expect(r.cache).toBe("none");
    expect(w.calls.some((c) => c.startsWith("bash scripts/build-images.sh"))).toBe(true);
  });

  it("a tag that is simply not in the registry does not borrow another night's cache", () => {
    const dir = tmp();
    const tarHolds = preparedCache(dir);
    const w = world({ registry: {}, tarHolds });
    const r = ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, cacheDir: dir, log: quiet });
    expect(w.calls.some((c) => c.startsWith("docker load"))).toBe(false);
    expect(r.cache).toBe("none");
    expect(r.ok).toBe(false);
  });

  it("a cache whose images no longer have the recorded ids is not used", () => {
    const dir = tmp();
    const tarHolds = preparedCache(dir);
    const swapped = Object.fromEntries(Object.entries(tarHolds).map(([ref, img]) => [ref, { ...img, id: `${img.id}-tampered` }]));
    const w = world({ registry: registryOf(1), down: OUTAGE, tarHolds: swapped });
    const r = ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, cacheDir: dir, log: quiet });
    expect(r.cache).toBe("none");
    expect(r.ok).toBe(false);
  });

  it("when only some images cannot be pulled, the ones pulled fresh stay fresh and the rest come from the cache", () => {
    const dir = tmp();
    const tarHolds = preparedCache(dir);
    // The cache holds last night's images; the registry has moved on to new ones for all three.
    const w = world({ registry: registryOf(50), down: OUTAGE, tarHolds, failFor: [IMAGES.live] });
    const ledger = memoryLedger();
    const r = ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, cacheDir: dir, log: quiet });
    expect(r.ok).toBe(true);
    const images = r.sides[0]!.provenance!.images;
    expect(images.reader.provenance).toBe("pulled+verified");
    expect(images.catalogue.provenance).toBe("pulled+verified");
    expect(images.live.provenance).toBe("cached");
    // `docker load` retagged reader and catalogue to last night's; they were put back.
    expect(w.local.get(IMAGES.reader)!.id).toBe(registryOf(50)[IMAGES.reader]!.id);
    expect(w.calls.some((c) => c.startsWith("docker tag"))).toBe(true);
    expect(r.cache).toBe("used");
  });

  it("the next night the registry answers, a stale cached entry does not stick: it is pulled and verified again", () => {
    const dir = tmp();
    const tarHolds = preparedCache(dir);
    const ledger = memoryLedger();
    const down = world({ registry: registryOf(1), down: OUTAGE, tarHolds });
    ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: down.exec, ledger, policy, cacheDir: dir, log: quiet });
    expect(Object.values(ledger.read()).every((e) => e.provenance === "cached")).toBe(true);
    // Same machine, same local images (a persistent runner), the registry is back and serves the same content.
    const up = world({ registry: registryOf(1) });
    for (const [ref, img] of down.local) up.local.set(ref, img);
    const r = ensureImages([{ spec: TAG }], QUAY_IMAGE_TEMPLATE, { exec: up.exec, ledger, policy, cacheDir: dir, log: quiet });
    expect(up.calls.filter((c) => c.startsWith("docker pull"))).toHaveLength(3);
    expect(Object.values(r.sides[0]!.provenance!.images).every((i) => i.provenance === "pulled+verified")).toBe(true);
    expect(r.cache).toBe("refreshed");
  });
});

describe("classifyPullFailure", () => {
  it("separates 'the registry could not answer' from 'there is no such tag'", () => {
    const unreachable = [OUTAGE, "Get https://quay.io/v2/: net/http: request canceled (Client.Timeout exceeded while awaiting headers)", "dial tcp: lookup quay.io: no such host", "received unexpected HTTP status: 503 Service Unavailable", "connection reset by peer", "some error nobody has seen before"];
    const absent = ["manifest for quay.io/tutors-sdk/tutors-reader:9.9.9 not found: manifest unknown", "Error response from daemon: pull access denied for quay.io/x, repository does not exist"];
    for (const text of unreachable) expect(classifyPullFailure(text), text).toBe("unreachable");
    for (const text of absent) expect(classifyPullFailure(text), text).toBe("absent");
  });
});
