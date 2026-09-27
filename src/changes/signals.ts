/**
 * The change signals of a release and the points they cost: the pure half of `harness changes`.
 *
 * Every point lost is a deduction on one pull request's risk line (or, when nothing between the tags can carry it,
 * on the release: `pr: null`), and names the PR, the file and, where GitHub can show it, a link to that file in that
 * PR's diff, so a reviewer goes straight to the hunk (gemba) and the trend can follow a file across releases (kaizen).
 * The release's change risk is 100 minus the sum of those deductions, floored at 0: a sum, not an average, so six
 * clean PRs cannot dilute one risky one.
 *
 * Guardrail: contributor lines are for trends and glances, never for reviewing people. The author is kept as a fact
 * field for the scoreboard and never appears in a reason. A first contribution is flagged as a fact and costs nothing
 * on its own; the points land only when it meets a hotspot (−10 instead of −3) or lacks tests (the same −10 anyone's
 * PR would lose).
 *
 * The rules are the plan's table (src/score/weights.ts, RULES.changeRisk):
 *   churn       −5 per app (reader, catalogue, live, time) above 2× its median over the history releases
 *   hotspots    −10 when a first contribution touches a hotspot, −3 otherwise (once per PR)
 *   ownership   −5 per production file with ≥ 3 authors this release, at most −15
 *   orphans     −10 per changelog entry with no diff under its scope, and per diff with no changelog entry
 *   tests       −10 per PR whose test lines ÷ production lines is below 0.2 on a package it changed
 *   reviews     a floor breach (no points) per PR with no approving review, and per commit straight to main
 *   deps        −5 per major bump of a direct dependency in pnpm-lock.yaml
 */
import { createHash } from "node:crypto";
import { RULES } from "../score/weights.ts";
import { PRODUCT_SECTIONS, parseChangelog, sectionOf, type ChangelogEntry, type ToolingChangelog } from "./changelog.ts";
import type { ChangeFacts, FileChange, Person, Unit } from "./facts.ts";
import type { Reviews } from "./github.ts";
import type { DepChange } from "./lock.ts";

export const CHANGES_SCHEMA_VERSION = 1 as const;
export const CHANGES_FILE = "changes.json";
export const APPS = ["reader", "catalogue", "live", "time"] as const;

export const RULE_IDS = ["review", "hotspot", "tests", "churn", "ownership", "orphan", "dependency"] as const;
export type RuleId = (typeof RULE_IDS)[number];

export interface ChangeDeduction {
  points: number;
  why: string;
  /** Where to look: the file in the PR's diff on GitHub, the commit, or CHANGELOG.md at the newer tag. */
  evidence: string;
  /** Present when this finding breaches the change-risk floor (the RCS is then capped at 74). */
  floor?: true;
  rule: RuleId;
  /** The PR the point lands on; null for a commit straight to main or a finding no PR between the tags carries. */
  pr: number | null;
  commit?: string;
  file?: string;
  /** A fact for the scoreboard's trends, never part of `why`. */
  author?: string;
}

export interface PackageTests {
  package: string;
  production: number;
  tests: number;
  /** tests ÷ production, two decimals. */
  ratio: number;
}

export interface TestDelta {
  production: number;
  tests: number;
  /** null when the PR changed no production line. */
  ratio: number | null;
  packages: PackageTests[];
}

/** One PR's risk line (or one commit straight to main). */
export interface PrRisk {
  pr: number | null;
  sha: string;
  title: string;
  url?: string;
  /** A commit that reached main without a pull request. */
  direct: boolean;
  /** A release/* branch coming back to main: bookkeeping; no orphan, hotspot or ownership check. */
  release: boolean;
  /** A fact for the scoreboard's per-contributor trend. Never a reason, never in the report's table. */
  author: string;
  firstContribution: boolean;
  files: string[];
  churn: number;
  hotspotsTouched: string[];
  testDelta: TestDelta;
  /** null when review coverage is not measured (no token), or GitHub could not say for this PR. */
  reviewed: boolean | null;
  points: number;
  deductions: ChangeDeduction[];
}

