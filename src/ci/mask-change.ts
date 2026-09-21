/**
 * CI guard: masks land in their own PR.
 *
 *   tsx src/ci/mask-change.ts --base <sha> [--max-masks 40]
 *
 * A mask is a blind spot you chose. The failure to prevent is a mask added in
 * the same change that needs it to pass: the reviewer sees a green run and a
 * diff that both explains and hides the difference. So a PR that ADDS or
 * LOOSENS anything in `normalise/masks.yaml` (a new mask, a changed mask, a
 * changed engine threshold) may change nothing else, apart from the mask's
 * notes, its tests, and the version bump every such PR needs
 * (`src/ci/engine-change.ts`). Removing a mask only tightens the harness and
 * may travel with anything.
 *
 * Also warns (never fails) when the list has grown past ~40 masks: past that,
 * nobody reviews it.
 *
 * Exits 1 on a violation; writes `masks_changed=true|false` to $GITHUB_OUTPUT.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import picomatch from "picomatch";
import { parse } from "yaml";
import { DEFAULT_MAX_MASKS } from "./noise-history.ts";

export const MASKS_FILE = "normalise/masks.yaml";

/** What a PR that adds or loosens a mask may also touch. */
export const MASK_PR_ALLOWED = [MASKS_FILE, "docs/noise-burndown.md", "docs/masks.md", "tests/normalise.test.ts", "tests/masks*.test.ts", "tests/fixtures/masks/**", "package.json"] as const;

interface MaskFile {
  masks?: { id: string }[];
  [engine: string]: unknown;
}

export interface MaskDiff {
  added: string[];
  /** Masks present on both sides whose definition differs. */
  changed: string[];
  removed: string[];
  /** Engine thresholds (screenshot, metrics, logs, timing) that differ: each is a mask of a kind. */
  thresholds: string[];
  baseCount: number;
  headCount: number;
  /** Anything that adds to or loosens what the harness ignores. */
  loosens: boolean;
}

const asFile = (text: string | undefined): MaskFile => (text ? ((parse(text) as MaskFile | null) ?? {}) : {});

export function diffMasks(baseText: string | undefined, headText: string | undefined): MaskDiff {
  const base = asFile(baseText);
  const head = asFile(headText);
  const b = new Map((base.masks ?? []).map((m) => [m.id, m]));
  const h = new Map((head.masks ?? []).map((m) => [m.id, m]));
  const added = [...h.keys()].filter((id) => !b.has(id));
  const removed = [...b.keys()].filter((id) => !h.has(id));
  const changed = [...h.keys()].filter((id) => b.has(id) && !isDeepStrictEqual(b.get(id), h.get(id)));
  const keys = new Set([...Object.keys(base), ...Object.keys(head)].filter((k) => k !== "masks"));
  const thresholds = [...keys].filter((k) => !isDeepStrictEqual(base[k], head[k]));
  return { added, changed, removed, thresholds, baseCount: b.size, headCount: h.size, loosens: added.length + changed.length + thresholds.length > 0 };
}

export interface MaskPrInput {
  changedFiles: string[];
  diff: MaskDiff;
  /** package.json as text at the base and at the head. */
  packageJson?: { base?: string; head?: string };
  maxMasks?: number;
}

export interface MaskPrResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** True when package.json differs only in `version` (the bump the engine-change rule demands). */
export function onlyVersionChanged(base: string | undefined, head: string | undefined): boolean {
  if (!base || !head) return false;
  const strip = (t: string) => {
    const { version: _v, ...rest } = JSON.parse(t) as Record<string, unknown>;
    return rest;
  };
  return isDeepStrictEqual(strip(base), strip(head));
}

export function checkMaskPr(input: MaskPrInput): MaskPrResult {
  const { diff } = input;
  const errors: string[] = [];
  const warnings: string[] = [];
  const files = input.changedFiles.map((f) => f.replaceAll("\\", "/"));
  const allowed = picomatch([...MASK_PR_ALLOWED], { dot: true });

  if (diff.loosens) {
    const others = files.filter((f) => !allowed(f) || (f === "package.json" && !onlyVersionChanged(input.packageJson?.base, input.packageJson?.head)));
    if (others.length) {
      const what = [...diff.added.map((id) => `added ${id}`), ...diff.changed.map((id) => `changed ${id}`), ...diff.thresholds.map((k) => `changed the ${k} thresholds`)].join(", ");
      errors.push(`${MASKS_FILE} ${what}, and this PR also changes: ${others.join(", ")}. Masks land in their own PR (with only their notes, tests and the version bump), so the reviewer of the change never also reviews the blind spot that hides it; see docs/noise-burndown.md.`);
    }
  }

  const max = input.maxMasks ?? DEFAULT_MAX_MASKS;
  if (diff.headCount > max) warnings.push(`the mask list has ${diff.headCount} masks, over the review limit of ${max}: consolidate, delete silent ones, or fix the app's determinism instead of masking (docs/noise-burndown.md)`);
  return { ok: errors.length === 0, errors, warnings };
}

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function gitShow(base: string, path: string): string | undefined {
  try {
    return git("show", `${base}:${path}`);
  } catch {
    return undefined;
  }
}

function main(argv: string[]): number {
  const at = argv.indexOf("--base");
  const base = at >= 0 ? argv[at + 1] : undefined;
  const mm = argv.indexOf("--max-masks");
  const maxMasks = mm >= 0 ? Number(argv[mm + 1]) : DEFAULT_MAX_MASKS;
  if (!base) {
    console.error("usage: mask-change --base <sha> [--max-masks 40]");
    return 2;
  }
  const changedFiles = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter(Boolean);
  const diff = diffMasks(gitShow(base, MASKS_FILE), existsSync(MASKS_FILE) ? readFileSync(MASKS_FILE, "utf8") : undefined);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `masks_changed=${diff.loosens}\n`);
  const result = checkMaskPr({ changedFiles, diff, packageJson: { ...(gitShow(base, "package.json") ? { base: gitShow(base, "package.json")! } : {}), head: readFileSync("package.json", "utf8") }, maxMasks });

  console.log(`masks: ${diff.baseCount} -> ${diff.headCount} (added ${diff.added.length}, changed ${diff.changed.length}, removed ${diff.removed.length}, thresholds changed ${diff.thresholds.length})`);
  for (const w of result.warnings) console.log(`::warning title=Mask count::${w}`);
  for (const e of result.errors) console.error(`::error title=Masks land in their own PR::${e}`);
  if (result.ok && diff.loosens) console.log("this PR changes masks and nothing else: ok");
  if (result.ok && !diff.loosens) console.log("no mask added or loosened: ok");
  return result.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
