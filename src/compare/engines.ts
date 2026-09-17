import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { structuredPatch } from "diff";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { EngineConfig } from "../normalise/masks.ts";
import type { Hunk, SideCapture } from "../types.ts";
import { hunkId, journeyPairs, pagePairs } from "./pages.ts";

export interface EngineContext {
  config: EngineConfig;
  /** Directory the captures live in (`<dir>/a`, `<dir>/b`); screenshot diffs are written to `<dir>/diff`. */
  captureDir?: string;
}

type Engine = (a: SideCapture, b: SideCapture, ctx: EngineContext) => Hunk[];

// ---- journeys ------------------------------------------------------------------

/** A journey that completes on one side and fails on the other is the loudest possible diff. */
export const journeyOutcomes: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of journeyPairs(a, b)) {
    if (pair.a.run !== 1) continue;
    if (!pair.a.error && pair.b.error) {
      hunks.push({ id: hunkId("dom", pair.a.journey), artefact: "dom", scope: pair.a.journey, severity: "fail", summary: `journey "${pair.a.journey}" completed on a but failed on b`, detail: pair.b.error });
    } else if (pair.a.error && !pair.b.error) {
      hunks.push({ id: hunkId("dom", pair.a.journey), artefact: "dom", scope: pair.a.journey, severity: "info", summary: `journey "${pair.a.journey}" failed on a but completed on b (fixed)`, detail: pair.a.error });
    } else if (pair.a.error && pair.b.error) {
      hunks.push({ id: hunkId("dom", pair.a.journey), artefact: "dom", scope: pair.a.journey, severity: "info", summary: `journey "${pair.a.journey}" failed on both sides`, detail: `a: ${pair.a.error}\nb: ${pair.b.error}` });
    }
  }
  return hunks;
};

// ---- dom -----------------------------------------------------------------------

export const dom: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of pagePairs(a, b)) {
    if (pair.a.aria === pair.b.aria) continue;
    const patch = structuredPatch("a", "b", pair.a.aria, pair.b.aria, undefined, undefined, { context: 2 });
    for (const h of patch.hunks) {
      const added = h.lines.filter((l) => l.startsWith("+")).length;
      const removed = h.lines.filter((l) => l.startsWith("-")).length;
      hunks.push({
        id: hunkId("dom", pair.pageKey),
        artefact: "dom",
        scope: pair.pageKey,
        path: pair.path,
        severity: "fail",
        summary: `${pair.pageKey}: semantic DOM differs (+${added} −${removed} lines at line ${h.oldStart})`,
        detail: h.lines.join("\n")
      });
    }
  }
  return hunks;
};

// ---- screenshot ------------------------------------------------------------------

export const screenshot: Engine = (a, b, ctx) => {
  const hunks: Hunk[] = [];
  if (!ctx.captureDir) return hunks;
  for (const pair of pagePairs(a, b)) {
    if (!pair.a.screenshot || !pair.b.screenshot) continue;
    const fileA = join(ctx.captureDir, "a", pair.a.screenshot);
    const fileB = join(ctx.captureDir, "b", pair.b.screenshot);
    if (!existsSync(fileA) || !existsSync(fileB)) continue;
    const pngA = PNG.sync.read(readFileSync(fileA));
    const pngB = PNG.sync.read(readFileSync(fileB));
    if (pngA.width !== pngB.width || pngA.height !== pngB.height) {
      hunks.push({ id: hunkId("screenshot", pair.pageKey), artefact: "screenshot", scope: pair.pageKey, path: pair.path, severity: "fail", summary: `${pair.pageKey}: screenshot size differs (${pngA.width}×${pngA.height} vs ${pngB.width}×${pngB.height})` });
      continue;
    }
    const diffPng = new PNG({ width: pngA.width, height: pngA.height });
    const differing = pixelmatch(pngA.data, pngB.data, diffPng.data, pngA.width, pngA.height, { threshold: ctx.config.screenshot.pixelThreshold });
    const ratio = differing / (pngA.width * pngA.height);
    if (ratio > ctx.config.screenshot.maxDiffRatio) {
      const diffFile = join(ctx.captureDir, "diff", pair.a.screenshot);
      mkdirSync(dirname(diffFile), { recursive: true });
      writeFileSync(diffFile, PNG.sync.write(diffPng));
      hunks.push({
        id: hunkId("screenshot", pair.pageKey),
        artefact: "screenshot",
        scope: pair.pageKey,
        path: pair.path,
        severity: "fail",
        summary: `${pair.pageKey}: ${(ratio * 100).toFixed(2)}% of pixels differ (threshold ${(ctx.config.screenshot.maxDiffRatio * 100).toFixed(2)}%)`,
        detail: `diff image: diff/${pair.a.screenshot}`
      });
    }
  }
  return hunks;
};

