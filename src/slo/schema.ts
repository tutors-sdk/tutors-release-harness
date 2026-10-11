import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse, YAMLParseError } from "yaml";
import { z } from "zod";
import { InputFileError, inputProblems, unreadable, type Problem } from "../claims/input-error.ts";
import { APPS } from "../image-ref.ts";
import { ROOT } from "../stack.ts";

/**
 * Since 1.34.0: the release's service level objectives, `release/slo.yaml` beside `claims.yaml` in the monorepo
 * (tutors-sdk/tutors-mono-repo#170). The monorepo owns the targets; its alerts burn against them in production and the
 * harness judges a candidate against the same numbers (src/compare/slo.ts). Read with `--slo`; absent, nothing is judged.
 */
export const SLO_FILE = "slo.yaml";

/** The bounds of `http_request_duration_seconds` the monorepo pins (its observability contract test): a latency threshold must be one. */
export const LATENCY_BUCKETS = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] as const;

const SLO_ID = /^[a-z][a-z0-9-]*$/;

const ObjectiveSchema = z
  .object({
    id: z.string().regex(SLO_ID, { message: 'id is lower-case words joined by "-", e.g. "reader-latency"' }),
    app: z.enum(APPS, { message: `app is one of ${APPS.join(", ")}` }),
    kind: z.enum(["availability", "latency"], { message: "kind is availability (share of responses that are not 5xx) or latency (share of requests under threshold)" }),
    target: z.number({ message: "target is a share, e.g. 0.995" }).gt(0, { message: "target is a share above 0" }).lt(1, { message: "target is a share under 1: 1 leaves no error budget" }),
    threshold: z
      .number({ message: "threshold is seconds, e.g. 1" })
      .refine((v) => (LATENCY_BUCKETS as readonly number[]).includes(v), { message: `threshold must be a bucket bound of http_request_duration_seconds (${LATENCY_BUCKETS.join(", ")}), or the SLI cannot be computed exactly` })
      .optional(),
    description: z.string().optional()
  })
  .strict()
  .superRefine((o, ctx) => {
    if (o.kind === "latency" && o.threshold === undefined) ctx.addIssue({ code: "custom", path: ["threshold"], message: "a latency objective needs threshold, in seconds" });
    if (o.kind === "availability" && o.threshold !== undefined) ctx.addIssue({ code: "custom", path: ["threshold"], message: "an availability objective has no threshold" });
  });

const SloFileSchema = z
  .object({
    version: z.literal(1, { message: "version is 1" }).optional(),
    window: z.string().regex(/^\d+d$/, { message: 'window is days, e.g. "28d"' }),
    objectives: z.array(ObjectiveSchema).min(1, { message: "objectives lists at least one" })
  })
  .strict();

export type Objective = z.infer<typeof ObjectiveSchema>;
export interface SloFile {
  /** Where it was read from, for the summary line. */
  source: string;
  window: string;
  objectives: Objective[];
}

/** Parse the text of an SLO file; anything wrong is an {@link InputFileError} that names each problem (exit 2, no stack). */
export function parseSlo(text: string, source: string): SloFile {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    if (e instanceof YAMLParseError) {
      const line = e.linePos ? ` (line ${e.linePos[0].line}, column ${e.linePos[0].col})` : "";
      throw new InputFileError(`${source} is not a valid SLO file: it is not valid YAML${line}:${e.message.split("\n")[0]}`);
    }
    throw e;
  }
  const parsed = SloFileSchema.safeParse(raw);
  if (!parsed.success) {
    const problems: Problem[] = parsed.error.issues.map((issue) => {
      const [first, index, ...rest] = issue.path;
      const where = first === "objectives" && typeof index === "number" ? `objective ${index + 1}` : "the file";
      const field = first === "objectives" && typeof index === "number" ? rest.join(".") : issue.path.join(".");
      return { where, ...(field ? { field } : {}), message: issue.message };
    });
    throw inputProblems("SLO file", source, problems);
  }
  const ids = new Set<string>();
  const dupes = parsed.data.objectives.filter((o) => (ids.has(o.id) ? true : (ids.add(o.id), false)));
  if (dupes.length) throw inputProblems("SLO file", source, dupes.map((o) => ({ where: `objective "${o.id}"`, field: "id", message: "is used twice" })));
  return { source, window: parsed.data.window, objectives: parsed.data.objectives };
}

export function loadSlo(path: string): SloFile {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    throw unreadable("the SLO file", path, e);
  }
  return parseSlo(text, path);
}

/**
 * The harness's own floors (`slo/floors.yaml`): stricter than the monorepo's indicative targets, judged with or without
 * them. A ratchet: raised by PR, never lowered to make a run pass.
 */
export const HARNESS_FLOORS_FILE = resolve(ROOT, "slo", "floors.yaml");

let floors: SloFile | undefined;
export function harnessFloors(): SloFile {
  floors ??= loadSlo(HARNESS_FLOORS_FILE);
  return floors;
}

/** An objective as the engine judges it: the stricter target, and both sides of where it came from. */
export interface JudgedObjective extends Objective {
  /** The harness floor's target for the same app, kind and threshold, when it has one. */
  floor?: number;
  /** The monorepo's target, when its file has one. */
  monorepo?: number;
}

const objectiveKey = (o: Objective) => `${o.app}/${o.kind}/${o.threshold ?? ""}`;

/**
 * The objectives to judge: the harness floors and the monorepo's, matched by app, kind and threshold. Where both have
 * one, the target is the stricter and the monorepo's id is kept; each side's own target is kept beside it.
 */
export function judgedObjectives(floorFile: SloFile, monorepo: SloFile | undefined): JudgedObjective[] {
  const out = new Map<string, JudgedObjective>();
  for (const o of floorFile.objectives) out.set(objectiveKey(o), { ...o, floor: o.target });
  for (const o of monorepo?.objectives ?? []) {
    const f = out.get(objectiveKey(o));
    out.set(objectiveKey(o), { ...o, target: Math.max(o.target, f?.target ?? 0), monorepo: o.target, ...(f ? { floor: f.target } : {}) });
  }
  return [...out.values()];
}