export type Measured<T> = ({ status: "measured" } & T) | { status: "not measured"; reason: string };

export interface Signals {
  churn: Measured<{ apps: { app: string; churn: number; median: number | null; above: boolean; history: number[] }[] }>;
  hotspots: Measured<{ files: { path: string; releases: number; weight: number }[]; touched: { path: string; prs: (number | string)[] }[] }>;
  ownership: { files: { path: string; authors: number; prs: (number | string)[] }[] };
  orphans: { diffs: Measured<{ source: string; items: { pr: number | null; sha: string; title: string; sections: string[] }[] }>; entries: Measured<{ items: { section: string; entry: string; prs: number[]; why: string }[] }> };
  tests: { packages: (PackageTests & { below: boolean })[] };
  reviews: Measured<{ reviewed: number[]; unreviewed: number[]; unknown: number[]; problems: string[] }> & { direct: string[] };
  dependencies: Measured<{ majorBumps: (DepChange & { pr: number | null })[]; newPackages: (DepChange & { pr: number | null })[] }>;
}

/** What `harness confidence --change-risk` (and the score stage of `harness release`) reads. */
export interface ChangeRiskBlock {
  /** 100 minus the sum of the deductions, floored at 0. */
  score: number;
  prs: { number: number; url?: string; reviewed: boolean | null; firstTimeContributor: boolean; hotspots: string[] }[];
  direct: { sha: string; title: string }[];
  deductions: ChangeDeduction[];
  /** What the change-risk score could not look at (a signal not measured, and why). */
  gaps: string[];
  /** Orphan changes found: a floor signal for requirements traceability. */
  orphans: number;
  evidence: string;
}

export interface Changes {
  schemaVersion: typeof CHANGES_SCHEMA_VERSION;
  a: string;
  b: string;
  refs: { a: string; b: string };
  version: string;
  repo?: string;
  history: { asked: number; releases: { from: string; to: string }[] };
  /** 100 minus `lost`, floored at 0. */
  score: number;
  lost: number;
  floorBreached: boolean;
  prs: PrRisk[];
  signals: Signals;
  notMeasured: { signal: string; reason: string }[];
  changeRisk: ChangeRiskBlock;
  harness?: { version: string; contractVersion: string };
}

// ---- what a path is ------------------------------------------------------------------------------------

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|mts|cts|svelte|vue|css|scss|sql)$/;
export const isTest = (p: string) => /(^|\/)(tests?|__tests__|__snapshots__|e2e)\//.test(p) || /\.(test|spec)\.[a-z]+$/.test(p) || p.endsWith(".snap");
/** Code that ships: a source file in a workspace package, not a test and not a type declaration. */
export const isProduction = (p: string) => CODE.test(p) && !isTest(p) && !p.endsWith(".d.ts") && packageOf(p) !== undefined;
export const packageOf = (p: string) => /^(apps\/[^/]+|packages\/(?:jsr|svelte)\/[^/]+|packages\/[^/]+)\//.exec(p)?.[1];

const lines = (f: FileChange) => f.added + f.deleted;
const sum = (xs: number[]) => xs.reduce((n, x) => n + x, 0);
const round2 = (x: number) => Math.round(x * 100) / 100;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export const appChurn = (files: FileChange[], app: string) => sum(files.filter((f) => f.path.startsWith(`apps/${app}/`)).map(lines));

/** Test lines ÷ production lines per package. Tests outside any package (the monorepo's root tests/) count for every package the PR changed. */
export function testDeltaOf(files: FileChange[]): TestDelta {
  const prod = new Map<string, number>();
  const tests = new Map<string, number>();
  let loose = 0;
  for (const f of files) {
    const pkg = packageOf(f.path);
    if (isTest(f.path)) {
      if (pkg) tests.set(pkg, (tests.get(pkg) ?? 0) + lines(f));
      else loose += lines(f);
    } else if (isProduction(f.path)) prod.set(pkg!, (prod.get(pkg!) ?? 0) + lines(f));
  }
  const packages = [...prod].filter(([, n]) => n > 0).map(([pkg, production]) => {
    const t = (tests.get(pkg) ?? 0) + loose;
    return { package: pkg, production, tests: t, ratio: round2(t / production) };
  });
  const production = sum(packages.map((p) => p.production));
  const t = sum([...tests.values()]) + loose;
  return { production, tests: t, ratio: production ? round2(t / production) : null, packages: packages.sort((x, y) => x.package.localeCompare(y.package)) };
}

