import { describe, expect, it } from "vitest";
import { explainGap, ledgerSentence, prWords, unexplainedWords, type LedgerRun } from "../src/changes/explain.ts";
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

  it("reads a difference in what an image is built from, on a night no merged PR touched its inputs, as the rebuild's (23 Oct, #516)", () => {
    const node: Hunk = { id: "sbom:node", artefact: "sbom", scope: "reader/node", severity: "fail", summary: "reader: package bumped: node 22.23.3 → 22.23.4" };
    const layer: Hunk = { id: "image-manifest:base", artefact: "image-manifest", scope: "reader/base", severity: "fail", summary: "reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337)" };
    const before = run(21, report([]), changes(ui));
    const now = run(22, report([node, layer, dom("reader:home")]), changes(ui, docs));
    const e = explainGap(now, [before]);
    expect(e.unexplained.rows).toMatchObject([{ why: "rebuilt", hunks: 2 }]);
    expect(e.unexplained.rows[0]!.suspects).toBeUndefined();
    expect(unexplainedWords(e.unexplained.rows[0]!)).toContain("its base image or a package moved upstream");
    // The DOM difference is still the night's PR: only what an image is built from goes to the rebuild.
    expect(e.contributed.rows).toMatchObject([{ hunks: 1, prs: [{ pr: 470 }] }]);
    // A lockfile change that night is named, not the rebuild.
    expect(explainGap(run(22, report([node]), changes(ui, kit)), [before]).contributed.rows).toMatchObject([{ prs: [{ pr: 466 }] }]);
  });

  it("reads a difference on a Rule journey the forecast before did not run as first measured: the whole range, not that night's PRs", () => {
    const live: Hunk = { id: "persistence:live", artefact: "persistence", scope: "rule-0589-live/realtime_watch", severity: "fail", summary: "rule-0589-live: RPC realtime_watch — 0 row(s) on a, 1 on b" };
    const ran = (r: RunReport, ...journeys: string[]) => ({ ...r, timingControl: { journeys: journeys.map((journey) => ({ journey, a: [], b: [], above: 0, below: 0 })) } }) as RunReport;
    const realtime = pr(481, ["apps/reader/src/routes/api/live/activity/+server.ts", "apps/reader/src/lib/live-publish.ts"]);
    const a11y = pr(505, ["packages/svelte/ui-navigators/src/Preferences.svelte"]);
    const before = run(17, ran(report([]), "reader-loads"), changes(realtime));
    const now = run(18, ran(report([live]), "reader-loads", "rule-0589-live"), changes(realtime, a11y));
    const e = explainGap(now, [before]);
    // #505 merged between the two, but the forecast before never ran rule-0589-live: matched over the whole range, the
    // reader's own source (#481) leads the shared package (#505).
    expect(e.contributed.rows).toMatchObject([{ hunks: 1, firstSeen: [{ id: "d18" }] }]);
    expect(prWords(e.contributed.rows[0]!.prs)).toBe("#481 most likely");
    // A forecast kept before 1.39.0 records no journeys: every journey counts as run, as before.
    expect(explainGap(now, [run(17, report([]), changes(realtime))]).contributed.rows).toMatchObject([{ prs: [{ pr: 505 }] }]);
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
    // Since 1.49.1 direct files count first: #518 changed the reader's own manifest, #519 only the lockfile beside it.
    expect(prWords([{ pr: 518, sha: "a", files: 2, direct: 1 }, { pr: 519, sha: "b", files: 2, direct: 0 }])).toBe("#518 most likely");
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
