/**
 * The 5 Whys and the kaizen register (C4, src/why): Why 1 pre-filled from a run's own trace, each trigger opening a stub,
 * `harness why check` accepting a filled file and rejecting each kind of blame with its Lean reason, the register
 * regenerated from the files, the register's own run rule (open countermeasures only rising), and the repository's
 * kaizen/ held to all of it as CI holds it.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import type { Changes } from "../src/changes/signals.ts";
import { UsageError, glanceCommand, scoreboardCommand, whyCommand } from "../src/local/cli.ts";
import { scoreAndWrite } from "../src/score/read.ts";
import { DIMENSION_IDS } from "../src/score/weights.ts";
import { type ScoreboardLine } from "../src/scoreboard/line.ts";
import { readTrends } from "../src/scoreboard/store.ts";
import { NO_COUNTERMEASURES, openCounts, trends } from "../src/scoreboard/trends.ts";
import { checkFiles, openWhy } from "../src/why/command.ts";
import { COUNTERMEASURE_KINDS, REASONS, blameIn, checkWhy, parseWhy } from "../src/why/format.ts";
import { loadContext } from "../src/why/read.ts";
import { DEFAULT_HEADER, REGISTER_END, REGISTER_START, readRegister, registerLine, registerOf, registerSummary } from "../src/why/register.ts";
import { WhyInputError, automaticFindings, findingIds, nearestClaim, renderStub, resolveFinding, stubName } from "../src/why/trace.ts";
import type { Claim, Hunk, JourneyCapture, RunReport } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-why-${name}-`));
const NOW = new Date("2026-09-27T12:00:00Z");

// ---- fixtures: a harness release directory on disk -----------------------------------------------------------

const unclaimed: Hunk = { id: "dom:reader:course:1", artefact: "dom", scope: "reader:course", summary: "the course card lost its image", severity: "fail" };
const claimed: Hunk = { id: "dom:reader:topic:2", artefact: "dom", scope: "reader:topic", summary: "the topic title moved", severity: "fail" };
const topicClaim: Claim = { artefact: "dom", scope: "reader:topic", reason: "PR #7 retitles topics" };
const staleClaim: Claim = { artefact: "dom", scope: "reader:courses/**", reason: "PR #12 new course list" };
const broad: Claim = { artefact: "*", scope: "**", reason: "everything", approvedBy: "sam" };

const journey = (name: string, run: number, pages: string[]): JourneyCapture => ({ journey: name, run, anonymous: true, durationMs: 1000 + run, pages: pages.map((pageKey) => ({ pageKey, path: `/${pageKey}`, aria: "", headers: {}, network: [], console: [], axe: [], focus: [], timing: { ttfbMs: 10, responseEndMs: 11 } })), persistence: [] }) as unknown as JourneyCapture;
const capture = { journeys: [1, 2].flatMap((r) => [journey("anonymous-student-reads-course", r, ["reader:home", "reader:course"]), journey("catalogue-loads", r, ["catalogue:home"])]) };

function releaseReport(o: { verdict: "pass" | "fail"; hollow?: boolean; mode?: "release" | "post-deploy" }): RunReport {
  // A FAIL has the unclaimed hunk; a PASS has only the claimed one; a hollow PASS has a broad claim swallowing it and three stale claims.
  const fail = o.verdict === "fail";
  const hunks = fail ? [unclaimed, claimed] : [claimed];
  const matches = o.hollow ? [{ hunk: claimed, claim: broad }] : [...(fail ? [{ hunk: unclaimed }] : []), { hunk: claimed, claim: topicClaim }];
  return {
    schemaVersion: 1,
    mode: o.mode ?? "release",
    ranAt: "2026-09-27T10:00:00Z",
    verdict: o.verdict,
    reasons: [o.verdict === "fail" ? "1 unclaimed difference" : "no unclaimed difference"],
    compare: { hunks, matches, unclaimed: fail ? [unclaimed] : [], staleClaims: o.hollow ? [1, 2, 3].map((n) => ({ artefact: "dom", scope: `s${n}`, reason: `r${n}` })) : [staleClaim], broadUnapproved: [] },
    masksApplied: { "a-mask": 3 },
    // a clean A/A and k6 on both sides, as a real release run has: a PASS scores Green unless the claims are hollow
    noise: { ranAt: "2026-09-27T02:00:00Z", clean: true, hunks: 0 },
    load: { a: { requests: 600, failed: 0, serverErrors: 0 }, b: { requests: 600, failed: 0, serverErrors: 0 } },
    ...(o.mode === "post-deploy" ? { deployment: { production: "16.3.0", status: "match", digests: {}, problems: [] } } : {})
  } as unknown as RunReport;
}

const changes = {
  schemaVersion: 1,
  a: "16.2.2",
  b: "16.3.0-rc.1",
  repo: "tutors-sdk/tutors-mono-repo",
  prs: [
    { pr: 12, sha: "abc12", title: "New course list", url: "https://github.com/tutors-sdk/tutors-mono-repo/pull/12", release: false, direct: false, author: "newcomer", firstContribution: true, reviewed: true, files: ["apps/reader/src/lib/CourseCard.svelte", "apps/reader/src/routes/+page.svelte"], churn: 120, hotspotsTouched: [], deductions: [], points: 0 },
    { pr: 13, sha: "abc13", title: "Catalogue tidy", release: false, direct: false, author: "regular", firstContribution: false, reviewed: null, files: ["apps/catalogue/src/x.ts"], churn: 10, hotspotsTouched: [], deductions: [], points: 0 }
  ]
} as unknown as Changes;

/** `<out>/<stamp>-release-command/` with gate.json, confidence.json, changes.json, and the release run beside it with its captures. */
function releaseDir(o: { verdict?: "pass" | "fail"; hollow?: boolean; changes?: boolean; rehearsals?: boolean } = {}): string {
  const out = tmp("out");
  const run = join(out, "2026-09-27T10-00-00-release");
  const dir = join(out, "2026-09-27T10-00-00-release-command");
  for (const d of [join(run, "a"), join(run, "b"), dir]) mkdirSync(d, { recursive: true });
  const verdict = o.verdict ?? "fail";
  writeFileSync(join(run, "report.json"), JSON.stringify(releaseReport({ verdict, ...(o.hollow ? { hollow: true } : {}) })));
  writeFileSync(join(run, "a", "capture.json"), JSON.stringify(capture));
  writeFileSync(join(run, "b", "capture.json"), JSON.stringify(capture));
  const code = verdict === "fail" ? 1 : 0;
  writeFileSync(join(dir, "gate.json"), JSON.stringify({ production: "16.2.2", candidate: "16.3.0-rc.1", code, steps: [{ id: "release", title: "release", code, runDir: run, verdict }] }));
  writeFileSync(join(dir, "status.json"), JSON.stringify(verdict === "fail" ? { fast: false, stopped: { stage: "release", why: "the gate FAILED: 1 unclaimed difference", next: "…" } } : { fast: false }));
  const rehearsal = (mode: string) => {
    const d = join(out, `2026-09-27T10-00-00-${mode}`);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, "report.json"), JSON.stringify({ schemaVersion: 1, mode, ranAt: "2026-09-27T10:00:00Z", verdict: "pass", reasons: [], compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [], broadUnapproved: [] }, masksApplied: {} }));
    return d;
  };
  scoreAndWrite({ outDir: dir, gate: verdict === "fail" ? "FAIL" : "PASS", release: run, ...(o.rehearsals === false ? {} : { migration: rehearsal("migration"), upgrade: rehearsal("upgrade") }), candidate: "16.3.0-rc.1", baseline: "16.2.2" });
  if (o.changes !== false) writeFileSync(join(dir, "changes.json"), JSON.stringify(changes));
  return dir;
}