// ---- links: the exact file in the exact PR -------------------------------------------------------------

const diffAnchor = (file: string) => `#diff-${createHash("sha256").update(file).digest("hex")}`;

/** GitHub's own anchor for a file in a PR's (or a commit's) diff; without a GitHub remote, the PR and the file in words. */
export function evidenceFor(repo: string | undefined, u: Pick<Unit, "pr" | "sha">, file?: string): string {
  if (!repo) return `${u.pr !== null ? `PR #${u.pr}` : `commit ${u.sha.slice(0, 7)}`}${file ? ` ${file}` : ""}`;
  const anchor = file ? diffAnchor(file) : "";
  return u.pr !== null ? `https://github.com/${repo}/pull/${u.pr}/files${anchor}` : `https://github.com/${repo}/commit/${u.sha}${anchor}`;
}

const prUrl = (repo: string | undefined, u: Unit) => (repo ? (u.pr !== null ? `https://github.com/${repo}/pull/${u.pr}` : `https://github.com/${repo}/commit/${u.sha}`) : undefined);
const nameOf = (u: Pick<Unit, "pr" | "sha">) => (u.pr !== null ? `PR #${u.pr}` : `commit ${u.sha.slice(0, 7)}`);
const refOf = (u: Pick<Unit, "pr" | "sha">): number | string => u.pr ?? u.sha.slice(0, 7);

/** One identity per person: the same name or the same email is the same author. */
function identities(): (p: Person) => number {
  const ids = new Map<string, number>();
  let next = 0;
  return (p) => {
    const keys = [`n:${p.name.trim().toLowerCase()}`, `e:${p.email.trim().toLowerCase()}`];
    const id = keys.map((k) => ids.get(k)).find((x) => x !== undefined) ?? next++;
    for (const k of keys) ids.set(k, id);
    return id;
  };
}

// ---- the signals ----------------------------------------------------------------------------------------

export interface ComputeOptions {
  reviews: Reviews;
  /** `pnpm release:changelog --json`, parsed, or why it was not used. */
  tooling?: ToolingChangelog;
  harness?: { version: string; contractVersion: string };
}

