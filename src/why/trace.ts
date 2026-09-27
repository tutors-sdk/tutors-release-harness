/**
 * The 5 Whys stub (C4): a finding, traced by the harness, turned into kaizen/<date>-<tag>-<finding>.md with Why 1 already
 * answered from data and Whys 2-5 left for people.
 *
 * The first answer is the harness's own trace, so it is facts rather than recollections: the finding, its artefact and
 * the journeys that reach it, the link to the hunk, the nearest claim and why it did not cover, the PR (its files and
 * churn from changes.json, a first contribution as a fact), and where the glance ranked it and what the Reviewer marked.
 * Every line names an artefact, a PR or a file someone can open. Whys 2-5 are prompts, and the countermeasure line is
 * constrained to the seven kinds (src/why/format.ts), because those are what the team controls.
 *
 * Finding ids (`--finding`):
 *   gate | band | rollback          the whole-release triggers: a Gate FAIL, a Red band, a post-deploy FAIL
 *   <rule>:<series>                 a run rule on the scoreboard: three-declines:rcs, two-of-three-below-75:change-risk;
 *                                   countermeasures-rising for the register's own rule
 *   <glance kind>:<key>, glance:<n> an item of the reviewer's glance, by its key (as glance-marks.jsonl names it) or rank
 *   anything else                   a hunk id from report.json (dom:reader:course/1, …)
 *
 * Pure: src/why/read.ts reads the files into a {@link WhyContext}. Nothing here is an input to a verdict or an exit code.
 */
import { isAbsolute, join, relative } from "node:path";
import picomatch from "picomatch";
import { MONOREPO_PULLS, prsIn } from "../ci/scorecard.ts";
import { claimLabel } from "../claims/rules.ts";
import type { Changes, PrRisk } from "../changes/signals.ts";
import { applyMarks, type MarkRecord } from "../glance/marks.ts";
import { APP_OF_PREFIX, GLANCE_KINDS, KIND_TITLES, hunkJourneys, journeySet, type GlanceInputs, type GlanceItem, type GlanceKind } from "../glance/rank.ts";
import { hunkAnchor, type Confidence } from "../score/confidence.ts";
import type { RunRuleFiring, RunRuleId, Trends } from "../scoreboard/trends.ts";
import type { Claim, Hunk, RunReport } from "../types.ts";
import { COUNTERMEASURE_KINDS, KIND_MEANS, TRIGGERS, WHYS, type TriggerId } from "./format.ts";
import type { RegisterEntry } from "./register.ts";

export class WhyInputError extends Error {}

/** What a stub is built from: a `harness release` directory or one run, as src/why/read.ts found it. */
export interface WhyContext {
  /** The directory `--run` named (absolute). */
  dir: string;
  kind: "release-command" | "run";
  tag?: string;
  baseline?: string;
  /** The Gate as `harness release` words it (FAIL, PASS, …), or the run's verdict in capitals. */
  gate?: string;
  /** The judged run's report and its directory (absolute): release mode, or post-deploy mode. */
  report?: { data: RunReport; dir: string };
  captures?: GlanceInputs["captures"];
  confidence?: Confidence;
  changes?: Changes;
  marks: MarkRecord[];
  /** Where the line stopped, when it did (status.json). */
  stopped?: { stage: string; why: string };
  /** The scoreboard read back, for a run-rule finding. */
  trends?: Trends;
  trendsSource?: string;
  /** The register, for countermeasures-rising. */
  register?: RegisterEntry[];
}

export type Finding =
  | { type: "gate" }
  | { type: "band" }
  | { type: "rollback" }
  | { type: "run-rule"; firing: RunRuleFiring }
  | { type: "countermeasures-rising"; counts: number[] }
  | { type: "glance"; item: GlanceItem }
  | { type: "hunk"; hunk: Hunk };

export const RUN_RULE_IDS: readonly (RunRuleId | "countermeasures-rising")[] = ["three-declines", "two-of-three-below-75", "countermeasures-rising"];

// ---- which finding -------------------------------------------------------------------------------------

