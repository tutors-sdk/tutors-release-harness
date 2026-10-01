/**
 * Claims owed (since 1.20.2): src/claims/draft.ts drafts one claim per cause, in release/claims.yaml's shape, scope
 * narrowed and checked with the claims matcher; a forecast's kept report shows them in place of the glance.
 */
import { readFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { DRAFT_RULE, draftClaims, draftsYaml, globEscape, scopeCandidates } from "../src/claims/draft.ts";
import { matchClaims, matcherFor } from "../src/claims/matcher.ts";
import { parseClaims } from "../src/claims/schema.ts";
import { InputFileError } from "../src/claims/input-error.ts";
import { isForecast, keepReport } from "../src/ci/report-archive.ts";
import { GLANCE_START } from "../src/glance/render.ts";
import { foldCauses } from "../src/report/causes.ts";
import { claimsOwedHtml, claimsOwedMarkdown } from "../src/report/lead.ts";
import type { Hunk, RunReport } from "../src/types.ts";
import { scoredRun } from "./support/scored-run.ts";

let n = 0;
const h = (artefact: Hunk["artefact"], scope: string, summary: string): Hunk => ({ id: `${artefact}:${++n}`, artefact, scope, summary, severity: "fail" });
const RULES = { source: "rules.json", rules: { "0220": { title: "The runtime image ships no package manager" } } };

/** A forecast's unclaimed set in the shapes the engines write, with a name ("tar") that is in two causes. */
const unclaimed = (): Hunk[] => [
  ...["reader", "catalogue", "live", "time"].flatMap((app) => ["@isaacs/cliui", "minipass", "a,b"].map((p) => h("sbom", `${app}/${p}`, `${app}: package removed: ${p}@1.0.0`))),
  h("sbom", "reader/tar", "reader: package bumped: tar 1 → 2"),
  h("sbom", "live/tar", "live: package bumped: tar 1 → 2"),
  h("network", "GET /_app/immutable/assets/1.{{hash}}.css", "reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css"),
  h("network", "GET /_app/immutable/assets/Card.{{hash}}.css", "live:home: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css"),
  h("network", "GET /logo.svg", "reader:home: request no longer made on b: GET /logo.svg"),
  h("dom", "reader:home", "reader:home: semantic DOM differs (+1 −2 lines at line 3)"),
  h("dom", "reader:course", "reader:course: semantic DOM differs (+4 −2 lines at line 3)"),
  h("headers", "reader:home/link", "reader:home: header link changed: <a> → <b>"),
  h("persistence", "student-signs-in/calendar", "student-signs-in: POST calendar — 0 row(s) on a, 5 on b")
];

describe("a draft claim per cause", () => {
  it("escapes what a glob reads, so a hash placeholder or a comma in a scope stays literal", () => {
    expect(globEscape("GET /a/1.{{hash}}.css")).toBe("GET /a/1.\\{\\{hash\\}\\}.css");
    expect(globEscape("reader/a,b")).toBe("reader/a\\,b");
    expect(globEscape("!x*?[y](z)|")).toBe("\\!x\\*\\?\\[y\\]\\(z\\)\\|");
    expect(globEscape("reader/@isaacs/cliui")).toBe("reader/@isaacs/cliui");
    for (const s of ["GET /a/1.{{hash}}.css", "reader/a,b", "reader:home", "student-signs-in/calendar"]) expect(matcherFor({ artefact: "*", scope: globEscape(s), reason: "test" })(h("dom", s, "x")), s).toBe(true);
  });

  it("offers a single scope as it is, app/name scopes by name, and a brace list with the common prefix and suffix out", () => {
    expect(scopeCandidates(["reader:home"])).toEqual(["reader:home"]);
    expect(scopeCandidates(["reader/x", "live/y"])).toEqual(["*/{x,y}", "{live,reader}/{x,y}", "{live/y,reader/x}"]);
    expect(scopeCandidates(["GET /a/1.{{hash}}.css", "GET /a/Card.{{hash}}.css"])).toContain("GET /a/{1,Card}.\\{\\{hash\\}\\}.css");
  });

  it("covers every difference of its cause and, where it can, nothing of another cause", () => {
    const u = unclaimed();
    const c = foldCauses(u);
    const drafts = draftClaims(c.causes, u, { [c.causes[0]!.id]: ["#143"] });
    expect(drafts.map((d) => d.key)).toEqual(c.causes.map((x) => x.key));
    const by = (k: string) => drafts.find((d) => d.key.startsWith(k))!;
    expect(by("sbom: package removed")).toMatchObject({ scope: "*/{@isaacs/cliui,a\\,b,minipass}", covers: 12, alsoCovers: 0 });
    expect(by("sbom: package removed").reason).toBe("package removed: 12 differences (reader, catalogue, live, time; 3 packages); likely #143");
    // tar is bumped, not removed: */tar would do, and takes nothing of the removals
    expect(by("sbom: package bumped")).toMatchObject({ scope: "*/tar", covers: 2, alsoCovers: 0 });
    expect(by("network: new request")).toMatchObject({ scope: "GET /_app/immutable/assets/{1,Card}.\\{\\{hash\\}\\}.css", covers: 2 });
    expect(by("dom")).toMatchObject({ scope: "reader:{course,home}", covers: 2 });
    expect(by("headers")).toMatchObject({ scope: "reader:home/link" });
    expect(by("persistence")).toMatchObject({ scope: "student-signs-in/calendar" });
    // and the drafts, with a Rule named, claim the whole unclaimed set with no claim left stale
    const filled = parseClaims(`claims:\n${draftsYaml(drafts).replaceAll(`"${DRAFT_RULE}"`, '"0220"')}`, "claims", RULES);
    const m = matchClaims(u, filled);
    expect(m.unclaimed).toEqual([]);
    expect(m.staleClaims).toEqual([]);
  });

  it("says when the narrowest scope it found also takes a difference of another cause", () => {
    // Two kinds on one page key: a page-key scope cannot tell them apart.
    const u = [h("dom", "reader:home", "reader:home: semantic DOM differs (+1 −2 lines at line 3)"), h("dom", "reader:home", 'journey "x" completed on a but failed on b')];
    const drafts = draftClaims(foldCauses(u).causes, u);
    expect(drafts.every((d) => d.covers === 1 && d.alsoCovers === 1)).toBe(true);
    expect(draftsYaml(drafts)).toContain("covers its 1 difference, and 1 of another cause");
  });

  it("is release/claims.yaml's shape, and a draft pasted unedited is refused: it claims nothing until a Rule is named", () => {
    const u = unclaimed();
    const yaml = draftsYaml(draftClaims(foldCauses(u).causes, u));
    const items = parse(`claims:\n${yaml}`).claims as Record<string, string>[];
    for (const item of items) expect(Object.keys(item)).toEqual(["artefact", "scope", "rule", "reason"]);
    expect(items[0]!.rule).toBe(DRAFT_RULE);
    expect(() => parseClaims(`claims:\n${yaml}`, "claims", RULES)).toThrow(InputFileError);
    expect(() => parseClaims(`claims:\n${yaml}`, "claims", RULES)).toThrow(/rule is four digits/);
  });

  it("renders in place of the glance: the count, what the drafts cover, and the YAML to paste, escaped", () => {
    const u = unclaimed();
    const drafts = draftClaims(foldCauses(u).causes, u);
    const md = claimsOwedMarkdown(drafts);
    expect(md).toContain(`#### Claims owed (${drafts.length})`);
    expect(md).toContain(`together they cover all ${u.length}, and none takes another cause's`);
    expect(md).toContain("```yaml\n  # sbom: package removed: covers its 12 differences.");
    const html = claimsOwedHtml(drafts);
    expect(html).toContain('<h2 id="claims-owed">');
    expect(html).toContain("scope: &quot;reader:home/link&quot;");
    expect(html).not.toMatch(/<script/);
    expect(claimsOwedMarkdown([])).toContain("None: no unclaimed difference.");
    expect(claimsOwedHtml([])).toContain("None: no unclaimed difference.");
  });
});

describe("on a kept forecast", () => {
  it("a forecast judges a build of main; a release candidate carries a version", () => {
    const sides = (b: string) => ({ sides: { a: { reader: "q/r:16.2.2" }, b: { reader: b } } }) as unknown as RunReport;
    expect(isForecast(sides("quay.io/tutors-sdk/tutors-reader:sha-90cb998"))).toBe(true);
    expect(isForecast(sides("quay.io/tutors-sdk/tutors-reader:16.3.0-rc.1"))).toBe(false);
    expect(isForecast(sides("quay.io/tutors-sdk/tutors-reader:sha-90cb998@sha256:" + "a".repeat(64)))).toBe(true);
    expect(isForecast(sides("tutors-reader:shabby"))).toBe(false);
  });

  it("shows the claims owed where the glance was, and a release candidate keeps its glance", async () => {
    const root = mkdtempSync(join(tmpdir(), "claims-owed-"));
    const forecast = keepReport({ dir: await scoredRun(join(root, "f"), { ranAt: "2026-09-28T05:00:00.000Z", unclaimed: 2 }), store: join(root, "fs") });
    const md = readFileSync(join(root, "fs", "reports", forecast.entry.id, "report.md"), "utf8");
    expect(md).not.toContain(GLANCE_START);
    expect(md.indexOf("No RCS")).toBeLessThan(md.indexOf("#### Claims owed (1)"));
    expect(md.indexOf("#### Claims owed (1)")).toBeLessThan(md.indexOf("| dimension | weight |"));
    expect(md).toContain('  - artefact: "screenshot"\n    scope: "/topic"\n    rule: "????"');
    const rc = keepReport({ dir: await scoredRun(join(root, "c"), { ranAt: "2026-09-28T05:00:00.000Z", unclaimed: 2, candidate: "1.1.0-rc.1" }), store: join(root, "cs") });
    const rcMd = readFileSync(join(root, "cs", "reports", rc.entry.id, "report.md"), "utf8");
    expect(rcMd).toContain(GLANCE_START);
    expect(rcMd).not.toContain("Claims owed");
  }, 60_000);
});
