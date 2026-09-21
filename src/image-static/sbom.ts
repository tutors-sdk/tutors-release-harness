import { dockerRef, parseRef } from "../image-ref.ts";
import type { Exec, TrustPolicy } from "../images.ts";
import type { ImageInfo } from "../types.ts";
import { failureReason, fillCommand } from "./command.ts";
import type { Collected, SbomData, SbomSource } from "./types.ts";

/**
 * Where the SBOM comes from.
 *   auto / attestation: the SPDX attestation cosign attached to a pulled image (the monorepo's publish workflow)
 *   generate:           a local generator over the image itself, run identically on both sides, so it works for
 *                       a local build (a mutant) and two sides are always comparable
 */
export type SbomSourcePolicy = "auto" | "attestation" | "generate";

export const DEFAULT_SBOM_CMD = "syft docker:{image} -o spdx-json";
const SPDX_PREDICATE = /spdx/i;

// ---- SPDX -> package multiset -------------------------------------------------------

interface SpdxPackage {
  SPDXID?: string;
  name?: string;
  versionInfo?: string;
  primaryPackagePurpose?: string;
}
interface SpdxDocument {
  spdxVersion?: string;
  packages?: SpdxPackage[];
  documentDescribes?: string[];
  relationships?: { spdxElementId?: string; relationshipType?: string; relatedSpdxElement?: string }[];
}

export const packageKey = (name: string, version: string) => `${name}@${version}`;

/** Split `name@version` at the last `@`, so scoped npm names (`@sveltejs/kit@2.0.0`) survive. */
export function splitPackageKey(key: string): { name: string; version: string } {
  const at = key.lastIndexOf("@");
  return at > 0 ? { name: key.slice(0, at), version: key.slice(at + 1) } : { name: key, version: "" };
}

/**
 * Reduce an SPDX JSON document to a multiset of `name@version`. The package the
 * document DESCRIBES is the image itself (its version is the image digest, which
 * differs on every build by definition), so it is left out; so is anything
 * marked as a container. What remains is what is inside.
 */
export function packagesFromSpdx(doc: unknown): Record<string, number> {
  const spdx = doc as SpdxDocument;
  if (!spdx || typeof spdx !== "object" || !Array.isArray(spdx.packages)) throw new Error("not an SPDX document: no packages array");
  const described = new Set(spdx.documentDescribes ?? []);
  for (const r of spdx.relationships ?? []) {
    if (r.relationshipType === "DESCRIBES" && r.spdxElementId === "SPDXRef-DOCUMENT" && r.relatedSpdxElement) described.add(r.relatedSpdxElement);
  }
  const out: Record<string, number> = {};
  for (const p of spdx.packages) {
    if (!p.name || (p.SPDXID && described.has(p.SPDXID)) || p.primaryPackagePurpose === "CONTAINER") continue;
    const version = p.versionInfo && p.versionInfo !== "NOASSERTION" ? p.versionInfo : "unversioned";
    const key = packageKey(p.name, version);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

// ---- cosign attestation -> SPDX ----------------------------------------------------------

interface Statement {
  predicateType?: string;
  subject?: { digest?: Record<string, string> }[];
  predicate?: unknown;
}

/** The SPDX document inside `cosign verify-attestation` / `cosign download attestation` output (one DSSE envelope per line). */
export function spdxFromAttestations(output: string, digest: string): { ok: true; doc: unknown } | { ok: false; reason: string } {
  const want = digest.replace(/^sha256:/, "");
  let statements = 0;
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim().startsWith("{")) continue;
    let statement: Statement;
    try {
      const envelope = JSON.parse(line) as { payload?: string } & Statement;
      // A DSSE envelope carries the in-toto statement base64-encoded; some tools print the statement itself.
      statement = envelope.payload ? (JSON.parse(Buffer.from(envelope.payload, "base64").toString("utf8")) as Statement) : envelope;
    } catch {
      continue;
    }
    statements += 1;
    if (!statement.predicateType || !SPDX_PREDICATE.test(statement.predicateType)) continue;
    const subjects = (statement.subject ?? []).map((s) => s.digest?.sha256).filter((s): s is string => Boolean(s));
    if (!subjects.includes(want)) return { ok: false, reason: `the SPDX attestation is for ${subjects.length ? subjects.map((s) => `sha256:${s.slice(0, 12)}…`).join(", ") : "no digest"}, not this image (sha256:${want.slice(0, 12)}…)` };
    let predicate = statement.predicate;
    // Older cosign wraps a predicate as { Data: "<json text>" }.
    if (predicate && typeof predicate === "object" && typeof (predicate as { Data?: unknown }).Data === "string") {
      try {
        predicate = JSON.parse((predicate as { Data: string }).Data);
      } catch {
        return { ok: false, reason: "the SPDX attestation's Data is not JSON" };
      }
    }
    return { ok: true, doc: predicate };
  }
  return { ok: false, reason: statements ? "the image has attestations, but none is an SPDX SBOM" : "cosign returned no attestation for this image" };
}

