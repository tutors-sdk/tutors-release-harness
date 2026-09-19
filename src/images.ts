import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { APPS, dockerRef, imagesFor, isBuildable, isRegistryRef, parseRef, type App, type AppImages } from "./image-ref.ts";
import { ROOT } from "./stack.ts";
import type { ImageInfo, SideProvenance } from "./types.ts";

/**
 * Exit code for "the images could not be obtained or could not be trusted":
 * the same class as a usage or harness error (README: 0 pass or warn, 1 fail,
 * 2 usage or harness error). It is deliberately not 1 — 1 means the harness
 * judged a release and it failed; here nothing was judged at all.
 */
export const EXIT_CANNOT_JUDGE = 2;

/** The identity the monorepo's image-build workflow signs as (cosign keyless, GitHub OIDC). */
export const DEFAULT_COSIGN_IDENTITY = "^https://github.com/tutors-sdk/tutors-mono-repo/\\.github/workflows/image-build\\.yml@";
export const DEFAULT_COSIGN_ISSUER = "https://token.actions.githubusercontent.com";

export interface ExecResult {
  /** Exit status; null when the process could not be started. */
  status: number | null;
  stdout: string;
  stderr: string;
  /** Set when the process could not be started at all (e.g. ENOENT: not installed). */
  error?: NodeJS.ErrnoException;
}

/** Runs one external command. Injected everywhere in this file so unit tests never touch Docker or cosign. */
export type Exec = (cmd: string, args: string[], opts?: { env?: NodeJS.ProcessEnv; inherit?: boolean }) => ExecResult;

export const realExec: Exec = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, MSYS_NO_PATHCONV: "1", ...opts.env },
    stdio: opts.inherit ? ["ignore", "inherit", "inherit"] : ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024
  });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", ...(result.error ? { error: result.error as NodeJS.ErrnoException } : {}) };
};

// ---- the ledger ------------------------------------------------------------------

/**
 * What `images ensure` learned, kept between it and the `run` that follows
 * (they are separate processes, in CI separate steps). An entry only counts
 * while the local image id still matches: retag or rebuild the image and the
 * entry no longer applies.
 */
export interface LedgerEntry {
  id: string;
  provenance: ImageInfo["provenance"];
  digest?: string;
  verifiedIdentity?: string;
  unverifiedReason?: string;
  builtFrom?: { ref: string; sha?: string };
  recordedAt: string;
}
export type Ledger = Record<string, LedgerEntry>;

export interface LedgerStore {
  read(): Ledger;
  write(ledger: Ledger): void;
}

export const LEDGER_FILE = process.env.HARNESS_PROVENANCE_FILE ?? resolve(ROOT, ".harness", "image-provenance.json");

export function fileLedger(path = LEDGER_FILE): LedgerStore {
  return {
    read() {
      if (!existsSync(path)) return {};
      try {
        return JSON.parse(readFileSync(path, "utf8")) as Ledger;
      } catch {
        return {};
      }
    },
    write(ledger) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, JSON.stringify(ledger, null, 2));
    }
  };
}

export function memoryLedger(initial: Ledger = {}): LedgerStore {
  let ledger = initial;
  return { read: () => ledger, write: (next) => void (ledger = next) };
}

// ---- trust policy ----------------------------------------------------------------

export interface TrustPolicy {
  /** Regular expression the signing certificate's identity must match. */
  identity: string;
  issuer: string;
  /** Judge pulled images that could not be verified. Loud, and recorded in the report. */
  allowUnsigned: boolean;
}

const truthy = (v: string | undefined) => v !== undefined && /^(1|true|yes)$/i.test(v);

export function trustPolicyFromEnv(env: NodeJS.ProcessEnv = process.env, allowUnsignedFlag = false): TrustPolicy {
  return {
    identity: env.HARNESS_COSIGN_IDENTITY || DEFAULT_COSIGN_IDENTITY,
    issuer: env.HARNESS_COSIGN_ISSUER || DEFAULT_COSIGN_ISSUER,
    allowUnsigned: allowUnsignedFlag || truthy(env.HARNESS_ALLOW_UNSIGNED)
  };
}

/** The images could not be obtained, or may not be judged. Maps to exit code 2. */
export class ImageTrustError extends Error {
  readonly exitCode = EXIT_CANNOT_JUDGE;
  constructor(message: string) {
    super(message);
    this.name = "ImageTrustError";
  }
}

// ---- docker and cosign, through the injected runner ------------------------------

interface Inspected {
  id: string;
  repoDigests: string[];
  labels: Record<string, string>;
}

