import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { liveProduction, productionResolve, rankReleaseTags, readerUrlOf, resolveLiveProduction, servesCommit, type LiveSources, type TagCommit } from "../src/ci/live-production.ts";
import { hashedBuildName } from "../src/modes/production-build.ts";
import { decide, type Sources } from "../src/ci/main-preview.ts";

// The commits of 3 November 2026: 17.0.0 (and its rc.1) on 432d468, 17.1.0-rc.1 on b146cca, the 17.1.0 release-prep merge.
const C17_0 = "432d46864626ce14e07eb7715e0408c643ca906a";
const C17_1 = "b146cca3900e27a2be21e99e873e731dfa6f9df8";
const MAIN_ONLY = "e53e434e0000000000000000000000000000abcd";
const TAGS: TagCommit[] = [
  { name: "v17.1.0-rc.1", sha: C17_1 },
  { name: "v17.0.0", sha: C17_0 },
  { name: "v17.0.0-rc.1", sha: C17_0 },
  { name: "v16.2.2", sha: "c76c0ff8f79090ecffa008d0546f3b9993dd92c7" },
  { name: "v7.0.0-apps", sha: "1111111111111111111111111111111111111111" }
];
const MAIN = [C17_1, MAIN_ONLY, C17_0];

describe("live production", () => {
  it("3 Nov 2026: Netlify served b146cca by build name only, the pin said 17.0.0: judge 17.1.0-rc.1 and warn", () => {
    expect(hashedBuildName(C17_1)).toBe("0a42da52a0e1e453");
    const r = resolveLiveProduction({ answers: { url: "https://tutors.dev", revision: "unknown", buildName: "0a42da52a0e1e453" }, pinned: "17.0.0", tags: TAGS, main: MAIN });
    expect(r.tag).toBe("17.1.0-rc.1");
    expect(r.source).toBe("live");
    expect(r.commit).toBe(C17_1);
    expect(r.drift).toContain("but the pin says 17.0.0");
    expect(r.drift).toContain("deploy:pin");
  });

  it("a final tag on the same commit as its rc wins, and a pin that agrees is no drift", () => {
    const r = resolveLiveProduction({ answers: { url: "u", revision: C17_0 }, pinned: "17.0.0", tags: TAGS, main: MAIN });
    expect(r).toMatchObject({ tag: "17.0.0", source: "live" });
    expect(r.drift).toBeUndefined();
  });

  it("a commit on main that no release tag names is judged by its sha- image", () => {
    const r = resolveLiveProduction({ answers: { url: "u", revision: MAIN_ONLY.slice(0, 12) }, pinned: "17.0.0", tags: TAGS, main: MAIN });
    expect(r.tag).toBe("sha-e53e434");
    expect(r.drift).toContain("but the pin says 17.0.0");
  });

  it("production that does not answer falls back to the pin, quietly", () => {
    const r = resolveLiveProduction({ answers: { url: "u" }, pinned: "17.0.0", tags: TAGS, main: MAIN });
    expect(r).toMatchObject({ tag: "17.0.0", source: "pin" });
    expect(r.drift).toBeUndefined();
    expect(r.how).toContain("did not answer");
  });

  it("production naming a commit that is none of ours falls back to the pin, with a warning", () => {
    const r = resolveLiveProduction({ answers: { url: "u", buildName: "ffffffffffffffff" }, pinned: "17.0.0", tags: TAGS, main: MAIN });
    expect(r).toMatchObject({ tag: "17.0.0", source: "pin" });
    expect(r.drift).toContain("no release tag or recent commit on main names");
  });

  it("no pin and nothing found: main, as the workflows' old default, with a warning", () => {
    const r = resolveLiveProduction({ pinned: "main", tags: TAGS, main: MAIN });
    expect(r.tag).toBe("main");
    expect(r.drift).toBeDefined();
  });

  it("a tag given by hand is used as given", () => {
    expect(resolveLiveProduction({ given: "16.2.2", answers: { url: "u", revision: C17_1 }, pinned: "17.0.0", tags: TAGS, main: MAIN })).toMatchObject({ tag: "16.2.2", source: "input" });
  });

  it("ranks release tags: finals before rcs, newer first, non-release tags dropped", () => {
    expect(rankReleaseTags(TAGS).map((t) => t.name)).toEqual(["17.1.0-rc.1", "17.0.0", "17.0.0-rc.1", "16.2.2"]);
    expect(rankReleaseTags([{ name: "v1.0.0-rc.1", sha: C17_0 }, { name: "v1.0.0-rc.2", sha: C17_0 }, { name: "v1.0.0", sha: C17_0 }]).map((t) => t.name)).toEqual(["1.0.0", "1.0.0-rc.2", "1.0.0-rc.1"]);
  });

  it("servesCommit reads a revision (full or abbreviated) or a hashed build name, never 'unknown' or a timestamp", () => {
    expect(servesCommit({ url: "u", revision: C17_1.slice(0, 7) }, C17_1)).toBe(true);
    expect(servesCommit({ url: "u", revision: "unknown", buildName: "1762160000000" }, C17_1)).toBe(false);
    expect(servesCommit({ url: "u", buildName: hashedBuildName(C17_0) }, C17_1)).toBe(false);
  });

  it("readerUrlOf takes reader= from the production list, or a bare URL", () => {
    expect(readerUrlOf("reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev")).toBe("https://tutors.dev");
    expect(readerUrlOf("https://example.org")).toBe("https://example.org");
    expect(readerUrlOf("catalogue=https://c")).toBeUndefined();
  });

  const sources = (o: Partial<LiveSources> = {}): LiveSources => ({
    ask: async (url) => ({ url, buildName: hashedBuildName(C17_1) }),
    tags: async () => TAGS,
    main: async () => MAIN,
    ...o
  });

  it("a source that throws counts as not answered", async () => {
    const r = await liveProduction({ pinned: "17.0.0" }, sources({ ask: async () => { throw new Error("offline"); } }));
    expect(r).toMatchObject({ tag: "17.0.0", source: "pin" });
  });

  it("production resolve writes tag, source, commit and drift for the workflow", async () => {
    const dir = mkdtempSync(join(tmpdir(), "live-"));
    const out = join(dir, "out");
    const summary = join(dir, "summary");
    const code = await productionResolve({ pinned: "17.0.0" }, sources(), { GITHUB_OUTPUT: out, GITHUB_STEP_SUMMARY: summary });
    expect(code).toBe(0);
    expect(readFileSync(out, "utf8")).toBe(`tag=17.1.0-rc.1\nsource=live\ncommit=${C17_1}\ndrift=true\n`);
    expect(readFileSync(summary, "utf8")).toContain("Production is not the pin");
  });

  it("Main to RC judges what production serves, not the overlay's stale pin", async () => {
    const src: Sources = {
      overlay: async () => 'images:\n  - name: reader\n    newTag: "17.0.0"\n',
      imageRuns: async () => [{ head_sha: C17_1, head_branch: "main", event: "push", status: "completed", conclusion: "success", html_url: "h", updated_at: "t" }],
      index: async () => undefined,
      tags: async () => TAGS.map((t) => t.name),
      live: (pinned) => liveProduction({ pinned }, sources())
    };
    const d = await decide(src, { harnessVersion: "test" });
    expect(d.production).toBe("17.1.0-rc.1");
    expect(d.drift).toContain("but the pin says 17.0.0");
    expect(d.stalePin).toBeUndefined();
  });

  it("Main to RC keeps the overlay when production cannot be matched", async () => {
    const src: Sources = {
      overlay: async () => 'images:\n  - name: reader\n    newTag: "17.0.0"\n',
      imageRuns: async () => [{ head_sha: C17_1, head_branch: "main", event: "push", status: "completed", conclusion: "success", html_url: "h", updated_at: "t" }],
      index: async () => undefined,
      live: (pinned) => liveProduction({ pinned }, sources({ ask: async (url) => ({ url }) }))
    };
    expect((await decide(src, { harnessVersion: "test" })).production).toBe("17.0.0");
  });
});
