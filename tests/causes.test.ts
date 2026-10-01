/**
 * Causes, not hunks (since 1.20.0): src/report/causes.ts folds the unclaimed differences by kind across apps, pages and
 * packages. The folding is pinned on the shapes the engines write, and the report writer adds it after the verdict.
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CAUSE_LISTED, causeKey, causesHtml, causesMarkdown, foldCauses, kindOf } from "../src/report/causes.ts";
import { writeReports } from "../src/report/index.ts";
import type { Hunk, RunReport } from "../src/types.ts";

let n = 0;
const hunk = (artefact: Hunk["artefact"], scope: string, summary: string, path?: string): Hunk => ({ id: `${artefact}:${scope}:${++n}`, artefact, scope, summary, severity: "fail", ...(path ? { path } : {}) });
const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** The kinds of the 29 September forecast, one or two of each. */
const forecast = (): Hunk[] => [
  ...["reader", "catalogue", "live", "time"].flatMap((app) => ["@isaacs/cliui", "minipass"].map((p) => hunk("sbom", `${app}/${p}`, `${app}: package removed: ${p}@8.0.2`))),
  hunk("sbom", "reader/node", "reader: package bumped: node 22.1.0 → 22.2.0"),
  hunk("dom", "reader:home", "reader:home: semantic DOM differs (+51 −25 lines at line 4)", "/"),
  hunk("dom", "reader:home", "reader:home: semantic DOM differs (+6 −7 lines at line 36)", "/"),
  hunk("dom", "reader:course", "reader:course: semantic DOM differs (+32 −33 lines at line 4)", "/course/x"),
  hunk("screenshot", "reader:home", "reader:home: 6.79% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%)", "/"),
  hunk("screenshot", "reader:course", "reader:course: 8.38% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%)", "/course/x"),
  hunk("network", "GET /_app/immutable/assets/Image.{{hash}}.css", "reader:home: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css", "/"),
  hunk("network", "GET /_app/immutable/assets/23.{{hash}}.css", "catalogue:home: new request on b: GET /_app/immutable/assets/23.{{hash}}.css", "/"),
  hunk("network", "GET /_app/immutable/chunks/{{hash}}.js", "reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 30× on b", "/"),
  hunk("network", "GET /logo.svg", "reader:home: request no longer made on b: GET /logo.svg", "/"),
  hunk("network", "GET /logo.svg", "live:home: request no longer made on b: GET /logo.svg", "/"),
  hunk("network", "GET /global.css", "live:home: request no longer made on b: GET /global.css", "/"),
  hunk("headers", "reader:home/link", "reader:home: header link changed: <./a.{{hash}}.css> → <./b.{{hash}}.css>", "/"),
  hunk("logs", "reader/event", "reader: new log field on b: event"),
  hunk("logs", "time/slow", "time: new log field on b: slow"),
  hunk("persistence", "student-signs-in/app_errors", "student-signs-in: POST app_errors — 20 row(s) on a, 0 on b"),
  hunk("persistence", "student-signs-in/calendar", "student-signs-in: POST calendar — 0 row(s) on a, 5 on b"),
  hunk("focus", "reader-auth:home", "reader-auth:home: keyboard order changed (12 stops on a, 11 on b)", "/"),
  hunk("dom", "reference-course-reads", 'journey "reference-course-reads" completed on a but failed on b')
];

