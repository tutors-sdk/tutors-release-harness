/**
 * E1 (harness hardening plan, since 1.56.0): the score's traceability input built from changes.json and claims.yaml,
 * written into changes.json by `harness changes`, and read by the score from --change-risk when no --traceability is
 * given, so a plain release measures the dimension.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { runChanges } from "../src/changes/command.ts";
import type { Changes, PrRisk } from "../src/changes/signals.ts";
import { confidence } from "../src/score/confidence.ts";
import { scoreInputs } from "../src/score/read.ts";
import { buildTraceability, claimTexts } from "../src/score/traceability.ts";
import { changesRepo } from "./support/changes-repo.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "harness-traceability-"));

const pr = (n: number | null, title: string, files: string[] = [], extra: Partial<PrRisk> = {}): PrRisk =>
  ({ pr: n, sha: `${String(n ?? 0).padStart(4, "0")}${"a".repeat(36)}`, title, direct: n === null, release: false, author: "ada", firstContribution: false, files, churn: 1, hotspotsTouched: [], testDelta: { production: 0, tests: 0, ratio: null, packages: [] }, reviewed: true, points: 0, deductions: [], ...(n !== null ? { url: `https://github.com/tutors-sdk/tutors-mono-repo/pull/${n}` } : {}), ...extra }) as PrRisk;

const range = (prs: PrRisk[]) => ({ a: "17.0.0", b: "17.1.0", prs });

describe("buildTraceability: one entry per feat or fix PR", () => {
  it("features and fixes only, by the conventional prefix; chores, docs, ci, refactors and release merges owe no Rule", () => {
    const t = buildTraceability(range([pr(1, "feat(reader): notes panel"), pr(2, "fix: course 504"), pr(3, "chore(deps): bump"), pr(4, "docs: readme"), pr(5, "ci: lint"), pr(6, "refactor!: ports"), pr(7, "feat!: drop Node 20"), pr(8, "chore(release): 17.1.0", [], { release: true })]), []);
    expect(t.entries.map((e) => [e.entry.split(" ")[0], e.kind])).toEqual([
      ["#1", "feature"],
      ["#2", "fix"],
      ["#7", "feature"]
    ]);
  });

  it("ears: the first EARS feature file the PR changed, else a Rule id its title cites, else null", () => {
    const t = buildTraceability(range([pr(1, "feat: a", ["apps/reader/src/a.ts", "tests/bdd/features/student/notes.feature"]), pr(2, "fix: b (Rule 0573)", ["Dockerfile"]), pr(3, "feat: c", ["apps/reader/src/c.ts", "specs/c.feature"])]), []);
    expect(t.entries.map((e) => e.ears)).toEqual(["tests/bdd/features/student/notes.feature", "Rule 0573 (cited in the title)", null]);
  });

  it("claimed only for a PR that declared an observable change: named by #N in a claim's reason, or by a Rule id the claim carries", () => {
    const claims = claimTexts(`claims:
  - artefact: dom
    scope: reader/course
    reason: "The notes panel (#1) adds a region"
  - artefact: headers
    scope: reader
    rule: "0573"
    reason: "Healthcheck"
`);
    const declares: PrRisk["declares"] = { artefacts: ["dom"], entry: "x", source: "title" };
    const t = buildTraceability(range([pr(1, "feat: notes (dom)", [], { declares }), pr(2, "fix: health (Rule 0573)", [], { declares }), pr(3, "feat: quiet (axe)", [], { declares }), pr(4, "feat: undeclared")]), claims);
    expect(t.entries.map((e) => e.claimed)).toEqual([true, true, false, undefined]);
    expect(t.untracedClaims).toBeUndefined();
  });

  it("a claim naming PRs that are none of the range's is untraced; a claim naming no PR is not judged", () => {
    const claims = claimTexts(`- artefact: dom
  scope: reader/x
  reason: "carried over from #99 and #100"
- artefact: dom
  scope: reader/y
  reason: "no PR named"
`);
    const t = buildTraceability(range([pr(1, "feat: a")]), claims);
    expect(t.untracedClaims).toEqual(["1 (dom reader/x) names #99, #100, not between 17.0.0 and 17.1.0"]);
  });

  it("a commit straight to main is labelled by its sha", () => {
    expect(buildTraceability(range([pr(null, "fix: hotfix")]), []).entries[0]!.entry).toBe("0000aaaaaaaa fix: hotfix");
  });
});

describe("the score reads it from changes.json", () => {
  const changes = (t: ReturnType<typeof buildTraceability> | undefined) => ({ changeRisk: { score: 100, prs: [], direct: [], deductions: [], gaps: [], orphans: 0, evidence: "changes.json" }, ...(t ? { traceability: t } : {}) });

  it("--change-risk changes.json with a traceability block and no --traceability: traceability is measured from it", () => {
    const dir = tmp();
    const file = join(dir, "changes.json");
    writeFileSync(file, JSON.stringify(changes(buildTraceability(range([pr(1, "feat: a", ["tests/bdd/features/a.feature"]), pr(2, "fix: b")]), []))));
    const inputs = scoreInputs({ outDir: dir, changeRisk: file });
    expect(inputs.traceability?.where).toBe("changes.json");
    const dim = confidence(inputs).dimensions.find((d) => d.id === "traceability")!;
    expect(dim.status).toBe("measured");
    expect(dim.deductions.map((d) => d.why)).toEqual(['changelog entry "#2 fix: b" has no EARS file']);
  });

  it("an older changes.json without the block leaves traceability not measured, as before", () => {
    const dir = tmp();
    const file = join(dir, "changes.json");
    writeFileSync(file, JSON.stringify(changes(undefined)));
    expect(scoreInputs({ outDir: dir, changeRisk: file }).traceability).toBeUndefined();
  });

  it("an explicit --traceability wins, and may itself be a changes.json", () => {
    const dir = tmp();
    const cr = join(dir, "changes.json");
    const tr = join(dir, "other.json");
    writeFileSync(cr, JSON.stringify(changes(buildTraceability(range([pr(1, "feat: a")]), []))));
    writeFileSync(tr, JSON.stringify(changes(buildTraceability(range([pr(2, "fix: b"), pr(3, "fix: c")]), []))));
    expect(scoreInputs({ outDir: dir, changeRisk: cr, traceability: tr }).traceability?.data.entries).toHaveLength(2);
  });
});

describe("harness changes --claims", () => {
  let repo: string;
  beforeAll(() => {
    repo = changesRepo();
  }, 30_000);

  it("writes the traceability block into changes.json, naming whether claims were read", async () => {
    const dir = tmp();
    const claims = join(dir, "claims.yaml");
    writeFileSync(claims, "claims: []\n");
    const out = join(dir, "changes.json");
    await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6, claims, out }, { env: {}, reviews: { approved: async () => true } });
    const c = JSON.parse(readFileSync(out, "utf8")) as Changes;
    expect(c.traceability?.evidence).toBe("changes.json and claims.yaml");
    const without = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6 }, { env: {}, reviews: { approved: async () => true } })).changes;
    expect(without.traceability?.evidence).toBe("changes.json (no claims)");
  });

  it("a claims file that is missing is refused, naming the flag", async () => {
    await expect(runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6, claims: join(tmp(), "nope.yaml") }, { env: {}, reviews: { approved: async () => true } })).rejects.toThrow(/--claims: .*does not exist/);
  });
});
