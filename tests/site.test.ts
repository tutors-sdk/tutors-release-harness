/**
 * The report pages (site/index.html): the page is static and reads each branch's reports/index.json in the browser, so
 * it is rendered here the way pages.yml serves it, from a fixture site: its script runs against a minimal document and a
 * fetch that reads the fixture directory. The top of the page is the exemplar, "What main would ship today", from the
 * newest Main to RC run kept by `harness reports keep`: scored (since 1.13.1), or kept before the score existed.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createContext, runInContext } from "node:vm";
import { beforeAll, describe, expect, it } from "vitest";
import { keepReport } from "../src/ci/report-archive.ts";
import { KIND_TITLES } from "../src/glance/rank.ts";
import type { Confidence } from "../src/score/confidence.ts";
import { scoredRun, unscoredRun } from "./support/scored-run.ts";

const ROOT = resolve(import.meta.dirname, "..");
const PAGE = readFileSync(resolve(ROOT, "site/index.html"), "utf8");
const SCRIPT = /<script>([\s\S]*)<\/script>/.exec(PAGE)![1]!;

interface Element {
  html: string;
  textContent: string;
  innerHTML: string;
  insertAdjacentHTML(where: string, html: string): void;
}

/** Runs the page's script against `site` (a directory laid out as pages.yml lays out _site) and returns what it drew, by element id. */
async function render(site: string): Promise<Record<string, string>> {
  const els: Record<string, Element> = {};
  const el = (id: string): Element => {
    const e: Element = {
      html: "",
      textContent: "",
      get innerHTML() {
        return this.html;
      },
      set innerHTML(v: string) {
        this.html = v;
      },
      insertAdjacentHTML(_where: string, h: string) {
        this.html += h;
      }
    };
    return (els[id] ??= e);
  };
  const fetch = async (url: string) => {
    const file = join(site, url);
    const ok = existsSync(file);
    return { ok, json: async () => JSON.parse(readFileSync(file, "utf8")) };
  };
  const ctx = createContext({ document: { getElementById: el }, fetch });
  runInContext(SCRIPT, ctx);
  await (ctx as { siteReady: Promise<unknown> }).siteReady;
  return Object.fromEntries(Object.entries(els).map(([k, v]) => [k, v.html]));
}

/** A Main to RC store as the main-preview branch keeps it, copied where pages.yml puts it. */
function site(): string {
  const root = mkdtempSync(join(tmpdir(), "harness-site-"));
  mkdirSync(join(root, "main-preview"), { recursive: true });
  return root;
}

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").replace(/ ([.,:;])/g, "$1").trim();

describe("site/index.html", () => {
  it("leads with the exemplar, then the scoreboard, the release candidates, every forecast and the nightly A/A", () => {
    const order = ["exemplar", "scoreboard", "release-records", "main-preview", "noise"].map((id) => PAGE.indexOf(`<section id="${id}"`));
    for (const at of order) expect(at).toBeGreaterThan(0);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(PAGE).toContain("What main would ship today");
  });

  it("stays a static page: no external script, stylesheet or font", () => {
    expect(PAGE).not.toMatch(/<script[^>]+src=/);
    expect(PAGE).not.toMatch(/<link[^>]+stylesheet/);
    expect(PAGE).not.toMatch(/@import|fonts\.googleapis/);
  });

  it("names the glance's kinds as the report does", () => {
    const table = runInContext(`(${/const GLANCE_KINDS = (\{[^\n]*\});/.exec(SCRIPT)![1]!})`, createContext({})) as Record<string, string>;
    expect(table).toEqual(KIND_TITLES);
  });
});

