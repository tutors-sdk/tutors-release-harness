import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import { DIGEST_PATTERN, type Digests } from "./digests.ts";
import { APPS, parseRef, type App } from "./image-ref.ts";
import { harnessHome, releasesDir } from "./local/home.ts";
import type { Deployment, RunReport } from "./types.ts";
import { SCHEMA_VERSION } from "./version.ts";

/**
 * The release record: what release mode judged, in the one place a later step
 * can check it against what was deployed (contract 1.3.0).
 *
 * Release mode writes `releases/<candidate-tag>.json` into the local state
 * directory (HARNESS_HOME, beside the noise store) and, so that CI can publish
 * it, `release-record.json` into the run's output directory. `release.yml`
 * publishes it to the `release-records` branch the way `nightly-noise.yml`
 * publishes the noise status; post-deploy mode reads it back, compares the
 * digests the deploy reported with the ones recorded, and warns when they
 * differ. A record is evidence, never a gate: a missing or different one warns.
 *
 * Files, under the store (`<HARNESS_HOME>/releases`, or the `releases/`
 * directory of the branch):
 *   <candidate>.json   the record of that exact candidate, whatever its verdict
 *   <release>.json     the newest candidate of that release that could ship (not a FAIL, unless overridden);
 *                      `16.3.0-rc.4` belongs to release `16.3.0`. What `--deployed 16.3.0` finds.
 */
export const RELEASE_RECORD_FILE = "release-record.json";

/** A registry tag: what a candidate or a release is called. Nothing in it can leave the store directory. */
const TAG = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
export const isTag = (value: string) => TAG.test(value);

const DigestsSchema = z.record(z.string(), z.string().regex(DIGEST_PATTERN)).superRefine((value, ctx) => {
  for (const app of Object.keys(value)) if (!(APPS as readonly string[]).includes(app)) ctx.addIssue({ code: "custom", message: `unknown app "${app}"` });
});

export const ReleaseRecordSchema = z.strictObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  candidate: z.string().regex(TAG),
  release: z.string().regex(TAG),
  production: z.string().regex(TAG).optional(),
  recordedAt: z.iso.datetime(),
  harness: z.strictObject({ version: z.string(), gitSha: z.string().nullable(), contractVersion: z.string() }),
  verdict: z.enum(["pass", "warn", "fail"]),
  overridden: z.boolean(),
  pinned: z.boolean(),
  verified: z.boolean(),
  digests: DigestsSchema
});
export type ReleaseRecord = z.infer<typeof ReleaseRecordSchema>;

/** `16.3.0-rc.4` -> `16.3.0`; a tag that is not a version names its own release. */
export function releaseOf(candidate: string): string {
  return /^(\d+\.\d+\.\d+)(?:[-+].*)?$/.exec(candidate)?.[1] ?? candidate;
}

export function parseReleaseRecord(text: string, source = "release record"): ReleaseRecord {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(`${source} is not valid JSON`);
  }
  const parsed = ReleaseRecordSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`${source} is not a valid release record:\n${parsed.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n")}`);
  return parsed.data;
}

/** Only the judged candidate's tag is trusted for a name: the tag of side b's reader, when it has one. */
export function candidateTag(report: Pick<RunReport, "sides">): string | undefined {
  const tag = parseRef(report.sides.b.reader).tag;
  return tag && isTag(tag) ? tag : undefined;
}

/** What a finished release-mode report says about the candidate it judged, or why there is nothing to record. */
export function releaseRecordOf(report: RunReport, opts: { pinned: boolean; at?: Date }): { record: ReleaseRecord } | { skipped: string } {
  const candidate = candidateTag(report);
  if (!candidate) return { skipped: `no release record: the candidate's image ${report.sides.b.reader} has no tag to name it by` };
  const images = report.provenance?.b?.images;
  const digests: Digests = {};
  if (images) for (const app of APPS) if (images[app]?.digest) digests[app] = images[app]!.digest!;
  const production = candidateOrUndefined(parseRef(report.sides.a.reader).tag);
  return {
    record: {
      schemaVersion: SCHEMA_VERSION,
      candidate,
      release: releaseOf(candidate),
      ...(production ? { production } : {}),
      recordedAt: (opts.at ?? new Date()).toISOString(),
      harness: report.harness,
      verdict: report.verdict,
      overridden: report.override?.applied === true,
      pinned: opts.pinned,
      verified: images !== undefined && APPS.every((app) => images[app]?.provenance === "pulled+verified"),
      digests
    }
  };
}

const candidateOrUndefined = (tag: string | undefined) => (tag && isTag(tag) ? tag : undefined);

/** Whether this candidate could ship: the record under the release's own name is only ever one that could. */
export const shippable = (record: Pick<ReleaseRecord, "verdict" | "overridden">) => record.verdict !== "fail" || record.overridden;

