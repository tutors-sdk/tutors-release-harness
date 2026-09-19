import { describe, expect, it } from "vitest";
import { QUAY_IMAGE_TEMPLATE, imagesFor } from "../src/image-ref.ts";
import { DEFAULT_COSIGN_IDENTITY, DEFAULT_COSIGN_ISSUER, EXIT_CANNOT_JUDGE, ImageTrustError, ensureImages, memoryLedger, registryDigest, resolveSideProvenance, trustPolicyFromEnv, type Exec, type ExecResult, type TrustPolicy } from "../src/images.ts";

/**
 * A pretend Docker daemon, registry, cosign and build script behind the
 * injected runner. Nothing in this file starts a process.
 */
interface FakeImage {
  id: string;
  repoDigests: string[];
  labels: Record<string, string>;
}

const digestOf = (n: number) => `sha256:${String(n).repeat(64).slice(0, 64)}`;

function world(init: { local?: Record<string, FakeImage>; registry?: Record<string, FakeImage>; signed?: string[]; cosign?: "installed" | "missing"; refs?: Record<string, string>; containerdStore?: boolean; cosignVersion?: string } = {}) {
  const local = new Map(Object.entries(init.local ?? {}));
  const registry = new Map(Object.entries(init.registry ?? {}));
  const signed = new Set(init.signed ?? []);
  const calls: string[] = [];
  const ok = (stdout = ""): ExecResult => ({ status: 0, stdout, stderr: "" });
  const no = (stderr: string, status = 1): ExecResult => ({ status, stdout: "", stderr });

  const exec: Exec = (cmd, args, opts) => {
    calls.push([cmd, ...args].join(" "));
    if (cmd === "docker" && args[0] === "image" && args[1] === "inspect") {
      const image = local.get(args.at(-1)!);
      return image ? ok(JSON.stringify({ Id: image.id, RepoDigests: image.repoDigests, Config: { Labels: image.labels } })) : no("No such image");
    }
    if (cmd === "docker" && args[0] === "pull") {
      const ref = args.at(-1)!;
      const image = registry.get(ref);
      if (!image) return no(`manifest for ${ref} not found: manifest unknown`);
      local.set(ref, image);
      return ok();
    }
    if (cmd === "cosign") {
      if (init.cosign === "missing") return { status: null, stdout: "", stderr: "", error: Object.assign(new Error("spawnSync cosign ENOENT"), { code: "ENOENT" }) };
      if (args[0] === "version") return ok(`GitVersion:    v${init.cosignVersion ?? "3.0.6"}
GitCommit:     abc
`);
      expect(args.slice(0, 5)).toEqual(["verify", "--certificate-identity-regexp", expect.any(String), "--certificate-oidc-issuer", expect.any(String)]);
      return signed.has(`${args[2]}|${args[4]}|${args.at(-1)}`) ? ok("[]") : no("Error: no matching signatures: none of the expected identities matched what was in the certificate");
    }
    if (cmd === "bash" && args[0] === "scripts/build-images.sh") {
      const [, gitRef, tag] = args as [string, string, string];
      const sha = init.refs?.[gitRef];
      if (!sha) return no(`fatal: couldn't find remote ref ${gitRef}`, 128);
      const built = imagesFor(tag, opts!.env!.HARNESS_IMAGE_PREFIX!);
      for (const [app, ref] of Object.entries(built)) local.set(ref, { id: `sha256:built-${app}-${sha}`, repoDigests: init.containerdStore ? [`${ref.slice(0, ref.lastIndexOf(":"))}@${digestOf(9)}`] : [], labels: { "org.opencontainers.image.revision": sha, "org.opencontainers.image.version": tag } });
      return ok();
    }
    throw new Error(`unexpected command: ${cmd} ${args.join(" ")}`);
  };
  return { exec, calls, local };
}

const policy: TrustPolicy = { identity: DEFAULT_COSIGN_IDENTITY, issuer: DEFAULT_COSIGN_ISSUER, allowUnsigned: false };
const signature = (repo: string, digest: string, p: TrustPolicy = policy) => `${p.identity}|${p.issuer}|${repo}@${digest}`;