/** A filled 5 Whys, from a real stub: the answers, the end of the chain and the countermeasure. */
function filled(o: { answers?: string[]; end?: string; endsIn?: string; kind?: string; what?: string; mutant?: string; owner?: string; due?: string; verifiedBy?: string } = {}): string {
  const dir = releaseDir();
  const c = loadContext(dir, { now: NOW });
  let text = renderStub(c, resolveFinding(c, unclaimed.id), { now: NOW, outDir: join(dir, "kaizen") }).text;
  const answers = o.answers ?? ["The course list PR changed the card markup and its claim was written for a route that no longer exists (reader:courses/**).", "claims/README.md shows page-key scopes only by example, not how a route maps to a page key.", "The claim guidance has no step that checks a claim's scope against the pages the journeys reach."];
  answers.forEach((a, i) => {
    text = text.replace(new RegExp(`(## Why ${i + 2}\\n\\n)<!--[^]*?-->`), `$1${a}`);
  });
  const set = (field: string, value: string | undefined) => {
    if (value === undefined) return;
    text = text.replace(new RegExp(`(- \\*\\*${field}:\\*\\*) ?.*`), `$1 ${value}`);
  };
  set("Chain ends at", o.end ?? "Why 4");
  set("Ends in", o.endsIn ?? "process");
  set("Kind", o.kind ?? "claim guidance");
  set("Countermeasure", o.what ?? "claims/README.md gains a check that a claim's scope matches a page a journey reaches (harness claims lint).");
  set("Mutant", o.mutant ?? "");
  set("Owner", o.owner ?? "the release captain rota");
  set("Due", o.due ?? "2026-10-15");
  set("Verified by", o.verifiedBy ?? "");
  return text;
}