const isPostDeploy = (c: WhyContext) => c.report?.data.mode === "post-deploy";
const glanceItems = (c: WhyContext) => applyMarks(c.confidence?.glance ?? [], c.marks);

/** The ids a context can open, for the usage error that lists them. */
export function findingIds(c: WhyContext): string[] {
  const ids: string[] = [];
  if (c.gate === "FAIL" && !isPostDeploy(c)) ids.push("gate");
  if (c.confidence?.band === "Red") ids.push("band");
  if (isPostDeploy(c) && c.report?.data.verdict === "fail") ids.push("rollback");
  for (const f of c.trends?.runRules.current ?? []) ids.push(`${f.rule}:${f.series}`);
  if (c.trends?.runRules.countermeasures.status === "measured" && c.trends.runRules.countermeasures.rising) ids.push("countermeasures-rising");
  for (const i of glanceItems(c)) ids.push(`${i.kind}:${i.key}`);
  for (const h of c.report?.data.compare.unclaimed ?? []) ids.push(h.id);
  return ids;
}

/** Resolve `--finding` against what the run has. A trigger that did not fire is refused: a 5 Whys starts from a fact. */
export function resolveFinding(c: WhyContext, id: string): Finding {
  const want = id.trim();
  const listed = () => {
    const ids = findingIds(c);
    return ids.length ? ` It has: ${ids.slice(0, 12).join(", ")}${ids.length > 12 ? ` and ${ids.length - 12} more` : ""}.` : " It has no finding that opens one (a PASS, not Red, no run rule firing, no unclaimed hunk).";
  };
  if (want === "gate") {
    if (isPostDeploy(c)) throw new WhyInputError(`--finding gate: ${c.dir} is a post-deploy run, not a release run: its trigger is rollback.${listed()}`);
    if (c.gate !== "FAIL") throw new WhyInputError(`--finding gate: the Gate of ${c.dir} is ${c.gate ?? "unknown"}, not a FAIL on a release run.${listed()}`);
    return { type: "gate" };
  }
  if (want === "band") {
    if (c.confidence?.band !== "Red") throw new WhyInputError(`--finding band: ${c.confidence ? `the band is ${c.confidence.band ?? "none"} (RCS ${c.confidence.rcs ?? "none"})` : "there is no confidence.json"}, not Red.${listed()}`);
    return { type: "band" };
  }
  if (want === "rollback") {
    if (!isPostDeploy(c) || c.report?.data.verdict !== "fail") throw new WhyInputError(`--finding rollback: ${c.dir} is not a post-deploy run that FAILED (the run that opens a rollback issue).${listed()}`);
    return { type: "rollback" };
  }
  if (want === "countermeasures-rising") {
    const cm = c.trends?.runRules.countermeasures;
    if (!cm || cm.status !== "measured" || !cm.rising) throw new WhyInputError(`--finding countermeasures-rising: the run rule is not firing (${cm?.status === "not measured" ? cm.reason : cm ? `open countermeasures ${cm.counts.join(" -> ")}` : "no scoreboard read"}).${listed()}`);
    return { type: "countermeasures-rising", counts: cm.counts };
  }
  const [head, ...rest] = want.split(":");
  const tail = rest.join(":");
  if ((RUN_RULE_IDS as readonly string[]).includes(head!)) {
    const all = c.trends?.runRules.firings ?? [];
    const firing = [...all].reverse().find((f) => f.rule === head && f.series === tail);
    if (!firing) throw new WhyInputError(`--finding ${want}: no such run rule firing on the scoreboard${c.trendsSource ? ` (${c.trendsSource})` : ""}.${listed()}`);
    return { type: "run-rule", firing };
  }
  if (head === "glance") {
    const n = Number(tail);
    const item = glanceItems(c).find((i) => i.rank === n);
    if (!item) throw new WhyInputError(`--finding ${want}: the glance has no item ${tail} (${glanceItems(c).length} ranked).${listed()}`);
    return { type: "glance", item };
  }
  if ((GLANCE_KINDS as readonly string[]).includes(head!)) {
    const item = glanceItems(c).find((i) => i.kind === (head as GlanceKind) && i.key === tail);
    if (!item) throw new WhyInputError(`--finding ${want}: no such glance item in ${c.dir}'s confidence.json.${listed()}`);
    return { type: "glance", item };
  }
  const hunk = c.report?.data.compare.hunks.find((h) => h.id === want);
  if (!hunk) throw new WhyInputError(`--finding ${want}: not a trigger, a run rule, a glance item or a hunk of ${c.report ? join(c.report.dir, "report.json") : `${c.dir} (no report.json found)`}.${listed()}`);
  return { type: "hunk", hunk };
}

