import { realExec, trustPolicyFromEnv, type Exec, type TrustPolicy } from "../images.ts";
import type { ImageInfo, SideProvenance, SideSpec } from "../types.ts";
import { osTempFiles, type TempFiles } from "./command.ts";
import { collectManifest } from "./manifest.ts";
import { DEFAULT_SBOM_CMD, collectSbom, type SbomAcquired, type SbomSourcePolicy } from "./sbom.ts";
import { IMAGE_APPS, type AppImageStatic, type Collected, type ImageApp, type SbomData, type SideImageStatic } from "./types.ts";
import { DEFAULT_VULN_CMD, collectVulns } from "./vulns.ts";

/** How static image artefacts are collected. Every field has an environment variable (docs/contract.md). */
export interface StaticPolicy {
  sbomSource: SbomSourcePolicy;
  sbomCmd: string;
  vulnCmd: string;
  /** A pre-fetched, pinned scanner database directory. */
  vulnDbDir?: string;
  trust: TrustPolicy;
}

export function staticPolicyFromEnv(env: NodeJS.ProcessEnv = process.env, trust: TrustPolicy = trustPolicyFromEnv(env)): StaticPolicy {
  const source = (env.HARNESS_SBOM_SOURCE || "auto").toLowerCase();
  if (source !== "auto" && source !== "attestation" && source !== "generate") throw new Error(`HARNESS_SBOM_SOURCE must be auto, attestation or generate, not "${env.HARNESS_SBOM_SOURCE}"`);
  return {
    sbomSource: source,
    sbomCmd: env.HARNESS_SBOM_CMD || DEFAULT_SBOM_CMD,
    vulnCmd: env.HARNESS_VULN_CMD || DEFAULT_VULN_CMD,
    ...(env.HARNESS_VULN_DB_DIR ? { vulnDbDir: env.HARNESS_VULN_DB_DIR } : {}),
    trust
  };
}

export interface CollectDeps {
  exec?: Exec;
  files?: TempFiles;
  policy?: StaticPolicy;
  log: (m: string) => void;
}

/**
 * Collect the manifest, SBOM and vulnerability list of every image a side runs.
 * Reads the images, never the running apps, so it runs before the stack starts.
 * It never throws for a missing tool or attestation: that is a reason, in the
 * result, and the report says so.
 */
export function collectImageStatic(images: SideSpec["images"], provenance: SideProvenance | undefined, deps: CollectDeps): SideImageStatic {
  const exec = deps.exec ?? realExec;
  const files = deps.files ?? osTempFiles();
  const policy = deps.policy ?? staticPolicyFromEnv();
  const out = {} as SideImageStatic;
  for (const app of IMAGE_APPS) out[app] = collectApp(app, images[app], provenance?.images[app], { exec, files, policy, log: deps.log });
  return out;
}

function collectApp(app: ImageApp, ref: string, info: ImageInfo | undefined, deps: { exec: Exec; files: TempFiles; policy: StaticPolicy; log: (m: string) => void }): AppImageStatic {
  const { exec, files, policy, log } = deps;
  const manifest = collectManifest(exec, ref);
  const sbom = collectSbom({ exec, policy: policy.trust, sbomSource: policy.sbomSource, sbomCmd: policy.sbomCmd }, ref, info);
  const vulns = collectVulns({ exec, files, vulnCmd: policy.vulnCmd, ...(policy.vulnDbDir ? { dbDir: policy.vulnDbDir } : {}) }, app, sbom.ok ? sbom.spdxText : undefined, sbom.ok ? undefined : sbom.reason);
  // The text was only for the scanner; what is kept is the package multiset.
  const { spdxText: _text, ...keptSbom } = sbom as SbomAcquired;
  for (const [kind, value] of [["manifest", manifest], ["sbom", sbom], ["vulns", vulns]] as const) {
    if (!value.ok) log(`  ${app}: ${kind} NOT COLLECTED: ${value.reason}`);
  }
  return { manifest, sbom: keptSbom as Collected<SbomData>, vulns };
}