// ---- network -----------------------------------------------------------------------

function routeOf(url: string): string {
  return url.replace("{{origin}}", "").replace(/^https?:\/\//, "");
}

export const network: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of pagePairs(a, b)) {
    const key = (n: { method: string; url: string }) => `${n.method} ${n.url}`;
    const countA = new Map<string, number>();
    const countB = new Map<string, number>();
    for (const n of pair.a.network) countA.set(key(n), (countA.get(key(n)) ?? 0) + 1);
    for (const n of pair.b.network) countB.set(key(n), (countB.get(key(n)) ?? 0) + 1);

    for (const [k, c] of countA) {
      const other = countB.get(k) ?? 0;
      const scope = `${k.split(" ")[0]} ${routeOf(k.slice(k.indexOf(" ") + 1))}`;
      if (other === 0) hunks.push({ id: hunkId("network", scope), artefact: "network", scope, path: pair.path, severity: "fail", summary: `${pair.pageKey}: request no longer made on b: ${scope}` });
      else if (other !== c) hunks.push({ id: hunkId("network", scope), artefact: "network", scope, path: pair.path, severity: "fail", summary: `${pair.pageKey}: ${scope} requested ${c}× on a, ${other}× on b` });
    }
    for (const [k] of countB) {
      if (countA.has(k)) continue;
      const scope = `${k.split(" ")[0]} ${routeOf(k.slice(k.indexOf(" ") + 1))}`;
      hunks.push({ id: hunkId("network", scope), artefact: "network", scope, path: pair.path, severity: "fail", summary: `${pair.pageKey}: new request on b: ${scope}` });
    }

    // Per-entry comparison for requests both sides made.
    const firstB = new Map(pair.b.network.map((n) => [key(n), n] as const));
    for (const na of pair.a.network) {
      const nb = firstB.get(key(na));
      if (!nb) continue;
      const scope = `${na.method} ${routeOf(na.url)}`;
      const fields: [string, string | number, string | number][] = [
        ["status", na.status, nb.status],
        ["content-type", na.contentType, nb.contentType],
        ["cache-control", na.cacheControl, nb.cacheControl],
        ["response schema", na.schemaHash, nb.schemaHash]
      ];
      for (const [field, va, vb] of fields) {
        if (va !== vb) hunks.push({ id: hunkId("network", scope), artefact: "network", scope, path: pair.path, severity: "fail", summary: `${pair.pageKey}: ${scope} ${field} changed: ${va || "∅"} → ${vb || "∅"}` });
      }
    }
  }
  return dedupe(hunks);
};

// ---- console ---------------------------------------------------------------------------

export const consoleMessages: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of pagePairs(a, b)) {
    const setA = new Set(pair.a.console.map((c) => `${c.level}: ${c.text}`));
    const setB = new Set(pair.b.console.map((c) => `${c.level}: ${c.text}`));
    for (const m of setB) if (!setA.has(m)) hunks.push({ id: hunkId("console", pair.pageKey), artefact: "console", scope: pair.pageKey, path: pair.path, severity: "fail", summary: `${pair.pageKey}: new console message on b`, detail: m });
    for (const m of setA) if (!setB.has(m)) hunks.push({ id: hunkId("console", pair.pageKey), artefact: "console", scope: pair.pageKey, path: pair.path, severity: "info", summary: `${pair.pageKey}: console message gone on b`, detail: m });
  }
  return hunks;
};

// ---- headers ------------------------------------------------------------------------------

export const headers: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of pagePairs(a, b)) {
    // Only pages that were a document request on both sides have comparable headers.
    if (!Object.keys(pair.a.headers).length && !Object.keys(pair.b.headers).length) continue;
    const names = new Set([...Object.keys(pair.a.headers), ...Object.keys(pair.b.headers)]);
    for (const name of [...names].sort()) {
      const va = pair.a.headers[name];
      const vb = pair.b.headers[name];
      if (va === vb) continue;
      const summary = va === undefined ? `${pair.pageKey}: header added on b: ${name}: ${vb}` : vb === undefined ? `${pair.pageKey}: header dropped on b: ${name} (was ${va})` : `${pair.pageKey}: header ${name} changed: ${va} → ${vb}`;
      hunks.push({ id: hunkId("headers", pair.pageKey), artefact: "headers", scope: `${pair.pageKey}/${name}`, path: pair.path, severity: "fail", summary });
    }
  }
  return hunks;
};

// ---- axe ---------------------------------------------------------------------------------------