describe("causes: hunks folded by kind", () => {
  it("folds a package, a page, an app, a hash and every number away, and keeps a route that is not a build asset", () => {
    const c = foldCauses(forecast());
    const keys = c.causes.map((x) => x.key);
    expect(c.unclaimed).toBe(forecast().length);
    expect(c.causes.reduce((a, x) => a + x.hunks, 0)).toBe(c.unclaimed);
    expect(new Set(keys)).toEqual(
      new Set([
        "sbom: package removed",
        "sbom: package bumped",
        "dom: semantic DOM differs (+# −# lines at line #)",
        'dom: journey "reference-course-reads" completed on a but failed on b',
        "screenshot: #% of pixels differ in #×# at (#, #) (threshold #%)",
        "network: new request on b: GET {{asset}}",
        "network: GET {{asset}} requested #× on a, #× on b",
        "network: request no longer made on b: GET /logo.svg",
        "network: request no longer made on b: GET /global.css",
        "headers: header link changed",
        "logs: new log field on b",
        "persistence: POST app_errors — # row(s) on a, # on b",
        "persistence: POST calendar — # row(s) on a, # on b",
        "focus: keyboard order changed (# stops on a, # on b)"
      ])
    );
    // Biggest first, then by key.
    for (let i = 1; i < c.causes.length; i++) {
      const [x, y] = [c.causes[i - 1]!, c.causes[i]!];
      expect(x.hunks > y.hunks || (x.hunks === y.hunks && x.key.localeCompare(y.key) < 0), `${x.key} before ${y.key}`).toBe(true);
    }
    const removed = c.causes[0]!;
    expect(removed).toMatchObject({ artefact: "sbom", hunks: 8, apps: ["reader", "catalogue", "live", "time"], pages: [], items: ["@isaacs/cliui", "minipass"] });
    expect(removed.id).toMatch(/^[0-9a-f]{8}$/);
    expect(removed.example).toMatchObject({ scope: "reader/@isaacs/cliui", summary: "reader: package removed: @isaacs/cliui@8.0.2" });
    const assets = c.causes.find((x) => x.key === "network: new request on b: GET {{asset}}")!;
    expect(assets).toMatchObject({ hunks: 2, apps: ["reader", "catalogue"], pages: ["catalogue:home", "reader:home"], items: ["GET /_app/immutable/assets/23.{{hash}}.css", "GET /_app/immutable/assets/Image.{{hash}}.css"] });
    expect(c.causes.find((x) => x.key.startsWith("logs"))).toMatchObject({ apps: ["reader", "time"], items: ["event", "slow"] });
    expect(c.causes.find((x) => x.key.startsWith("headers"))).toMatchObject({ items: ["link"], pages: ["reader:home"] });
    // reader-auth is the reader set up for sign-in; a journey's table names no app.
    expect(c.causes.find((x) => x.key.startsWith("focus"))).toMatchObject({ apps: ["reader"], pages: ["reader-auth:home"] });
    expect(c.causes.find((x) => x.key.startsWith("persistence: POST app_errors"))).toMatchObject({ apps: [], pages: [] });
  });

  it("names the same cause the same in two runs, whatever the numbers, and a different route a different cause", () => {
    expect(causeKey(hunk("dom", "reader:home", "reader:home: semantic DOM differs (+1 −2 lines at line 3)"))).toBe(causeKey(hunk("dom", "live:topic", "live:topic: semantic DOM differs (+40 −2 lines at line 300)")));
    expect(causeKey(hunk("network", "GET /a.png", "reader:home: new request on b: GET /a.png"))).not.toBe(causeKey(hunk("network", "GET /b.png", "reader:home: new request on b: GET /b.png")));
    expect(kindOf(hunk("sbom", "reader/tar", "reader: package bumped: tar 1.34+dfsg-1, 7.4.3 → 1.35"))).toEqual({ kind: "package bumped", item: "tar" });
    expect(kindOf(hunk("image-manifest", "reader/layers", "reader: 9 layer(s) on a, 10 on b"))).toEqual({ kind: "# layer(s) on a, # on b" });
    const a = foldCauses([hunk("dom", "reader:home", "reader:home: semantic DOM differs (+1 −2 lines at line 3)")]).causes[0]!;
    const b = foldCauses([hunk("dom", "live:x", "live:x: semantic DOM differs (+9 −9 lines at line 9)")]).causes[0]!;
    expect(a.id).toBe(b.id);
  });

  it("groups the pages on which the same artefacts moved together, and leaves a page with one artefact out", () => {
    const c = foldCauses(forecast());
    expect(c.together[0]).toEqual({ artefacts: ["dom", "headers", "network", "screenshot"], pages: ["reader:home"], hunks: 7 });
    expect(c.together).toContainEqual({ artefacts: ["dom", "screenshot"], pages: ["reader:course"], hunks: 2 });
    expect(c.together.flatMap((g) => g.pages)).not.toContain("reader-auth:home");
    expect(foldCauses([])).toEqual({ unclaimed: 0, causes: [], together: [] });
  });

  it("renders a table with the headline, each example linked to its row, long lists counted, and nothing when there is no cause", () => {
    const many = Array.from({ length: CAUSE_LISTED.items + 3 }, (_, i) => hunk("sbom", `reader/pkg-${String(i).padStart(2, "0")}`, `reader: package removed: pkg-${i}@1.0.0`));
    const c = foldCauses([...forecast(), ...many]);
    const html = causesHtml(c, esc);
    expect(html).toContain(`<h2 id="causes">${c.unclaimed} unclaimed differences, ${c.causes.length} causes</h2>`);
    expect(html).toContain(`<a href="#hunk-${esc(c.causes[0]!.example.id)}">`);
    expect(html).toContain(`and ${c.causes[0]!.items.length - CAUSE_LISTED.items} more`);
    expect(html).toContain("Moved together");
    expect(html).not.toMatch(/<script/);
    const md = causesMarkdown(c).join("\n");
    expect(md).toContain(`### ${c.unclaimed} unclaimed differences, ${c.causes.length} causes`);
    expect(md).toContain("| `sbom` package removed (");
    expect(md).toContain("- `dom`, `headers`, `network`, `screenshot` on 1 page (7 differences): `reader:home`");
    expect(causesHtml(foldCauses([]), esc)).toBe("");
    expect(causesMarkdown(undefined)).toEqual([]);
    const one = foldCauses([hunk("console", "catalogue:home", "catalogue:home: new console message on b")]);
    expect(causesMarkdown(one)[0]).toBe("### 1 unclaimed difference, 1 cause");
    // A changed link header runs to kilobytes: the example is cut.
    const long = foldCauses([hunk("headers", "reader:home/link", `reader:home: header link changed: ${"<x>, ".repeat(200)}`)]);
    expect(causesMarkdown(long).join("\n")).toContain("…");
  });

  it("is added to report.json when the report is written, after the verdict, and leaves the verdict alone", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-causes-"));
    const unclaimed = forecast();
    const report = { mode: "release", verdict: "fail", reasons: ["x"], ranAt: "2026-09-29T08:48:03.000Z", now: "2026-09-16T09:05:00.000Z", runs: 1, harnessVersion: "1.20.0", harness: { version: "1.20.0", gitSha: null, contractVersion: "1.20.0" }, schemaVersion: 1, substrate: "compose", sides: { a: { reader: "r:a", catalogue: "c:a", live: "l:a" }, b: { reader: "r:b", catalogue: "c:b", live: "l:b" } }, compare: { hunks: unclaimed, matches: unclaimed.map((h) => ({ hunk: h })), unclaimed, staleClaims: [], broadUnapproved: [] }, masksApplied: {} } as unknown as RunReport;
    const files = writeReports(dir, report);
    const written = JSON.parse(readFileSync(files.json, "utf8")) as RunReport;
    expect(written.causes).toEqual(foldCauses(unclaimed));
    expect(written.verdict).toBe("fail");
    expect(report.causes).toEqual(written.causes);
    expect(readFileSync(files.html, "utf8")).toContain('id="causes"');
    expect(readFileSync(files.md, "utf8")).toContain("unclaimed differences, 14 causes");
  });
});
