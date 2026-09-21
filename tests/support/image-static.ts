import type { ExecResult, Exec } from "../../src/images.ts";
import type { ImageManifest, SideImageStatic, VulnData } from "../../src/image-static/types.ts";
import type { ImageInfo, SideCapture } from "../../src/types.ts";
import { capture, clone } from "./captures.ts";

export const D = (n: number | string) => `sha256:${String(n).repeat(64).slice(0, 64)}`;

export function manifest(over: Partial<ImageManifest> = {}): ImageManifest {
  return {
    os: "linux",
    arch: "amd64",
    user: "1001",
    ports: ["3000/tcp"],
    entrypoint: null,
    cmd: ["node", "build/index.js"],
    layers: 9,
    size: 200 * 1024 * 1024,
    bottomLayer: D("b"),
    labels: { "org.opencontainers.image.revision": "aaaa", "org.opencontainers.image.version": "16.2.0", "org.opencontainers.image.created": "2026-09-01T10:00:00Z", "org.opencontainers.image.source": "https://github.com/tutors-sdk/tutors-mono-repo" },
    ...over
  };
}

export const SPDX_ROOT_ID = "SPDXRef-DocumentRoot-Image";

/** An SPDX document the way syft writes it: the image itself is a package the document DESCRIBES. */
export function spdx(packages: [string, string][], root = "sha256:1111"): Record<string, unknown> {
  return {
    spdxVersion: "SPDX-2.3",
    SPDXID: "SPDXRef-DOCUMENT",
    name: "quay.io/tutors-sdk/tutors-reader",
    packages: [
      { SPDXID: SPDX_ROOT_ID, name: "quay.io/tutors-sdk/tutors-reader", versionInfo: root, primaryPackagePurpose: "CONTAINER" },
      ...packages.map(([name, version], i) => ({ SPDXID: `SPDXRef-Package-${i}`, name, versionInfo: version }))
    ],
    relationships: [{ spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: SPDX_ROOT_ID }]
  };
}

/** One line of `cosign verify-attestation` / `download attestation` output. */
export function envelope(digest: string, doc: unknown, predicateType = "https://spdx.dev/Document"): string {
  const statement = { _type: "https://in-toto.io/Statement/v0.1", predicateType, subject: [{ name: "quay.io/tutors-sdk/tutors-reader", digest: { sha256: digest.replace("sha256:", "") } }], predicate: doc };
  return JSON.stringify({ payloadType: "application/vnd.in-toto+json", payload: Buffer.from(JSON.stringify(statement)).toString("base64"), signatures: [] });
}

export function grype(ids: [string, string, string][], db = "2026-09-15T00:00:00Z"): string {
  return JSON.stringify({
    matches: ids.map(([id, severity, artifact]) => ({ vulnerability: { id, severity, fix: { versions: [] } }, artifact: { name: artifact.split("@")[0], version: artifact.split("@")[1] } })),
    descriptor: { name: "grype", version: "0.90.0", db: { status: { built: db, schemaVersion: 6 } } }
  });
}

export function vulns(findings: Record<string, { severity: string; packages: string[]; fixedIn?: string }>, db = "built 2026-09-15T00:00:00Z schema 6"): VulnData {
  return { scanner: { name: "grype", version: "0.90.0", db }, findings };
}

/** A side whose every app has the same static artefacts. */
export function staticSide(over: { manifest?: ImageManifest; packages?: Record<string, number>; vulns?: VulnData } = {}): SideImageStatic {
  const app = () => ({
    manifest: { ok: true as const, data: clone(over.manifest ?? manifest()) },
    sbom: { ok: true as const, data: { source: "attestation" as const, packages: clone(over.packages ?? { "express@4.19.2": 1, "openssl@3.0.14": 1 }) } },
    vulns: { ok: true as const, data: clone(over.vulns ?? vulns({ "CVE-2026-0001": { severity: "Low", packages: ["openssl@3.0.14"] } })) }
  });
  return { reader: app(), catalogue: app(), live: app() };
}

export function withStatic(side: "a" | "b", imageStatic: SideImageStatic): SideCapture {
  return { ...capture(side), imageStatic };
}

// ---- a fake docker, cosign, syft and grype ---------------------------------------------------------

export interface FakeTools {
  /** docker image inspect by reference. */
  images?: Record<string, { config?: Record<string, unknown>; layers?: string[]; size?: number; os?: string; arch?: string }>;
  /** cosign verify-attestation / download attestation stdout, by `repo@digest`. */
  attestations?: Record<string, string>;
  cosign?: "installed" | "missing";
  /** syft stdout by `docker:<ref>`. */
  syft?: Record<string, string>;
  /** grype stdout, by SBOM content marker: called with the path; the fake reads it through `sboms`. */
  scanner?: "installed" | "missing" | ((sbomPath: string) => string);
}

export function fakeTools(tools: FakeTools = {}) {
  const calls: { cmd: string; args: string[]; env?: NodeJS.ProcessEnv }[] = [];
  const ok = (stdout = ""): ExecResult => ({ status: 0, stdout, stderr: "" });
  const no = (stderr: string, status = 1): ExecResult => ({ status, stdout: "", stderr });
  const missing = (cmd: string): ExecResult => ({ status: null, stdout: "", stderr: "", error: Object.assign(new Error(`spawnSync ${cmd} ENOENT`), { code: "ENOENT" }) });
  const exec: Exec = (cmd, args, opts) => {
    calls.push({ cmd, args, ...(opts?.env ? { env: opts.env } : {}) });
    if (cmd === "docker" && args[0] === "image" && args[1] === "inspect") {
      const image = tools.images?.[args.at(-1)!];
      if (!image) return no("Error: No such image");
      return ok(JSON.stringify({ Os: image.os ?? "linux", Architecture: image.arch ?? "amd64", Size: image.size ?? 1000, Config: image.config ?? {}, RootFS: { Layers: image.layers ?? [D("b"), D("c")] } }));
    }
    if (cmd === "cosign") {
      if (tools.cosign === "missing") return missing(cmd);
      const subject = args.at(-1)!;
      const out = tools.attestations?.[subject];
      return out === undefined ? no("Error: no attestations found") : ok(out);
    }
    if (cmd === "syft") {
      const out = tools.syft?.[args[0]!];
      return out === undefined ? no("could not find image") : ok(out);
    }
    if (cmd === "grype" || cmd === "trivy") {
      if (tools.scanner === "missing") return missing(cmd);
      const path = args.find((a) => a.startsWith("sbom:"))?.slice(5) ?? args.at(-1)!;
      return typeof tools.scanner === "function" ? ok(tools.scanner(path)) : no("no scanner configured");
    }
    throw new Error(`unexpected command: ${cmd} ${args.join(" ")}`);
  };
  return { exec, calls };
}

export const provenance = (over: Partial<ImageInfo> = {}): ImageInfo => ({ ref: "quay.io/tutors-sdk/tutors-reader:16.2.0", provenance: "pulled+verified", digest: D(1), ...over });