// ---- the stub -----------------------------------------------------------------------------------------------

describe("the stub: Why 1 is the harness's own trace", () => {
  it("a hunk: the finding, artefact, journeys, the hunk's link, the nearest claim and why it did not cover, the PR with files and churn, a first contribution as a fact, the glance", () => {
    const dir = releaseDir();
    const w = openWhy({ run: dir, finding: unclaimed.id, out: join(dir, "kaizen"), now: NOW, harness: "1.13.0" });
    expect(w).toMatchObject({ written: true, trigger: "gate", finding: unclaimed.id });
    expect(w.file).toBe(join(dir, "kaizen", "2026-09-27-16-3-0-rc-1-dom-reader-course-1.md"));
    const text = readFileSync(w.file, "utf8");
    expect(text).toContain("# 5 Whys: 16.3.0-rc.1, dom reader:course");
    expect(text).toContain("- **Trigger:** Gate FAIL");
    expect(text).toContain("- **Release:** 16.3.0-rc.1 (beside 16.2.2)");
    expect(text).toContain("## Why 1: Why did dom `reader:course` differ with no claim covering it?");
    expect(text).toContain("- **Finding:** the course card lost its image (fail, unclaimed; release mode, verdict FAIL)");
    expect(text).toContain("- **Artefact:** dom, scope `reader:course`");
    expect(text).toContain("- **Journey:** anonymous-student-reads-course (1 of 2)");
    expect(text).toContain(`- **Hunk:** [${unclaimed.id}](../../2026-09-27T10-00-00-release/report.html#hunk-${unclaimed.id})`);
    expect(text).toContain("- **Nearest claim:** `dom reader:courses/**`: PR #12 new course list; why it did not cover: its scope `reader:courses/**` matches neither the hunk's scope `reader:course` (the claim matched nothing in this run: stale)");
    expect(text).toContain("[PR #12](https://github.com/tutors-sdk/tutors-mono-repo/pull/12) \"New course list\": 2 files (`apps/reader/src/lib/CourseCard.svelte`, `apps/reader/src/routes/+page.svelte`), churn 120 lines; first contribution: yes (a fact, not a cause)");
    expect(text).toContain("- **Glance:** not one of the");
    // the author is a fact field for trends, never in a 5 Whys
    expect(text).not.toContain("newcomer");
    // Whys 2-5 blank, the countermeasure constrained, owner, due, verified by
    const f = parseWhy(text);
    expect(f.whys.map((x) => [x.n, x.answer === ""])).toEqual([[1, false], [2, true], [3, true], [4, true], [5, true]]);
    for (const k of COUNTERMEASURE_KINDS) expect(text).toContain(k);
    for (const field of ["Chain ends at", "Ends in", "Kind", "Countermeasure", "Mutant", "Owner", "Due", "Verified by"]) expect(f.fields, field).toHaveProperty([field], "");
    // a stub is not a filled 5 Whys: the check says what is missing
    expect(checkWhy(f).map((p) => p.at)).toEqual(["Chain ends at", "Why 2", "Why 3", "Why 4", "Why 5", "Ends in", "Kind", "Countermeasure", "Owner", "Due"]);
  });

  it("the covering claim when the hunk was claimed, and the PR its reason names", () => {
    const r = releaseReport({ verdict: "fail" });
    expect(nearestClaim(claimed, r)).toMatchObject({ claim: topicClaim, covers: true });
    expect(nearestClaim(unclaimed, { ...r, compare: { ...r.compare, matches: [], staleClaims: [{ artefact: "timing", scope: "reader:course", reason: "x" }] } })!.why).toBe("its artefact is timing and the hunk's is dom (the claim matched nothing in this run: stale)");
    expect(nearestClaim(unclaimed, { ...r, compare: { ...r.compare, matches: [], staleClaims: [] } })).toBeUndefined();
  });

  it("without changes.json the PR is not measured, never guessed", () => {
    const dir = releaseDir({ changes: false });
    const c = loadContext(dir, { now: NOW });
    expect(renderStub(c, resolveFinding(c, unclaimed.id), { now: NOW, outDir: dir }).text).toContain("- **PR:** not measured: no changes.json");
  });

  it("an existing stub is left as it is: someone may be filling it in", () => {
    const dir = releaseDir();
    const first = openWhy({ run: dir, finding: "gate", out: join(dir, "kaizen"), now: NOW });
    writeFileSync(first.file, "# 5 Whys: being filled\n");
    const again = openWhy({ run: dir, finding: "gate", out: join(dir, "kaizen"), now: NOW });
    expect(again).toMatchObject({ file: first.file, written: false });
    expect(readFileSync(first.file, "utf8")).toBe("# 5 Whys: being filled\n");
  });

  it("a trigger that did not fire, or an id the run does not have, is refused with the ids it has", () => {
    const pass = releaseDir({ verdict: "pass" });
    const c = loadContext(pass, { now: NOW });
    expect(() => resolveFinding(c, "gate")).toThrow(/the Gate of .* is PASS/);
    expect(() => resolveFinding(c, "band")).toThrow(/not Red/);
    expect(() => resolveFinding(c, "rollback")).toThrow(/not a post-deploy run/);
    expect(() => resolveFinding(c, "three-declines:rcs")).toThrow(/no such run rule firing/);
    expect(() => resolveFinding(c, "nope")).toThrow(WhyInputError);
    expect(findingIds(loadContext(releaseDir(), { now: NOW }))).toEqual(["gate", unclaimed.id]);
    expect(stubName({ now: NOW, finding: "Broad-claim:* **" })).toBe("2026-09-27-untagged-broad-claim.md");
  });
});

