import type { CompareResult, Mode, NoiseStatus, Verdict } from "./types.ts";

export interface GateInput {
  mode: Mode;
  compare: CompareResult;
  /** The most recent A/A result, when one was supplied; undefined means none was. */
  noise?: NoiseStatus;
  /** Explicit, logged waiver of the A/A requirement (`--noise skip`). */
  noiseWaived: boolean;
  /** Days after which a noise status is too old to trust. */
  noiseMaxAgeDays: number;
  ranAt: Date;
  /**
   * Noise mode only: what makes this run's own evidence weak (an image that was not pulled and
   * verified in the run). A clean A/A on weak evidence is a warning, never a pass.
   */
  degraded?: string[];
  /**
   * Post-deploy: whether a CI step opens a rollback issue when the verdict is FAIL (post-deploy.yml does; a local run
   * does not: `harness local watch` writes a note under HARNESS_HOME/rollbacks instead). Decides only the wording of
   * the reason. Default true, the CI wording, so a caller that says nothing reads as before.
   */
  rollbackIssue?: boolean;
}

/**
 * Whether this process runs where a rollback-issue step exists: `HARNESS_ROLLBACK_ISSUE` (1, true or yes to say so,
 * 0, false or no to say not) wins; unset, GitHub Actions (`GITHUB_ACTIONS=true`) has one and anything else does not.
 */
export function rollbackIssueConfigured(env: NodeJS.ProcessEnv): boolean {
  const v = env.HARNESS_ROLLBACK_ISSUE?.trim().toLowerCase();
  if (v) return ["1", "true", "yes"].includes(v);
  return env.GITHUB_ACTIONS === "true";
}

export interface GateOutput {
  verdict: Verdict;
  reasons: string[];
}

/**
 * Turn a comparison into a verdict for the mode.
 *
 * The rule that keeps the harness honest: it may only FAIL a release on
 * captured differences while its own A/A is clean. Without a clean, recent
 * noise run the same findings are reported as a warning, with the reason
 * stated, so the harness never becomes the flaky gate everyone bypasses — and
 * never quietly loses its teeth either. Rehearsals (migration, upgrade) are
 * deterministic and need no A/A.
 */
export function gate(input: GateInput): GateOutput {
  const { mode, compare } = input;
  const failing = compare.unclaimed.length;
  const info = compare.hunks.filter((h) => h.severity === "info").length;
  const reasons: string[] = [];

  if (compare.staleClaims.length) reasons.push(`${compare.staleClaims.length} claim(s) matched nothing and should be removed from the changelog`);

  switch (mode) {
    case "noise": {
      const total = compare.hunks.filter((h) => h.severity === "fail").length;
      if (total === 0 && input.degraded?.length) {
        return { verdict: "warn", reasons: [`A/A is clean but DEGRADED, so it does not count: ${input.degraded.join("; ")}`, ...reasons] };
      }
      if (total === 0) return { verdict: "pass", reasons: ["A/A is clean: the harness may gate releases", ...reasons] };
      return { verdict: "warn", reasons: [`A/A produced ${total} diff(s): the normaliser needs a mask for each, or the stack is not deterministic; the harness is advisory until this is 0`, ...reasons] };
    }
    case "any-two":
      return { verdict: "pass", reasons: [`investigation only: ${failing} unclaimed diff(s), ${info} informational`, ...reasons] };
    case "release":
    case "post-deploy": {
      if (compare.broadUnapproved.length) {
        reasons.unshift(`${compare.broadUnapproved.length} broad claim(s) without approvedBy: claim precisely or have a human approve`);
      }
      if (failing === 0 && compare.broadUnapproved.length === 0) {
        return { verdict: "pass", reasons: [mode === "release" ? "every difference is claimed" : "production behaves as the recorded candidate did", ...reasons] };
      }
      if (failing) reasons.unshift(mode === "release" ? `${failing} unclaimed diff(s)` : `${failing} new difference(s) between production and the recorded candidate: ${input.rollbackIssue === false ? "decide whether to roll back" : "open a rollback issue"}`);
      const trust = trustNoise(input);
      if (trust.ok) return { verdict: "fail", reasons };
      return { verdict: "warn", reasons: [`advisory only: ${trust.why}`, ...reasons] };
    }
    case "migration": {
      if (failing === 0) return { verdict: "pass", reasons: ["the candidate's migrations respect expand/contract and roll back cleanly", ...reasons] };
      return { verdict: "fail", reasons: [`${failing} expand/contract or rollback violation(s)`, ...reasons] };
    }
    case "upgrade": {
      if (failing === 0) return { verdict: "pass", reasons: ["the candidate rolled in under load with no failed request", ...reasons] };
      return { verdict: "fail", reasons: [`${failing} finding(s) during the rollout`, ...reasons] };
    }
  }
}

export function trustNoise(input: Pick<GateInput, "noise" | "noiseWaived" | "noiseMaxAgeDays" | "ranAt">): { ok: true } | { ok: false; why: string } {
  if (input.noiseWaived) return { ok: true };
  if (!input.noise) return { ok: false, why: "no A/A (noise) result was supplied; run `harness run --mode noise` first and pass --noise <its noise-status.json>" };
  if (input.noise.degraded?.length) return { ok: false, why: `the last A/A run (${input.noise.ranAt}) was degraded and does not count: ${input.noise.degraded.join("; ")}` };
  if (!input.noise.clean) return { ok: false, why: `the last A/A run (${input.noise.ranAt}) had ${input.noise.hunks} diff(s)` };
  const ageMs = input.ranAt.getTime() - new Date(input.noise.ranAt).getTime();
  if (ageMs > input.noiseMaxAgeDays * 86_400_000) return { ok: false, why: `the last clean A/A run (${input.noise.ranAt}) is older than ${input.noiseMaxAgeDays} day(s)` };
  return { ok: true };
}

export function exitCodeFor(verdict: Verdict): number {
  return verdict === "fail" ? 1 : 0;
}