/** The trigger a finding records in the register. */
export function triggerOf(c: WhyContext, f: Finding): TriggerId {
  switch (f.type) {
    case "gate":
    case "band":
    case "rollback":
      return f.type;
    case "run-rule":
    case "countermeasures-rising":
      return "run-rule";
    case "glance":
      return f.item.mark?.mark === "escalated" ? "escalated" : "finding";
    case "hunk":
      return isPostDeploy(c) && c.report?.data.verdict === "fail" ? "rollback" : c.gate === "FAIL" ? "gate" : "finding";
  }
}

/** The finding's id, as `--finding` takes it and the file name carries it. */
export function findingId(f: Finding): string {
  switch (f.type) {
    case "gate":
    case "band":
    case "rollback":
    case "countermeasures-rising":
      return f.type;
    case "run-rule":
      return `${f.firing.rule}:${f.firing.series}`;
    case "glance":
      return `${f.item.kind}:${f.item.key}`;
    case "hunk":
      return f.hunk.id;
  }
}

export const slug = (s: string, max = 60) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "") || "finding";

/** kaizen/<date>-<tag>-<finding-slug>.md */
export function stubName(o: { now: Date; tag?: string; finding: string }): string {
  return `${o.now.toISOString().slice(0, 10)}-${o.tag ? slug(o.tag, 40) : "untagged"}-${slug(o.finding)}.md`;
}

// ---- the trace: facts from the artefacts ----------------------------------------------------------------

const md = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");
const short = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const isUrl = (s: string) => /^https?:\/\//.test(s);

/** A link as the stub can follow it: a URL as it is, a path relative to where the stub is written. */
function linkFrom(outDir: string, base: string, target: string): string {
  if (isUrl(target)) return target;
  const [path, anchor] = target.split("#");
  const abs = isAbsolute(path!) ? path! : join(base, path!);
  return `${relative(outDir, abs).replaceAll("\\", "/") || "."}${anchor ? `#${anchor}` : ""}`;
}