export const axe: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of pagePairs(a, b)) {
    const key = (f: { rule: string; target: string }) => `${f.rule} @ ${f.target}`;
    const setA = new Set(pair.a.axe.map(key));
    const setB = new Set(pair.b.axe.map(key));
    for (const f of pair.b.axe) if (!setA.has(key(f))) hunks.push({ id: hunkId("axe", pair.pageKey), artefact: "axe", scope: pair.pageKey, path: pair.path, severity: "fail", summary: `${pair.pageKey}: new axe violation on b: ${f.rule} (${f.impact})`, detail: f.target });
    for (const f of pair.a.axe) if (!setB.has(key(f))) hunks.push({ id: hunkId("axe", pair.pageKey), artefact: "axe", scope: pair.pageKey, path: pair.path, severity: "info", summary: `${pair.pageKey}: axe violation fixed on b: ${f.rule} (${f.impact})`, detail: f.target });
  }
  return hunks;
};

// ---- metrics ---------------------------------------------------------------------------------------

export const metrics: Engine = (a, b, ctx) => {
  const hunks: Hunk[] = [];
  const apps = new Set([...Object.keys(a.metrics.after), ...Object.keys(b.metrics.after)]);
  for (const app of apps) {
    const afterA = a.metrics.after[app]?.series ?? {};
    const afterB = b.metrics.after[app]?.series ?? {};
    const beforeA = a.metrics.before[app]?.series ?? {};
    const beforeB = b.metrics.before[app]?.series ?? {};
    for (const name of Object.keys(afterA).sort()) {
      if (!(name in afterB)) hunks.push({ id: hunkId("metrics", name), artefact: "metrics", scope: `${app}/${name}`, severity: "fail", summary: `${app}: series missing on b: ${name}` });
    }
    for (const name of Object.keys(afterB).sort()) {
      if (!(name in afterA)) hunks.push({ id: hunkId("metrics", name), artefact: "metrics", scope: `${app}/${name}`, severity: "fail", summary: `${app}: new series on b: ${name}` });
    }
    for (const name of Object.keys(afterA).sort()) {
      if (!(name in afterB) || !(name in beforeA) || !(name in beforeB)) continue;
      const da = afterA[name]! - beforeA[name]!;
      const db = afterB[name]! - beforeB[name]!;
      const allowed = Math.max(ctx.config.metrics.deltaAbsolute, ctx.config.metrics.deltaTolerance * Math.max(Math.abs(da), Math.abs(db)));
      if (Math.abs(da - db) > allowed) {
        hunks.push({ id: hunkId("metrics", name), artefact: "metrics", scope: `${app}/${name}`, severity: "fail", summary: `${app}: ${name} moved by ${fmt(da)} on a and ${fmt(db)} on b under the same traffic` });
      }
    }
  }
  return hunks;
};

// ---- logs -------------------------------------------------------------------------------------------

export const logs: Engine = (a, b, ctx) => {
  const hunks: Hunk[] = [];
  const apps = new Set([...Object.keys(a.logs), ...Object.keys(b.logs)]);
  for (const app of apps) {
    const la = a.logs[app];
    const lb = b.logs[app];
    if (!la || !lb) continue;
    const keysA = new Set(la.keys);
    const keysB = new Set(lb.keys);
    for (const k of la.keys) if (!keysB.has(k)) hunks.push({ id: hunkId("logs", app), artefact: "logs", scope: `${app}/${k}`, severity: "fail", summary: `${app}: log field gone on b: ${k}` });
    for (const k of lb.keys) if (!keysA.has(k)) hunks.push({ id: hunkId("logs", app), artefact: "logs", scope: `${app}/${k}`, severity: "fail", summary: `${app}: new log field on b: ${k}` });
    const levels = new Set([...Object.keys(la.byLevel), ...Object.keys(lb.byLevel)]);
    for (const level of levels) {
      const ca = la.byLevel[level] ?? 0;
      const cb = lb.byLevel[level] ?? 0;
      const allowed = Math.max(2, ctx.config.logs.levelTolerance * Math.max(ca, cb));
      if (Math.abs(ca - cb) > allowed) hunks.push({ id: hunkId("logs", app), artefact: "logs", scope: `${app}/${level}`, severity: "fail", summary: `${app}: ${level}-level lines: ${ca} on a, ${cb} on b` });
    }
    if (la.requestIdRatio - lb.requestIdRatio > ctx.config.logs.requestIdDrop) {
      hunks.push({ id: hunkId("logs", app), artefact: "logs", scope: `${app}/request-id`, severity: "fail", summary: `${app}: request-id propagation fell from ${pct(la.requestIdRatio)} to ${pct(lb.requestIdRatio)}` });
    }
    if (la.jsonLines > 0 && lb.jsonLines === 0 && lb.lines > 0) {
      hunks.push({ id: hunkId("logs", app), artefact: "logs", scope: `${app}/json`, severity: "fail", summary: `${app}: logs are no longer JSON lines on b` });
    }
  }
  return hunks;
};

