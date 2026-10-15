import { describe, expect, it } from "vitest";
import { explainGap, ledgerSentence, prWords, type LedgerRun } from "../src/changes/explain.ts";
import type { Changes, PrRisk } from "../src/changes/signals.ts";
import type { Hunk, RunReport } from "../src/types.ts";

const pr = (n: number, files: string[]): PrRisk => ({ pr: n, sha: `${n}`.padStart(7, "0"), title: `PR ${n}`, url: `https://github.com/x/y/pull/${n}`, files }) as unknown as PrRisk;
const changes = (...prs: PrRisk[]): Changes => ({ prs }) as unknown as Changes;
const sbom = (pkg: string): Hunk => ({ id: `sbom:${pkg}`, artefact: "sbom", scope: `reader/${pkg}`, severity: "fail", summary: `reader/${pkg}: package added (1.0.0)` });
const dom = (page: string): Hunk => ({ id: `dom:${page}`, artefact: "dom", scope: page, severity: "fail", summary: `${page}: semantic DOM differs (+3 −1 lines at line 12)` });
const report = (unclaimed: Hunk[], claimed: Hunk[] = [], baseline = "16.2.2"): RunReport =>
  ({
    sides: { a: { reader: `quay.io/t/reader:${baseline}` }, b: { reader: "quay.io/t/reader:sha-1" } },
    compare: { unclaimed, hunks: [...unclaimed, ...claimed], matches: [...claimed.map((hunk) => ({ hunk, claim: { artefact: hunk.artefact, scope: hunk.scope, reason: "CHANGELOG 17.0.0: icons" } })), ...unclaimed.map((hunk) => ({ hunk }))] }
  }) as unknown as RunReport;
const run = (day: number, r: RunReport, c?: Changes): LedgerRun => ({ id: `d${day}`, ranAt: `2026-10-${String(day).padStart(2, "0")}T08:00:00Z`, report: r, ...(c ? { changes: c } : {}) });

const kit = pr(466, ["pnpm-lock.yaml", "package.json"]);
const docs = pr(470, ["README.md"]);
const ui = pr(313, ["apps/reader/src/routes/+page.svelte"]);

describe("the gap, explained", () => {
  it("puts every difference in exactly one row: claimed, contributed by the PR merged the night it appeared, or unexplained", () => {
    const old = run(10, report([dom("reader:home")]), changes(ui));
    const before = run(11, report([dom("reader:home")]), changes(ui));
    const now = run(12, report([dom("reader:home"), sbom("jsdom"), sbom("cssstyle")], [dom("reader:lab")]), changes(ui, kit, docs));
    const e = explainGap(now, [old, before]);
    expect(e.total).toBe(4);
    expect(e.claimed.hunks + e.contributed.hunks + e.unexplained.hunks).toBe(e.total);
    expect(e.claimed.rows).toEqual([{ label: "CHANGELOG 17.0.0: icons", reason: "CHANGELOG 17.0.0: icons", hunks: 1 }]);
    // kit and docs merged between d11 and d12; only kit touches the lockfile, so it alone is named.
    expect(e.contributed.rows[0]).toMatchObject({ hunks: 2, prs: [{ pr: 466 }], firstSeen: [{ id: "d12" }] });
    // The DOM difference was already in the oldest kept forecast, whose whole range is one PR: it is that PR's.
    expect(e.contributed.rows[1]).toMatchObject({ hunks: 1, prs: [{ pr: 313 }], firstSeen: [{ id: "d10" }] });
    expect(e.unexplained.hunks).toBe(0);
    expect(ledgerSentence(e)).toBe("4 differences: claims explain 1; #466 contributed 2; #313 contributed 1; 0 unexplained.");
  });

  it("reads the oldest kept forecast's whole range, so the first forecast beside a new release names the PRs since it", () => {
    const now = run(16, report([dom("reader:home"), sbom("jsdom")], [], "17.0.0"), changes(ui, kit));
    const e = explainGap(now, []);
    expect(e.contributed.rows.map((r) => [prWords(r.prs), r.hunks]).sort()).toEqual([
      ["#313", 1],
      ["#466", 1]
    ]);
  });

  it("leaves a difference unexplained when no PR merged between the forecasts it appeared between", () => {
    const a = run(10, report([]), changes(ui));
    const b = run(11, report([dom("reader:topic")]), changes(ui));
    const e = explainGap(b, [a]);
    expect(e.unexplained.rows).toMatchObject([{ why: "no-merge", hunks: 1 }]);
    expect(e.contributed.hunks).toBe(0);
  });

  it("never reads a forecast beside another production, or one that ran after the run", () => {
    const other = run(10, report([], [], "16.1.0"), changes());
    const later = run(13, report([]), changes(ui, kit));
    const now = run(12, report([sbom("jsdom")]), changes(kit));
    expect(explainGap(now, [other, later]).history.runs).toBe(0);
  });

  it("names the PR that matched the most files as most likely, and keeps a tie as one group", () => {
    expect(prWords([{ pr: 466, sha: "a", files: 3 }, { pr: 461, sha: "b", files: 1 }])).toBe("#466 most likely");
    expect(prWords([{ pr: 1, sha: "a", files: 1 }, { pr: 2, sha: "b", files: 1 }])).toBe("one of #1, #2");
  });

  it("counts more than eight PRs as unexplained, naming the best matches as suspects only", () => {
    const many = Array.from({ length: 9 }, (_, i) => pr(500 + i, ["pnpm-lock.yaml"]));
    const a = run(10, report([]), changes());
    const b = run(11, report([sbom("jsdom")]), changes(...many));
    const e = explainGap(b, [a]);
    expect(e.contributed.hunks).toBe(0);
    expect(e.unexplained.rows[0]).toMatchObject({ why: "too-many", hunks: 1 });
    expect(e.unexplained.rows[0]!.suspects!.length).toBeLessThanOrEqual(3);
  });
});