/** Every claim the run knew: those that matched a hunk and those that matched nothing (stale). */
function claimsOf(r: RunReport): { claim: Claim; stale: boolean }[] {
  const out: { claim: Claim; stale: boolean }[] = [];
  const seen = new Set<string>();
  const add = (claim: Claim, stale: boolean) => {
    const k = `${claim.artefact} ${claim.scope} ${claim.reason}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ claim, stale });
  };
  for (const m of r.compare.matches ?? []) if (m.claim) add(m.claim, false);
  for (const c of r.compare.staleClaims ?? []) add(c, true);
  return out;
}

const literal = (glob: string) => glob.split(/[*?[{]/)[0]!.toLowerCase();
const common = (a: string, b: string) => {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
};

/**
 * The claim that covered the hunk, or the one nearest to covering it and why it did not: the matcher's own rule
 * (src/claims/matcher.ts): the artefact, then the scope glob against the scope, the route and the page.
 */
export function nearestClaim(h: Hunk, r: RunReport): { claim: Claim; covers: boolean; why: string } | undefined {
  const covering = r.compare.matches?.find((m) => m.hunk.id === h.id)?.claim;
  if (covering) return { claim: covering, covers: true, why: "it matched, so the gate took the difference as intended" };
  const candidates = claimsOf(r);
  if (!candidates.length) return undefined;
  const head = h.scope.split("/")[0]!;
  const targets = [h.scope, h.path, head !== h.scope ? head : undefined].filter((x): x is string => !!x).map((x) => x.toLowerCase());
  const scored = candidates.map(({ claim, stale }) => {
    const sameArtefact = claim.artefact === "*" || claim.artefact === h.artefact;
    const prefix = Math.max(...targets.map((t) => common(literal(claim.scope), t)));
    return { claim, stale, sameArtefact, prefix, score: (sameArtefact ? 1000 : 0) + prefix };
  });
  const best = scored.sort((a, b) => b.score - a.score)[0]!;
  const c = best.claim;
  const reasons: string[] = [];
  if (!best.sameArtefact) reasons.push(`its artefact is ${c.artefact} and the hunk's is ${h.artefact}`);
  const isMatch = picomatch(c.scope, { dot: true, nocase: true });
  if (![h.scope, h.path, head !== h.scope ? head : undefined].some((t) => t && isMatch(t))) reasons.push(`its scope \`${c.scope}\` matches neither the hunk's scope \`${h.scope}\`${h.path ? `, its route \`${h.path}\`` : ""}${head !== h.scope ? ` nor its page \`${head}\`` : ""}`);
  if (!reasons.length) reasons.push("an earlier claim in the file would have taken it first, or it is info-only");
  return { claim: c, covers: false, why: `${reasons.join("; and ")}${best.stale ? " (the claim matched nothing in this run: stale)" : ""}` };
}

const claimText = (c: Claim) => `\`${c.artefact} ${c.scope}\`: ${md(short(claimLabel(c), 120))}${c.approvedBy ? ` (approvedBy ${md(c.approvedBy)})` : ""}`;

function prUrl(p: PrRisk, changes: Changes): string {
  if (p.url) return p.url;
  if (p.pr === null) return changes.repo ? `https://github.com/${changes.repo}/commit/${p.sha}` : `commit ${p.sha.slice(0, 7)}`;
  return changes.repo ? `https://github.com/${changes.repo}/pull/${p.pr}` : `${MONOREPO_PULLS}${p.pr}`;
}

const prName = (p: PrRisk) => (p.pr !== null ? `PR #${p.pr}` : `commit ${p.sha.slice(0, 7)}`);

/** One PR as a fact: its link, title, files and churn, and a first contribution as a fact (never a cause). */
function prFact(p: PrRisk, changes: Changes): string {
  const files = p.files.slice(0, 4).map((f) => `\`${f}\``).join(", ");
  return `[${prName(p)}](${prUrl(p, changes)}) "${md(short(p.title, 80))}": ${plural(p.files.length, "file")} (${files}${p.files.length > 4 ? `, +${p.files.length - 4} more` : ""}), churn ${p.churn} lines; first contribution: ${p.firstContribution ? "yes (a fact, not a cause)" : "no"}`;
}

/** The PR behind a hunk: one its claim names, else the PRs that changed the app the hunk is in (said as such). */
function prsFor(h: Hunk, c: WhyContext, claim: Claim | undefined): string {
  const ch = c.changes;
  if (!ch) return "not measured: no changes.json (harness changes, or harness release with --monorepo)";
  const named = prsIn(claim?.reason).map((n) => ch.prs.find((p) => p.pr === n)).filter((p): p is PrRisk => !!p);
  if (named.length) return named.map((p) => prFact(p, ch)).join("; ");
  const app = APP_OF_PREFIX[h.scope.split("/")[0]!.split(":")[0]!];
  const byApp = app ? ch.prs.filter((p) => !p.release && p.files.some((f) => f.startsWith(`apps/${app}/`))).sort((x, y) => y.churn - x.churn) : [];
  if (!byApp.length) return `no PR between ${ch.a} and ${ch.b} is tied to it (no claim names one${app ? `, and none changed apps/${app}/` : ", and the hunk is in no app"})`;
  return `none named by a claim; ${plural(byApp.length, "PR")} changed apps/${app}/ between ${ch.a} and ${ch.b}, largest first: ${byApp
    .slice(0, 3)
    .map((p) => prFact(p, ch))
    .join("; ")}${byApp.length > 3 ? `; and ${byApp.length - 3} more in changes.json` : ""}`;
}

function journeysOf(h: Hunk, c: WhyContext): string {
  if (!c.report) return "unknown: no report";
  const js = journeySet({ ...(c.captures ? { captures: c.captures } : {}), release: { data: c.report.data, where: "" } });
  const hit = hunkJourneys(h, js);
  if (!js.names.length) return `unknown: ${js.source}`;
  return hit?.length ? `${hit.join(", ")} (${hit.length} of ${js.names.length})` : `unmapped: no journey of ${js.names.length} can be placed on it (${js.source})`;
}

function glanceFact(c: WhyContext, anchor: string): string {
  const items = glanceItems(c);
  if (!c.confidence) return "not ranked: no confidence.json";
  const i = items.find((x) => x.links.hunk?.endsWith(`#${anchor}`) || x.hunks?.some((y) => y.endsWith(`#${anchor}`)));
  if (!i) return `not one of the ${items.length} place(s) the glance ranked`;
  return `${glanceItemLine(i, items.length)}`;
}

const glanceItemLine = (i: GlanceItem, of: number) => `rank ${i.rank} of ${of} (${KIND_TITLES[i.kind].toLowerCase()}; novelty ${i.novelty.toFixed(2)} × exposure ${i.exposure.toFixed(2)} = ${i.score.toFixed(2)}); reviewer's mark: ${i.mark ? `${i.mark.mark} by ${md(i.mark.by)}${i.mark.note ? ` ("${md(i.mark.note)}")` : ""}` : "not marked"}`;

/** The facts of one hunk, as Why 1's list. */
export function hunkFacts(c: WhyContext, h: Hunk, outDir: string): string[] {
  const r = c.report!;
  const link = linkFrom(outDir, r.dir, `report.html#${hunkAnchor(h)}`);
  const unclaimed = r.data.compare.unclaimed.some((u) => u.id === h.id);
  const near = nearestClaim(h, r.data);
  return [
    `- **Finding:** ${md(h.summary)} (${h.severity}${h.severity === "fail" ? (unclaimed ? ", unclaimed" : ", claimed") : ", info only"}; ${r.data.mode} mode, verdict ${r.data.verdict.toUpperCase()})`,
    `- **Artefact:** ${h.artefact}, scope \`${md(h.scope)}\`${h.path ? `, route \`${md(h.path)}\`` : ""}`,
    `- **Journey:** ${journeysOf(h, c)}`,
    `- **Hunk:** [${h.id}](${link})${h.detail ? `: ${md(short(h.detail, 160))}` : ""}`,
    near ? `- **${near.covers ? "Covering claim" : "Nearest claim"}:** ${claimText(near.claim)}; ${near.covers ? "" : "why it did not cover: "}${near.why}` : "- **Nearest claim:** none: the run had no claims",
    `- **PR:** ${prsFor(h, c, near?.claim)}`,
    `- **Glance:** ${glanceFact(c, hunkAnchor(h))}`
  ];
}

/** At most five hunks, one line each, and the command that opens a 5 Whys on each. */
function hunkList(c: WhyContext, hunks: Hunk[], outDir: string): string[] {
  const r = c.report!;
  const lines = hunks.slice(0, 5).map((h) => {
    const near = nearestClaim(h, r.data);
    return `  - [${h.artefact} ${md(h.scope)}](${linkFrom(outDir, r.dir, `report.html#${hunkAnchor(h)}`)}): ${md(short(h.summary, 100))}; journeys: ${journeysOf(h, c)}; nearest claim: ${near ? `${claimText(near.claim)} (${near.why})` : "none"} · \`--finding ${h.id}\``;
  });
  if (hunks.length > 5) lines.push(`  - and ${hunks.length - 5} more in [report.html](${linkFrom(outDir, r.dir, "report.html")})`);
  return lines;
}