describe("the exemplar: what main would ship today", () => {
  let scored: string;
  let conf: Confidence;
  let id: string;
  beforeAll(async () => {
    scored = site();
    const work = mkdtempSync(join(tmpdir(), "harness-site-work-"));
    keepReport({ dir: unscoredRun(work, "2026-09-26T05:00:00.000Z"), store: join(scored, "main-preview"), runUrl: "https://github.com/tutors-sdk/tutors-release-harness/actions/runs/1" });
    const dir = await scoredRun(work, { ranAt: "2026-09-28T05:00:00.000Z", unclaimed: 2 });
    conf = JSON.parse(readFileSync(join(dir, "confidence.json"), "utf8")) as Confidence;
    id = keepReport({ dir, store: join(scored, "main-preview"), runUrl: "https://github.com/tutors-sdk/tutors-release-harness/actions/runs/2" }).entry.id;
  }, 60_000);

  it("shows the newest forecast's Gate, what stops the line, the score's word, the glance with its links, the change risk, when and which harness", async () => {
    const html = (await render(scored))["exemplar-body"]!;
    const t = text(html);
    expect(t).toContain("Main sha-3f1c2a9 against production 1.0.4.");
    expect(html).toContain('Gate <span class="verdict fail">FAIL</span>');
    expect(t).toContain("What stops the line 2 unclaimed diff(s)");
    // a FAIL has no RCS: the page says why, in the score's own words, and shows no number or band
    expect(conf.rcs).toBeNull();
    expect(t).toContain(conf.note!);
    expect(html).not.toMatch(/class="band /);
    // the glance, each item with its links: the hunk inside the kept report, the PR on GitHub
    expect(conf.glance.length).toBeGreaterThan(0);
    expect(t).toContain("Where to look first");
    for (const i of conf.glance) expect(t).toContain(i.finding);
    expect(html).toContain(`href="main-preview/reports/${id}/report.html#hunk-dom:/course:1"`);
    expect(html).toContain('href="https://github.com/tutors-sdk/tutors-mono-repo/pull/10"');
    // a diff link with no URL is shown as text, never guessed into a link
    expect(t).toContain("diff: PR #11 apps/reader/src/hot.ts");
    expect(html).not.toMatch(/href="[^"]*PR #11/);
    // what changed
    expect(t).toContain("Change risk 32 over v1.0.4..v1.1.0: 4 of 5 change(s) carry a finding; its floor is breached.");
    expect(t).toContain("1 more with no deductions");
    // when, which harness, and where to read on
    expect(t).toMatch(/Ran .*2026.* UTC with harness 1\.13\.1\./);
    expect(html).toContain(`href="main-preview/reports/${id}/report.html">the full report</a>`);
    expect(html).toContain('href="https://github.com/tutors-sdk/tutors-release-harness/blob/main/docs/lean.md"');
    expect(html).toContain('href="https://github.com/tutors-sdk/tutors-release-harness/blob/main/docs/user-guide/10-running-a-release.md"');
    expect(html).toContain('href="https://github.com/tutors-sdk/tutors-release-harness/actions/runs/2"');
  });

  it("a PASS shows the RCS, its band and the band's one-line meaning", async () => {
    const root = site();
    const work = mkdtempSync(join(tmpdir(), "harness-site-work-"));
    const dir = await scoredRun(work, { ranAt: "2026-09-28T06:00:00.000Z" });
    const c = JSON.parse(readFileSync(join(dir, "confidence.json"), "utf8")) as Confidence;
    keepReport({ dir, store: join(root, "main-preview") });
    const html = (await render(root))["exemplar-body"]!;
    expect(c.rcs).not.toBeNull();
    expect(html).toContain(`RCS ${c.rcs} <span class="band ${c.band!.toLowerCase()}">${c.band}</span>`);
    expect(text(html)).toContain(`${c.band}: ${c.meaning}`);
    expect(html).toContain('Gate <span class="verdict pass">PASS</span>');
    expect(text(html)).toContain("Why no unclaimed differences");
  }, 60_000);

  it("a forecast kept before the score existed says so and shows no number", async () => {
    const root = site();
    const work = mkdtempSync(join(tmpdir(), "harness-site-work-"));
    keepReport({ dir: unscoredRun(work, "2026-09-26T05:00:00.000Z"), store: join(root, "main-preview") });
    const html = (await render(root))["exemplar-body"]!;
    const t = text(html);
    expect(html).toContain('Gate <span class="verdict fail">FAIL</span>');
    expect(t).toContain("Scored by harness 1.4.11 before the confidence score existed");
    expect(t).toContain("The next forecast will carry them.");
    expect(t).not.toMatch(/RCS \d|Change risk \d|Where to look first/);
  });

  it("with nothing kept yet it says so, and where to read how to run one", async () => {
    const html = (await render(site()))["exemplar-body"]!;
    expect(text(html)).toContain("No Main to RC forecast kept yet.");
    expect(html).toContain("docs/user-guide/10-running-a-release.md");
  });

  it("every forecast is still listed below, the scored one with its RCS word beside the scorecard", async () => {
    const drawn = await render(scored);
    const list = text(drawn["main-preview"]!);
    expect(list).toContain("no RCS");
    expect(list).toMatch(/scorecard \d+ \([A-D]\)/);
    // the head row and one row per kept forecast
    expect(drawn["main-preview"]!.match(/<tr>/g)?.length).toBe(3);
    expect(text(drawn["noise"]!)).toContain("No kept reports yet.");
  });
});