// ---- timing --------------------------------------------------------------------------------------------

/** Two-sided Mann-Whitney U with normal approximation; fine for the small samples the harness produces. */
export function mannWhitney(x: number[], y: number[]): { u: number; p: number } {
  const all = [...x.map((v) => ({ v, g: 0 })), ...y.map((v) => ({ v, g: 1 }))].sort((p, q) => p.v - q.v);
  const ranks = new Array<number>(all.length);
  for (let i = 0; i < all.length; ) {
    let j = i;
    while (j + 1 < all.length && all[j + 1]!.v === all[i]!.v) j += 1;
    const rank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k += 1) ranks[k] = rank;
    i = j + 1;
  }
  const r1 = all.reduce((sum, e, i) => (e.g === 0 ? sum + ranks[i]! : sum), 0);
  const n1 = x.length;
  const n2 = y.length;
  const u1 = r1 - (n1 * (n1 + 1)) / 2;
  const u = Math.min(u1, n1 * n2 - u1);
  const mu = (n1 * n2) / 2;
  const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  if (sigma === 0) return { u, p: 1 };
  const z = (Math.abs(u - mu) - 0.5) / sigma;
  const p = 2 * (1 - normalCdf(Math.max(z, 0)));
  return { u, p: Math.min(1, Math.max(0, p)) };
}

function normalCdf(z: number): number {
  // Abramowitz & Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  return 0.5 * (1 + (z >= 0 ? erf : -erf));
}

function median(xs: number[]): number {
  const s = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export const timing: Engine = (a, b, ctx) => {
  const hunks: Hunk[] = [];
  // A laptop's stack and a live deployment behind a CDN are not the same clock.
  if (a.external || b.external) return hunks;
  const samples = (capture: SideCapture) => {
    const byPage = new Map<string, { ttfb: number[]; path: string }>();
    const byJourney = new Map<string, number[]>();
    for (const j of capture.journeys) {
      if (!j.error) byJourney.set(j.journey, [...(byJourney.get(j.journey) ?? []), j.durationMs]);
      for (const p of j.pages) {
        if (p.timing.ttfbMs < 0) continue;
        const entry = byPage.get(p.pageKey) ?? { ttfb: [], path: p.path };
        entry.ttfb.push(p.timing.ttfbMs);
        byPage.set(p.pageKey, entry);
      }
    }
    return { byPage, byJourney };
  };
  const sa = samples(a);
  const sb = samples(b);
  const { minRuns, alpha, minEffect, minShiftMs } = ctx.config.timing;

  const judge = (scope: string, path: string | undefined, label: string, xs: number[], ys: number[]) => {
    if (!xs.length || !ys.length) return;
    const ma = median(xs);
    const mb = median(ys);
    const effect = ma > 0 ? (mb - ma) / ma : 0;
    if (effect < minEffect || mb - ma < minShiftMs) return;
    if (xs.length < minRuns || ys.length < minRuns) {
      hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, ...(path ? { path } : {}), severity: "info", summary: `${label} median ${ma}ms → ${mb}ms (+${pct(effect)}); ${Math.max(xs.length, ys.length)} run(s), need ${minRuns} to judge` });
      return;
    }
    const { p } = mannWhitney(xs, ys);
    if (p < alpha) hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, ...(path ? { path } : {}), severity: "fail", summary: `${label} slower on b: median ${ma}ms → ${mb}ms (+${pct(effect)}, p=${p.toFixed(3)}, n=${xs.length}/${ys.length})` });
    else hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, ...(path ? { path } : {}), severity: "info", summary: `${label} median ${ma}ms → ${mb}ms but not significant (p=${p.toFixed(3)})` });
  };

  for (const [pageKey, ea] of sa.byPage) {
    const eb = sb.byPage.get(pageKey);
    if (eb) judge(pageKey, ea.path, `${pageKey} TTFB`, ea.ttfb, eb.ttfb);
  }
  for (const [journey, xs] of sa.byJourney) {
    const ys = sb.byJourney.get(journey);
    if (ys) judge(journey, undefined, `journey ${journey}`, xs, ys);
  }
  return hunks;
};

// ---- helpers -------------------------------------------------------------------------------------------------

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}
function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}
function dedupe(hunks: Hunk[]): Hunk[] {
  const seen = new Set<string>();
  return hunks.filter((h) => {
    const k = `${h.artefact}|${h.scope}|${h.summary}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const ENGINES: Record<string, Engine> = { journeyOutcomes, dom, screenshot, network, console: consoleMessages, headers, axe, metrics, logs, timing };
