/**
 * Static image artefacts (R5): the image manifest, the SBOM and the
 * vulnerability list. TESTING.md's three tests for every engine: A/A clean, a
 * planted change caught, a change it must not flag. Collection runs through a
 * fake docker, cosign, syft and grype; nothing here starts a process.
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Ajv } from "ajv";
import { afterEach, describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { parseClaims } from "../src/claims/schema.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { diffManifest, diffSbom, diffVulns, imageStatic } from "../src/compare/image-static.ts";
import { collectImageStatic, staticPolicyFromEnv } from "../src/image-static/collect.ts";
import { splitCommand, type TempFiles } from "../src/image-static/command.ts";
import { collectManifest, runsAsRoot } from "../src/image-static/manifest.ts";
import { packagesFromSpdx, spdxFromAttestations } from "../src/image-static/sbom.ts";
import { parseScannerOutput, scannerEnv } from "../src/image-static/vulns.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import { trustPolicyFromEnv } from "../src/images.ts";
import type { Hunk, RunReport, SideProvenance } from "../src/types.ts";
import { D, envelope, fakeTools, grype, manifest, provenance, spdx, staticSide, vulns, withStatic } from "./support/image-static.ts";
import { capture, clone } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: ReturnType<typeof withStatic>, b: ReturnType<typeof withStatic>): Hunk[] => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const staticHunks = (hunks: Hunk[]) => hunks.filter((h) => ["image-manifest", "sbom", "vulns"].includes(h.artefact));
const scopes = (hunks: Hunk[]) => hunks.map((h) => `${h.artefact}:${h.scope}:${h.severity}`).sort();

afterEach(() => {
  delete process.env.HARNESS_REQUIRE_STATIC;
});

// ---- the whole engine: A/A ---------------------------------------------------------------------------

describe("A/A", () => {
  it("two sides with identical static artefacts produce no hunks at all", () => {
    expect(staticHunks(diff(withStatic("a", staticSide()), withStatic("b", staticSide())))).toEqual([]);
  });

  it("a side that carries no static artefacts (an external side, migration mode, an old capture) is not compared, and says nothing", () => {
    expect(imageStatic(capture("a"), withStatic("b", staticSide()), { config: masks })).toEqual([]);
    expect(imageStatic(withStatic("a", staticSide()), capture("b"), { config: masks })).toEqual([]);
  });
});

// ---- image-manifest --------------------------------------------------------------------------------------

describe("image-manifest engine", () => {
  const one = (over: Parameters<typeof manifest>[0]) => diffManifest("reader", manifest(), manifest({ ...over }));

  it("catches a different base image: by the lowest layer, and by the base digest label when the build recorded it", () => {
    expect(scopes(one({ bottomLayer: D("e") }))).toEqual(["image-manifest:reader/base:fail"]);
    const withLabel = manifest({ baseDigest: D(1), baseName: "node:22-bookworm-slim" });
    const bumped = diffManifest("reader", withLabel, manifest({ baseDigest: D(2), baseName: "node:22-bookworm-slim" }));
    expect(scopes(bumped)).toEqual(["image-manifest:reader/base:fail"]);
    expect(bumped[0]!.summary).toMatch(/different base image/);
  });

  it("catches a new root user, a changed user, a new port, a dropped port, entrypoint, cmd, layer count, platform", () => {
    expect(one({ user: "" }).map((h) => [h.scope, h.severity, h.summary])).toEqual([["reader/user", "fail", expect.stringMatching(/now runs as root/)]]);
    expect(one({ user: "0:0" })[0]!.summary).toMatch(/now runs as root/);
    expect(scopes(one({ user: "1002" }))).toEqual(["image-manifest:reader/user:fail"]);
    expect(scopes(one({ ports: ["3000/tcp", "9229/tcp"] }))).toEqual(["image-manifest:reader/ports/9229/tcp:fail"]);
    expect(scopes(one({ ports: [] }))).toEqual(["image-manifest:reader/ports/3000/tcp:fail"]);
    expect(scopes(one({ entrypoint: ["/sbin/tini", "--"] }))).toEqual(["image-manifest:reader/entrypoint:fail"]);
    expect(scopes(one({ cmd: ["node", "server.js"] }))).toEqual(["image-manifest:reader/cmd:fail"]);
    expect(scopes(one({ layers: 10 }))).toEqual(["image-manifest:reader/layers:fail"]);
    expect(scopes(one({ arch: "arm64" }))).toEqual(["image-manifest:reader/platform:fail"]);
  });

  it("catches a grown image and a changed, added or removed OCI label", () => {
    expect(scopes(one({ size: 260 * 1024 * 1024 }))).toEqual(["image-manifest:reader/size:fail"]);
    const labels = { ...manifest().labels };
    expect(scopes(one({ labels: { ...labels, "org.opencontainers.image.source": "https://example.com/fork" } }))).toEqual(["image-manifest:reader/label/org.opencontainers.image.source:fail"]);
    expect(scopes(one({ labels: { ...labels, "org.opencontainers.image.licenses": "MIT" } }))).toEqual(["image-manifest:reader/label/org.opencontainers.image.licenses:fail"]);
    const { "org.opencontainers.image.source": _gone, ...rest } = labels;
    expect(scopes(one({ labels: rest }))).toEqual(["image-manifest:reader/label/org.opencontainers.image.source:fail"]);
  });

  it("must not flag what changes on every build: revision, version, created; nor a small size change; nor no longer being root as a failure", () => {
    const labels = { ...manifest().labels, "org.opencontainers.image.revision": "bbbb", "org.opencontainers.image.version": "16.3.0", "org.opencontainers.image.created": "2026-09-20T10:00:00Z" };
    expect(one({ labels })).toEqual([]);
    expect(one({ size: 202 * 1024 * 1024 })).toEqual([]);
    expect(diffManifest("reader", manifest({ size: 20 * 1024 * 1024 }), manifest({ size: 24 * 1024 * 1024 }))).toEqual([]); // 20x in relative terms, under 5 MB in absolute
    expect(diffManifest("reader", manifest({ user: "root" }), manifest({ user: "1001" })).map((h) => h.severity)).toEqual(["info"]);
    expect(one({ size: 100 * 1024 * 1024 }).map((h) => h.severity)).toEqual(["info"]);
  });

  it("the base label's own keys are handled once, as a base change, not again as labels", () => {
    const a = manifest({ baseDigest: D(1), labels: { ...manifest().labels, "org.opencontainers.image.base.digest": D(1) } });
    const b = manifest({ baseDigest: D(2), labels: { ...manifest().labels, "org.opencontainers.image.base.digest": D(2) } });
    expect(scopes(diffManifest("reader", a, b))).toEqual(["image-manifest:reader/base:fail"]);
  });

  it("knows what root is", () => {
    for (const user of ["", "root", "0", "0:0", "root:root"]) expect(runsAsRoot(user), user).toBe(true);
    for (const user of ["1001", "1001:0", "node", "nobody"]) expect(runsAsRoot(user), user).toBe(false);
  });
});

// ---- sbom ---------------------------------------------------------------------------------------------------

describe("sbom engine", () => {
  const sbom = (packages: Record<string, number>) => ({ source: "attestation" as const, packages });

  it("every package added, removed or bumped is one hunk, scoped by package name", () => {
    const a = sbom({ "express@4.19.2": 1, "openssl@3.0.14": 1, "left-pad@1.3.0": 1, "@sveltejs/kit@2.20.0": 1 });
    const b = sbom({ "express@4.19.2": 1, "openssl@3.0.15": 1, "jq@1.7": 1, "@sveltejs/kit@2.21.0": 1 });
    expect(diffSbom("reader", a, b).map((h) => `${h.scope} | ${h.summary}`)).toEqual([
      "reader/@sveltejs/kit | reader: package bumped: @sveltejs/kit 2.20.0 → 2.21.0",
      "reader/jq | reader: package added: jq@1.7",
      "reader/left-pad | reader: package removed: left-pad@1.3.0",
      "reader/openssl | reader: package bumped: openssl 3.0.14 → 3.0.15"
    ]);
    expect(diffSbom("reader", a, b).every((h) => h.artefact === "sbom" && h.severity === "fail")).toBe(true);
  });

  it("must not flag a reordering, or the same package appearing a different number of times", () => {
    const a = sbom({ "express@4.19.2": 1, "openssl@3.0.14": 1 });
    expect(diffSbom("reader", a, sbom({ "openssl@3.0.14": 1, "express@4.19.2": 1 }))).toEqual([]);
    expect(diffSbom("reader", a, sbom({ "express@4.19.2": 3, "openssl@3.0.14": 1 }))).toEqual([]);
  });

  it("reduces an SPDX document to name@version, without the package that describes the image (its version is the digest)", () => {
    const doc = spdx([["express", "4.19.2"], ["express", "4.19.2"], ["glibc", "2.36-9"], ["mystery", "NOASSERTION"]], D(7));
    expect(packagesFromSpdx(doc)).toEqual({ "express@4.19.2": 2, "glibc@2.36-9": 1, "mystery@unversioned": 1 });
    // The same contents in a different image build: only the root package differs, and it is left out.
    expect(diffSbom("reader", { source: "attestation", packages: packagesFromSpdx(spdx([["a", "1"]], D(1))) }, { source: "attestation", packages: packagesFromSpdx(spdx([["a", "1"]], D(2))) })).toEqual([]);
    expect(() => packagesFromSpdx({ spdxVersion: "SPDX-2.3" })).toThrow(/not an SPDX document/);
  });
});

// ---- vulns --------------------------------------------------------------------------------------------------

describe("vulns engine", () => {
  const v = (ids: Record<string, string>) => vulns(Object.fromEntries(Object.entries(ids).map(([id, severity]) => [id, { severity, packages: ["openssl@3.0.14"] }])));

  it("a new CVE on b fails; one fixed on a is informational", () => {
    const hunks = diffVulns("reader", v({ "CVE-2026-0001": "Low", "CVE-2026-0002": "High" }), v({ "CVE-2026-0001": "Low", "CVE-2026-0003": "Critical" }));
    expect(scopes(hunks)).toEqual(["vulns:reader/CVE-2026-0002:info", "vulns:reader/CVE-2026-0003:fail"]);
    expect(hunks.find((h) => h.severity === "fail")!.summary).toMatch(/new vulnerability on b: CVE-2026-0003 \(Critical\)/);
  });

  it("must not flag the same CVE reached through another package or with another severity rating, or a reordering", () => {
    const a = vulns({ "CVE-2026-0001": { severity: "Low", packages: ["openssl@3.0.14"] }, "CVE-2026-0002": { severity: "Low", packages: ["zlib@1"] } });
    const b = vulns({ "CVE-2026-0002": { severity: "Medium", packages: ["zlib@1", "minizip@1"] }, "CVE-2026-0001": { severity: "Low", packages: ["openssl@3.0.15"] } });
    expect(diffVulns("reader", a, b)).toEqual([]);
  });

  it("two sides scanned with different databases make the diff untrustworthy, and say so as a failure", () => {
    const hunks = diffVulns("reader", vulns({}, "built 2026-09-15"), vulns({}, "built 2026-09-20"));
    expect(scopes(hunks)).toEqual(["vulns:reader/db:fail"]);
  });
});

// ---- collection: manifest, attestation, generation, scanner -------------------------------------------------------

function memoryFiles(): TempFiles & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return { store, write: (name, content) => (store.set(`/tmp/${name}`, content), `/tmp/${name}`) };
}
const REF = "quay.io/tutors-sdk/tutors-reader:16.2.0";
const REPO = "quay.io/tutors-sdk/tutors-reader";
const images = { reader: REF, catalogue: "quay.io/tutors-sdk/tutors-catalogue:16.2.0", live: "quay.io/tutors-sdk/tutors-live:16.2.0" };
const sideProvenance = (over: Partial<ReturnType<typeof provenance>> = {}): SideProvenance => ({
  summary: "pulled+verified",
  images: {
    reader: provenance({ ref: images.reader, digest: D(1), ...over }),
    catalogue: provenance({ ref: images.catalogue, digest: D(2), ...over }),
    live: provenance({ ref: images.live, digest: D(3), ...over })
  }
});
const digestFor = (app: "reader" | "catalogue" | "live") => ({ reader: D(1), catalogue: D(2), live: D(3) })[app];
const inspectable = Object.fromEntries(Object.values(images).map((ref) => [ref, { config: { User: "1001", ExposedPorts: { "3000/tcp": {} }, Cmd: ["node", "build/index.js"], Labels: { "org.opencontainers.image.revision": "aaaa", "other.label": "x" } }, layers: [D("b"), D("c"), D("d")], size: 5 }]));
const attestations = Object.fromEntries((["reader", "catalogue", "live"] as const).map((app) => [`quay.io/tutors-sdk/tutors-${app}@${digestFor(app)}`, envelope(digestFor(app), spdx([["express", "4.19.2"], ["openssl", "3.0.14"]], digestFor(app)))]));
const env = (extra: Record<string, string> = {}) => ({ ...extra }) as NodeJS.ProcessEnv;

describe("collecting the manifest", () => {
  it("reads user, ports, entrypoint, cmd, layers, size, the lowest layer and only the OCI labels", () => {
    const tools = fakeTools({ images: { [REF]: { config: { User: "1001", ExposedPorts: { "3000/tcp": {}, "1000/tcp": {} }, Entrypoint: null, Cmd: ["node", "x.js"], Labels: { "org.opencontainers.image.base.digest": D(4), "org.opencontainers.image.base.name": "node:22", "not.oci": "x" } }, layers: [D("b"), D("c")], size: 42 } } });
    const got = collectManifest(tools.exec, REF);
    expect(got).toMatchObject({ ok: true, data: { user: "1001", ports: ["1000/tcp", "3000/tcp"], entrypoint: null, cmd: ["node", "x.js"], layers: 2, size: 42, bottomLayer: D("b"), baseDigest: D(4), baseName: "node:22", labels: { "org.opencontainers.image.base.digest": D(4), "org.opencontainers.image.base.name": "node:22" } } });
    expect(tools.calls[0]).toEqual({ cmd: "docker", args: ["image", "inspect", "--format", "{{json .}}", REF] });
  });

  it("an image that is not there, or that reports no layers, is not collected, with the reason", () => {
    expect(collectManifest(fakeTools().exec, REF)).toEqual({ ok: false, reason: expect.stringContaining("not present locally") });
    expect(collectManifest(fakeTools({ images: { [REF]: { layers: [] } } }).exec, REF)).toEqual({ ok: false, reason: expect.stringContaining("no filesystem layers") });
  });
});

describe("collecting the SBOM from the cosign attestation", () => {
  const collect = (tools: ReturnType<typeof fakeTools>, prov: SideProvenance | undefined, extraEnv: Record<string, string> = {}, files = memoryFiles()) =>
    collectImageStatic(images, prov, { exec: tools.exec, files, policy: staticPolicyFromEnv(env(extraEnv), trustPolicyFromEnv(env())), log: () => {} });

  it("verifies the attestation by digest against the signing identity, and reduces it to the package multiset", () => {
    const tools = fakeTools({ images: inspectable, attestations, scanner: () => grype([["CVE-2026-0001", "High", "openssl@3.0.14"]]) });
    const got = collect(tools, sideProvenance());
    expect(got.reader.sbom).toEqual({ ok: true, source: "cosign attestation (signature verified)", data: { source: "attestation", packages: { "express@4.19.2": 1, "openssl@3.0.14": 1 } } });
    const cosign = tools.calls.find((c) => c.cmd === "cosign")!;
    expect(cosign.args).toEqual(["verify-attestation", "--type", "spdxjson", "--certificate-identity-regexp", trustPolicyFromEnv(env()).identity, "--certificate-oidc-issuer", trustPolicyFromEnv(env()).issuer, `${REPO}@${D(1)}`]);
    // The SBOM text is only handed to the scanner; the capture keeps the multiset.
    expect(JSON.stringify(got)).not.toContain("SPDXRef");
  });

  it("an image with --allow-unsigned provenance is read with `cosign download attestation`, and labelled NOT verified", () => {
    const tools = fakeTools({ images: inspectable, attestations, scanner: "missing" });
    const got = collect(tools, sideProvenance({ provenance: "pulled-unverified" }));
    expect(got.reader.sbom).toMatchObject({ ok: true, source: expect.stringContaining("NOT verified") });
    expect(tools.calls.find((c) => c.cmd === "cosign")!.args.slice(0, 2)).toEqual(["download", "attestation"]);
  });

  it("an image built or present locally has no attestation: NOT COLLECTED, and the reason says how to get an SBOM anyway", () => {
    const got = collect(fakeTools({ images: inspectable, scanner: "missing" }), sideProvenance({ provenance: "local" }));
    expect(got.reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/is local, not a pulled image.*HARNESS_SBOM_SOURCE=generate/) });
    expect(got.reader.vulns).toEqual({ ok: false, reason: expect.stringMatching(/nothing to scan: .*local/) });
    expect(got.reader.manifest.ok).toBe(true);
    expect(collect(fakeTools({ images: inspectable }), undefined).reader.sbom.ok).toBe(false);
  });

  it("a pulled image with no attestation, or cosign missing, is NOT COLLECTED with the reason", () => {
    expect(collect(fakeTools({ images: inspectable }), sideProvenance()).reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/no SBOM attestation for .*cosign failed: Error: no attestations found/) });
    expect(collect(fakeTools({ images: inspectable, cosign: "missing" }), sideProvenance()).reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/cosign is not installed/) });
  });

  it("refuses an attestation for another digest, one that is not SPDX, and an SBOM that lists nothing", () => {
    const other = { [`${REPO}@${D(1)}`]: envelope(D(9), spdx([["express", "4.19.2"]])) };
    expect(collect(fakeTools({ images: inspectable, attestations: other }), sideProvenance()).reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/is for sha256:999999999999….*not this image/) });
    const slsa = { [`${REPO}@${D(1)}`]: envelope(D(1), {}, "https://slsa.dev/provenance/v1") };
    expect(collect(fakeTools({ images: inspectable, attestations: slsa }), sideProvenance()).reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/none is an SPDX SBOM/) });
    const empty = { [`${REPO}@${D(1)}`]: envelope(D(1), spdx([])) };
    expect(collect(fakeTools({ images: inspectable, attestations: empty }), sideProvenance()).reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/lists no packages/) });
  });

  it("reads the older cosign predicate shape, where the SPDX text is wrapped in { Data }", () => {
    const wrapped = envelope(D(1), { Data: JSON.stringify(spdx([["express", "4.19.2"]])), Timestamp: "2026-09-01" });
    expect(spdxFromAttestations(wrapped, D(1))).toMatchObject({ ok: true });
    expect(spdxFromAttestations("", D(1))).toEqual({ ok: false, reason: expect.stringContaining("no attestation") });
  });
});

describe("generating an SBOM instead (HARNESS_SBOM_SOURCE=generate)", () => {
  it("runs the generator command on the image, whatever its provenance, and never touches cosign", () => {
    const tools = fakeTools({ images: inspectable, syft: Object.fromEntries(Object.values(images).map((ref) => [`docker:${ref}`, JSON.stringify(spdx([["express", "4.19.2"]]))])), scanner: "missing" });
    const got = collectImageStatic(images, sideProvenance({ provenance: "local" }), { exec: tools.exec, files: memoryFiles(), policy: staticPolicyFromEnv(env({ HARNESS_SBOM_SOURCE: "generate" }), trustPolicyFromEnv(env())), log: () => {} });
    expect(got.reader.sbom).toEqual({ ok: true, source: "generated by syft", data: { source: "generated", packages: { "express@4.19.2": 1 } } });
    expect(tools.calls.some((c) => c.cmd === "cosign")).toBe(false);
    expect(tools.calls.find((c) => c.cmd === "syft")!.args).toEqual([`docker:${REF}`, "-o", "spdx-json"]);
  });

  it("a generator that is not installed, or an unusable HARNESS_SBOM_SOURCE, is a loud reason or an error, never an empty SBOM", () => {
    const tools = fakeTools({ images: inspectable });
    const notInstalled = { ...tools, exec: ((cmd, args, o) => (cmd === "syft" ? { status: null, stdout: "", stderr: "", error: Object.assign(new Error("ENOENT"), { code: "ENOENT" }) } : tools.exec(cmd, args, o))) as typeof tools.exec };
    const got = collectImageStatic(images, undefined, { exec: notInstalled.exec, files: memoryFiles(), policy: staticPolicyFromEnv(env({ HARNESS_SBOM_SOURCE: "generate" }), trustPolicyFromEnv(env())), log: () => {} });
    expect(got.reader.sbom).toEqual({ ok: false, reason: expect.stringMatching(/could not generate an SBOM.*syft is not installed/) });
    expect(() => staticPolicyFromEnv(env({ HARNESS_SBOM_SOURCE: "guess" }))).toThrow(/must be auto, attestation or generate/);
  });

  it("splits a command the way a shell would, without being one", () => {
    expect(splitCommand(`syft "docker:{image}" -o 'spdx-json' --exclude "a b"`)).toEqual(["syft", "docker:{image}", "-o", "spdx-json", "--exclude", "a b"]);
    expect(() => splitCommand(`syft "oops`)).toThrow(/unterminated/);
    expect(splitCommand("grype sbom:{sbom} ; rm -rf /")).toContain(";");
  });
});

describe("collecting vulnerabilities", () => {
  const files = memoryFiles();
  const scan = () => fakeTools({ images: inspectable, attestations, scanner: (path) => (files.store.get(path)?.includes("openssl") ? grype([["CVE-2026-0001", "High", "openssl@3.0.14"]]) : "{}") });
  const run = (tools: ReturnType<typeof fakeTools>, e: Record<string, string> = {}) => collectImageStatic(images, sideProvenance(), { exec: tools.exec, files, policy: staticPolicyFromEnv(env(e), trustPolicyFromEnv(env())), log: () => {} });

  it("runs the scanner over the image's SBOM with database updates switched off, and reads its findings", () => {
    const tools = scan();
    const got = run(tools, { HARNESS_VULN_DB_DIR: "/opt/grype-db" });
    expect(got.reader.vulns).toEqual({ ok: true, source: "grype 0.90.0", data: vulns({ "CVE-2026-0001": { severity: "High", packages: ["openssl@3.0.14"] } }) });
    const call = tools.calls.find((c) => c.cmd === "grype")!;
    expect(call.args).toEqual(["sbom:/tmp/reader.spdx.json", "-o", "json"]);
    expect(call.env).toMatchObject({ GRYPE_DB_AUTO_UPDATE: "false", GRYPE_DB_CACHE_DIR: "/opt/grype-db", TRIVY_SKIP_DB_UPDATE: "true", TRIVY_OFFLINE_SCAN: "true" });
    // The scanner reads the SBOM the attestation carried, purls and all, not a reconstruction.
    expect(files.store.get("/tmp/reader.spdx.json")).toContain("SPDXRef-Package-0");
  });

  it("the scanner is a command: trivy works through HARNESS_VULN_CMD", () => {
    const trivyOut = JSON.stringify({ SchemaVersion: 2, Results: [{ Vulnerabilities: [{ VulnerabilityID: "CVE-2026-0009", Severity: "HIGH", PkgName: "zlib", InstalledVersion: "1.2", FixedVersion: "1.3" }] }, { Vulnerabilities: null }] });
    const tools = fakeTools({ images: inspectable, attestations, scanner: () => trivyOut });
    const got = run(tools, { HARNESS_VULN_CMD: "trivy sbom --format json --offline-scan {sbom}" });
    expect(got.reader.vulns).toEqual({ ok: true, source: "trivy", data: { scanner: { name: "trivy" }, findings: { "CVE-2026-0009": { severity: "HIGH", packages: ["zlib@1.2"], fixedIn: "1.3" } } } });
    expect(tools.calls.find((c) => c.cmd === "trivy")!.args.at(-1)).toBe("/tmp/reader.spdx.json");
  });

  it("a scanner that is missing is NOT COLLECTED with an install hint; one that prints something else is refused rather than read as clean", () => {
    expect(run(fakeTools({ images: inspectable, attestations, scanner: "missing" })).reader.vulns).toEqual({ ok: false, reason: expect.stringMatching(/grype is not installed/) });
    expect(run(fakeTools({ images: inspectable, attestations, scanner: () => "not json" })).reader.vulns).toEqual({ ok: false, reason: expect.stringMatching(/did not print JSON/) });
    expect(run(fakeTools({ images: inspectable, attestations, scanner: () => '{"hello":1}' })).reader.vulns).toEqual({ ok: false, reason: expect.stringMatching(/neither grype's .* nor trivy's/) });
    expect(parseScannerOutput('{"matches":[]}')).toMatchObject({ ok: true, data: { findings: {} } });
  });

  it("pins the scanner: no update variable is ever left on", () => {
    expect(scannerEnv(undefined)).toMatchObject({ GRYPE_DB_AUTO_UPDATE: "false", GRYPE_CHECK_FOR_APP_UPDATE: "false", TRIVY_SKIP_DB_UPDATE: "true" });
    expect(scannerEnv(undefined)).not.toHaveProperty("GRYPE_DB_CACHE_DIR");
  });
});

// ---- end to end: capture -> compare -> report --------------------------------------------------------------------

function run(a: ReturnType<typeof withStatic>, b: ReturnType<typeof withStatic>, opts: { mode?: "release" | "noise"; claims?: string } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "harness-static-"));
  const outcome = compareFromCaptures({ mode: opts.mode ?? "release", substrate: "compose", captureDir: dir, a, b, claims: opts.claims ? parseClaims(opts.claims) : [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {} });
  return { outcome, report: JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport, md: readFileSync(outcome.files.md, "utf8"), html: readFileSync(outcome.files.html, "utf8") };
}

describe("in a report", () => {
  it("a planted added package fails a release, attributed to sbom, and one claim covers it", () => {
    const b = withStatic("b", staticSide({ packages: { "express@4.19.2": 1, "openssl@3.0.14": 1, "jq@1.7": 1 } }));
    const { report } = run(withStatic("a", staticSide()), b);
    expect(report.verdict).toBe("fail");
    expect(report.compare.unclaimed.map((h) => `${h.artefact} ${h.scope}`)).toEqual(["sbom reader/jq", "sbom catalogue/jq", "sbom live/jq"]);
    const claimed = run(withStatic("a", staticSide()), b, { claims: 'claims:\n  - artefact: sbom\n    scope: "*/jq"\n    reason: "feat(reader): #1099 adds jq for the export job"\n' });
    expect(claimed.report.verdict).toBe("pass");
    expect(claimed.report.compare.staleClaims).toEqual([]);
  });

  it("claims name the artefacts, and only that artefact: an sbom claim does not cover a manifest hunk, nor a dom claim an sbom hunk", () => {
    expect(parseClaims('claims:\n  - artefact: image-manifest\n    scope: "reader/user"\n    reason: "chore(docker): drop root #1"\n  - artefact: vulns\n    scope: "reader/CVE-2026-1"\n    reason: "accepted: not reachable, #2"\n')).toHaveLength(2);
    const hunk = (artefact: Hunk["artefact"], scope: string): Hunk => ({ id: scope, artefact, scope, summary: "s", severity: "fail" });
    const hunks = [hunk("sbom", "reader/@sveltejs/kit"), hunk("image-manifest", "reader/user"), hunk("vulns", "reader/CVE-2026-1")];
    const result = matchClaims(hunks, parseClaims('claims:\n  - artefact: sbom\n    scope: "reader/@sveltejs/kit"\n    reason: "chore(deps): kit bump #3"\n  - artefact: dom\n    scope: "reader/*"\n    reason: "Rule 0001: unrelated dom claim"\n'));
    expect(result.unclaimed.map((h) => h.scope)).toEqual(["reader/user", "reader/CVE-2026-1"]);
    expect(result.staleClaims.map((c) => c.artefact)).toEqual(["dom"]);
  });

  it("A/A: identical sides write a passing noise run and report every artefact as collected", () => {
    const { report } = run(withStatic("a", staticSide()), withStatic("b", staticSide()), { mode: "noise" });
    expect(report.verdict).toBe("pass");
    expect(report.imageArtefacts!.a!.reader).toEqual({ manifest: { collected: true, summary: expect.stringContaining("9 layers") }, sbom: { collected: true, summary: "2 distinct package(s)" }, vulns: { collected: true, summary: "1 advisories, db built 2026-09-15T00:00:00Z schema 6" } });
    expect(report.reasons.filter((r) => r.startsWith("NOT COLLECTED"))).toEqual([]);
  });

  const missing = (side: "a" | "b") => {
    const s = staticSide();
    for (const app of ["reader", "catalogue", "live"] as const) {
      s[app].sbom = { ok: false, reason: `${app} is local, not a pulled image: there is no cosign attestation to read` };
      s[app].vulns = { ok: false, reason: "nothing to scan: no SBOM" };
    }
    return withStatic(side, s);
  };

  it("an image with no SBOM or scanner is NOT COLLECTED, loudly: a reason at the top, an informational hunk, a cell in both renderers, never a clean pass in silence", () => {
    const { report, md, html } = run(withStatic("a", staticSide()), missing("b"));
    expect(report.verdict).toBe("pass"); // informational unless required, but not silent:
    expect(report.reasons.filter((r) => r.startsWith("NOT COLLECTED: sbom of reader on side b"))).toHaveLength(1);
    expect(report.reasons.some((r) => /NOT COLLECTED: vulns of reader, catalogue, live on side b: nothing to scan/.test(r))).toBe(true);
    expect(report.compare.hunks.filter((h) => h.scope.endsWith("/not-collected")).map((h) => `${h.artefact}:${h.scope}:${h.severity}`)).toEqual(["sbom:reader/not-collected:info", "vulns:reader/not-collected:info", "sbom:catalogue/not-collected:info", "vulns:catalogue/not-collected:info", "sbom:live/not-collected:info", "vulns:live/not-collected:info"]);
    expect(report.imageArtefacts!.b!.reader.sbom).toEqual({ collected: false, reason: expect.stringContaining("no cosign attestation") });
    expect(md).toContain("**NOT COLLECTED: reader is local");
    expect(html).toContain('class="loud">NOT COLLECTED: reader is local');
  });

  it("with HARNESS_REQUIRE_STATIC=1 the same gap fails the release, until it is claimed", () => {
    process.env.HARNESS_REQUIRE_STATIC = "1";
    const { report } = run(withStatic("a", staticSide()), missing("b"));
    expect(report.verdict).toBe("fail");
    expect(report.compare.unclaimed.map((h) => h.scope)).toContain("reader/not-collected");
    expect(report.compare.unclaimed.every((h) => h.scope.endsWith("/not-collected"))).toBe(true);
  });

  it("both sides missing the same thing is still reported (an A/A on two local builds must not read as clean)", () => {
    const { report } = run(missing("a"), missing("b"), { mode: "noise" });
    expect(report.compare.hunks.filter((h) => h.scope === "reader/not-collected")).toHaveLength(2);
    expect(report.imageArtefacts!.a!.reader.sbom.collected).toBe(false);
  });

  it("the report the run writes is accepted by the contract's schema", () => {
    const schema = JSON.parse(readFileSync(join(import.meta.dirname, "..", "docs", "contract", "report.schema.json"), "utf8"));
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const validate = ajv.compile(schema);
    for (const { report } of [run(withStatic("a", staticSide()), missing("b")), run(withStatic("a", staticSide()), withStatic("b", staticSide({ packages: { "x@1": 1 } })))]) {
      validate(report);
      expect(validate.errors ?? []).toEqual([]);
    }
  });

  it("the captures keep the static artefacts, so `harness compare --dir` reproduces the same hunks", () => {
    const { outcome } = run(withStatic("a", staticSide()), withStatic("b", staticSide({ manifest: manifest({ user: "" }) })));
    expect(outcome.report.compare.unclaimed.map((h) => h.scope)).toEqual(["reader/user", "catalogue/user", "live/user"]);
    const a = clone(withStatic("a", staticSide()));
    expect(JSON.parse(JSON.stringify(a)).imageStatic.reader.sbom.data.packages).toEqual({ "express@4.19.2": 1, "openssl@3.0.14": 1 });
  });
});