describe("each trigger opens a stub", () => {
  it("gate: the Gate FAIL, where the line stopped, each unclaimed hunk with its --finding", () => {
    const dir = releaseDir();
    const text = readFileSync(openWhy({ run: dir, finding: "gate", out: join(dir, "kaizen"), now: NOW }).file, "utf8");
    expect(text).toContain("## Why 1: Why did the Gate FAIL on 16.3.0-rc.1?");
    expect(text).toContain("- **Line stopped at:** release: the gate FAILED: 1 unclaimed difference");
    expect(text).toContain(`\`--finding ${unclaimed.id}\``);
  });

  it("band: a Red release, its floors and where the most points went", () => {
    const dir = releaseDir({ verdict: "pass", hollow: true });
    const c = loadContext(dir, { now: NOW });
    expect(c.confidence!.band).toBe("Red");
    expect(automaticFindings(c).map((f) => f.type)).toEqual(["band"]);
    const w = openWhy({ run: dir, finding: "band", out: join(dir, "kaizen"), now: NOW });
    const text = readFileSync(w.file, "utf8");
    expect(w.trigger).toBe("band");
    expect(text).toContain("## Why 1: Why was 16.3.0-rc.1 Red (RCS 74)?");
    expect(text).toMatch(/- \*\*Floors breached:\*\* Claim coverage/);
    expect(text).toContain("[evidence](../");
    // Evidence that is a sentence ("no migration run directory") is words, never a link to a path that does not exist.
    expect(text).not.toMatch(/\]\([^)]*\s[^)]*\)/);
  });

  it("band: evidence that is a sentence (a skipped rehearsal) is words, not a link to a path that does not exist", () => {
    const dir = releaseDir({ verdict: "pass", rehearsals: false });
    const text = readFileSync(openWhy({ run: dir, finding: "band", out: join(dir, "kaizen"), now: NOW }).file, "utf8");
    expect(text).toContain("evidence: no migration run directory");
    expect(text).not.toMatch(/\]\([^)]*\s[^)]*\)/);
  });

  it("rollback: a post-deploy FAIL, tagged with what was deployed", () => {
    const run = join(tmp("pd"), "2026-09-27T12-00-00-post-deploy");
    mkdirSync(run, { recursive: true });
    writeFileSync(join(run, "report.json"), JSON.stringify(releaseReport({ verdict: "fail", mode: "post-deploy" })));
    const out = tmp("kz");
    const w = openWhy({ run, finding: "rollback", out, now: NOW });
    expect(w).toMatchObject({ trigger: "rollback" });
    expect(w.file).toBe(join(out, "2026-09-27-16-3-0-rollback.md"));
    const text = readFileSync(w.file, "utf8");
    expect(text).toContain("- **Trigger:** rollback");
    expect(text).toContain("## Why 1: Why did production differ from the tested release 16.3.0?");
    expect(text).toContain("- **Deployment:** match");
    // a hunk in a post-deploy run is a rollback's finding too
    expect(openWhy({ run, finding: unclaimed.id, out, now: NOW }).trigger).toBe("rollback");
    expect(() => openWhy({ run, finding: "gate", out, now: NOW })).toThrow(/a post-deploy run, not a release run: its trigger is rollback/);
  });

  it("a run rule on the scoreboard: the firing, its window, and this release's deductions in that dimension", () => {
    const dir = releaseDir({ verdict: "pass", hollow: true });
    const file = join(tmp("sb"), "releases.jsonl");
    writeFileSync(file, [95, 90, 85, 80].map((rcs, i) => JSON.stringify(line(`16.${i}.0`, { rcs }))).join("\n") + "\n");
    const w = openWhy({ run: dir, finding: "three-declines:rcs", out: join(dir, "kaizen"), scoreboard: file, now: NOW });
    const text = readFileSync(w.file, "utf8");
    expect(w.trigger).toBe("run-rule");
    expect(text).toContain("- **Trigger:** run rule");
    expect(text).toContain("## Why 1: Why did RCS decline three releases running?");
    expect(text).toContain("- **Window:** 16.0.0 95 → 16.1.0 90 → 16.2.0 85 → 16.3.0 80");
  });

  it("an escalated glance mark opens one beside the release, by itself", () => {
    const dir = releaseDir({ verdict: "pass", hollow: true });
    const c = loadContext(dir, { now: NOW });
    expect(c.confidence!.glance[0]!.kind).toBe("broad-claim");
    const log: string[] = [];
    expect(glanceCommand("mark", { run: dir, item: "1", mark: "escalated", by: "ana", note: "cannot tell what the broad claim hides", scoreboard: join(dir, "none.jsonl") }, { now: () => NOW, log: (m) => log.push(m) })).toBe(0);
    const stubs = readdirSync(join(dir, "kaizen"));
    expect(stubs).toEqual(["2026-09-27-16-3-0-rc-1-broad-claim.md"]);
    const text = readFileSync(join(dir, "kaizen", stubs[0]!), "utf8");
    expect(text).toContain("- **Trigger:** escalated glance mark");
    expect(text).toContain("## Why 1: Why could the artefacts not show whether this is right: broad claim * ** (approvedBy sam)");
    expect(text).toContain('reviewer\'s mark: escalated by ana ("cannot tell what the broad claim hides")');
    expect(log.some((l) => l.startsWith("5 Whys opened (escalated glance mark): "))).toBe(true);
    // verified and disputed open nothing
    const other = releaseDir({ verdict: "pass", hollow: true });
    glanceCommand("mark", { run: other, item: "1", mark: "verified", by: "ana" }, { now: () => NOW, log: () => {} });
    expect(existsSync(join(other, "kaizen"))).toBe(false);
  });
});

