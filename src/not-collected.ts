import { hunkId } from "./compare/pages.ts";
import type { Hunk } from "./types.ts";

/**
 * "Not collected": the one convention for an artefact the harness could not (or
 * was told not to) produce, so that a gap is never read as "no difference".
 *
 * Every collector that can come up empty reports it the same way:
 *
 *   text       `NOT COLLECTED: <what>[ of <subject>][ on side <a|b>|on both sides]: <reason>`
 *              in the report's `reasons`, in a hunk's `summary`, in the run log.
 *   hunk       artefact = the artefact; scope = `<subject>/not-collected`, where the
 *              subject is an app (`reader/not-collected`) or, when the whole artefact is
 *              missing, the artefact itself (`runtime/not-collected`). A claim names it like any other.
 *   severity   ONE rule. A gap is informational, unless the artefact is required, and then it fails:
 *                - required by default: `runtime` and `startup`. Their collectors run against the
 *                  stacks the harness started itself, so an empty one is a fault, never a missing tool;
 *                - required when the operator says so: HARNESS_REQUIRE_ARTEFACTS=<list> (below);
 *                  HARNESS_REQUIRE_STATIC=1 stays as an alias for `static`;
 *                - never a failure when the operator switched the artefact off (`--no-runtime`,
 *                  `--startup-restarts 0`): informational and shown.
 *              The artefacts that depend on a tool that may legitimately be absent from a
 *              developer's machine (syft, grype, an SBOM attestation, a message bus) are
 *              therefore informational until a pipeline requires them.
 *
 * HARNESS_REQUIRE_ARTEFACTS is a comma separated list of artefact names (`image-manifest`,
 * `sbom`, `vulns`, `runtime`, `startup`, `bus`), or `static` (the first three), or `all`. It only
 * ever adds to the defaults above: a typo cannot loosen a gate, so an unknown name is an error.
 */

export const NOT_COLLECTED = "NOT COLLECTED";

/** The artefacts that can be reported as not collected. */
export const COLLECTED_ARTEFACTS = ["image-manifest", "sbom", "vulns", "runtime", "startup", "bus"] as const;
export type CollectedArtefact = (typeof COLLECTED_ARTEFACTS)[number];

export const STATIC_ARTEFACTS: readonly CollectedArtefact[] = ["image-manifest", "sbom", "vulns"];
/** Required with no configuration. */
export const DEFAULT_REQUIRED: readonly CollectedArtefact[] = ["runtime", "startup"];

export const REQUIRE_ENV = "HARNESS_REQUIRE_ARTEFACTS";
export const REQUIRE_STATIC_ENV = "HARNESS_REQUIRE_STATIC";

/** An unusable HARNESS_REQUIRE_ARTEFACTS: reported as a usage error (exit 2) before anything runs. */
export class RequirementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequirementError";
  }
}

export interface Requirements {
  /** Everything whose gap fails: the defaults and what the environment adds. */
  required: ReadonlySet<CollectedArtefact>;
  /** What the environment added. */
  fromEnv: ReadonlySet<CollectedArtefact>;
}

const truthy = (value: string | undefined) => /^(1|true|yes)$/i.test(value?.trim() ?? "");

export function requirements(env: NodeJS.ProcessEnv = process.env): Requirements {
  const fromEnv = new Set<CollectedArtefact>();
  const list = (env[REQUIRE_ENV] ?? "").split(/[\s,]+/).filter(Boolean);
  for (const token of list) {
    const name = token.toLowerCase();
    if (name === "all") COLLECTED_ARTEFACTS.forEach((a) => fromEnv.add(a));
    else if (name === "static") STATIC_ARTEFACTS.forEach((a) => fromEnv.add(a));
    else if ((COLLECTED_ARTEFACTS as readonly string[]).includes(name)) fromEnv.add(name as CollectedArtefact);
    else throw new RequirementError(`${REQUIRE_ENV} takes artefact names (${COLLECTED_ARTEFACTS.join(", ")}), static or all; "${token}" is not one`);
  }
  if (truthy(env[REQUIRE_STATIC_ENV])) STATIC_ARTEFACTS.forEach((a) => fromEnv.add(a));
  return { required: new Set([...DEFAULT_REQUIRED, ...fromEnv]), fromEnv };
}

/** The severity of a gap: the one rule. `disabled` is the operator's own choice to switch the artefact off. */
export function notCollectedSeverity(artefact: CollectedArtefact, o: { disabled?: boolean } = {}, env: NodeJS.ProcessEnv = process.env): Hunk["severity"] {
  if (o.disabled) return "info";
  return requirements(env).required.has(artefact) ? "fail" : "info";
}

export interface NotCollectedText {
  /** What is missing, in words: "sbom", "container posture", "startup time". */
  what: string;
  /** An app, when it is one app's. */
  subject?: string;
  side?: "a" | "b" | "both";
  reason: string;
}

export function notCollectedText(t: NotCollectedText): string {
  const of = t.subject ? ` of ${t.subject}` : "";
  const on = t.side === "both" ? " on both sides" : t.side ? ` on side ${t.side}` : "";
  return `${NOT_COLLECTED}: ${t.what}${of}${on}: ${t.reason}`;
}

/** `<subject>/not-collected`: the scope of the hunk, so that one claim (any app, then /not-collected) covers the gaps of an artefact. */
export const notCollectedScope = (subject: string): string => `${subject}/not-collected`;

export interface NotCollectedHunk extends NotCollectedText {
  artefact: CollectedArtefact;
  /** The scope's subject: an app, or the artefact itself when all of it is missing. */
  scopeSubject: string;
  disabled?: boolean;
  detail?: string;
}

/** The hunk for a gap: the text, the scope and the severity of the convention. */
export function notCollectedHunk(o: NotCollectedHunk, env: NodeJS.ProcessEnv = process.env): Hunk {
  const severity = notCollectedSeverity(o.artefact, { ...(o.disabled ? { disabled: true } : {}) }, env);
  const asked = severity === "fail" && requirements(env).fromEnv.has(o.artefact) && !DEFAULT_REQUIRED.includes(o.artefact);
  const scope = notCollectedScope(o.scopeSubject);
  const text = notCollectedText(o);
  return { id: hunkId(o.artefact, scope), artefact: o.artefact, scope, severity, summary: `${text}${asked ? ` (required by ${REQUIRE_ENV})` : ""}`, ...(o.detail ? { detail: o.detail } : {}) };
}

/** One line per (what, side, reason), the subjects that share it listed together: five apps with the same missing tool are one line, not five. */
export function notCollectedLines(gaps: (NotCollectedText & { subject: string })[]): string[] {
  const groups: { text: NotCollectedText; subjects: string[] }[] = [];
  for (const g of gaps) {
    const same = groups.find((x) => x.text.what === g.what && x.text.side === g.side && x.text.reason === g.reason);
    if (same) same.subjects.push(g.subject);
    else groups.push({ text: { what: g.what, ...(g.side ? { side: g.side } : {}), reason: g.reason }, subjects: [g.subject] });
  }
  return groups.map((g) => notCollectedText({ ...g.text, subject: g.subjects.join(", ") }));
}