// ---- acquiring an SBOM ------------------------------------------------------------------------

export interface SbomDeps {
  exec: Exec;
  policy: TrustPolicy;
  sbomSource: SbomSourcePolicy;
  sbomCmd: string;
}

const COSIGN_HINT = "https://docs.sigstore.dev/cosign/system_config/installation/";
const SYFT_HINT = "https://github.com/anchore/syft#installation, or point HARNESS_SBOM_CMD at another SPDX-JSON generator";

/** An SBOM collected, with the SPDX text it was reduced from: the scanner needs purls and CPEs that the package multiset drops. The text is never stored in a capture. */
export type SbomAcquired = Collected<SbomData> & { spdxText?: string };

function parseSpdx(text: string, source: SbomSource, label: string): SbomAcquired {
  try {
    const packages = packagesFromSpdx(JSON.parse(text));
    // An SBOM that lists nothing is a cataloguer that found nothing, not an image with nothing in it.
    if (!Object.keys(packages).length) return { ok: false, reason: `${label}: the SBOM lists no packages` };
    return { ok: true, source, data: { source, packages }, spdxText: text };
  } catch (e) {
    return { ok: false, reason: `${label}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

function fromAttestation(deps: SbomDeps, info: ImageInfo, ref: string): SbomAcquired {
  const { exec, policy } = deps;
  const digest = info.digest;
  if (info.provenance !== "pulled+verified" && info.provenance !== "pulled-unverified") {
    return { ok: false, reason: `${ref} is ${info.provenance}, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself` };
  }
  if (!digest) return { ok: false, reason: `${ref} has no registry digest, so its attestation cannot be looked up` };
  const subject = `${parseRef(ref).repo}@${digest}`;
  const verified = info.provenance === "pulled+verified";
  const result = verified
    ? exec("cosign", ["verify-attestation", "--type", "spdxjson", "--certificate-identity-regexp", policy.identity, "--certificate-oidc-issuer", policy.issuer, subject])
    : exec("cosign", ["download", "attestation", subject]);
  if (result.error || result.status !== 0) return { ok: false, reason: `no SBOM attestation for ${subject}: ${failureReason("cosign", result, COSIGN_HINT)}` };
  const found = spdxFromAttestations(result.stdout, digest);
  if (!found.ok) return { ok: false, reason: `${subject}: ${found.reason}` };
  const source: SbomSource = verified ? "attestation" : "attestation-unverified";
  const parsed = parseSpdx(JSON.stringify(found.doc), source, subject);
  return parsed.ok ? { ...parsed, source: verified ? "cosign attestation (signature verified)" : "cosign attestation (NOT verified: --allow-unsigned)" } : parsed;
}

function generate(deps: SbomDeps, ref: string): SbomAcquired {
  let argv: string[];
  try {
    argv = fillCommand(deps.sbomCmd, { image: dockerRef(ref) });
  } catch (e) {
    return { ok: false, reason: `HARNESS_SBOM_CMD: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (!argv.length) return { ok: false, reason: "HARNESS_SBOM_CMD is empty" };
  const result = deps.exec(argv[0]!, argv.slice(1));
  if (result.error || result.status !== 0) return { ok: false, reason: `could not generate an SBOM for ${ref}: ${failureReason(argv[0]!, result, SYFT_HINT)}` };
  const parsed = parseSpdx(result.stdout, "generated", `${argv[0]} output for ${ref}`);
  return parsed.ok ? { ...parsed, source: `generated by ${argv[0]}` } : parsed;
}

/** The image's SBOM, or why there is none. Never throws, and never returns an empty SBOM in place of a missing one. */
export function collectSbom(deps: SbomDeps, ref: string, info: ImageInfo | undefined): SbomAcquired {
  if (deps.sbomSource === "generate") return generate(deps, ref);
  if (!info) return { ok: false, reason: `${ref}: image provenance is unknown, so no attestation can be read` };
  return fromAttestation(deps, info, ref);
}