// ---- harness why check --------------------------------------------------------------------------------------

describe("harness why check: kaizen, not blame", () => {
  it("accepts a filled 5 Whys whose chain ends early in a process", () => {
    expect(checkWhy(parseWhy(filled()))).toEqual([]);
  });

  it("rejects an answer that is only human error, carelessness or a person, with the Lean reason", () => {
    for (const bad of ["Human error.", "carelessness", "It was a mistake by the reviewer.", "The developer forgot.", "someone was careless"]) {
      const p = checkWhy(parseWhy(filled({ answers: ["The claim did not cover the route.", bad, "The SOP has no step for it."] })));
      expect(p, bad).toEqual([{ at: "Why 3", why: REASONS.blame }]);
    }
    for (const bad of ["Ana forgot", "Leigh Griffin", "@octocat", "because of Sam"]) expect(blameIn(bad), bad).toBe(REASONS.person);
    // blame with a cause beside it is an answer: the rest of it can be checked
    for (const ok of ["Human error: the SOP has no step that checks the claim's scope against a journey.", "The reviewer's glance did not rank broad claims above timing.", "Flaky timing on CI runners"]) expect(blameIn(ok), ok).toBeUndefined();
    expect(REASONS.blame).toContain("prompt for the next why");
  });

  it("rejects each other bad pattern with its reason", () => {
    const at = (o: Parameters<typeof filled>[0]) => checkWhy(parseWhy(filled(o))).map((p) => p.at);
    expect(at({ answers: ["", "b", "c"] })).toEqual(["Why 2"]);
    // answers after where the chain ends may stay blank; before it they may not
    expect(at({ end: "Why 5" })).toEqual(["Why 5"]);
    // no end said: every why is then expected
    expect(at({ end: "" })).toEqual(["Chain ends at", "Why 5"]);
    expect(at({ endsIn: "a person" })).toEqual(["Ends in"]);
    expect(at({ kind: "be more careful" })).toEqual(["Kind"]);
    expect(at({ kind: "mutant, journey" })).toEqual(["Kind"]);
    expect(at({ what: "Everyone should be more careful." })).toEqual([]);
    expect(at({ what: "carelessness" })).toEqual(["Countermeasure"]);
    expect(at({ kind: "mutant" })).toEqual(["Mutant"]);
    expect(at({ kind: "mutant", mutant: "../mutants/x.yaml" })).toEqual(["Mutant"]);
    expect(at({ kind: "mutant", mutant: "mutants/mutants.yaml#course-card-image" })).toEqual([]);
    expect(at({ owner: "" })).toEqual(["Owner"]);
    expect(at({ due: "" })).toEqual(["Due"]);
    expect(at({ due: "2026-02-30" })).toEqual(["Due"]);
    expect(at({ verifiedBy: "yes" })).toEqual(["Verified by"]);
    expect(at({ verifiedBy: "16.4.0" })).toEqual([]);
    expect(checkWhy(parseWhy(filled({ kind: "mutant" })))[0]!.why).toBe(REASONS.mutant);
    expect(checkWhy(parseWhy(filled({ kind: "vibes" })))[0]!.why).toContain(COUNTERMEASURE_KINDS.join(" · "));
  });

  it("the command: exit 0 for a filled file, 1 for one that is not ready, README.md never checked; 2 for no files", () => {
    const dir = tmp("check");
    writeFileSync(join(dir, "good.md"), filled());
    writeFileSync(join(dir, "README.md"), "# not a 5 Whys\n");
    const log: string[] = [];
    expect(whyCommand("check", [dir], {}, { log: (m) => log.push(m) })).toBe(0);
    expect(log.join("\n")).toContain("1 5 Whys ready for the register");
    writeFileSync(join(dir, "bad.md"), filled({ answers: ["x", "human error", "y"] }));
    log.length = 0;
    expect(whyCommand("check", [dir], {}, { log: (m) => log.push(m) })).toBe(1);
    expect(log.join("\n")).toContain(`Why 3: ${REASONS.blame}`);
    expect(checkFiles([join(dir, "good.md")])).toEqual([{ file: join(dir, "good.md"), problems: [] }]);
    expect(() => whyCommand("check", [], {})).toThrow(UsageError);
    expect(() => whyCommand("check", [join(dir, "missing.md")], {})).toThrow(UsageError);
  });
});