export function computeChanges(f: ChangeFacts, o: ComputeOptions): Changes {
  const R = RULES.changeRisk;
  const repo = f.repo;
  const byUnit = new Map<Unit, ChangeDeduction[]>(f.units.map((u) => [u, []]));
  const loose: ChangeDeduction[] = [];
  const notMeasured: { signal: string; reason: string }[] = [];
  const land = (u: Unit | undefined, d: Omit<ChangeDeduction, "pr" | "commit" | "author">) => {
    const full: ChangeDeduction = { ...d, pr: u ? u.pr : null, ...(u && u.pr === null ? { commit: u.sha } : {}), ...(u ? { author: u.author.name } : {}) };
    (u ? byUnit.get(u)! : loose).push(full);
  };
  const changing = f.units.filter((u) => !u.release);

  // Churn: each app against its own median over the history releases.
  let churn: Signals["churn"];
  if (!f.history.length) {
    churn = { status: "not measured", reason: `no release tag before ${f.refs.a} to take a median from` };
    notMeasured.push({ signal: "churn", reason: churn.reason });
  } else {
    const apps = APPS.map((app) => {
      const history = f.history.map((r) => appChurn(r.files, app));
      const med = median(history);
      const now = appChurn(f.net, app);
      const above = med !== null && med > 0 && now > R.churnFactor * med;
      if (above) {
        const top = [...f.units].sort((x, y) => appChurn(y.files, app) - appChurn(x.files, app))[0];
        const biggest = top?.files.filter((x) => x.path.startsWith(`apps/${app}/`)).sort((x, y) => lines(y) - lines(x))[0]?.path;
        land(top, {
          points: R.churnApp,
          rule: "churn",
          why: `${app} churn ${now} lines, above ${R.churnFactor}× its median of ${med} over the last ${plural(f.history.length, "release")}${top ? `; ${nameOf(top)} is the largest part (${appChurn(top.files, app)} lines)` : ""}`,
          evidence: top ? evidenceFor(repo, top, biggest) : `apps/${app}`,
          ...(biggest ? { file: biggest } : {})
        });
      }
      return { app, churn: now, median: med, above, history };
    });
    churn = { status: "measured", apps };
  }

  // Hotspots: production files changed in at least 3 of the history releases, heaviest first.
  const releasesOf = new Map<string, { releases: number; weight: number }>();
  for (const r of f.history)
    for (const x of r.files.filter((x) => isProduction(x.path))) {
      const h = releasesOf.get(x.path) ?? { releases: 0, weight: 0 };
      h.releases += 1;
      h.weight += lines(x);
      releasesOf.set(x.path, h);
    }
  const hotspotFiles = [...releasesOf].filter(([, h]) => h.releases >= R.hotspotReleases).map(([path, h]) => ({ path, ...h })).sort((x, y) => y.releases - x.releases || y.weight - x.weight || x.path.localeCompare(y.path));
  const hot = new Map(hotspotFiles.map((h) => [h.path, h]));
  const hotspotsMeasured = f.history.length >= R.hotspotReleases;
  const touched = new Map<Unit, string[]>();
  if (hotspotsMeasured)
    for (const u of changing) {
      const paths = u.files.map((x) => x.path).filter((p) => hot.has(p)).sort((x, y) => hot.get(y)!.weight - hot.get(x)!.weight);
      if (!paths.length) continue;
      touched.set(u, paths);
      const first = u.firstContribution;
      const names = paths.map((p) => `${p} (${hot.get(p)!.releases} of the last ${f.history.length} releases)`);
      land(u, {
        points: first ? R.hotspotFirstTime : R.hotspot,
        rule: "hotspot",
        why: `${nameOf(u)}${first ? ", a first contribution," : ""} touches ${paths.length === 1 ? "hotspot" : `${paths.length} hotspots`} ${names.slice(0, 3).join(", ")}${paths.length > 3 ? ` and ${paths.length - 3} more` : ""}`,
        evidence: evidenceFor(repo, u, paths[0]),
        file: paths[0]!
      });
    }
  const hotspots: Signals["hotspots"] = hotspotsMeasured
    ? { status: "measured", files: hotspotFiles, touched: [...new Set([...touched.values()].flat())].map((path) => ({ path, prs: [...touched].filter(([, ps]) => ps.includes(path)).map(([u]) => refOf(u)) })) }
    : { status: "not measured", reason: `only ${plural(f.history.length, "release")} of history before ${f.refs.a}; a hotspot is a file changed in ${R.hotspotReleases} of them` };
  if (hotspots.status === "not measured") notMeasured.push({ signal: "hotspots", reason: hotspots.reason });

  // Ownership dispersion: many hands on one production file this release. The point lands on the PR that brought the third.
  const id = identities();
  const authors = new Map<string, { ids: Set<number>; units: Unit[]; third?: Unit }>();
  for (const u of changing)
    for (const c of u.commits)
      for (const path of c.files.filter(isProduction)) {
        const a = authors.get(path) ?? { ids: new Set<number>(), units: [] };
        a.ids.add(id(c.author));
        if (!a.units.includes(u)) a.units.push(u);
        if (!a.third && a.ids.size >= R.dispersionAuthors) a.third = u;
        authors.set(path, a);
      }
  const dispersed = [...authors].filter(([, a]) => a.third).sort(([p, x], [q, y]) => y.ids.size - x.ids.size || p.localeCompare(q));
  let left = R.dispersionMax;
  dispersed.forEach(([path, a], i) => {
    if (left <= 0) return;
    const points = Math.min(R.dispersion, left);
    left -= points;
    const rest = dispersed.length - i - 1;
    land(a.third, {
      points,
      rule: "ownership",
      why: `${path} had ${a.ids.size} authors this release (${a.units.map(nameOf).join(", ")}): no one holds the whole picture${left <= 0 && rest > 0 ? ` (and ${plural(rest, "more file")} like it, not counted again)` : ""}`,
      evidence: evidenceFor(repo, a.third!, path),
      file: path
    });
  });

  // Orphans: what the changelog says against what the diff did.
  const cl = f.changelog !== undefined ? parseChangelog(f.changelog, f.version) : undefined;
  const clUsable = !!cl?.found;
  const changelogAt = repo ? `https://github.com/${repo}/blob/${f.refs.b}/CHANGELOG.md` : `CHANGELOG.md at ${f.refs.b}`;
  const clWhy = f.changelog === undefined ? `${f.refs.b} has no CHANGELOG.md` : `CHANGELOG.md at ${f.refs.b} has no "### v${f.version}" entries under a product section`;
  let diffs: Signals["orphans"]["diffs"];
  const productSections = (u: Unit) => [...new Set(u.files.map((x) => sectionOf(x.path)).filter((s) => s !== undefined))];
  if (o.tooling) {
    const items = o.tooling.entries.filter((e) => !e.curated && e.sections.some((s) => (PRODUCT_SECTIONS as readonly string[]).includes(s))).map((e) => ({ pr: e.pr, sha: e.sha, title: e.title, sections: e.sections }));
    diffs = { status: "measured", source: "pnpm release:changelog --json", items };
  } else if (clUsable) {
    const items = changing.filter((u) => productSections(u).length && (u.pr === null || !cl!.named.has(u.pr))).map((u) => ({ pr: u.pr, sha: u.sha.slice(0, 7), title: u.title, sections: productSections(u) }));
    diffs = { status: "measured", source: `CHANGELOG.md at ${f.refs.b}`, items };
  } else {
    diffs = { status: "not measured", reason: `${clWhy}, and no --changelog (pnpm release:changelog --json) was given` };
    notMeasured.push({ signal: "orphan diffs (a diff with no changelog entry)", reason: diffs.reason });
  }
  if (diffs.status === "measured")
    for (const item of diffs.items) {
      const u = f.units.find((x) => (item.pr !== null ? x.pr === item.pr : x.sha.startsWith(item.sha)));
      const file = u?.files.find((x) => sectionOf(x.path))?.path;
      land(u, {
        points: R.orphan,
        rule: "orphan",
        why: `${item.pr !== null ? `PR #${item.pr}` : `commit ${item.sha}`} changed ${item.sections.join(", ")} but no changelog entry under v${f.version} names it`,
        evidence: u ? evidenceFor(repo, u, file) : changelogAt,
        ...(file ? { file } : {})
      });
    }
  let entries: Signals["orphans"]["entries"];
  if (clUsable) {
    const items: { section: string; entry: string; prs: number[]; why: string; unit?: Unit }[] = [];
    // CHANGELOG.md has no Development section: CI, tests and guides are filed under Infrastructure, so it covers them too.
    const inScope = (files: FileChange[], e: ChangelogEntry) => files.some((x) => sectionOf(x.path) === e.section || (e.section === "Infrastructure" && sectionOf(x.path) === undefined));
    for (const e of cl!.entries) {
      const merged = e.prs.map((pr) => f.units.find((u) => u.pr === pr)).filter((u): u is Unit => !!u);
      let why: string | undefined;
      if (e.prs.length && !merged.length) why = `names ${e.prs.map((n) => `PR #${n}`).join(", ")}, not merged between ${f.refs.a} and ${f.refs.b}`;
      else if (merged.length && !merged.some((u) => inScope(u.files, e))) why = `${merged.map(nameOf).join(", ")} changed nothing under ${e.section}'s paths`;
      else if (!e.prs.length && !inScope(f.net, e)) why = `nothing under ${e.section}'s paths changed between ${f.refs.a} and ${f.refs.b}`;
      if (why) items.push({ section: e.section, entry: e.text, prs: e.prs, why, ...(merged[0] ? { unit: merged[0] } : {}) });
    }
    for (const it of items)
      land(it.unit, { points: R.orphan, rule: "orphan", why: `changelog entry (${it.section}, v${f.version}) "${short(it.entry)}": ${it.why}`, evidence: changelogAt, file: "CHANGELOG.md" });
    entries = { status: "measured", items: items.map(({ unit: _, ...rest }) => rest) };
  } else {
    entries = { status: "not measured", reason: clWhy };
    notMeasured.push({ signal: "orphan entries (a changelog entry with no diff)", reason: entries.reason });
  }

  // Tests: per PR, test lines ÷ production lines on each package it changed.
  const deltas = new Map(f.units.map((u) => [u, testDeltaOf(u.files)]));
  for (const u of changing) {
    const low = deltas.get(u)!.packages.filter((p) => p.ratio < R.testRatio);
    if (!low.length) continue;
    const worst = [...low].sort((x, y) => y.production - x.production)[0]!;
    const file = u.files.filter((x) => isProduction(x.path) && packageOf(x.path) === worst.package).sort((x, y) => lines(y) - lines(x))[0]?.path;
    land(u, {
      points: R.lowTests,
      rule: "tests",
      why: `${nameOf(u)}${u.firstContribution ? ", a first contribution," : ""} changed ${low.map((p) => `${p.production} production lines in ${p.package} with ${p.tests} test lines (${p.ratio.toFixed(2)})`).join("; ")}: below ${R.testRatio}`,
      evidence: evidenceFor(repo, u, file),
      ...(file ? { file } : {})
    });
  }
  // The release's ratio per package is the sum of its PRs': a PR's root tests count for the packages that PR changed, not every package.
  const perPackage = new Map<string, { production: number; tests: number }>();
  for (const u of changing)
    for (const p of deltas.get(u)!.packages) {
      const x = perPackage.get(p.package) ?? { production: 0, tests: 0 };
      x.production += p.production;
      x.tests += p.tests;
      perPackage.set(p.package, x);
    }
  const releaseTests = [...perPackage].sort(([x], [y]) => x.localeCompare(y)).map(([pkg, x]) => ({ package: pkg, ...x, ratio: round2(x.tests / x.production) }));

  // Reviews: nothing merges alone. A commit straight to main had no review by definition, token or not.
  const reviewed = (u: Unit): boolean | null => (u.pr === null ? false : o.reviews.status === "measured" ? (o.reviews.approved.get(u.pr) ?? null) : null);
  for (const u of f.units) {
    const r = reviewed(u);
    if (u.pr === null) land(u, { points: R.unreviewed, rule: "review", floor: true, why: `commit ${u.sha.slice(0, 7)} "${short(u.title)}" reached main without a pull request, so nobody reviewed it`, evidence: evidenceFor(repo, u) });
    else if (r === false) land(u, { points: R.unreviewed, rule: "review", floor: true, why: `PR #${u.pr} was merged with no approving review`, evidence: prUrl(repo, u) ?? `PR #${u.pr}` });
  }
  const prsOnly = f.units.filter((u) => u.pr !== null);
  const reviews: Signals["reviews"] =
    o.reviews.status === "measured"
      ? { status: "measured", reviewed: prsOnly.filter((u) => reviewed(u) === true).map((u) => u.pr!), unreviewed: prsOnly.filter((u) => reviewed(u) === false).map((u) => u.pr!), unknown: prsOnly.filter((u) => reviewed(u) === null).map((u) => u.pr!), problems: o.reviews.problems, direct: f.units.filter((u) => u.pr === null).map((u) => u.sha.slice(0, 7)) }
      : { status: "not measured", reason: o.reviews.reason, direct: f.units.filter((u) => u.pr === null).map((u) => u.sha.slice(0, 7)) };
  if (o.reviews.status === "not measured") notMeasured.push({ signal: "review coverage", reason: o.reviews.reason });
  else if (reviews.status === "measured" && reviews.unknown.length) notMeasured.push({ signal: "review coverage", reason: `GitHub could not say for ${reviews.unknown.map((n) => `PR #${n}`).join(", ")}: ${o.reviews.problems[0] ?? "no answer"}` });

  // Dependency movement: major bumps of direct dependencies, each on the PR that moved it.
  let dependencies: Signals["dependencies"];
  if (!f.deps) {
    dependencies = { status: "not measured", reason: `pnpm-lock.yaml is missing at ${f.refs.a} or ${f.refs.b}` };
    notMeasured.push({ signal: "dependency movement", reason: dependencies.reason });
  } else {
    const owner = (d: DepChange) => [...f.units].reverse().find((u) => u.deps.some((x) => x.name === d.name && x.importer === d.importer && x.to === d.to));
    const majorBumps = f.deps.filter((d) => d.kind === "major").map((d) => ({ ...d, pr: owner(d)?.pr ?? null }));
    const newPackages = f.deps.filter((d) => d.kind === "new").map((d) => ({ ...d, pr: owner(d)?.pr ?? null }));
    for (const d of f.deps.filter((x) => x.kind === "major")) {
      const u = owner(d);
      land(u, { points: R.majorBump, rule: "dependency", why: `${u ? nameOf(u) : "the release"} moves ${d.name} ${d.from} → ${d.to} in ${d.importer === "." ? "the root" : d.importer}: a major bump, ground the journeys may not cover`, evidence: u ? evidenceFor(repo, u, "pnpm-lock.yaml") : "pnpm-lock.yaml", file: "pnpm-lock.yaml" });
    }
    dependencies = { status: "measured", majorBumps, newPackages };
  }

  // The lines, the sum and the block the score reads.
  const order = (d: ChangeDeduction) => RULE_IDS.indexOf(d.rule);
  const prs: PrRisk[] = f.units.map((u) => {
    const ds = byUnit.get(u)!.sort((x, y) => order(x) - order(y));
    const url = prUrl(repo, u);
    return {
      pr: u.pr,
      sha: u.sha,
      title: u.title,
      ...(url ? { url } : {}),
      direct: u.pr === null,
      release: u.release,
      author: u.author.name,
      firstContribution: u.firstContribution,
      files: u.files.map((x) => x.path),
      churn: sum(u.files.map(lines)),
      hotspotsTouched: touched.get(u) ?? [],
      testDelta: deltas.get(u)!,
      reviewed: reviewed(u),
      points: sum(ds.map((d) => d.points)),
      deductions: ds
    };
  });
  const all = [...prs.flatMap((p) => p.deductions), ...loose];
  const lost = sum(all.map((d) => d.points));
  const score = Math.max(0, 100 - lost);
  const orphans = diffs.status === "measured" || entries.status === "measured" ? all.filter((d) => d.rule === "orphan").length : 0;
  const changeRisk: ChangeRiskBlock = {
    score,
    prs: prs.filter((p) => p.pr !== null).map((p) => ({ number: p.pr!, ...(p.url ? { url: p.url } : {}), reviewed: p.reviewed, firstTimeContributor: p.firstContribution, hotspots: p.hotspotsTouched })),
    direct: prs.filter((p) => p.pr === null).map((p) => ({ sha: p.sha, title: p.title })),
    deductions: all,
    gaps: notMeasured.map((n) => `${n.signal}: ${n.reason}`),
    orphans,
    evidence: CHANGES_FILE
  };
  return {
    schemaVersion: CHANGES_SCHEMA_VERSION,
    a: f.a,
    b: f.b,
    refs: f.refs,
    version: f.version,
    ...(repo ? { repo } : {}),
    history: { asked: f.historyAsked, releases: f.history.map(({ from, to }) => ({ from, to })) },
    score,
    lost,
    floorBreached: all.some((d) => d.floor),
    prs,
    signals: {
      churn,
      hotspots,
      ownership: { files: dispersed.map(([path, a]) => ({ path, authors: a.ids.size, prs: a.units.map(refOf) })) },
      orphans: { diffs, entries },
      tests: { packages: releaseTests.map((p) => ({ ...p, below: p.ratio < R.testRatio })) },
      reviews,
      dependencies
    },
    notMeasured,
    changeRisk,
    ...(o.harness ? { harness: o.harness } : {})
  };
}

function short(s: string, n = 80): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