function deductionLines(c: WhyContext, conf: Confidence, outDir: string, only?: string): string[] {
  const all = conf.dimensions
    .filter((d) => !only || d.id === only)
    .flatMap((d) => d.deductions.map((x) => ({ d, x })))
    .sort((a, b) => b.x.points - a.x.points)
    .slice(0, 5);
  return all.map(({ d, x }) => `  - ${d.name} −${x.points}${x.floor ? " (floor)" : ""}: ${md(short(x.why, 120))} ([evidence](${linkFrom(outDir, c.dir, x.evidence)}))`);
}

interface Trace {
  question: string;
  facts: string[];
  title: string;
}

/** Why 1: the question and the harness's own answer. */
export function traceOf(c: WhyContext, f: Finding, outDir: string): Trace {
  const tag = c.tag ?? "this release";
  const conf = c.confidence;
  switch (f.type) {
    case "gate": {
      const r = c.report;
      const unclaimed = r?.data.compare.unclaimed ?? [];
      return {
        title: `${tag}, Gate FAIL`,
        question: `Why did the Gate FAIL on ${tag}?`,
        facts: [
          `- **Gate:** FAIL${c.baseline ? ` (${tag} beside ${c.baseline})` : ""}${r ? `: ${md(r.data.reasons.join("; "))}` : ""}`,
          ...(c.stopped ? [`- **Line stopped at:** ${c.stopped.stage}: ${md(c.stopped.why)}`] : []),
          ...(r ? [`- **Report:** [report.html](${linkFrom(outDir, r.dir, "report.html")})`, `- **Unclaimed differences:** ${unclaimed.length}${unclaimed.length ? "" : " (the FAIL is not a difference: read the reasons above)"}`, ...hunkList(c, unclaimed, outDir)] : ["- **Report:** no release report was found"]),
          ...(unclaimed.length > 1 ? ["- **When their causes differ,** open one 5 Whys per hunk with its `--finding` above."] : [])
        ]
      };
    }
    case "band": {
      const cf = conf!;
      const floors = cf.dimensions.filter((d) => d.floorBreached).map((d) => d.name);
      const low = cf.dimensions.filter((d) => d.status === "measured" && d.score !== null && d.score < 100).sort((a, b) => a.score! - b.score!);
      return {
        title: `${tag}, Red band`,
        question: `Why was ${tag} Red (RCS ${cf.rcs})?`,
        facts: [
          `- **RCS:** ${cf.rcs} Red (mean ${cf.mean ?? "none"})${cf.note ? `: ${md(cf.note)}` : ""}; the Gate was ${cf.gate}`,
          `- **Floors breached:** ${floors.length ? floors.join(", ") : "none"}`,
          `- **Dimensions below 100:** ${low.length ? low.map((d) => `${d.name} ${d.score}`).join(", ") : "none"}`,
          `- **Not measured (a gap, not a cause):** ${cf.dimensions.filter((d) => d.status === "not measured").map((d) => d.name).join(", ") || "none"}`,
          `- **Where the most points went** ([confidence.json](${linkFrom(outDir, c.dir, "confidence.json")})):`,
          ...deductionLines(c, cf, outDir)
        ]
      };
    }
    case "rollback": {
      const r = c.report!;
      const d = r.data;
      return {
        title: `${tag}, rollback`,
        question: `Why did production differ from the tested release${c.tag ? ` ${c.tag}` : ""}?`,
        facts: [
          `- **Post-deploy:** FAIL at ${d.ranAt}: ${md(d.reasons.join("; "))}`,
          `- **Report:** [report.html](${linkFrom(outDir, r.dir, "report.html")})`,
          ...(d.deployment ? [`- **Deployment:** ${d.deployment.status}`] : []),
          ...(d.productionBuild ? [`- **Production build:** ${md(d.productionBuild.summary)}`] : []),
          `- **Unclaimed differences:** ${d.compare.unclaimed.length}`,
          ...hunkList(c, d.compare.unclaimed, outDir)
        ]
      };
    }
    case "run-rule": {
      const fi = f.firing;
      const dim = conf?.dimensions.find((d) => d.id === fi.series);
      const words = fi.rule === "three-declines" ? "decline three releases running" : "fall below 75 in two of the last three releases";
      return {
        title: `run rule, ${fi.name} (${fi.rule})`,
        question: `Why did ${fi.name} ${words}?`,
        facts: [
          `- **Run rule:** ${md(fi.kaizen)}${fi.current ? "" : ` (fired at ${fi.at}, not the newest release)`}`,
          `- **Window:** ${fi.window.map((w) => `${w.tag} ${w.value}`).join(" → ")}${fi.acrossWeightsChange ? "; it spans a change of weights or rules, so part of the movement may be the rules, not the product" : ""}`,
          `- **Scoreboard:** ${c.trendsSource ?? "read by harness scoreboard trends"}`,
          ...(conf && fi.series !== "rcs" && dim ? [`- **This release's ${dim.name}:** ${dim.status === "measured" ? `${dim.score}${dim.floorBreached ? " (floor breached)" : ""}` : `not measured: ${md(dim.reason ?? "")}`}; where its points went:`, ...deductionLines(c, conf, outDir, fi.series), ...(dim.gaps?.length ? [`  - what it could not see: ${md(dim.gaps.join("; "))}`] : [])] : []),
          ...(conf && fi.series === "rcs" ? [`- **This release:** RCS ${conf.rcs ?? "none"} ${conf.band ?? ""}; where the most points went:`, ...deductionLines(c, conf, outDir)] : [])
        ]
      };
    }
    case "countermeasures-rising": {
      const open = (c.register ?? []).filter((e) => e.open);
      return {
        title: "run rule, open countermeasures only rising",
        question: "Why do open countermeasures only rise?",
        facts: [
          `- **Open countermeasures per release:** ${f.counts.join(" → ")} (the loop is not closing)`,
          `- **Open now:** ${open.length}`,
          ...open.slice(0, 8).map((e) => `  - [${md(e.title || e.file)}](${e.file}): ${e.kind ?? "no kind yet"}, owner ${e.owner || "none"}, due ${e.due || "none"}`),
          ...(open.length > 8 ? [`  - and ${open.length - 8} more in README.md`] : [])
        ]
      };
    }
    case "glance": {
      const i = f.item;
      const l = i.links;
      const base = c.dir;
      const anchor = l.hunk?.split("#")[1];
      const hunk = anchor?.startsWith("hunk-") ? c.report?.data.compare.hunks.find((h) => hunkAnchor(h) === anchor) : undefined;
      const escalated = i.mark?.mark === "escalated";
      return {
        title: `${tag}, glance ${KIND_TITLES[i.kind].toLowerCase()}${escalated ? " escalated" : ""}`,
        question: escalated ? `Why could the artefacts not show whether this is right: ${short(i.finding, 120)}?` : `Why is this a place to look: ${short(i.finding, 120)}?`,
        facts: [
          `- **Glance item:** ${md(i.finding)}`,
          `- **Ranked:** ${glanceItemLine(i, glanceItems(c).length)}`,
          ...(l.hunk ? [`- **Hunk:** [${md(l.hunk.split("/").pop()!)}](${linkFrom(outDir, base, l.hunk)})`] : []),
          ...(l.claim ? [`- **Claim:** ${md(l.claim)}`] : []),
          ...(l.pr ? [`- **PR:** ${l.pr}`] : []),
          ...(l.diff ? [`- **Diff:** ${l.diff}`] : []),
          ...(i.detail ? [`- **Detail:** ${md(i.detail)}`] : []),
          `- **Why it ranked:** ${md(i.basis.novelty)}; ${md(i.basis.exposure)}`,
          ...(hunk ? hunkFacts(c, hunk, outDir).filter((x) => /^- \*\*(Journey|Nearest claim|Covering claim|PR):/.test(x)).map((x) => x.replace(/^- \*\*PR:\*\*/, "- **PR (changes.json):**")) : [])
        ]
      };
    }
    case "hunk": {
      const h = f.hunk;
      const unclaimed = c.report!.data.compare.unclaimed.some((u) => u.id === h.id);
      return {
        title: `${tag}, ${h.artefact} ${short(h.scope, 60)}`,
        question: `Why did ${h.artefact} \`${h.scope}\` differ${unclaimed ? " with no claim covering it" : ""}${isPostDeploy(c) ? " in production" : ""}?`,
        facts: hunkFacts(c, h, outDir)
      };
    }
  }
}