// ---- the register -------------------------------------------------------------------------------------------

describe("the register: kaizen/README.md regenerated from the files", () => {
  it("one row per 5 Whys, the mutant linked; --write keeps the hand-written header; without it, exit 1 when out of date", () => {
    const dir = tmp("register");
    writeFileSync(join(dir, "README.md"), `# Kaizen register\n\nHand-written header.\n\n${REGISTER_START}\nold rows\n${REGISTER_END}\n\nFooter.\n`);
    writeFileSync(join(dir, "2026-09-27-16-3-0-rc-1-gate.md"), filled({ kind: "mutant", mutant: "mutants/mutants.yaml#course-card-image", due: "2026-09-01" }));
    writeFileSync(join(dir, "2026-09-28-16-3-0-rc-2-band.md"), filled({ verifiedBy: "16.4.0" }));
    expect(whyCommand("register", [], { dir }, { log: () => {} })).toBe(1);
    const log: string[] = [];
    expect(whyCommand("register", [], { dir, write: true }, { now: () => NOW, log: (m) => log.push(m) })).toBe(0);
    const readme = readFileSync(join(dir, "README.md"), "utf8");
    expect(readme.startsWith("# Kaizen register\n\nHand-written header.\n\n")).toBe(true);
    expect(readme.endsWith("\n\nFooter.\n")).toBe(true);
    expect(readme).not.toContain("old rows");
    expect(readme).toContain("| Gate FAIL | 16.3.0-rc.1 | mutant: [mutants/mutants.yaml#course-card-image](../mutants/mutants.yaml#course-card-image): ");
    expect(readme).toContain("| the release captain rota | 2026-10-15 | closed in 16.4.0 |");
    expect(readme).toContain("2 5 Whys: 1 open, 1 closed.");
    expect(log.join("\n")).toContain("2 5 Whys: 1 open, 1 overdue, 1 closed");
    expect(whyCommand("register", [], { dir }, { log: () => {} })).toBe(0);
    expect(registerSummary(readRegister(dir), NOW)).toEqual({ total: 2, open: 1, closed: 1, overdue: 1, unassigned: 0 });
    expect(registerLine(dir, NOW)).toContain("register: 1 open countermeasure(s), 1 overdue, 1 closed");
    // the same files give the same bytes: nothing in it depends on today
    expect(registerOf(dir, false).inSync).toBe(true);
  });

  it("a directory with no README.md gets the default header; a stub not yet filled is listed as open, with what is left", () => {
    const dir = tmp("fresh");
    const w = openWhy({ run: releaseDir(), finding: "gate", out: dir, now: NOW });
    registerOf(dir, true);
    const readme = readFileSync(join(dir, "README.md"), "utf8");
    expect(readme.startsWith(DEFAULT_HEADER)).toBe(true);
    expect(readme).toContain(`](${w.file.split("/").pop()}) | Gate FAIL | 16.3.0-rc.1 | — | — | — | open (10 to fill: \`harness why check\`) |`);
  });

  it("the repository's register is what CI holds it to: every 5 Whys filled, README.md regenerated from them", () => {
    const dir = join(ROOT, "kaizen");
    expect(checkFiles([dir]).filter((r) => r.problems.length)).toEqual([]);
    expect(registerOf(dir, false).inSync).toBe(true);
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("pnpm harness why check kaizen");
    expect(ci).toContain("pnpm harness why register --dir kaizen");
  });
});

