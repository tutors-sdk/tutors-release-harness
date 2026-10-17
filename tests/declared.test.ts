import { describe, expect, it } from "vitest";
import { attribute } from "../src/changes/attribute.ts";
import { changelogLineOf, declarationOf, hintOf } from "../src/changes/declares.ts";
import { explainGap, ledgerSentence, type LedgerRun } from "../src/changes/explain.ts";
import { readBodies } from "../src/changes/github.ts";
import type { Changes, PrRisk } from "../src/changes/signals.ts";
import { gateWhy } from "../src/a3/model.ts";
import { draftClaims, draftsYaml } from "../src/claims/draft.ts";
import { foldCauses } from "../src/report/causes.ts";
import type { Hunk, RunReport } from "../src/types.ts";

// #505's own body, as GitHub returns it (trimmed): the ticked CHANGELOG line under the template's heading.
const BODY_505 = [
  "## If a student, lecturer or operator can observe the change",
  "",
  '- [x] CHANGELOG: `Screen readers announce the Preferences button as "Preferences", and the search and close buttons announce their keyboard shortcuts (axe, dom)`'
].join("\n");
const TEMPLATE = "- [ ] The CHANGELOG line (or the line to add at release time) names the artefacts it moves, e.g. `(axe, dom)`; see [Changelog Entries](../CONTRIBUTING.md#changelog-entries). Write `none` if nothing observable should differ";

describe("what a PR declares", () => {
  it("reads the hint ending a CHANGELOG entry, and refuses a parenthesis that is not artefact names", () => {
    expect(hintOf("Nav contrast raised (axe, dom) (PR #301)")).toEqual({ artefacts: ["axe", "dom"], entry: "Nav contrast raised" });
    expect(hintOf("Presence polled every 15 s (network)")).toEqual({ artefacts: ["network"], entry: "Presence polled every 15 s" });
    expect(hintOf("Raise contrast (see notes)")).toBeUndefined();
    expect(hintOf("none")).toEqual({ artefacts: [], entry: "none" });
  });

  it("reads #505's ticked CHANGELOG line from its body, and never the template's unticked example", () => {
    expect(changelogLineOf(BODY_505)).toMatch(/^Screen readers announce .* \(axe, dom\)$/);
    expect(changelogLineOf(TEMPLATE)).toBeUndefined();
    expect(changelogLineOf("<!-- CHANGELOG: `x (dom)` -->")).toBeUndefined();
    expect(declarationOf("fix(a11y): button names contain their visible text", BODY_505)).toMatchObject({ artefacts: ["axe", "dom"], source: "body" });
  });

  it("takes the title's hint first, as pnpm release:changelog does", () => {
    expect(declarationOf("fix(reader): raise nav contrast (axe, dom)", "CHANGELOG: `other (network)`")).toEqual({ artefacts: ["axe", "dom"], entry: "fix(reader): raise nav contrast", source: "title" });
    expect(declarationOf("chore: tidy", undefined)).toBeUndefined();
  });

  it("reads a body GitHub cannot give as no body, so the title alone speaks for the PR", async () => {
    const bodies = await readBodies({ body: async (n) => (n === 2 ? Promise.reject(new Error("404")) : `body ${n}`) }, [1, 2]);
    expect([...bodies]).toEqual([[1, "body 1"]]);
  });
});

// Today's forecast (17 Oct 2026): #505 renamed "Open Theme Menu" to "Preferences"; ten dom and two focus differences.
const pr = (n: number, files: string[], body?: string): PrRisk => {
  const declares = declarationOf(`PR ${n}`, body);
  return { pr: n, sha: `${n}`.padStart(7, "0"), title: `PR ${n}`, url: `https://github.com/x/y/pull/${n}`, files, release: false, ...(declares ? { declares } : {}) } as unknown as PrRisk;
};
const changes = (...prs: PrRisk[]): Changes => ({ prs }) as unknown as Changes;
const dom = (page: string): Hunk => ({ id: `dom:${page}`, artefact: "dom", scope: page, severity: "fail", summary: `${page}: semantic DOM differs (+1 −1 lines at line 9)` });
const focus = (page: string): Hunk => ({ id: `focus:${page}`, artefact: "focus", scope: page, severity: "fail", summary: `${page}: keyboard order changed (12 stops on a, 12 on b)` });
const report = (unclaimed: Hunk[]): RunReport =>
  ({ sides: { a: { reader: "quay.io/t/reader:17.0.0" }, b: { reader: "quay.io/t/reader:sha-83d4ccf" } }, compare: { unclaimed, hunks: unclaimed, matches: unclaimed.map((hunk) => ({ hunk })) } }) as unknown as RunReport;
