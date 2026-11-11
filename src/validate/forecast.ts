/**
 * `harness validate forecast` (since 1.63.0, docs/validate-forecast.md): what lecturers would be told about real
 * courses if main's `tutors validate` shipped, beside what the published one tells them today. Since mono-repo #591 the
 * standard netlify.toml runs validate before the generator, so a new error is not a message: it stops that course's
 * deploy. The forecast explains each difference by the rule that made it, as the release forecast counts causes.
 */

export type Severity = "error" | "warn" | "info";

export interface Finding {
  rule: string;
  severity: Severity;
  path: string;
  message: string;
}

/** One side's run over one course: its findings, or why it could not run. */
export interface SideRun {
  findings?: Finding[];
  problem?: string;
}

export interface CourseForecast {
  course: string;
  commit: string;
  production: SideRun;
  candidate: SideRun;
  /** On main and not in production; empty when production could not run. */
  added: Finding[];
  removed: Finding[];
  /** Errors main reports: each stops this course's deploy once main ships. */
  candidateErrors: number;
  productionErrors?: number;
}

export interface RuleCause {
  rule: string;
  added: number;
  removed: number;
  /** Added findings that are errors: deploys this rule would newly stop. */
  newErrors: number;
  courses: string[];
}

export interface ValidateForecast {
  production: { spec: string; version?: string; problem?: string };
  candidate: { dir: string; sha?: string };
  courses: CourseForecast[];
  causes: RuleCause[];
  /** Courses main's validate would stop deploying (any error). */
  stopped: string[];
  /** Courses that deploy under production's validate and would stop under main's. */
  newlyStopped: string[];
}

const key = (f: Finding) => JSON.stringify([f.rule, f.severity, f.path, f.message]);
const errors = (fs: readonly Finding[] | undefined) => (fs ?? []).filter((f) => f.severity === "error").length;

export function forecastCourse(course: string, commit: string, production: SideRun, candidate: SideRun): CourseForecast {
  const both = production.findings !== undefined && candidate.findings !== undefined;
  const before = new Set((production.findings ?? []).map(key));
  const after = new Set((candidate.findings ?? []).map(key));
  return {
    course,
    commit,
    production,
    candidate,
    added: both ? candidate.findings!.filter((f) => !before.has(key(f))) : [],
    removed: both ? production.findings!.filter((f) => !after.has(key(f))) : [],
    candidateErrors: errors(candidate.findings),
    ...(production.findings !== undefined ? { productionErrors: errors(production.findings) } : {})
  };
}

/** Each difference counted once, under the rule that made it. */
export function causesOf(courses: readonly CourseForecast[]): RuleCause[] {
  const by = new Map<string, RuleCause>();
  const at = (rule: string) => by.get(rule) ?? (by.set(rule, { rule, added: 0, removed: 0, newErrors: 0, courses: [] }), by.get(rule)!);
  for (const c of courses) {
    for (const f of c.added) {
      const cause = at(f.rule);
      cause.added++;
      if (f.severity === "error") cause.newErrors++;
      if (!cause.courses.includes(c.course)) cause.courses.push(c.course);
    }
    for (const f of c.removed) {
      const cause = at(f.rule);
      cause.removed++;
      if (!cause.courses.includes(c.course)) cause.courses.push(c.course);
    }
  }
  return [...by.values()].sort((a, b) => b.newErrors - a.newErrors || b.added + b.removed - (a.added + a.removed) || a.rule.localeCompare(b.rule));
}

export function buildForecast(production: ValidateForecast["production"], candidate: ValidateForecast["candidate"], courses: CourseForecast[]): ValidateForecast {
  return {
    production,
    candidate,
    courses,
    causes: causesOf(courses),
    stopped: courses.filter((c) => c.candidateErrors > 0).map((c) => c.course),
    newlyStopped: courses.filter((c) => c.candidateErrors > 0 && c.productionErrors === 0).map((c) => c.course)
  };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function forecastText(f: ValidateForecast): string {
  const out: string[] = [];
  const prod = f.production.problem ? `${f.production.spec}: ${f.production.problem}` : `${f.production.spec} (${f.production.version})`;
  out.push(`tutors validate forecast: main${f.candidate.sha ? ` ${f.candidate.sha.slice(0, 7)}` : ""} against what lecturers run today, ${prod}.`);
  for (const c of f.courses) {
    const side = (r: SideRun, n?: number) => (r.problem ? `cannot run (${r.problem})` : `${plural(n ?? 0, "error")}, ${plural(r.findings!.length, "finding")}`);
    // Production's problem is usually the one above (nothing to run); say it once.
    const prodSide = c.production.problem !== undefined && c.production.problem === f.production.problem ? "" : `; production ${side(c.production, c.productionErrors)}`;
    out.push(`  ${c.course}: main ${side(c.candidate, c.candidateErrors)}${prodSide}`);
  }
  out.push("");
  out.push(
    f.stopped.length === 0
      ? "Main's validate lets every corpus course deploy."
      : `Main's validate would stop ${f.stopped.length} of ${f.courses.length} courses deploying: ${f.stopped.join(", ")}.`
  );
  if (f.newlyStopped.length > 0) out.push(`Newly stopped (they deploy under production's validate): ${f.newlyStopped.join(", ")}.`);
  if (f.production.problem) out.push("Production cannot run validate, so there is nothing to compare: main's findings stand alone.");
  else if (f.causes.length === 0) out.push("Main and production report the same findings on every course.");
  else {
    const total = f.causes.reduce((n, c) => n + c.added + c.removed, 0);
    out.push(`${plural(total, "difference")} from production, from ${plural(f.causes.length, "rule")}:`);
    for (const c of f.causes) {
      const parts = [c.added ? `+${c.added}` : "", c.removed ? `-${c.removed}` : ""].filter(Boolean).join(" ");
      out.push(`  ${c.rule}: ${parts}${c.newErrors ? ` (${plural(c.newErrors, "new error")})` : ""} on ${c.courses.join(", ")}`);
    }
  }
  return out.join("\n") + "\n";
}

/** --strict: exit 1 when main would newly stop a course deploying, or adds an error anywhere. */
export const forecastFails = (f: ValidateForecast): boolean => f.newlyStopped.length > 0 || f.causes.some((c) => c.newErrors > 0);