function inspect(exec: Exec, ref: string): Inspected | undefined {
  const result = exec("docker", ["image", "inspect", "--format", "{{json .}}", dockerRef(ref)]);
  if (result.status !== 0) return undefined;
  try {
    const raw = JSON.parse(result.stdout.trim()) as { Id?: string; RepoDigests?: string[] | null; Config?: { Labels?: Record<string, string> | null } };
    return { id: raw.Id ?? "", repoDigests: raw.RepoDigests ?? [], labels: raw.Config?.Labels ?? {} };
  } catch {
    return undefined;
  }
}

/**
 * The registry digest of a local image for the repository it is referred to
 * by. Only a digest recorded against that same repository counts: an image
 * can carry digests from several registries, and a signature is looked up by
 * repository.
 */
export function registryDigest(ref: string, repoDigests: string[]): string | undefined {
  const { repo, digest } = parseRef(ref);
  const known = repoDigests.filter((d) => d.startsWith(`${repo}@`)).map((d) => d.slice(repo.length + 1));
  if (digest) return known.includes(digest) ? digest : undefined;
  return known[0];
}

/** The monorepo signs with cosign 3; an older cosign cannot read those signatures and reports them as missing. */
export const MIN_COSIGN_MAJOR = 3;

/** The installed cosign's version when it is too old to verify, else undefined. Only asked after a failure, to explain it. */
function oldCosign(exec: Exec): string | undefined {
  const version = /GitVersion:\s*v?(\d+)\.(\d+)\.(\d+)/.exec(exec("cosign", ["version"]).stdout);
  return version && Number(version[1]) < MIN_COSIGN_MAJOR ? `${version[1]}.${version[2]}.${version[3]}` : undefined;
}

export type Verification = { ok: true; identity: string } | { ok: false; reason: string };

/** `cosign verify` by digest against the publishing workflow's identity. Never by tag: a tag can move between the pull and the check. */
export function verifySignature(exec: Exec, repo: string, digest: string, policy: TrustPolicy): Verification {
  const subject = `${repo}@${digest}`;
  const result = exec("cosign", ["verify", "--certificate-identity-regexp", policy.identity, "--certificate-oidc-issuer", policy.issuer, subject]);
  if (result.error) {
    return { ok: false, reason: result.error.code === "ENOENT" ? "cosign is not installed (https://docs.sigstore.dev/cosign/system_config/installation/), so the signature cannot be checked" : `cosign could not be run: ${result.error.message}` };
  }
  if (result.status !== 0) {
    const why = result.stderr.trim().split(/\r?\n/).filter(Boolean).slice(-2).join(" / ") || `cosign exited ${result.status}`;
    const old = oldCosign(exec);
    const hint = old ? ` — and this is cosign ${old}: the images are signed with cosign 3, and verifying them needs cosign >= ${MIN_COSIGN_MAJOR}` : "";
    return { ok: false, reason: `no valid signature for ${subject} by ${policy.identity} (issuer ${policy.issuer}): ${why}${hint}` };
  }
  return { ok: true, identity: policy.identity };
}

// ---- describing a side -----------------------------------------------------------

function infoFrom(ref: string, inspected: Inspected, entry: LedgerEntry | undefined): ImageInfo {
  // Only a pulled image has a registry digest worth reporting: Docker's containerd image store
  // gives every local build a RepoDigest too (its own manifest), which no registry ever served.
  const digest = entry?.provenance.startsWith("pulled") ? (registryDigest(ref, inspected.repoDigests) ?? entry.digest) : undefined;
  const label = (k: string) => inspected.labels[`org.opencontainers.image.${k}`] || undefined;
  const revision = label("revision") ?? entry?.builtFrom?.sha;
  return {
    ref,
    id: inspected.id,
    ...(digest ? { digest } : {}),
    ...(revision ? { revision } : {}),
    ...(label("version") ? { version: label("version")! } : {}),
    ...(label("created") ? { created: label("created")! } : {}),
    provenance: entry?.provenance ?? "local",
    ...(entry?.verifiedIdentity ? { verifiedIdentity: entry.verifiedIdentity } : {}),
    ...(entry?.unverifiedReason ? { unverifiedReason: entry.unverifiedReason } : {}),
    ...(entry?.builtFrom ? { builtFrom: { ...entry.builtFrom, ...(entry.builtFrom.sha || !revision ? {} : { sha: revision }) } } : {})
  };
}

const short = (sha: string | undefined) => (sha ? sha.replace(/^sha256:/, "").slice(0, 12) : "");

export function describeProvenance(info: ImageInfo): string {
  if (info.provenance === "built-from-ref") return `built-from-ref ${info.builtFrom?.ref ?? "?"}@${short(info.builtFrom?.sha ?? info.revision) || "?"}`;
  if (info.provenance === "local") return "local (unverified)";
  return info.provenance;
}

