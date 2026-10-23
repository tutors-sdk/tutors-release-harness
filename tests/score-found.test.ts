/**
 * E1 (harness hardening plan, since 1.56.0): `harness release` finds the score's inputs a release already has when
 * they were not given: the monorepo's quality record (--test-signal) and the newest post-deploy run (--post-deploy).
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findScoreInputs } from "../src/local/release.ts";
import { qualityRecord, type QualityGit } from "../src/local/quality.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "harness-found-"));
const SHA = "c".repeat(40);
const OLDER = "b".repeat(40);
const RECORD = JSON.stringify({ schemaVersion: 1, commit: OLDER });

/** A monorepo checkout as git answers it: the tag, the quality branch (once fetched, if `fetched`), its files. */
function fakeGit(o: { tag?: boolean; branch?: "present" | "after-fetch" | "none"; kept?: string[] } = {}): QualityGit & { calls: string[][] } {
  let fetched = false;
  const calls: string[][] = [];
  const git = ((args: string[]) => {
    calls.push(args);
    const [cmd, ...rest] = args;
    if (cmd === "rev-parse") {
      const ref = rest.at(-1)!.replace("^{commit}", "");
      if (ref === "refs/tags/v17.1.0") return o.tag === false ? undefined : `${SHA}\n`;
      if (ref === "refs/remotes/origin/quality") return o.branch === "present" || (o.branch === "after-fetch" && fetched) ? "q\n" : undefined;
      return undefined;
    }
    if (cmd === "fetch") {
      fetched = true;
      return "";
    }
    if (cmd === "ls-tree") return (o.kept ?? [`${OLDER}.json`]).map((f) => `quality/${f}`).join("\n");
    if (cmd === "rev-list") return `${SHA}\n${OLDER}\n`;
    if (cmd === "show") return (o.kept ?? [`${OLDER}.json`]).some((f) => rest[0] === `refs/remotes/origin/quality:quality/${f}`) ? RECORD : undefined;
    return undefined;
  }) as QualityGit & { calls: string[][] };
  git.calls = calls;
  return git;
}

describe("qualityRecord: the candidate's quality/<sha>.json from the monorepo's quality branch", () => {
  it("the newest record at or before the candidate's commit, written as quality.json, saying which commit it is for", () => {
    const dir = tmp();
    const q = qualityRecord(fakeGit({ branch: "present" }), "17.1.0", dir);
    expect(q).toEqual({ file: join(dir, "quality.json"), note: `quality record for ${OLDER.slice(0, 12)}, the newest before v17.1.0` });
    expect(readFileSync(join(dir, "quality.json"), "utf8")).toBe(RECORD);
  });

  it("the candidate's own record when there is one", () => {
    const q = qualityRecord(fakeGit({ branch: "present", kept: [`${SHA}.json`, `${OLDER}.json`] }), "17.1.0", tmp());
    expect("note" in q && q.note).toBe(`quality record for ${SHA.slice(0, 12)}, the candidate's commit`);
  });

  it("fetches the branch once when the checkout lacks it", () => {
    const git = fakeGit({ branch: "after-fetch" });
    expect("file" in qualityRecord(git, "17.1.0", tmp())).toBe(true);
    expect(git.calls.filter((c) => c[0] === "fetch")).toEqual([["fetch", "--quiet", "origin", "quality:refs/remotes/origin/quality"]]);
  });

  it("each way of finding nothing is a reason, never a file", () => {
    expect(qualityRecord(fakeGit({ tag: false, branch: "present" }), "17.1.0", tmp())).toEqual({ reason: "the monorepo checkout has no tag v17.1.0" });
    expect(qualityRecord(fakeGit({ branch: "none" }), "17.1.0", tmp())).toEqual({ reason: "the monorepo has no quality branch (or it could not be fetched)" });
    expect(qualityRecord(fakeGit({ branch: "present", kept: ["d".repeat(40) + ".json"] }), "17.1.0", tmp())).toEqual({ reason: `no quality record for ${SHA.slice(0, 12)} or the 60 commits before it` });
  });
});

describe("findScoreInputs: what the score stage reads when nothing was given", () => {
  it("the quality record and the newest post-deploy run with a report, each named in a note", () => {
    const out = tmp();
    for (const [name, report] of [["2026-10-20T01-00-00Z-post-deploy", true], ["2026-10-22T01-00-00Z-post-deploy", true], ["2026-10-23T01-00-00Z-post-deploy", false]] as const) {
      mkdirSync(join(out, name), { recursive: true });
      if (report) writeFileSync(join(out, name, "report.json"), "{}");
    }
    const dir = join(out, "2026-10-23T02-00-00Z-release-command");
    mkdirSync(dir);
    const f = findScoreInputs({ candidate: "17.1.0", monorepo: "/m", outRoot: out }, dir, { qualityGit: fakeGit({ branch: "present" }) });
    expect(f.testSignal).toBe(join(dir, "quality.json"));
    expect(f.postDeploy).toBe(join(out, "2026-10-22T01-00-00Z-post-deploy"));
    expect(f.notes).toEqual([`test signal: quality record for ${OLDER.slice(0, 12)}, the newest before v17.1.0`, "post-deploy: ../2026-10-22T01-00-00Z-post-deploy"]);
  });

  it("a given --test-signal or --post-deploy is not looked for; no checkout is a note", () => {
    const out = tmp();
    expect(findScoreInputs({ candidate: "17.1.0", outRoot: out, score: { testSignal: "/t.json", postDeploy: "/p" } }, out, {})).toEqual({ notes: [] });
    expect(findScoreInputs({ candidate: "17.1.0", outRoot: out }, out, {}).notes).toEqual(["test signal: no monorepo checkout for its quality record", "post-deploy: no post-deploy run under the output root (harness local watch writes one)"]);
  });
});
