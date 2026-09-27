import { createHash } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { builtAt, hashedBuildName, judgeProductionBuild, productionBuildReason, readProductionBuild } from "../src/modes/production-build.ts";
import { compareFromCaptures } from "../src/run.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { renderHtml, renderMarkdown } from "../src/report/index.ts";
import { mdCode } from "../src/report/deployment.ts";
import type { ProductionBuild, RunReport } from "../src/types.ts";
import { capture } from "./support/captures.ts";

const COMMIT = "1a2b3c4d5e6f708192a3b4c5d6e7f80912a3b4c5";
const OTHER = "ffeeddccbbaa99887766554433221100ffeeddcc";
const URL_ = "https://tutors.dev";
const hash16 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);

describe("judging which build production serves", () => {
  it("the hashed build name is sha256 of the commit, hex, first 16 characters (SvelteKit's version.name with GIT_SHA or COMMIT_REF)", () => {
    expect(hashedBuildName(COMMIT)).toBe(hash16(COMMIT));
    expect(hashedBuildName(COMMIT)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("match: /version names the recorded commit (in full, abbreviated, or in capitals)", () => {
    for (const revision of [COMMIT, COMMIT.slice(0, 7), COMMIT.toUpperCase()]) {
      const p = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, revision });
      expect(p.status, revision).toBe("match");
      expect(p.summary).toContain("/version names it");
    }
    expect(productionBuildReason(judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, revision: COMMIT }))).toBeUndefined();
  });

  it("match: the build name is the recorded commit's hash, even when /version did not answer", () => {
    const p = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, buildName: hash16(COMMIT) });
    expect(p).toMatchObject({ status: "match", buildName: hash16(COMMIT), recordedRevision: COMMIT });
    expect(p.summary).toContain("its build name is that commit's hash");
    expect(p.revision).toBeUndefined();
  });

  it("differs: production names another commit, or carries another commit's hash", () => {
    const byRevision = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, revision: OTHER });
    expect(byRevision.status).toBe("differs");
    expect(byRevision.summary).toContain(`/version names commit ${OTHER.slice(0, 12)}`);
    const byHash = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, buildName: hash16(OTHER) });
    expect(byHash.status).toBe("differs");
    expect(byHash.summary).toContain(`build name ${hash16(OTHER)}`);
    expect(productionBuildReason(byHash)).toMatch(/^PRODUCTION BUILD DIFFERS: production does not serve the recorded candidate's commit 1a2b3c4d5e6f: .*\. Informational: the verdict is unchanged\.$/);
    // an abbreviation must be of the commit, and at least 7 characters
    expect(judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, revision: COMMIT.slice(0, 6) }).status).toBe("differs");
  });

  it("unknown: no recorded commit, nothing answered, or only an unnamed build", () => {
    expect(judgeProductionBuild({ url: URL_, revision: OTHER, buildName: hash16(OTHER) }).status).toBe("unknown");
    const silent = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT });
    expect(silent.status).toBe("unknown");
    expect(silent.summary).toContain("/version did not answer; /_app/version.json did not answer");
    expect(productionBuildReason(silent)).toMatch(/^PRODUCTION BUILD NOT CONFIRMED: cannot tell whether production serves the recorded candidate's commit 1a2b3c4d5e6f/);
    const noRecord = judgeProductionBuild({ url: URL_, recordedRevision: "  " });
    expect(noRecord.recordedRevision).toBeUndefined();
    expect(noRecord.summary).toContain("(not recorded)");
  });

  it("a build name of digits is when the build was made, from an unnamed build", () => {
    const p = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, buildName: "1790000000000", revision: "unknown" });
    expect(p).toMatchObject({ status: "unknown", builtAt: "2026-09-21T14:13:20.000Z", revision: "unknown" });
    expect(p.summary).toContain("/version names no commit; built at 2026-09-21T14:13:20.000Z from an unnamed build");
    expect(builtAt("1790000000000")).toBe("2026-09-21T14:13:20.000Z");
    expect(builtAt("999999999999999")).toBeUndefined(); // not a build time: 13 digits cover 2001 to 2286
    expect(builtAt("abc")).toBeUndefined();
    expect(builtAt(undefined)).toBeUndefined();
    // 16 digits is a hash that happens to be all digits, not a time
    expect(builtAt("1234567890123456")).toBeUndefined();
  });

  it("a build name that is neither is quoted only when it is harmless", () => {
    expect(judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, buildName: "v16.3.0" }).summary).toContain("build name v16.3.0, which is neither a commit hash nor a build time");
    const hostile = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, buildName: "<img src=x onerror=alert(1)>", revision: "`|**x**" });
    expect(hostile.status).toBe("differs");
    expect(hostile.summary).not.toMatch(/[<>`|*]/);
    expect(hostile.summary).toContain("an unrecognised value");
  });
});

describe("asking production (a local server; no real network)", () => {
  let server: Server | undefined;
  afterEach(async () => {
    if (server) await new Promise<void>((done) => server!.close(() => done()));
    server = undefined;
  });
  const serve = async (handler: Parameters<typeof createServer>[1]) => {
    server = createServer(handler);
    await new Promise<void>((done) => server!.listen(0, "127.0.0.1", done));
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  };

  it("reads the build name and the revision from the reader, under its path, ignoring a trailing slash", async () => {
    const seen: string[] = [];
    const base = await serve((req, res) => {
      seen.push(req.url ?? "");
      if (req.url === "/reader/_app/version.json") res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ version: hash16(COMMIT) }));
      else if (req.url === "/reader/version") res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ revision: COMMIT, version: "16.3.0" }));
      else res.writeHead(404).end();
    });
    const p = await readProductionBuild(`${base}/reader/`, COMMIT);
    expect(seen.sort()).toEqual(["/reader/_app/version.json", "/reader/version"]);
    expect(p).toMatchObject({ url: `${base}/reader`, status: "match", buildName: hash16(COMMIT), revision: COMMIT });
  });

  it("a 404, a body that is not JSON, or a field of the wrong type is 'not answered'", async () => {
    const base = await serve((req, res) => {
      if (req.url === "/_app/version.json") res.writeHead(200).end("<html>not json</html>");
      else if (req.url === "/version") res.writeHead(200).end(JSON.stringify({ revision: { nested: true } }));
      else res.writeHead(404).end();
    });
    const p = await readProductionBuild(base, undefined);
    expect(p).toEqual({ url: base, status: "unknown", summary: "cannot tell whether production serves the recorded candidate's commit (not recorded): /version did not answer; /_app/version.json did not answer" });
    const md = renderMarkdown({ ...minimal, productionBuild: p });
    expect(md).toContain("| `/_app/version.json` build name | not answered |");
    expect(md).toContain("| `/version` revision | not answered |");
    expect(renderHtml({ ...minimal, productionBuild: p })).toContain("<em>not answered</em>");
  });

  it("a numeric build name is read as the build time", async () => {
    const base = await serve((req, res) => {
      if (req.url === "/_app/version.json") res.writeHead(200).end(JSON.stringify({ version: 1790000000000 }));
      else res.writeHead(404).end();
    });
    expect(await readProductionBuild(base, COMMIT)).toMatchObject({ status: "unknown", buildName: "1790000000000", builtAt: "2026-09-21T14:13:20.000Z" });
  });

  it("a server that never answers, or nothing listening, is 'not answered' and never throws", async () => {
    const base = await serve(() => {
      /* hold the request open */
    });
    const started = Date.now();
    const slow = await readProductionBuild(base, COMMIT, { timeoutMs: 200 });
    expect(Date.now() - started).toBeLessThan(3000);
    expect(slow).toMatchObject({ status: "unknown" });
    expect(slow.buildName).toBeUndefined();
    expect(slow.revision).toBeUndefined();
    server!.closeAllConnections();
    await new Promise<void>((done) => server!.close(() => done()));
    server = undefined;
    const gone = await readProductionBuild(base, COMMIT, { timeoutMs: 1000 });
    expect(gone.summary).toContain("/version did not answer; /_app/version.json did not answer");
  });
});

const minimal: RunReport = {
  schemaVersion: 1,
  harness: { version: "1.0.0", gitSha: null, contractVersion: "1.6.0" },
  harnessVersion: "1.0.0",
  mode: "post-deploy",
  substrate: "compose",
  ranAt: "2026-09-16T09:10:00.000Z",
  now: "2026-09-16T09:05:00.000Z",
  runs: 1,
  sides: { a: { reader: "tutors/reader:rc", catalogue: "tutors/catalogue:rc", live: "tutors/live:rc" }, b: { reader: "external:https://tutors.dev", catalogue: "external:https://c", live: "external:https://l" } },
  verdict: "pass",
  reasons: [],
  compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [], broadUnapproved: [] },
  masksApplied: {}
};

describe("the report", () => {
  it("renders a Production build section in report.md and report.html", () => {
    const p = judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, buildName: "1790000000000", revision: "unknown" });
    const md = renderMarkdown({ ...minimal, productionBuild: p });
    expect(md).toContain("### Production build: unknown");
    expect(md).toContain("| `/_app/version.json` build name | `1790000000000` (built at 2026-09-21T14:13:20.000Z from an unnamed build) |");
    expect(md).toContain(`recorded candidate's commit is \`${COMMIT}\``);
    const html = renderHtml({ ...minimal, productionBuild: p });
    expect(html).toContain("<h2>Production build: unknown</h2>");
    expect(html).toContain("built at 2026-09-21T14:13:20.000Z from an unnamed build");
    expect(renderMarkdown(minimal)).not.toContain("Production build");
    expect(renderHtml(minimal)).not.toContain("Production build");
  });

  it("escapes what production answered: HTML is escaped, Markdown stays inside its code span and table cell", () => {
    const hostile: ProductionBuild = { url: "https://tutors.dev/<b>", status: "differs", recordedRevision: COMMIT, buildName: "<script>alert(1)</script>", revision: "a`b|c\n## heading", summary: "s" };
    const html = renderHtml({ ...minimal, productionBuild: hostile });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("https://tutors.dev/&lt;b&gt;");
    const md = renderMarkdown({ ...minimal, productionBuild: hostile });
    expect(md).toContain("| `/version` revision | ``a`b\\|c ## heading`` |");
    expect(md).not.toMatch(/^## heading/m);
    expect(mdCode("`x`")).toBe("`` `x` ``");
    expect(mdCode("plain")).toBe("`plain`");
  });

  it("post-deploy: the reading lands in report.json and reasons, and never changes the verdict or adds a hunk", () => {
    const run = (productionBuild?: ProductionBuild) => {
      const dir = mkdtempSync(join(tmpdir(), "harness-production-build-"));
      const outcome = compareFromCaptures({ mode: "post-deploy", substrate: "compose", captureDir: dir, a: capture("a"), b: capture("b"), claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, ...(productionBuild ? { productionBuild } : {}) });
      return { outcome, written: JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport };
    };
    const without = run();
    expect(without.written.productionBuild).toBeUndefined();
    for (const [p, line] of [
      [judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, revision: OTHER }), /^PRODUCTION BUILD DIFFERS/],
      [judgeProductionBuild({ url: URL_, recordedRevision: COMMIT }), /^PRODUCTION BUILD NOT CONFIRMED/],
      [judgeProductionBuild({ url: URL_, recordedRevision: COMMIT, revision: COMMIT }), undefined]
    ] as const) {
      const { outcome, written } = run(p);
      expect(written.productionBuild).toEqual(p);
      expect(outcome.report.verdict).toBe(without.outcome.report.verdict);
      expect(outcome.report.compare).toEqual(without.outcome.report.compare);
      const extra = outcome.report.reasons.filter((r) => !without.outcome.report.reasons.includes(r));
      if (line) {
        expect(extra).toHaveLength(1);
        expect(extra[0]).toMatch(line);
      } else expect(extra).toEqual([]);
    }
  });
});
