import { parseRef } from "../image-ref.ts";
import type { Exec, TrustPolicy } from "../images.ts";
import type { ImageInfo } from "../types.ts";
import { failureReason } from "./command.ts";
import type { BuildProvenanceData, Collected } from "./types.ts";

/**
 * The SLSA provenance on an image (since 1.22.0, for the build-provenance policy): `cosign verify-attestation` on the
 * digest, under the same certificate identity and issuer its signature and its SBOM attestation are verified against,
 * once per SLSA predicate type (v1, then v0.2) until one is found. Only for an image pulled and signature-verified in
 * the run: anything else has no verified attestation to read, and says so.
 */
export const SLSA_TYPES = ["slsaprovenance1", "slsaprovenance"] as const;

const SLSA_PREDICATE = /^https:\/\/slsa\.dev\/provenance\//;
/** cosign's words for "this image has no attestation of that type", as against "cosign could not ask". */
const NONE_OF_THAT_TYPE = /no matching attestations|none of the attestations matched|no attestations? (were )?found/i;
const COSIGN_HINT = "https://docs.sigstore.dev/cosign/system_config/installation/";

interface Statement {
  predicateType?: string;
  subject?: { digest?: Record<string, string> }[];
  predicate?: {
    builder?: { id?: string };
    invocation?: { configSource?: { entryPoint?: string } };
    runDetails?: { builder?: { id?: string } };
    buildDefinition?: { externalParameters?: { workflow?: { path?: string; ref?: string } } };
  };
}

/** The SLSA statements in cosign's output (one DSSE envelope per line) that are about this digest. */
export function slsaStatements(output: string, digest: string): BuildProvenanceData["statements"] {
  const want = digest.replace(/^sha256:/, "");
  const out: BuildProvenanceData["statements"] = [];
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim().startsWith("{")) continue;
    let s: Statement;
    try {
      const envelope = JSON.parse(line) as { payload?: string } & Statement;
      s = envelope.payload ? (JSON.parse(Buffer.from(envelope.payload, "base64").toString("utf8")) as Statement) : envelope;
    } catch {
      continue;
    }
    if (!s.predicateType || !SLSA_PREDICATE.test(s.predicateType)) continue;
    if (!(s.subject ?? []).some((x) => x.digest?.sha256 === want)) continue;
    const p = s.predicate ?? {};
    const builder = p.runDetails?.builder?.id ?? p.builder?.id ?? null;
    const wf = p.buildDefinition?.externalParameters?.workflow;
    const workflow = wf?.path ? `${wf.path}${wf.ref ? `@${wf.ref}` : ""}` : (p.invocation?.configSource?.entryPoint ?? null);
    out.push({ predicateType: s.predicateType, builder, workflow });
  }
  return out;
}

export function collectBuildProvenance(deps: { exec: Exec; policy: TrustPolicy }, ref: string, info: ImageInfo | undefined): Collected<BuildProvenanceData> {
  if (!info) return { ok: false, reason: `${ref}: image provenance is unknown, so no attestation can be read` };
  if (info.provenance !== "pulled+verified") return { ok: false, reason: `${ref} is ${info.provenance}, not pulled and signature-verified in this run: there is no verified attestation to read` };
  if (!info.digest) return { ok: false, reason: `${ref} has no registry digest, so its attestations cannot be looked up` };
  const subject = `${parseRef(ref).repo}@${info.digest}`;
  for (const type of SLSA_TYPES) {
    const result = deps.exec("cosign", ["verify-attestation", "--type", type, "--certificate-identity-regexp", deps.policy.identity, "--certificate-oidc-issuer", deps.policy.issuer, subject]);
    if (!result.error && result.status === 0) {
      const statements = slsaStatements(result.stdout, info.digest);
      if (statements.length) return { ok: true, source: `cosign verify-attestation --type ${type}`, data: { identity: deps.policy.identity, statements } };
      continue;
    }
    if (!result.error && NONE_OF_THAT_TYPE.test(`${result.stderr}\n${result.stdout}`)) continue;
    return { ok: false, reason: `could not ask for the SLSA provenance of ${subject}: ${failureReason("cosign", result, COSIGN_HINT)}` };
  }
  return { ok: true, source: `cosign verify-attestation --type ${SLSA_TYPES.join(", ")}`, data: { identity: deps.policy.identity, statements: [] } };
}