// ---- the file --------------------------------------------------------------------------------------------

const PROMPT = `<!-- Why? An answer checkable against an artefact, a PR or a document. "Human error" is not an answer: it is the prompt for the next why. Leave the rest blank once the chain has ended. -->`;

export interface Stub {
  name: string;
  text: string;
  trigger: TriggerId;
  finding: string;
}

/** The whole stub: header fields, Why 1 answered from the trace, Whys 2-5 blank, the end of the chain and the countermeasure. */
export function renderStub(c: WhyContext, f: Finding, o: { now: Date; outDir: string; harness?: string }): Stub {
  const trigger = triggerOf(c, f);
  const id = findingId(f);
  const t = traceOf(c, f, o.outDir);
  const run = relative(o.outDir, c.dir).replaceAll("\\", "/") || ".";
  const lines = [
    `# 5 Whys: ${t.title}`,
    "",
    `- **Trigger:** ${TRIGGERS[trigger]}`,
    `- **Finding:** \`${id}\``,
    `- **Release:** ${c.tag ?? "unknown"}${c.baseline ? ` (beside ${c.baseline})` : ""}`,
    `- **Run:** \`${run}\``,
    `- **Opened:** ${o.now.toISOString().slice(0, 10)} by \`harness why\`${o.harness ? ` (harness ${o.harness})` : ""}`,
    "",
    "> Kaizen, not blame. Each answer is checkable against an artefact, a PR or a document. \"Human error\" is not an",
    "> answer; it is the prompt for the next why. The chain ends when the answer is a process or a tool, and the",
    "> countermeasure changes the system. `harness why check <this file>` says what is still missing.",
    "",
    `## Why 1: ${t.question}`,
    "",
    "The harness's own trace (facts, each one a link or a file):",
    "",
    ...t.facts,
    "",
    "<!-- Correct the trace if it is wrong; do not replace it with a recollection. -->",
    ""
  ];
  for (let n = 2; n <= WHYS; n++) lines.push(`## Why ${n}`, "", PROMPT, "");
  lines.push(
    "## Where the chain ends",
    "",
    "- **Chain ends at:** <!-- Why 1 to Why 5: the first answer that is a process or a tool -->",
    "- **Ends in:** <!-- process | tool -->",
    "",
    "## Countermeasure",
    "",
    `<!-- Exactly one kind: ${COUNTERMEASURE_KINDS.join(" · ")}.`,
    ...COUNTERMEASURE_KINDS.map((k) => `     ${k}: ${KIND_MEANS[k]}`),
    "     Never a person: \"be more careful\" is not a countermeasure. -->",
    "",
    "- **Kind:** ",
    "- **Countermeasure:** <!-- what changes in the system, in one sentence -->",
    "- **Mutant:** <!-- kind mutant only: the path under mutants/ that plants this escape -->",
    "- **Owner:** <!-- who sees the countermeasure through (SOP step 12) -->",
    "- **Due:** <!-- YYYY-MM-DD -->",
    "- **Verified by:** <!-- the release in which it was verified closed, e.g. 16.4.0; empty while open -->",
    ""
  );
  return { name: stubName({ now: o.now, ...(c.tag ? { tag: c.tag } : {}), finding: id }), text: lines.join("\n"), trigger, finding: id };
}

/** The findings `harness release` opens by itself: a Gate FAIL, a Red band, each run rule firing now, open countermeasures only rising. */
export function automaticFindings(c: WhyContext): Finding[] {
  const out: Finding[] = [];
  if (c.gate === "FAIL" && !isPostDeploy(c)) out.push({ type: "gate" });
  if (c.confidence?.band === "Red") out.push({ type: "band" });
  if (isPostDeploy(c) && c.report?.data.verdict === "fail") out.push({ type: "rollback" });
  for (const firing of c.trends?.runRules.current ?? []) out.push({ type: "run-rule", firing });
  const cm = c.trends?.runRules.countermeasures;
  if (cm?.status === "measured" && cm.rising) out.push({ type: "countermeasures-rising", counts: cm.counts });
  return out;
}

