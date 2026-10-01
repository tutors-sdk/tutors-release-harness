/**
 * Engine levels (since 1.21.0): every engine is blocking or informing, and an informing engine's findings are reported,
 * never gated. Today every engine is blocking, so nothing a run decided before 1.21.0 changes: the A/A of this file.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { ENGINE_LEVELS, applyLevels, levelOn, levelsLine, levelsOn, type EngineLevels } from "../src/compare/levels.ts";
import { POLICY_FAMILY } from "../src/compare/policy.ts";
import { exitCodeFor, gate } from "../src/gate.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { buildReadiness, type KeptForecast } from "../src/readiness/model.ts";
import { readForecasts } from "../src/readiness/read.ts";
import { renderReadiness } from "../src/readiness/render.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { compareFromCaptures, defaultRunOptions } from "../src/run.ts";
import { ARTEFACTS, type Hunk, type NoiseStatus } from "../src/types.ts";
import { capture, clone } from "./support/captures.ts";

const AT = new Date("2026-10-01T09:00:00Z");
// The checks that ship informing: the policy family (1.22.0) and the timing tolerance (1.26.0).
const INFORMING: readonly string[] = [...POLICY_FAMILY, "timing-tolerance"];
const DIFF = ARTEFACTS.filter((a) => !INFORMING.includes(a));
const clean: NoiseStatus = { ranAt: "2026-10-01T02:00:00.000Z", clean: true, hunks: 0 };
const hunk = (artefact: Hunk["artefact"], severity: Hunk["severity"] = "fail", scope = "reader:home/x-frame-options"): Hunk => ({ id: `${artefact}:${scope}`, artefact, scope, summary: `${artefact} moved`, severity });
const informing = (blockingFrom?: string): EngineLevels => ({ ...ENGINE_LEVELS, headers: { level: "informing", ...(blockingFrom ? { blockingFrom } : {}) } });

describe("the levels", () => {
  it("every engine has one: every diff engine is blocking, and the policy family (since 1.22.0) informing with no date", () => {
    expect(Object.keys(ENGINE_LEVELS).sort()).toEqual([...ARTEFACTS].sort());
    for (const a of DIFF) expect(levelOn(a, AT), a).toEqual({ level: "blocking" });
    for (const a of INFORMING) expect(levelOn(a, AT), a).toEqual({ level: "informing" });
    expect(levelsLine(levelsOn(AT))).toBe(`${DIFF.length} of ${ARTEFACTS.length} engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block).`);
    const blocking = Object.fromEntries(ARTEFACTS.map((a) => [a, { level: "blocking" as const }]));
    expect(levelsLine(levelsOn(AT, blocking))).toBe(`Every engine is blocking (${ARTEFACTS.length} of ${ARTEFACTS.length}).`);
  });

  it("A/A: with every diff engine blocking their hunks are the same objects, so the run is the run it was before levels", () => {
    const hunks = DIFF.flatMap((a) => [hunk(a), hunk(a, "info")]);
    const out = applyLevels(hunks, AT);
    expect(out).toHaveLength(hunks.length);
    out.forEach((h, i) => expect(h).toBe(hunks[i]));
  });

  it("planted: an informing engine's failing hunk is reported as informing and never gates, in release or in the A/A", () => {
    const [h] = applyLevels([hunk("headers")], AT, informing());
    expect(h).toMatchObject({ severity: "info", level: "informing", artefact: "headers" });
    expect(h).not.toHaveProperty("blockingFrom");
    const compare = matchClaims([h!], []);
    expect(compare.unclaimed).toEqual([]);
    const release = gate({ mode: "release", compare, noise: clean, noiseWaived: false, noiseMaxAgeDays: 7, ranAt: AT });
    expect(release.verdict).toBe("pass");
    expect(exitCodeFor(release.verdict)).toBe(0);
    expect(gate({ mode: "noise", compare, noiseWaived: false, noiseMaxAgeDays: 7, ranAt: AT }).verdict).toBe("pass");
    // The same hunk from a blocking engine fails, as it always did.
    expect(gate({ mode: "release", compare: matchClaims([hunk("headers")], []), noise: clean, noiseWaived: false, noiseMaxAgeDays: 7, ranAt: AT }).verdict).toBe("fail");
  });

  it("an informing result stays claimable: a claim that names it is used, not stale", () => {
    const compare = matchClaims(applyLevels([hunk("headers")], AT, informing()), [{ artefact: "headers", scope: "reader:home/*", reason: "Rule 0031: frames" }]);
    expect(compare.matches[0]!.claim?.reason).toBe("Rule 0031: frames");
    expect(compare.staleClaims).toEqual([]);
  });

  it("must not flag: an informational hunk of an informing engine is left as it was, and another engine's failure still fails", () => {
    const info = hunk("headers", "info");
    const dom = hunk("dom");
    const out = applyLevels([info, dom], AT, informing());
    expect(out[0]).toBe(info);
    expect(out[1]).toBe(dom);
  });

  it("blockingFrom: informing before the date, blocking on and after it; a date that is not one is refused", () => {
    expect(levelOn("headers", new Date("2026-10-31T23:59:59Z"), informing("2026-11-01"))).toEqual({ level: "informing", blockingFrom: "2026-11-01" });
    expect(levelOn("headers", new Date("2026-11-01T00:00:00Z"), informing("2026-11-01"))).toEqual({ level: "blocking" });
    expect(applyLevels([hunk("headers")], AT, informing("2026-11-01"))[0]).toMatchObject({ level: "informing", blockingFrom: "2026-11-01" });
    expect(applyLevels([hunk("headers")], new Date("2026-12-01T00:00:00Z"), informing("2026-11-01"))[0]).toMatchObject({ severity: "fail" });
    expect(() => levelOn("headers", AT, informing("1 November"))).toThrow(/YYYY-MM-DD/);
    expect(levelsLine(levelsOn(AT, informing("2026-11-01")))).toContain("informing (reported, never gates): headers (blocking from 2026-11-01)");
  });

  it("an engine the table does not name is blocking: no check escapes the Gate by being left out", () => {
    expect(levelOn("not-an-engine", AT, {})).toEqual({ level: "blocking" });
  });
});

describe("through a run", () => {
  const run = (levels?: EngineLevels) => {
    const b = clone(capture("b"));
    delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
    return compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-levels-")), a: capture("a"), b, claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: defaultRunOptions().noiseMaxAgeDays, now: "2026-09-16T09:05:00.000Z", runs: 1, ranAt: AT, log: () => {}, ...(levels ? { levels } : {}) }).report;
  };

  it("today: the dropped header fails as before, and the report records every diff engine as blocking", () => {
    const r = run();
    expect(r.verdict).toBe("fail");
    expect(r.compare.unclaimed.map((h) => h.artefact)).toContain("headers");
    for (const a of DIFF) expect(r.levels![a]).toEqual({ level: "blocking" });
    expect(renderHtml(r)).toContain(`${DIFF.length} of ${ARTEFACTS.length} engines are blocking`);
    expect(renderHtml(r)).toContain("No informing results on this run.");
  });

  it("with every engine blocking and nothing found, the pull-request comment says nothing of levels", () => {
    const blocking = Object.fromEntries(ARTEFACTS.map((a) => [a, { level: "blocking" as const }]));
    const r = run(blocking);
    expect(renderHtml(r)).toContain("Every engine is blocking");
    expect(renderMarkdown(r)).not.toContain("Informing");
  });

  it("with headers informing: the run passes, and the report and readiness page show the result, labelled", () => {
    const r = run(informing("2026-11-01"));
    expect(r.verdict).toBe("pass");
    expect(r.compare.unclaimed).toEqual([]);
    expect(r.levels!.headers).toEqual({ level: "informing", blockingFrom: "2026-11-01" });
    const html = renderHtml(r);
    expect(html).toMatch(/<h2 id="informing">Informing \(1; 1 unclaimed\) <span class="level">reported, never gates<\/span><\/h2>/);
    expect(html).toContain("blocking from 2026-11-01");
    expect(html).toContain('<em>informing</em> <a href="#informing">(reported, never gates)</a>');
    expect(renderMarkdown(r)).toContain("### Informing (1; 1 unclaimed): reported, never gates");
    const k: KeptForecast = { id: "f", ranAt: "2026-10-01T08:50:00Z", verdict: "pass", harnessVersion: "1.21.0", gate: "PASS", files: ["f/report.html"], unclaimed: 0, informing: 1 };
    const page = renderReadiness(buildReadiness({ now: AT, harness: "1.21.0", forecasts: [k], github: "read" }));
    expect(page).toContain('title="found by informing engines: reported, never gates">1 informing</a>');
    expect(page).toContain('<span class="k">Informing</span><span class="big">1</span>');
  });

  it("the readiness page counts a kept report's unclaimed informing results, and does not count one kept before levels", () => {
    const site = mkdtempSync(join(tmpdir(), "harness-levels-site-"));
    const base = join(site, "main-preview/reports");
    const keep = (id: string, report: unknown) => {
      mkdirSync(join(base, id), { recursive: true });
      writeFileSync(join(base, id, "report.json"), JSON.stringify(report));
    };
    const r = run(informing());
    keep("new", r);
    const { levels: _l, ...old } = run();
    keep("old", old);
    writeFileSync(join(base, "index.json"), JSON.stringify({ runs: ["new", "old"].map((id, i) => ({ id, mode: "release", ranAt: `2026-10-0${2 - i}T08:00:00Z`, verdict: "pass", harnessVersion: "1.21.0", files: [`${id}/report.json`] })) }));
    const f = readForecasts(site);
    expect(f.map((x) => x.informing)).toEqual([1, undefined]);
    expect(f[0]!.informingBy).toEqual({ headers: 1 });
    const page = renderReadiness(buildReadiness({ now: new Date("2026-10-02T12:00:00Z"), harness: "1.22.0", forecasts: [{ ...f[0]!, files: [...f[0]!.files, "new/report.html"] }], github: "read" }));
    expect(page).toContain('title="found by informing engines: reported, never gates (headers 1)">1 informing</a>');
    expect(page).toContain("headers 1. found by informing engines and not claimed");
  });
});
