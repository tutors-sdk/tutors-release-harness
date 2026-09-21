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
}

export interface AppImageStatic {
  manifest: Collected<ImageManifest>;
  sbom: Collected<SbomData>;
  vulns: Collected<VulnData>;
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