/**
 * Write the record: into the store (`<candidate>.json`, and `<release>.json` when it could ship) and into the run's
 * output directory as `release-record.json`, which is what CI uploads and publishes.
 */
export function writeReleaseRecord(record: ReleaseRecord, o: { store?: string; outDir: string; log: (m: string) => void }): string[] {
  const store = resolve(o.store ?? releasesDir());
  mkdirSync(store, { recursive: true });
  const text = JSON.stringify(record, null, 2) + "\n";
  const files = [join(store, `${record.candidate}.json`)];
  if (shippable(record) && record.release !== record.candidate) files.push(join(store, `${record.release}.json`));
  for (const file of files) writeFileSync(file, text);
  const inRun = join(o.outDir, RELEASE_RECORD_FILE);
  writeFileSync(inRun, text);
  o.log(`release record for ${record.candidate}: ${files.join(", ")} (and ${inRun}); ${record.verified ? `${Object.keys(record.digests).length} verified digest(s)` : "no verified registry digests: the candidate was not pulled and verified here"}`);
  return [...files, inRun];
}

// ---- reading it back, and judging a deployment ---------------------------------------------------

export interface FoundRecord {
  /** Where it was looked for. */
  file: string;
  record?: ReleaseRecord;
  /** Why there is none to use. */
  problem?: string;
}

/**
 * The record of what was deployed. `where` is `--release-record`: a file, or a directory holding `<tag>.json`; without
 * it, the store under HARNESS_HOME. The lookup order is exactly that, and nothing else is consulted.
 */
export function findReleaseRecord(tag: string, where: string | undefined, home = harnessHome()): FoundRecord {
  const base = where ? resolve(where) : releasesDir(home);
  const file = existsSync(base) && statSync(base).isFile() ? base : join(base, `${tag}.json`);
  if (!existsSync(file)) return { file, problem: `no release record at ${file}` };
  const text = readFileSync(file, "utf8");
  if (!text.trim()) return { file, problem: `${file} is empty` };
  try {
    const record = parseReleaseRecord(text, file);
    if (record.candidate !== tag && record.release !== tag) return { file, problem: `${file} is the record of ${record.candidate} (release ${record.release}), not of ${tag}` };
    return { file, record };
  } catch (e) {
    return { file, problem: (e instanceof Error ? e.message : String(e)).split("\n")[0]! };
  }
}

/**
 * Compare what the deploy reported with what release mode recorded for the candidate. Every gap is a problem, and a
 * problem is a warning: the harness never fails a deployment for what it cannot see. Pure.
 */
export function judgeDeployment(o: { production?: string; digests: Digests; found?: FoundRecord }): Deployment {
  const { digests, found } = o;
  const record = found?.record;
  const base = { ...(o.production ? { production: o.production } : {}), digests, ...(record ? { recorded: record.digests, record: { candidate: record.candidate, judgedAt: record.recordedAt, verdict: record.verdict } } : {}) };
  const tag = o.production ?? "the deployed release";
  if (!record) return { ...base, status: "no-record", problems: [`no release record for ${tag} (${found?.problem ?? "none was looked for"}): whether the deployed images are the ones release mode judged cannot be checked`] };
  const reported = Object.keys(digests) as App[];
  if (!reported.length) return { ...base, status: "not-reported", problems: [`the deploy reported ${tag} but no image digests: whether it runs the images release mode judged (${record.candidate}) cannot be checked`] };

  const differ: string[] = [];
  const gaps: string[] = [];
  for (const app of APPS) {
    const deployed = digests[app];
    const judged = record.digests[app];
    if (deployed && judged && deployed !== judged) differ.push(`${app}: deployed ${deployed}, but release mode judged ${judged} (${record.candidate})`);
    else if (deployed && !judged) gaps.push(`${app}: deployed ${deployed}, but the release record of ${record.candidate} has no digest for it${record.verified ? "" : " (that candidate was not pulled and verified from a registry)"}`);
    else if (!deployed && judged) gaps.push(`${app}: the release record has a digest (${judged}), but the deploy did not report one`);
  }
  if (differ.length) return { ...base, status: "differs", problems: [...differ, ...gaps] };
  if (gaps.length) return { ...base, status: "incomplete", problems: gaps };
  return { ...base, status: "match", problems: [] };
}

/** One line for `reasons` and the summary; undefined when the deployment matches. */
export function deploymentReason(d: Deployment): string | undefined {
  if (d.status === "match") return undefined;
  const head = d.status === "differs" ? "DEPLOYED IMAGES DIFFER from what release mode judged" : "DEPLOYED IMAGES NOT CONFIRMED against what release mode judged";
  return `${head} (advisory, never a FAIL): ${d.problems.join("; ")}`;
}
