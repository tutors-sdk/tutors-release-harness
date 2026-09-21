import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { compareFromCaptures } from "../src/run.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { capture } from "./support/captures.ts";
import { renderHtml, renderMarkdown, writeReports } from "../src/report/index.ts";
import type { Hunk, ImageInfo, RunReport, SideProvenance } from "../src/types.ts";

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

describe("image provenance in the report header", () => {
  const digest = (n: number) => `sha256:${String(n).repeat(64)}`;
  const side = (summary: string, info: (app: string, i: number) => ImageInfo, extra: Partial<SideProvenance> = {}): SideProvenance => ({
    summary,
    ...extra,
    images: { reader: info("reader", 1), catalogue: info("catalogue", 2), live: info("live", 3) }
  });
  const verified = side("pulled+verified", (app, i) => ({ ref: `quay.io/tutors-sdk/tutors-${app}:16.2.0`, id: `sha256:id${i}`, digest: digest(i), revision: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", version: "16.2.0", provenance: "pulled+verified", verifiedIdentity: "^https://github.com/tutors-sdk/" }));
  const built = side("built-from-ref release/16.3.0@0123456789ab", (app, i) => ({ ref: `quay.io/tutors-sdk/tutors-${app}:16.3.0-rc.1`, id: `sha256:b${i}`, revision: "0123456789abcdef0123456789abcdef01234567", version: "16.3.0-rc.1", provenance: "built-from-ref", builtFrom: { ref: "release/16.3.0", sha: "0123456789abcdef0123456789abcdef01234567" } }));
  const withProvenance: RunReport = { ...report, provenance: { a: verified, b: built } };

  it("markdown shows each side's provenance, and digest, revision and version per image, above the reasons", () => {
    const md = renderMarkdown(withProvenance);
    expect(md).toContain("| **provenance** | **pulled+verified** | **built-from-ref release/16.3.0@0123456789ab** |");
    expect(md).toContain(`| reader image | \`${digest(1)}\` · rev \`1a2b3c4d5e6f\` · version \`16.2.0\` | no registry digest · rev \`0123456789ab\` · version \`16.3.0-rc.1\` |`);
    expect(md.indexOf("**provenance**")).toBeLessThan(md.indexOf("1 unclaimed diff(s)"));
  });

  it("html shows the same and is loud about a side that is not the published image", () => {
    const html = renderHtml(withProvenance);
    expect(html).toContain("a — pulled+verified");
    expect(html).toContain("b — built-from-ref release/16.3.0@0123456789ab");
    expect(html).toContain(`digest <code>${digest(2)}</code>`);
    expect(html).toContain("version <code>16.3.0-rc.1</code>");
    expect(html).toContain('<p class="loud">Side b did not run signature-verified registry images');
    expect(html.indexOf("provenance")).toBeLessThan(html.indexOf("<h2>Differences"));
  });

  it("a locally built side is announced before anything else in both reports: above the reasons and the tables, not just in a table cell", () => {
    const md = renderMarkdown(withProvenance);
    expect(md).toContain("> ⚠️ **Side b did not run signature-verified registry images (built-from-ref release/16.3.0@0123456789ab). This run is not evidence about the images that ship.**");
    expect(md.indexOf("> ⚠️ **Side b")).toBeLessThan(md.indexOf("| | a | b |"));
    const html = renderHtml(withProvenance);
    expect(html.indexOf("class=\"loud\"")).toBeLessThan(html.indexOf("<ul>"));
    expect(html.indexOf("class=\"loud\"")).toBeLessThan(html.indexOf("<table>"));
    // Two verified sides, or sides that were never inspected, are not announced.
    expect(renderMarkdown({ ...report, provenance: { a: verified, b: verified } })).not.toContain("not evidence");
    expect(renderHtml({ ...report, provenance: { a: verified } })).not.toContain("not evidence");
  });

  it("an unverified pull shows why, and an unlabelled image says so rather than showing nothing", () => {
    const unverified = side("pulled-unverified", (app, i) => ({ ref: `quay.io/x/tutors-${app}:1`, digest: digest(i), provenance: "pulled-unverified", unverifiedReason: "no valid signature <for this>" }), { allowedUnsigned: true });
    const html = renderHtml({ ...report, provenance: { a: verified, b: unverified } });
    expect(html).toContain("<strong>not verified:</strong> no valid signature &lt;for this&gt;");
    expect(html).toContain("revision <em>unlabelled</em>");
    expect(html).toContain("Side b did not run");
  });

  it("flows from capture.json into report.json and the reasons, and is never itself a difference", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-provenance-"));
    const unverified = side("pulled-unverified", (app, i) => ({ ref: `quay.io/x/tutors-${app}:1`, digest: digest(i), provenance: "pulled-unverified", unverifiedReason: "unsigned" }), { allowedUnsigned: true });
    const outcome = compareFromCaptures({ mode: "noise", substrate: "compose", captureDir: dir, a: capture("a", { provenance: built }), b: capture("b", { provenance: unverified }), claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => undefined });
    expect(outcome.report.compare.hunks).toEqual([]);
    const json = JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport;
    expect(json.provenance!.a!.images.reader.builtFrom).toEqual({ ref: "release/16.3.0", sha: "0123456789abcdef0123456789abcdef01234567" });
    expect(json.provenance!.b!.allowedUnsigned).toBe(true);
    expect(json.reasons.join(" | ")).toMatch(/side a was built here from monorepo ref release\/16\.3\.0/);
    expect(json.reasons.join(" | ")).toMatch(/side b ran 3 registry image\(s\) whose signature was NOT verified/);
  });

  it("a report without provenance (an older capture) renders as before", () => {
    expect(renderMarkdown(report)).not.toContain("provenance");
    expect(renderHtml(report)).not.toContain('class="loud"');
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
