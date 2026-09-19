import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { renderHtml, renderMarkdown, writeReports } from "../src/report/index.ts";
import type { Hunk, RunReport } from "../src/types.ts";

const hunks: Hunk[] = [
  { id: "1", artefact: "headers", scope: "reader:home/x-frame-options", summary: "reader:home: header dropped on b: x-frame-options (was SAMEORIGIN)", severity: "fail" },
  { id: "2", artefact: "dom", scope: "reader:lab-step", path: "/lab/x", summary: "reader:lab-step: semantic DOM differs", detail: '+ - note "<planted>"', severity: "fail" },
  { id: "3", artefact: "axe", scope: "reader:course", summary: "reader:course: axe violation fixed on b: button-name", severity: "info" }
];

const report: RunReport = {
  schemaVersion: 1,
  harness: { version: "1.0.0", gitSha: "0123456789abcdef0123456789abcdef01234567", contractVersion: "1.0.0" },
  harnessVersion: "1.0.0",
  mode: "release",
  substrate: "compose",
  ranAt: "2026-09-16T09:10:00.000Z",
  now: "2026-09-16T09:05:00.000Z",
  runs: 1,
  sides: { a: { reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0" }, b: { reader: "tutors/reader:rc", catalogue: "tutors/catalogue:rc", live: "tutors/live:rc" } },
  verdict: "fail",
  reasons: ["1 unclaimed diff(s)"],
  noise: { ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0 },
  compare: matchClaims(hunks, [{ artefact: "dom", scope: "reader:lab-step", reason: "Rule 0031: reading time" }, { artefact: "network", scope: "GET /gone", reason: "Rule 0002: stale" }]),
  masksApplied: { "response-date": 4, etag: 0 }
};

describe("markdown (PR comment)", () => {
  const md = renderMarkdown(report);
  it("leads with the verdict and lists unclaimed before claimed", () => {
    expect(md.startsWith("## ❌ Release harness — release — FAIL")).toBe(true);
    expect(md.indexOf("Unclaimed differences (1)")).toBeLessThan(md.indexOf("Claimed differences (1)"));
    expect(md).toContain("x-frame-options");
    expect(md).toContain("Rule 0031: reading time");
  });
  it("names stale claims and the masks that fired", () => {
    expect(md).toContain("Stale claims (1)");
    expect(md).toContain("response-date×4");
    expect(md).not.toContain("etag×0");
  });
});

describe("html", () => {
  const html = renderHtml(report);
  it("is self-contained and escapes content", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("&lt;planted&gt;");
    expect(html).not.toContain("<planted>");
    expect(html).toContain("Silent this run: <code>etag</code>");
  });
});

describe("writeReports", () => {
  it("writes json, html and md next to each other", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-report-"));
    const files = writeReports(dir, report);
    expect(JSON.parse(readFileSync(files.json, "utf8")).verdict).toBe("fail");
    expect(readFileSync(files.html, "utf8")).toContain("FAIL".toLowerCase());
    expect(readFileSync(files.md, "utf8")).toContain("FAIL");
  });
});
