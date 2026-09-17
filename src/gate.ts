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
}

export interface GateOutput {
  verdict: Verdict;
  reasons: string[];
}

/**
 * Turn a comparison into a verdict for the mode.
 *
 * The rule that keeps the harness honest: it may only FAIL a release while its
 * own A/A is clean. Without a clean, recent noise run the same findings are
 * reported as a warning, with the reason stated, so the harness never becomes
 * the flaky gate everyone bypasses — and never quietly loses its teeth either.
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
      if (total === 0) return { verdict: "pass", reasons: ["A/A is clean: the harness may gate releases", ...reasons] };
      return { verdict: "warn", reasons: [`A/A produced ${total} diff(s): the normaliser needs a mask for each, or the stack is not deterministic; the harness is advisory until this is 0`, ...reasons] };
    }
    case "any-two":
      return { verdict: "pass", reasons: [`investigation only: ${failing} unclaimed diff(s), ${info} informational`, ...reasons] };
    case "release": {
      if (compare.broadUnapproved.length) {
        reasons.unshift(`${compare.broadUnapproved.length} broad claim(s) without approvedBy: claim precisely or have a human approve`);
      }
      if (failing === 0 && compare.broadUnapproved.length === 0) {
        return { verdict: "pass", reasons: ["every difference is claimed", ...reasons] };
      }
      if (failing) reasons.unshift(`${failing} unclaimed diff(s)`);
      const trust = trustNoise(input);
      if (trust.ok) return { verdict: "fail", reasons };
      return { verdict: "warn", reasons: [`advisory only: ${trust.why}`, ...reasons] };
    }
    case "upgrade":
    case "migration":
    case "post-deploy":
      return { verdict: "warn", reasons: [`mode "${mode}" is not implemented yet (see README, phases H4–H5)`] };
  }
}

function trustNoise(input: GateInput): { ok: true } | { ok: false; why: string } {
  if (input.noiseWaived) return { ok: true };
  if (!input.noise) return { ok: false, why: "no A/A (noise) result was supplied; run `harness run --mode noise` first and pass --noise <its noise-status.json>" };
  if (!input.noise.clean) return { ok: false, why: `the last A/A run (${input.noise.ranAt}) had ${input.noise.hunks} diff(s)` };
  const ageMs = input.ranAt.getTime() - new Date(input.noise.ranAt).getTime();
  if (ageMs > input.noiseMaxAgeDays * 86_400_000) return { ok: false, why: `the last clean A/A run (${input.noise.ranAt}) is older than ${input.noiseMaxAgeDays} day(s)` };
  return { ok: true };
}

export function exitCodeFor(verdict: Verdict): number {
  return verdict === "fail" ? 1 : 0;
}
