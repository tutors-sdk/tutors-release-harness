import type { OverrideRecord, RunReport, Verdict } from "./types.ts";

/**
 * Overriding a harness FAIL.
 *
 * The harness is a gate people can be tempted to route around; the metric that
 * says whether it is trusted or merely tolerated is how often that happens. A
 * bypass in GitHub's branch protection is invisible to the harness, so the
 * supported way past a FAIL is to say so to the harness itself:
 *
 *   harness run … --override-reason "why" --override-by "who"
 *
 * The verdict stays `fail` — the harness does not change its mind — but the
 * run exits 0 and the report records who overrode it and why. It is the same
 * discipline as a claim's `reason`: a sentence a reviewer can weigh, not a
 * rubber stamp. An override on a run that did not fail is recorded with
 * `applied: false`, so it never looks like a bypass that was not needed.
 */
export interface OverrideRequest {
  reason: string;
  by: string;
}

const RUBBER_STAMP = /^(ok|okay|lgtm|approved|override|overridden|urgent|hotfix|because|n\/a|none|see\b.*)$/i;

/** Refuses a missing reason, a missing person, and a reason that says nothing. Throws with the reason, for exit 2. */
export function parseOverride(reason: string | undefined, by: string | undefined): OverrideRequest | undefined {
  if (reason === undefined && by === undefined) return undefined;
  const r = (reason ?? "").trim();
  const b = (by ?? "").trim();
  if (!r || !b) throw new Error("an override needs both --override-reason and --override-by (a person, not a bot: the actor who decided)");
  if (r.length < 20 || RUBBER_STAMP.test(r)) throw new Error("--override-reason must say why the FAIL is being accepted, in at least 20 characters: name the difference and the decision");
  return { reason: r, by: b };
}

export function recordOverride(request: OverrideRequest, verdict: Verdict, at: Date): OverrideRecord {
  return { reason: request.reason, by: request.by, verdict, applied: verdict === "fail", at: at.toISOString() };
}

/** The process exit code for a finished run: the verdict's, unless a FAIL was overridden. */
export function exitCodeForReport(report: Pick<RunReport, "verdict" | "override">): number {
  if (report.verdict !== "fail") return 0;
  return report.override?.applied ? 0 : 1;
}

/** One line for `reasons`, the markdown comment and the step summary. */
export function overrideLine(o: OverrideRecord): string {
  return o.applied
    ? `OVERRIDDEN by ${o.by}: the harness verdict is FAIL and was accepted anyway. Reason given: ${o.reason}`
    : `override requested by ${o.by} but not needed: the verdict is ${o.verdict.toUpperCase()}. Reason given: ${o.reason}`;
}
