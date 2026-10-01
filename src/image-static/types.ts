/**
 * Static container artefacts (phase R5): facts about an image collected from
 * the image itself (its manifest, the SBOM cosign attested to it, a
 * vulnerability scan of that SBOM), never from the running app. Each is
 * either collected or reported as "not collected: <reason>"; there is no
 * third state, so a missing SBOM or scanner can never look like a clean diff.
 */

import { APPS } from "../image-ref.ts";

/** The same apps as everywhere else: an image artefact is collected for every one. */
export const IMAGE_APPS = APPS;
export type ImageApp = (typeof IMAGE_APPS)[number];

/** A value, or the reason there is none. */
export type Collected<T> = { ok: true; data: T; /** where it came from, for people */ source?: string } | { ok: false; reason: string };

/** What `docker image inspect` says an image is. */
export interface ImageManifest {
  os: string;
  arch: string;
  /** Config.User exactly as the image states it; "" means unset, which is root. */
  user: string;
  /** Exposed ports, e.g. "3000/tcp", sorted. */
  ports: string[];
  entrypoint: string[] | null;
  cmd: string[] | null;
  /** Number of filesystem layers. */
  layers: number;
  /** Uncompressed size in bytes. */
  size: number;
  /** diffID of the lowest layer: a fingerprint of the base image's OS layer, available on every image. */
  bottomLayer: string;
  /** `org.opencontainers.image.base.name` / `.base.digest`, when the build recorded them. */
  baseName?: string;
  baseDigest?: string;
  /** Every `org.opencontainers.*` label. */
  labels: Record<string, string>;
  /**
   * Since 1.22.0, for the policy family: `Config.Healthcheck.Test` joined by spaces, or null when the image declares
   * none (or `NONE`). Absent from a capture recorded before 1.22.0.
   */
  healthcheck?: string | null;
  /** Since 1.22.0: environment variables whose name or value looks like a secret (src/image-static/secrets.ts). Names and why only: a value is never kept. */
  secretEnv?: SecretFinding[];
  /**
   * Since 1.22.0: build arguments and commands in the image's layer history (`docker image history`) that look like a
   * secret, names and why only; null when the history could not be read. Absent from a capture recorded before 1.22.0.
   */
  secretHistory?: SecretFinding[] | null;
}

/** Something in an image that looks like a secret. Never the value. */
export interface SecretFinding {
  /** The variable's name, or the pattern's name when the value alone gave it away. */
  name: string;
  /** For the history: the 0-based position of the history entry, newest first, as `docker image history` lists it. */
  entry?: number;
  /** Why it looks like a secret, for people: "its name says it is a token", "the value is a GitHub token". */
  why: string;
}

/**
 * Since 1.22.0, for the policy family: the SLSA provenance cosign verified on an image's digest, under the same
 * signing identity as its signature. `statements` is empty when the image carries none.
 */
export interface BuildProvenanceData {
  /** The certificate identity the attestations were verified against (HARNESS_COSIGN_IDENTITY). */
  identity: string;
  statements: { predicateType: string; builder: string | null; workflow: string | null }[];
}

export type SbomSource = "attestation" | "attestation-unverified" | "generated";

/** The package multiset of an SBOM: `name@version` -> how many times it appears. */
export interface SbomData {
  source: SbomSource;
  packages: Record<string, number>;
}

export interface VulnFinding {
  severity: string;
  /** `name@version` of every package the scanner matched it to. */
  packages: string[];
  fixedIn?: string;
}

export interface VulnData {
  scanner: { name: string; version?: string; /** the vulnerability database it ran with, as far as the output says */ db?: string };
  /** CVE (or other advisory) id -> finding. */
  findings: Record<string, VulnFinding>;
  /**
   * Since 1.23.0: the OpenVEX file the scan was given (`--vex`, src/image-static/vex.ts), and the advisories the scanner
   * set aside under it (grype's ignoredMatches with a VEX status). Absent when the scan had none.
   */
  vex?: { source: string; sha256: string; statements: number; excepts: number; excepted: string[] };
}

export interface AppImageStatic {
  manifest: Collected<ImageManifest>;
  sbom: Collected<SbomData>;
  vulns: Collected<VulnData>;
  /** Since 1.22.0: the image's verified SLSA provenance, for the build-provenance policy. Absent from a capture recorded before 1.22.0. */
  buildProvenance?: Collected<BuildProvenanceData>;
}

/** Everything collected for one side: per app. */
export type SideImageStatic = Record<"reader" | "catalogue" | "live", AppImageStatic> & { time?: AppImageStatic };

// ---- what the report says about it ---------------------------------------------------

export const IMAGE_ARTEFACT_KINDS = ["manifest", "sbom", "vulns"] as const;
export type ImageArtefactKind = (typeof IMAGE_ARTEFACT_KINDS)[number];

export interface ImageArtefactStatus {
  collected: boolean;
  /** Collected: where it came from, e.g. `attestation`, `generated`, `grype 0.9.1`. For people. */
  source?: string;
  /** Not collected: why. For people. */
  reason?: string;
  /** Collected: one line of what was found. For people. */
  summary?: string;
}

export type SideImageArtefacts = Record<"reader" | "catalogue" | "live", Record<ImageArtefactKind, ImageArtefactStatus>> & { time?: Record<ImageArtefactKind, ImageArtefactStatus> };