/** One line per side: the single provenance when the three images agree, otherwise each app's. */
export function summarise(images: Record<App, ImageInfo>, allowedUnsigned: boolean): SideProvenance {
  const each = APPS.map((app) => describeProvenance(images[app]));
  const summary = new Set(each).size === 1 ? each[0]! : APPS.map((app, i) => `${app}: ${each[i]}`).join("; ");
  const unverified = APPS.some((app) => images[app].provenance === "pulled-unverified");
  return { summary, ...(allowedUnsigned && unverified ? { allowedUnsigned: true } : {}), images };
}

/**
 * Look at a side's images just before they run: read id, digest and OCI labels,
 * and decide whether they may be judged. An image that came from a registry
 * must have a verification on record for the exact local image (from
 * `images ensure`); if it does not, it is verified now. Nothing here pulls.
 */
export function resolveSideProvenance(images: AppImages, deps: { exec: Exec; ledger: LedgerStore; policy: TrustPolicy; log: (m: string) => void }): SideProvenance {
  const ledger = deps.ledger.read();
  const out = {} as Record<App, ImageInfo>;
  let dirty = false;
  for (const app of APPS) {
    const ref = images[app];
    const inspected = inspect(deps.exec, ref);
    if (!inspected) throw new ImageTrustError(`${ref} is not present locally; run \`harness images ensure\` first (it pulls, verifies the signature, or builds from the monorepo ref)`);
    let entry = ledger[ref]?.id === inspected.id ? ledger[ref] : undefined;
    const digest = registryDigest(ref, inspected.repoDigests);
    // An image under a registry name that carries a digest is treated as pulled unless this
    // harness built that exact image itself (the ledger entry matches its id). A RepoDigest alone
    // does not prove a pull — the containerd image store gives local builds one — but refusing
    // is the safe reading, and `--allow-unsigned` or a non-registry name is the way out.
    const fromRegistry = isRegistryRef(ref) && digest !== undefined && entry?.provenance !== "built-from-ref";
    if (fromRegistry && entry?.provenance !== "pulled+verified") {
      entry = settle(ref, inspected, digest, deps);
      ledger[ref] = entry;
      dirty = true;
    }
    out[app] = infoFrom(ref, inspected, entry);
  }
  if (dirty) deps.ledger.write(ledger);
  return summarise(out, deps.policy.allowUnsigned);
}

/** Verify a pulled image and turn the answer into a ledger entry, or refuse. */
function settle(ref: string, inspected: Inspected, digest: string, deps: { exec: Exec; policy: TrustPolicy; log: (m: string) => void }): LedgerEntry {
  const verified = verifySignature(deps.exec, parseRef(ref).repo, digest, deps.policy);
  const recordedAt = new Date().toISOString();
  if (verified.ok) {
    deps.log(`  verified ${parseRef(ref).repo}@${digest.slice(0, 19)}… signed by ${verified.identity}`);
    return { id: inspected.id, provenance: "pulled+verified", digest, verifiedIdentity: verified.identity, recordedAt };
  }
  if (!deps.policy.allowUnsigned) {
    throw new ImageTrustError(`${ref}: ${verified.reason}. A registry image is not judged without a verified signature; for local work only, --allow-unsigned (or HARNESS_ALLOW_UNSIGNED=1) overrides this and the report says so.`);
  }
  deps.log(`  WARNING: ${ref} is NOT VERIFIED and will be judged anyway (--allow-unsigned): ${verified.reason}`);
  return { id: inspected.id, provenance: "pulled-unverified", digest, unverifiedReason: verified.reason, recordedAt };
}

// ---- images ensure ---------------------------------------------------------------

export interface ImageRequest {
  /** What --a / --b was given. */
  spec: string;
  /** The monorepo git ref to build from when the registry has no such tag; defaults to `v<tag>`, `<tag>`, `release/<tag>`. */
  ref?: string;
}

export interface EnsureDeps {
  exec?: Exec;
  ledger?: LedgerStore;
  policy?: TrustPolicy;
  log: (m: string) => void;
}

export interface EnsureResult {
  ok: boolean;
  /** 0, or EXIT_CANNOT_JUDGE with every reason in `problems`. */
  exitCode: number;
  problems: string[];
  sides: { spec: string; provenance?: SideProvenance }[];
}

function build(exec: Exec, ref: string, tag: string, prefix: string, log: (m: string) => void): boolean {
  log(`  BUILDING FROM SOURCE: ${tag} is not in the registry; building the three images from monorepo ref ${ref}`);
  return exec("bash", ["scripts/build-images.sh", ref, tag], { env: { HARNESS_IMAGE_PREFIX: prefix }, inherit: true }).status === 0;
}