// ---- closing the loop: open countermeasures on the scoreboard ------------------------------------------------

function line(tag: string, o: { rcs?: number; open?: number } = {}): ScoreboardLine {
  return {
    schemaVersion: 1,
    tag,
    run: 1,
    date: "2026-09-01T00:00:00Z",
    appendedAt: "2026-09-01T00:00:00Z",
    gate: "PASS",
    rcs: o.rcs ?? 95,
    band: "Green",
    weightsVersion: null,
    dimensions: DIMENSION_IDS.map((id) => ({ id, status: "measured", score: 95, floorBreached: false })),
    masks: 1,
    masksNeverFired: [],
    claims: 0,
    staleClaims: 0,
    journeys: null,
    mutants: null,
    prs: null,
    ...(o.open !== undefined ? { openCountermeasures: o.open } : {})
  };
}

describe("open countermeasures only rising: the register's own run rule", () => {
  it("reads each release's openCountermeasures off the scoreboard; not measured until a line records one", () => {
    expect(trends({ lines: [line("1"), line("2")], now: NOW }).runRules.countermeasures).toEqual({ status: "not measured", reason: NO_COUNTERMEASURES });
    expect(openCounts([line("1"), line("2", { open: 3 })])).toEqual([3]);
    const rising = trends({ lines: [1, 2, 3, 4].map((n) => line(`16.${n}.0`, { open: n })), now: NOW }).runRules.countermeasures;
    expect(rising).toEqual({ status: "measured", rising: true, counts: [1, 2, 3, 4] });
    expect(trends({ lines: [1, 2, 2, 4].map((n, i) => line(`16.${i}.0`, { open: n })), now: NOW }).runRules.countermeasures).toMatchObject({ rising: false });
  });

  it("scoreboard append records the register's open count on the line, and the schema takes it", () => {
    const dir = releaseDir({ verdict: "pass" });
    const kaizen = tmp("kz");
    writeFileSync(join(kaizen, "a.md"), filled());
    writeFileSync(join(kaizen, "b.md"), filled({ verifiedBy: "16.4.0" }));
    const home = tmp("home");
    expect(scoreboardCommand("append", { run: dir }, { home, kaizen, now: () => NOW, log: () => {} })).toBe(0);
    const appended = JSON.parse(readFileSync(join(home, "scoreboard", "releases.jsonl"), "utf8").trim()) as ScoreboardLine;
    expect(appended.openCountermeasures).toBe(1);
    const schema = JSON.parse(readFileSync(join(ROOT, "docs/contract/scoreboard-line.schema.json"), "utf8"));
    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addFormat("date-time", /./);
    expect(ajv.validate(schema, appended), JSON.stringify(ajv.errors)).toBe(true);
  });

  it("when it fires, it is a kaizen item: a stub listing what is open", () => {
    const dir = releaseDir({ verdict: "pass" });
    const kaizen = tmp("kz");
    writeFileSync(join(kaizen, "2026-09-01-16-0-0-gate.md"), filled());
    const file = join(tmp("sb"), "releases.jsonl");
    writeFileSync(file, [1, 2, 3, 4].map((n) => JSON.stringify(line(`16.${n}.0`, { open: n }))).join("\n") + "\n");
    const c = loadContext(dir, { now: NOW, scoreboard: file, register: kaizen });
    expect(automaticFindings(c).map((f) => f.type)).toEqual(["countermeasures-rising"]);
    expect(readTrends({ file, now: NOW }).runRules.countermeasures).toMatchObject({ rising: true });
    const w = openWhy({ run: dir, finding: "countermeasures-rising", out: kaizen, scoreboard: file, now: NOW });
    const text = readFileSync(w.file, "utf8");
    expect(w.trigger).toBe("run-rule");
    expect(text).toContain("## Why 1: Why do open countermeasures only rise?");
    expect(text).toContain("- **Open countermeasures per release:** 1 → 2 → 3 → 4 (the loop is not closing)");
    expect(text).toContain("](2026-09-01-16-0-0-gate.md): claim guidance, owner the release captain rota, due 2026-10-15");
  });
});