/** The three Quay images at one tag, as the monorepo's image-build workflow publishes them. */
function published(tag: string, base: number, revision = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b") {
  const images = imagesFor(tag, QUAY_IMAGE_TEMPLATE);
  const registry: Record<string, FakeImage> = {};
  const signed: string[] = [];
  Object.values(images).forEach((ref, i) => {
    const repo = ref.slice(0, ref.lastIndexOf(":"));
    const digest = digestOf(base + i);
    registry[ref] = { id: `sha256:id-${base + i}`, repoDigests: [`${repo}@${digest}`], labels: { "org.opencontainers.image.revision": revision, "org.opencontainers.image.version": tag, "org.opencontainers.image.created": "2026-09-01T10:00:00Z" } };
    signed.push(signature(repo, digest));
  });
  return { images, registry, signed };
}

const quiet = () => undefined;

describe("images ensure", () => {
  it("pulls a registry tag, verifies every image by digest against the workflow identity, and records pulled+verified", () => {
    const pub = published("16.2.0", 1);
    const w = world({ registry: pub.registry, signed: pub.signed });
    const ledger = memoryLedger();
    const result = ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, log: quiet });

    expect(result).toMatchObject({ ok: true, exitCode: 0, problems: [] });
    expect(result.sides[0]!.provenance!.summary).toBe("pulled+verified");
    const reader = result.sides[0]!.provenance!.images.reader;
    expect(reader).toMatchObject({ provenance: "pulled+verified", digest: digestOf(1), revision: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", version: "16.2.0", verifiedIdentity: DEFAULT_COSIGN_IDENTITY });

    const verifies = w.calls.filter((c) => c.startsWith("cosign verify"));
    expect(verifies).toHaveLength(3);
    // By digest, never by tag; the identity and the GitHub OIDC issuer are pinned.
    expect(verifies[0]).toBe(`cosign verify --certificate-identity-regexp ${DEFAULT_COSIGN_IDENTITY} --certificate-oidc-issuer https://token.actions.githubusercontent.com quay.io/tutors-sdk/tutors-reader@${digestOf(1)}`);
    expect(ledger.read()["quay.io/tutors-sdk/tutors-reader:16.2.0"]).toMatchObject({ provenance: "pulled+verified", digest: digestOf(1) });
  });

  it("the default identity is the monorepo's image-build workflow and nothing else", () => {
    const re = new RegExp(DEFAULT_COSIGN_IDENTITY);
    expect(re.test("https://github.com/tutors-sdk/tutors-mono-repo/.github/workflows/image-build.yml@refs/tags/v16.2.0")).toBe(true);
    expect(re.test("https://github.com/tutors-sdk/tutors-mono-repo/.github/workflows/other.yml@refs/heads/main")).toBe(false);
    expect(re.test("https://github.com/someone/tutors-mono-repo/.github/workflows/image-build.yml@refs/heads/main")).toBe(false);
    expect(re.test("https://github.com/tutors-sdk/tutors-mono-repo/.github/workflows/image-buildXyml@x")).toBe(false);
  });

  it("an unsigned registry image is exit 2 with the reason, and is not recorded as usable", () => {
    const pub = published("16.2.0", 1);
    const w = world({ registry: pub.registry, signed: pub.signed.slice(1) });
    const ledger = memoryLedger();
    const result = ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, log: quiet });
    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(EXIT_CANNOT_JUDGE);
    expect(EXIT_CANNOT_JUDGE).toBe(2);
    expect(result.problems.join("\n")).toMatch(/tutors-reader:16\.2\.0: no valid signature for quay\.io\/tutors-sdk\/tutors-reader@sha256:1{64}.*no matching signatures/);
    expect(result.problems.join("\n")).toMatch(/--allow-unsigned/);
    expect(ledger.read()["quay.io/tutors-sdk/tutors-reader:16.2.0"]).toBeUndefined();
  });

  it("an image signed by another identity is refused: the identity is part of the check", () => {
    const pub = published("16.2.0", 1);
    const other: TrustPolicy = { ...policy, identity: "^https://github.com/someone-else/" };
    const w = world({ registry: pub.registry, signed: Object.values(pub.registry).map((i) => `${other.identity}|${other.issuer}|${i.repoDigests[0]}`) });
    expect(ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, log: quiet }).exitCode).toBe(2);
    // …and HARNESS_COSIGN_IDENTITY / HARNESS_COSIGN_ISSUER change who must have signed.
    const overridden = trustPolicyFromEnv({ HARNESS_COSIGN_IDENTITY: other.identity });
    expect(overridden).toEqual({ identity: other.identity, issuer: DEFAULT_COSIGN_ISSUER, allowUnsigned: false });
    expect(ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy: overridden, log: quiet }).exitCode).toBe(0);
    expect(trustPolicyFromEnv({ HARNESS_COSIGN_ISSUER: "https://issuer.example" }).issuer).toBe("https://issuer.example");
  });

  it("cosign missing is exit 2 and says so", () => {
    const pub = published("16.2.0", 1);
    const w = world({ registry: pub.registry, signed: pub.signed, cosign: "missing" });
    const result = ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(result.exitCode).toBe(2);
    expect(result.problems[0]).toMatch(/cosign is not installed/);
  });

  it("a cosign older than 3 cannot read the signatures: the refusal says that, not just 'unsigned'", () => {
    const pub = published("16.2.0", 1);
    const w = world({ registry: pub.registry, signed: [], cosignVersion: "2.4.1" });
    const result = ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(result.exitCode).toBe(2);
    expect(result.problems[0]).toMatch(/this is cosign 2\.4\.1: .* needs cosign >= 3/);
    const current = world({ registry: pub.registry, signed: [] });
    expect(ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: current.exec, ledger: memoryLedger(), policy, log: quiet }).problems[0]).not.toMatch(/needs cosign/);
  });

  it("--allow-unsigned judges anyway, loudly, and the provenance says pulled-unverified with the reason", () => {
    const pub = published("16.2.0", 1);
    const w = world({ registry: pub.registry, signed: [] });
    const lines: string[] = [];
    const result = ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger: memoryLedger(), policy: trustPolicyFromEnv({}, true), log: (m) => lines.push(m) });
    expect(result.exitCode).toBe(0);
    const side = result.sides[0]!.provenance!;
    expect(side.summary).toBe("pulled-unverified");
    expect(side.allowedUnsigned).toBe(true);
    expect(side.images.live.unverifiedReason).toMatch(/no valid signature/);
    expect(lines.filter((l) => l.includes("WARNING")).length).toBeGreaterThanOrEqual(4);
    expect(trustPolicyFromEnv({ HARNESS_ALLOW_UNSIGNED: "1" }).allowUnsigned).toBe(true);
    expect(trustPolicyFromEnv({ HARNESS_ALLOW_UNSIGNED: "0" }).allowUnsigned).toBe(false);
  });

  it("local images are used as they are: never pulled, never verified, recorded as local", () => {
    const images = imagesFor("local", "tutors");
    const w = world({ local: Object.fromEntries(Object.values(images).map((ref, i) => [ref, { id: `sha256:l${i}`, repoDigests: [], labels: {} }])) });
    const result = ensureImages([{ spec: "local" }, { spec: "local" }], "tutors", { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(result.exitCode).toBe(0);
    expect(result.sides).toHaveLength(1);
    expect(result.sides[0]!.provenance!.summary).toBe("local (unverified)");
    expect(result.sides[0]!.provenance!.images.reader.provenance).toBe("local");
    expect(w.calls.some((c) => c.startsWith("docker pull") || c.startsWith("cosign"))).toBe(false);
  });

  it("a name without a registry host is never pulled (it would be whoever owns that namespace on Docker Hub); it is built", () => {
    const w = world({ refs: { "v16.2.0": "abcdef0123456789abcdef0123456789abcdef01" } });
    const result = ensureImages([{ spec: "16.2.0" }], "tutors", { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(result.exitCode).toBe(0);
    expect(w.calls.some((c) => c.startsWith("docker pull"))).toBe(false);
    expect(result.sides[0]!.provenance!.summary).toBe("built-from-ref v16.2.0@abcdef012345");
  });

  it("falls back to building from the monorepo ref when the registry lacks the tag, loudly, and records ref and sha", () => {
    const w = world({ refs: { "release/16.3.0-rc.1": "0123456789abcdef0123456789abcdef01234567" } });
    const lines: string[] = [];
    const ledger = memoryLedger();
    const result = ensureImages([{ spec: "16.3.0-rc.1" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, log: (m) => lines.push(m) });
    expect(result.exitCode).toBe(0);
    expect(w.calls.filter((c) => c.startsWith("bash"))).toEqual(["bash scripts/build-images.sh v16.3.0-rc.1 16.3.0-rc.1", "bash scripts/build-images.sh 16.3.0-rc.1 16.3.0-rc.1", "bash scripts/build-images.sh release/16.3.0-rc.1 16.3.0-rc.1"]);
    expect(lines.some((l) => l.includes("BUILDING FROM SOURCE"))).toBe(true);
    const reader = result.sides[0]!.provenance!.images.reader;
    expect(reader).toMatchObject({ ref: "quay.io/tutors-sdk/tutors-reader:16.3.0-rc.1", provenance: "built-from-ref", builtFrom: { ref: "release/16.3.0-rc.1", sha: "0123456789abcdef0123456789abcdef01234567" }, revision: "0123456789abcdef0123456789abcdef01234567" });
    expect(reader.digest).toBeUndefined();
    // A locally built image is not a registry image: cosign is never asked about it.
    expect(w.calls.some((c) => c.startsWith("cosign"))).toBe(false);
  });

  it("Docker's containerd image store gives local builds a RepoDigest: a build is still not asked for a signature, and shows no registry digest", () => {
    const w = world({ refs: { "v16.2.0": "a".repeat(40) }, containerdStore: true });
    const ledger = memoryLedger();
    const result = ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: w.exec, ledger, policy, log: quiet });
    expect(result.exitCode).toBe(0);
    expect(result.sides[0]!.provenance!.summary).toBe(`built-from-ref v16.2.0@${"a".repeat(12)}`);
    expect(result.sides[0]!.provenance!.images.reader.digest).toBeUndefined();
    expect(w.calls.some((c) => c.startsWith("cosign"))).toBe(false);
    // The same at run time, from the ledger…
    expect(resolveSideProvenance(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE), { exec: w.exec, ledger, policy, log: quiet }).summary).toMatch(/^built-from-ref/);
    // …but without that record, a registry-named image with a digest is taken for a pull, and refused.
    expect(() => resolveSideProvenance(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE), { exec: w.exec, ledger: memoryLedger(), policy, log: quiet })).toThrow(/no valid signature/);

    const local = imagesFor("local", "tutors");
    const store = world({ local: Object.fromEntries(Object.values(local).map((ref, i) => [ref, { id: `sha256:c${i}`, repoDigests: [`${ref.split(":")[0]}@${digestOf(i + 1)}`], labels: {} }])) });
    const side = resolveSideProvenance(local, { exec: store.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(side.summary).toBe("local (unverified)");
    expect(side.images.reader.digest).toBeUndefined();
  });

  it("--ref-a names the ref; a ref that does not exist is exit 2", () => {
    const w = world({ refs: { main: "f".repeat(40) } });
    expect(ensureImages([{ spec: "16.2.0", ref: "main" }], "tutors", { exec: w.exec, ledger: memoryLedger(), policy, log: quiet }).sides[0]!.provenance!.summary).toBe(`built-from-ref main@${"f".repeat(12)}`);
    const failed = ensureImages([{ spec: "16.9.9", ref: "nope" }], "tutors", { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(failed.exitCode).toBe(2);
    expect(failed.problems[0]).toMatch(/could not be built from any of nope/);
  });

  it("digest-pinned per-app references are pulled by digest, verified, and cannot fall back to a build", () => {
    const repos = ["reader", "catalogue", "live"].map((app) => `quay.io/tutors-sdk/tutors-${app}`);
    const registry = Object.fromEntries(repos.map((repo, i) => [`${repo}@${digestOf(i + 4)}`, { id: `sha256:p${i}`, repoDigests: [`${repo}@${digestOf(i + 4)}`], labels: { "org.opencontainers.image.version": "16.2.0" } }]));
    const spec = `reader=${repos[0]}:16.2.0@${digestOf(4)},catalogue=${repos[1]}@${digestOf(5)},live=${repos[2]}@${digestOf(6)}`;
    const w = world({ registry, signed: repos.map((repo, i) => signature(repo, digestOf(i + 4))) });
    const result = ensureImages([{ spec }], "tutors", { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(result.exitCode).toBe(0);
    expect(w.calls).toContain(`docker pull --quiet ${repos[0]}@${digestOf(4)}`);
    expect(result.sides[0]!.provenance!.images.reader).toMatchObject({ ref: `${repos[0]}:16.2.0@${digestOf(4)}`, digest: digestOf(4), provenance: "pulled+verified" });

    const absent = ensureImages([{ spec }], "tutors", { exec: world().exec, ledger: memoryLedger(), policy, log: quiet });
    expect(absent.exitCode).toBe(2);
    expect(absent.problems[0]).toMatch(/not a bare tag, so it cannot be built/);
  });

  it("a malformed spec is a problem with exit 2, not a crash", () => {
    const result = ensureImages([{ spec: `16.2.0@${digestOf(1)}` }], QUAY_IMAGE_TEMPLATE, { exec: world().exec, ledger: memoryLedger(), policy, log: quiet });
    expect(result.exitCode).toBe(2);
    expect(result.problems[0]).toMatch(/three digests/);
  });
});

describe("what run does before a stack starts", () => {
  it("an image that is not there is refused: compose must never pull it unverified behind the harness's back", () => {
    expect(() => resolveSideProvenance(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE), { exec: world().exec, ledger: memoryLedger(), policy, log: quiet })).toThrow(ImageTrustError);
    try {
      resolveSideProvenance(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE), { exec: world().exec, ledger: memoryLedger(), policy, log: quiet });
    } catch (e) {
      expect((e as ImageTrustError).exitCode).toBe(2);
      expect((e as Error).message).toMatch(/run `harness images ensure` first/);
    }
  });

  it("an image someone pulled by hand is verified then, not trusted because it is present", () => {
    const pub = published("16.2.0", 1);
    const unsignedWorld = world({ local: pub.registry, signed: [] });
    expect(() => resolveSideProvenance(pub.images, { exec: unsignedWorld.exec, ledger: memoryLedger(), policy, log: quiet })).toThrow(/no valid signature/);
    const signedWorld = world({ local: pub.registry, signed: pub.signed });
    expect(resolveSideProvenance(pub.images, { exec: signedWorld.exec, ledger: memoryLedger(), policy, log: quiet }).summary).toBe("pulled+verified");
  });

  it("a verification on record is reused only while the local image is the same image", () => {
    const pub = published("16.2.0", 1);
    const ledger = memoryLedger();
    const first = world({ registry: pub.registry, signed: pub.signed });
    ensureImages([{ spec: "16.2.0" }], QUAY_IMAGE_TEMPLATE, { exec: first.exec, ledger, policy, log: quiet });

    const same = world({ local: pub.registry, signed: [] });
    expect(resolveSideProvenance(pub.images, { exec: same.exec, ledger, policy, log: quiet }).summary).toBe("pulled+verified");
    expect(same.calls.some((c) => c.startsWith("cosign"))).toBe(false);

    // The tag now points at other content: the record no longer applies, and it is unsigned.
    const moved = published("16.2.0", 7);
    const other = world({ local: moved.registry, signed: [] });
    expect(() => resolveSideProvenance(moved.images, { exec: other.exec, ledger, policy, log: quiet })).toThrow(/no valid signature/);
  });

  it("a mutant on a verified base is a mixed side, spelled out per app", () => {
    const pub = published("16.2.0", 1);
    const mutant = "tutors-harness/mutant-route-500:latest";
    const w = world({ local: { ...pub.registry, [mutant]: { id: "sha256:m", repoDigests: [], labels: { "org.opencontainers.image.revision": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" } } }, signed: pub.signed });
    const side = resolveSideProvenance({ ...pub.images, reader: mutant }, { exec: w.exec, ledger: memoryLedger(), policy, log: quiet });
    expect(side.summary).toBe("reader: local (unverified); catalogue: pulled+verified; live: pulled+verified");
    expect(side.images.reader.revision).toBe("1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b");
  });

  it("only a digest recorded against the same repository counts", () => {
    expect(registryDigest("quay.io/a/b:1", [`quay.io/other/b@${digestOf(1)}`, `quay.io/a/b@${digestOf(2)}`])).toBe(digestOf(2));
    expect(registryDigest("quay.io/a/b:1", [`quay.io/other/b@${digestOf(1)}`])).toBeUndefined();
    expect(registryDigest(`quay.io/a/b@${digestOf(3)}`, [`quay.io/a/b@${digestOf(2)}`])).toBeUndefined();
  });
});