/**
 * Make sure every image a side needs exists locally and may be judged:
 *
 *   1. already local                       -> used as it is (a registry image among them is verified if it has not been)
 *   2. a registry reference, by tag/digest -> pulled, then its signature verified BY DIGEST; unsigned is refused
 *   3. a bare tag the registry lacks       -> built from the monorepo at the matching git ref, loudly
 *
 * This is the one place the harness touches source, and only to produce an
 * image it then treats like any other. What happened is written to the ledger,
 * which `run` reads into capture.json and the report header.
 */
export function ensureImages(requests: ImageRequest[], prefix: string, deps: EnsureDeps): EnsureResult {
  const exec = deps.exec ?? realExec;
  const store = deps.ledger ?? fileLedger();
  const policy = deps.policy ?? trustPolicyFromEnv();
  const { log } = deps;
  const problems: string[] = [];
  const sides: EnsureResult["sides"] = [];
  const problem = (message: string) => {
    problems.push(message);
    log(`  ERROR: ${message}`);
  };
  if (policy.allowUnsigned) log("WARNING: --allow-unsigned is set: registry images that fail signature verification will still be judged. Never use this for a release decision.");

  const seen = new Set<string>();
  for (const request of requests) {
    if (seen.has(request.spec)) continue;
    seen.add(request.spec);
    let images: AppImages;
    try {
      images = imagesFor(request.spec, prefix);
    } catch (e) {
      problem(e instanceof Error ? e.message : String(e));
      sides.push({ spec: request.spec });
      continue;
    }
    log(`${request.spec}:`);

    // 1 and 2: local, else pull. Names without a registry host are never pulled.
    const missing: string[] = [];
    for (const ref of new Set(Object.values(images))) {
      if (inspect(exec, ref)) {
        log(`  ${ref}: present locally`);
        continue;
      }
      if (!isRegistryRef(ref)) {
        log(`  ${ref}: not present, and not a registry reference, so it is not pulled`);
        missing.push(ref);
        continue;
      }
      log(`  pulling ${ref}`);
      const pulled = exec("docker", ["pull", "--quiet", dockerRef(ref)]);
      if (pulled.error) problem(`docker could not be run: ${pulled.error.message}`);
      if (pulled.status !== 0) {
        log(`  ${ref}: not in the registry (${pulled.stderr.trim().split(/\r?\n/).pop() ?? `docker pull exited ${pulled.status}`})`);
        missing.push(ref);
      }
    }

    // 3: the loud fallback.
    let builtFrom: string | undefined;
    if (missing.length) {
      if (!isBuildable(request.spec)) {
        problem(`${missing.join(", ")}: not available, and "${request.spec}" is not a bare tag, so it cannot be built from a monorepo ref`);
        sides.push({ spec: request.spec });
        continue;
      }
      const refs = request.ref ? [request.ref] : [`v${request.spec}`, request.spec, `release/${request.spec}`];
      builtFrom = refs.find((ref) => build(exec, ref, request.spec, prefix, log));
      if (!builtFrom) {
        problem(`${request.spec}: not in the registry and could not be built from any of ${refs.join(", ")}`);
        sides.push({ spec: request.spec });
        continue;
      }
      // The build tags all three apps, replacing anything pulled under the same tag.
      const ledger = store.read();
      for (const ref of new Set(Object.values(images))) {
        const inspected = inspect(exec, ref);
        if (!inspected) continue;
        const sha = inspected.labels["org.opencontainers.image.revision"];
        ledger[ref] = { id: inspected.id, provenance: "built-from-ref", builtFrom: { ref: builtFrom, ...(sha ? { sha } : {}) }, recordedAt: new Date().toISOString() };
      }
      store.write(ledger);
    }

    // Verify whatever came from a registry, and describe the side.
    try {
      const provenance = resolveSideProvenance(images, { exec, ledger: store, policy, log });
      for (const app of APPS) {
        const info = provenance.images[app];
        log(`  ${app}: ${info.ref} — ${describeProvenance(info)}${info.digest ? ` · ${info.digest.slice(0, 19)}…` : ""}${info.revision ? ` · revision ${short(info.revision)}` : ""}${info.version ? ` · version ${info.version}` : ""}`);
      }
      sides.push({ spec: request.spec, provenance });
    } catch (e) {
      if (!(e instanceof ImageTrustError)) throw e;
      problem(e.message);
      sides.push({ spec: request.spec });
    }
  }

  const ok = problems.length === 0;
  if (!ok) log(`images ensure: ${problems.length} problem(s); nothing may be judged (exit ${EXIT_CANNOT_JUDGE})`);
  return { ok, exitCode: ok ? 0 : EXIT_CANNOT_JUDGE, problems, sides };
}