describe("the command", () => {
  it("usage: --run and --finding are needed; an unknown finding or a missing run is a usage error (exit 2), never a stub", () => {
    expect(() => whyCommand(undefined, [], {})).toThrow(UsageError);
    expect(() => whyCommand(undefined, [], { run: tmp("x") })).toThrow(/--finding/);
    expect(() => whyCommand(undefined, [], { run: tmp("x"), finding: "gate" })).toThrow(/no report\.json, gate\.json/);
    const dir = releaseDir();
    expect(() => whyCommand(undefined, [], { run: dir, finding: "band", out: join(dir, "kaizen") })).toThrow(/not Red/);
    expect(existsSync(join(dir, "kaizen"))).toBe(false);
    expect(() => whyCommand("bogus", [], {})).toThrow(/why check/);
    const log: string[] = [];
    expect(whyCommand(undefined, [], { run: dir, finding: "gate", out: join(dir, "kaizen"), tag: "16.3.0-rc.9" }, { now: () => NOW, log: (m) => log.push(m), home: tmp("h") })).toBe(0);
    expect(log[0]).toMatch(/^5 Whys opened \(gate\): .*2026-09-27-16-3-0-rc-9-gate\.md/);
  });

  it("post-deploy.yml puts the rollback stub in the issue, with no new permission", () => {
    const wf = readFileSync(join(ROOT, ".github/workflows/post-deploy.yml"), "utf8");
    expect(wf).toContain('pnpm harness why --run "$(dirname "$report")" --finding rollback');
    expect(wf).toMatch(/permissions:\n {2}contents: read\n {2}actions: read\n {2}issues: write\n/);
  });
});
