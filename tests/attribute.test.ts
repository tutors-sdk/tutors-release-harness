/**
 * Which PR did it (since 1.20.1): src/changes/attribute.ts names, for each cause, the PRs that could have made it. A new
 * cause against the PRs merged since the last forecast; the rest by path. The kept forecast leads with it.
 */
import { copyFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { attribute, byPath, mergedSince, pathsOf } from "../src/changes/attribute.ts";
import type { Changes, PrRisk } from "../src/changes/signals.ts";
import { keepReport } from "../src/ci/report-archive.ts";
import { foldCauses, type Cause } from "../src/report/causes.ts";
import { ATTRIBUTION_LISTED, attributionLeadHtml, attributionLeadMarkdown } from "../src/report/lead.ts";
import type { Hunk } from "../src/types.ts";
import { scoredRun } from "./support/scored-run.ts";

const pr = (n: number, files: string[], o: Partial<PrRisk> = {}): PrRisk => ({ pr: n, sha: `${n}`.padStart(40, "0"), title: `PR ${n}`, url: `https://github.com/tutors-sdk/tutors-mono-repo/pull/${n}`, direct: false, release: false, author: "x", firstContribution: false, files, churn: 1, hotspotsTouched: [], testDelta: { production: 1, tests: 0, ratio: 0, packages: [] }, reviewed: false, points: 0, deductions: [], ...o });
const changes = (prs: PrRisk[]) => ({ prs }) as unknown as Changes;
const h = (artefact: Hunk["artefact"], scope: string, summary: string): Hunk => ({ id: `${artefact}:${scope}:${summary.length}`, artefact, scope, summary, severity: "fail" });

const DOCKER = pr(143, ["apps/reader/Dockerfile", "apps/catalogue/Dockerfile"]);
const MANIFEST = pr(282, ["apps/reader/package.json", "pnpm-lock.yaml", "apps/reader/Dockerfile"]);
const PAPER = pr(313, ["packages/svelte/ui/src/Card.svelte", "packages/svelte/ui/src/Paper.svelte", "apps/reader/src/routes/+page.svelte"]);
const CATALOGUE = pr(330, ["apps/catalogue/src/routes/+page.svelte", "apps/catalogue/src/lib/x.ts", "apps/catalogue/src/lib/y.ts", "apps/catalogue/src/lib/z.ts"]);
const DOCS = pr(350, ["README.md", "apps/reader/README.md", "apps/reader/src/lib/x.test.ts", ".github/workflows/ci.yml", "docs/a.md"]);
const RELEASE = pr(360, ["apps/reader/package.json"], { release: true });

const causes = (...hunks: Hunk[]) => foldCauses(hunks).causes;

describe("attribution by path", () => {
  it("an image cause is about Dockerfiles first and manifests after; a page cause is about its app, then the packages", () => {
    expect(pathsOf({ artefact: "sbom", apps: ["reader"] })).toEqual({ primary: ["**/Dockerfile*", "**/.dockerignore"], secondary: ["pnpm-lock.yaml", "package.json", "apps/*/package.json", "packages/**/package.json"] });
    expect(pathsOf({ artefact: "image-manifest", apps: ["reader"] }).secondary).toEqual([]);
    expect(pathsOf({ artefact: "dom", apps: ["reader", "live"] })).toEqual({ primary: ["apps/reader/**", "apps/live/**"], secondary: ["packages/**"] });
    // A journey's table names no app: the reader is the app every journey drives; anything else names every app.
    expect(pathsOf({ artefact: "persistence", apps: [] }).primary).toEqual(["apps/reader/**"]);
    expect(pathsOf({ artefact: "logs", apps: [] }).primary).toEqual(["apps/*/**"]);
  });

  it("ranks the PRs by direct files, then indirect, then merge order, and never matches documentation, tests or workflows", () => {
    const [sbom] = causes(h("sbom", "reader/minipass", "reader: package removed: minipass@7.1.2"));
    expect(byPath(sbom!, [PAPER, DOCKER, MANIFEST, DOCS]).map((p) => [p.pr, p.files, p.direct])).toEqual([
      [143, 2, 2],
      [282, 3, 1]
    ]);
    const [dom] = causes(h("dom", "catalogue:home", "catalogue:home: semantic DOM differs (+1 −1 lines at line 2)"));
    // A Dockerfile under the app is the app's own: it can change what the page serves.
    expect(byPath(dom!, [PAPER, CATALOGUE, DOCKER, DOCS]).map((p) => [p.pr, p.files, p.direct])).toEqual([
      [330, 4, 4],
      [143, 1, 1],
      [313, 2, 0]
    ]);
    const [reader] = causes(h("dom", "reader:home", "reader:home: semantic DOM differs (+1 −1 lines at line 2)"));
    expect(byPath(reader!, [DOCS]).length).toBe(0);
  });

  it("names what was merged between two forecasts: this range less the last one's, release merges left out", () => {
    expect(mergedSince(changes([DOCKER, PAPER, CATALOGUE, RELEASE]), changes([DOCKER])).map((p) => p.pr)).toEqual([313, 330]);
  });
});

describe("attribution by delta", () => {
  const cs = causes(h("dom", "catalogue:home", "catalogue:home: semantic DOM differs (+1 −1 lines at line 2)"), h("network", "GET /logo.svg", "reader:home: request no longer made on b: GET /logo.svg"), h("sbom", "reader/minipass", "reader: package removed: minipass@7.1.2"));
  const key = (k: string) => cs.find((c) => c.key.startsWith(k))!.key;

  it("a cause the last forecast did not have is attributed to the PRs merged since, narrowed by path when any match", () => {
    const a = attribute(cs, changes([DOCKER, PAPER, CATALOGUE]), { id: "prev", candidate: "sha-1", keys: new Set([key("sbom"), key("network")]), changes: changes([DOCKER]) });
    const dom = a.causes.find((c) => c.key.startsWith("dom"))!;
    expect(dom).toMatchObject({ how: "new", hunks: 1 });
    expect(dom.prs.map((p) => p.pr)).toEqual([330, 313]);
    // the others by path, over the whole range
    expect(a.causes.find((c) => c.key.startsWith("sbom"))).toMatchObject({ how: "path", prs: [{ pr: 143 }] });
    expect(a.mergedSince?.map((p) => p.pr)).toEqual([313, 330]);
    expect(a.against).toEqual({ id: "prev", candidate: "sha-1" });
    expect(a.attributed).toBe(3);
  });

  it("names every PR merged since when none matches the new cause's paths: one of them did it", () => {
    const a = attribute(cs, changes([PAPER, DOCS]), { id: "prev", candidate: "sha-1", keys: new Set([key("dom"), key("network")]), changes: changes([PAPER]) });
    expect(a.causes.find((c) => c.key.startsWith("sbom"))).toMatchObject({ how: "new", prs: [{ pr: 350, files: 0, direct: 0 }] });
  });

  it("falls back to path when nothing earlier was kept, or nothing was merged since, or the earlier range is unknown", () => {
    for (const previous of [undefined, { id: "p", candidate: "c", keys: new Set<string>(), changes: changes([DOCKER, PAPER, CATALOGUE]) }, { id: "p", candidate: "c", keys: new Set<string>() }]) {
      const a = attribute(cs, changes([DOCKER, PAPER, CATALOGUE]), previous);
      expect(a.causes.every((c) => c.how === "path"), JSON.stringify(previous ?? null)).toBe(true);
    }
    const none = attribute(cs, changes([DOCS]));
    expect(none.attributed).toBe(0);
    expect(none.causes.every((c) => c.prs.length === 0)).toBe(true);
  });
});

describe("the lead of a kept forecast", () => {
  const cs: Cause[] = causes(h("dom", "catalogue:home", "catalogue:home: semantic DOM differs (+1 −1 lines at line 2)"), h("sbom", "reader/minipass", "reader: package removed: minipass@7.1.2"));
  const many = Array.from({ length: ATTRIBUTION_LISTED + 2 }, (_, i) => pr(400 + i, [`apps/catalogue/src/f${i}.ts`]));

  it("puts the new causes first, names the first PRs of each and counts the rest, linked; says what was merged since", () => {
    const a = attribute(cs, changes([DOCKER, ...many]), { id: "p", candidate: "sha-90cb998", keys: new Set([cs.find((c) => c.artefact === "sbom")!.key]), changes: changes([DOCKER]) });
    const md = attributionLeadMarkdown(a);
    expect(md).toContain("#### Causes and the PRs behind them");
    expect(md).toContain("2 causes, 2 with a PR named. Merged since the forecast of `sha-90cb998`:");
    expect(md).toContain("1 cause is new since then, and only these PRs can have made it.");
    const rows = md.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| cause") && !l.startsWith("| ---"));
    expect(rows[0]).toMatch(/^\| \*\*new\*\* dom: /);
    expect(rows[0]).toContain(`[#400](https://github.com/tutors-sdk/tutors-mono-repo/pull/400) (1 file)`);
    expect(rows[0]).toContain("and 2 more");
    expect(rows[1]).toContain("[#143](https://github.com/tutors-sdk/tutors-mono-repo/pull/143) (2 files)");
    const html = attributionLeadHtml(a);
    expect(html).toContain('<h2 id="attribution">Causes and the PRs behind them</h2>');
    expect(html).toContain(`<a href="#cause-${cs[0]!.id}">`);
    expect(html).toContain('<a href="https://github.com/tutors-sdk/tutors-mono-repo/pull/400">#400</a>');
    expect(html).not.toMatch(/<script/);
  });

  it("says when nothing was merged since, and when nothing matched", () => {
    const a = attribute(cs, changes([DOCS]), { id: "p", candidate: "sha-1", keys: new Set(cs.map((c) => c.key)), changes: changes([DOCS]) });
    const md = attributionLeadMarkdown(a);
    expect(md).toContain("Nothing was merged since the forecast of `sha-1`.");
    expect(md).toContain("| none matched |");
    expect(md).toContain("0 with a PR named");
  });

  it("is led in a kept, scored forecast after the delta and before the RCS", async () => {
    const root = mkdtempSync(join(tmpdir(), "attribution-"));
    const store = join(root, "store");
    const one = await scoredRun(join(root, "one"), { ranAt: "2026-09-27T05:00:00.000Z", unclaimed: 1 });
    keepReport({ dir: one, store });
    const two = await scoredRun(join(root, "two"), { ranAt: "2026-09-28T05:00:00.000Z", unclaimed: 3 });
    // The same range both nights (each scoredRun builds its own repository, so its direct commit's sha differs).
    copyFileSync(join(one, "changes.json"), join(two, "changes.json"));
    const { entry } = keepReport({ dir: two, store });
    const md = readFileSync(join(store, "reports", entry.id, "report.md"), "utf8");
    const at = (s: string) => md.indexOf(s);
    expect(at("#### New since the last forecast")).toBeLessThan(at("#### Causes and the PRs behind them"));
    expect(at("#### Causes and the PRs behind them")).toBeLessThan(at("**RCS") >= 0 ? at("**RCS") : at("No RCS"));
    // the same range both nights: nothing merged since, the one cause by path
    expect(md).toContain("Nothing was merged since the forecast of `sha-3f1c2a9`.");
    expect(md).toMatch(/\| screenshot: screenshot \/topic moved # \| 3 \| #1[0-2] /);
    const html = readFileSync(join(store, "reports", entry.id, "report.html"), "utf8");
    expect(html.indexOf('<h2 id="delta">')).toBeLessThan(html.indexOf('<h2 id="attribution">'));
    expect(html).toContain('<h2 id="causes">');
  }, 60_000);
});