const run = (day: number, r: RunReport, c: Changes): LedgerRun => ({ id: `d${day}`, ranAt: `2026-10-${day}T07:12:00Z`, report: r, changes: c });

const nightly = pr(504, ["patches/stryker.patch"]);
const a11y = pr(505, ["packages/svelte/ui-navigators/src/LayoutMenu.svelte", "packages/svelte/utils/i18n/src/messages/en.ts"], BODY_505);
const pages = ["catalogue:home", "live:home", "reader:search", "reference:course"];
const today = [...pages.map(dom), focus("catalogue:home"), focus("reference:course")];

describe("a difference its PR declared", () => {
  const before = run(16, report([]), changes());
  const now = run(17, report(today), changes(nightly, a11y));

  it("counts dom as declared by #505 and leaves focus to #505, saying its line missed it", () => {
    const e = explainGap(now, [before]);
    expect(e.declared).toMatchObject({ hunks: 4, rows: [{ pr: { pr: 505 }, hunks: 4 }] });
    expect(e.contributed.rows).toMatchObject([{ prs: [{ pr: 505 }], hunks: 2, missed: [{ pr: 505 }] }]);
    expect(e.claimed.hunks + e.declared!.hunks + e.contributed.hunks + e.unexplained.hunks).toBe(e.total);
    expect(ledgerSentence(e)).toBe("6 differences: #505 declared 4 in its CHANGELOG line; #505 contributed 2 (#505's CHANGELOG line says (axe, dom); focus moved); 0 unexplained.");
  });

  it("says the forecast fails only on what nobody declared, and passes the rest to the release author", () => {
    const e = explainGap(now, [before]);
    const why = gateWhy({ verdict: "fail", reasons: [], report: now.report, stream: "main-preview" }, e)!;
    expect(why).toMatch(/^FAIL because 2 differences have no claim and no PR declared them \(#505's CHANGELOG line says \(axe, dom\); focus moved\)\. The other 4 are declared/);
    expect(why).toMatch(/nothing is owed on main/);
  });

  it("says a forecast whose every difference is declared fails only for want of the claims the release will carry", () => {
    const declaredAll = pr(505, a11y.files, BODY_505.replace("(axe, dom)", "(dom, focus)"));
    const e = explainGap(run(17, report(today), changes(nightly, declaredAll)), [before]);
    expect(e.contributed.hunks).toBe(0);
    expect(gateWhy({ verdict: "fail", reasons: [], report: now.report, stream: "main-preview" }, e)).toMatch(/^FAIL only because 6 differences are not claimed yet, and each is declared in its PR's CHANGELOG line \(#505: 6\): nothing is owed on main/);
  });

  it("drafts the declared cause with the PR's CHANGELOG line as its reason and no Rule to name", () => {
    const causes = foldCauses(today).causes;
    const a = attribute(causes, changes(nightly, a11y), { id: "d16", candidate: "sha-c867ee8", keys: new Set(), changes: changes() });
    expect(a.declared).toBe(1);
    const domCause = a.causes.find((c) => c.key.startsWith("dom"))!;
    expect(domCause.declaredBy).toMatchObject({ pr: 505 });
    expect(a.causes.find((c) => c.key.startsWith("focus"))!.declaredBy).toBeUndefined();
    const drafts = draftClaims(causes, today, {}, { [domCause.cause]: { pr: "#505", entry: domCause.declaredBy!.declares!.entry } });
    const yaml = draftsYaml(drafts);
    expect(yaml).toMatch(/Declared by #505 in its CHANGELOG line: ready to paste when the release is cut\./);
    expect(yaml).toMatch(/reason: "CHANGELOG: Screen readers announce .* \(#505\)"/);
    expect(yaml.match(/rule: "\?\?\?\?"/g)).toHaveLength(1);
  });

  it("never declares by path: a PR that touched the packages before tonight says nothing about a cause that is not new", () => {
    const causes = foldCauses(today).causes;
    const a = attribute(causes, changes(a11y));
    expect(a.declared).toBe(0);
  });
});
