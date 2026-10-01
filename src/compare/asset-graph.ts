import type { Hunk, SideCapture } from "../types.ts";
import { levelOn, type EngineLevels, ENGINE_LEVELS } from "./levels.ts";
import { hunkId, pagePairs } from "./pages.ts";

/**
 * Asset-graph folding (since 1.27.0; runway change 9). A change to how a SvelteKit app is chunked repeats on every
 * page: the hashed JS chunks and CSS assets under `/_app/immutable/` are requested more or fewer times, appear or go,
 * and the document's `link` preload header changes with them. On the 2026-10-01 forecast that was 79 of 85 network
 * hunks and all 8 header hunks. That is build churn, not behaviour. This check folds it: **one hunk per app**, scope
 * `<app>`, giving the immutable requests a to b (JS and CSS), their bytes when the responses said how many
 * (`content-length`), and how many network and headers differences are this churn.
 *
 * A network difference is churn when its request is under `/_app/immutable/` and the request was made more or fewer
 * times, or on one side only. A status, content type, cache or schema change to the same request is not churn and is
 * never folded. A `link` header difference is churn when every link on both sides points under `/_app/immutable/`.
 *
 * The check ships **informing** (src/compare/levels.ts), with no date. Its hunk is reported and never gates, and
 * network and headers stay exactly as they were, so every churn hunk still needs its claim. At 2.0 it becomes
 * blocking. Then {@link foldAssetChurn} turns each churn hunk into information that names this check ("folded into
 * asset-graph"). The app's one asset-graph hunk is the only one that gates, and one claim on `<app>` covers a
 * re-chunking.
 */
export const ASSET_PATH = /\/_app\/immutable\//;
const LINK_TARGET = /<([^>]*)>/g;

const appOf = (pageKey: string) => pageKey.split(":")[0] ?? pageKey;
const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** A network hunk that is build churn: a request under /_app/immutable/ made a different number of times, or on one side only. */
export function isNetworkChurn(h: Pick<Hunk, "artefact" | "scope" | "summary">): boolean {
  return h.artefact === "network" && ASSET_PATH.test(h.scope) && /(requested \d+× on a, \d+× on b|: new request on b: |: request no longer made on b: )/.test(h.summary);
}

/** The link targets in a header value or a headers hunk's summary. */
function links(text: string): string[] {
  return [...text.matchAll(LINK_TARGET)].map((m) => m[1]!);
}

/** A headers hunk that is build churn: the `link` header, every link on both sides under /_app/immutable/. */
export function isHeaderChurn(h: Pick<Hunk, "artefact" | "scope" | "summary">): boolean {
  if (h.artefact !== "headers" || !h.scope.endsWith("/link")) return false;
  const targets = links(h.summary);
  return targets.length > 0 && targets.every((t) => ASSET_PATH.test(t));
}

export const isAssetChurn = (h: Pick<Hunk, "artefact" | "scope" | "summary">) => isNetworkChurn(h) || isHeaderChurn(h);

/** The page key a network or headers hunk is about: its summary starts with it. */
const pageKeyOf = (h: Pick<Hunk, "summary">) => h.summary.slice(0, h.summary.indexOf(": "));

interface Tally {
  js: number;
  css: number;
  bytes: number;
  /** Requests whose response said how many bytes. */
  sized: number;
  requests: number;
}

function tally(side: SideCapture, pageKeys: Set<string>, app: string): Tally {
  const t: Tally = { js: 0, css: 0, bytes: 0, sized: 0, requests: 0 };
  for (const j of side.journeys) {
    if (j.run !== 1) continue;
    for (const p of j.pages) {
      if (appOf(p.pageKey) !== app || !pageKeys.has(p.pageKey)) continue;
      for (const n of p.network) {
        if (!ASSET_PATH.test(n.url)) continue;
        t.requests += 1;
        if (/\.js(\?|$)/.test(n.url)) t.js += 1;
        else if (/\.css(\?|$)/.test(n.url)) t.css += 1;
        if (typeof n.bytes === "number") {
          t.bytes += n.bytes;
          t.sized += 1;
        }
      }
    }
  }
  return t;
}

/**
 * One hunk per app whose asset graph moved, from the captures (run 1, the pages both sides reached, as network
 * compares them) and the network and headers hunks already found. Severity `fail`: informing until 2.0, so
 * src/compare/levels.ts reports it as information.
 */
export function assetGraph(a: SideCapture, b: SideCapture, hunks: readonly Hunk[]): Hunk[] {
  if (a.external || b.external) return [];
  const pairs = pagePairs(a, b);
  const pageKeys = new Set(pairs.map((p) => p.pageKey));
  const apps = [...new Set(pairs.map((p) => appOf(p.pageKey)))];
  const out: Hunk[] = [];
  for (const app of apps) {
    const churn = hunks.filter((h) => isAssetChurn(h) && appOf(pageKeyOf(h)) === app);
    const ta = tally(a, pageKeys, app);
    const tb = tally(b, pageKeys, app);
    const moved = ta.js !== tb.js || ta.css !== tb.css || (ta.sized === ta.requests && tb.sized === tb.requests && ta.bytes !== tb.bytes);
    if (!churn.length && !moved) continue;
    const net = churn.filter((h) => h.artefact === "network").length;
    const hdr = churn.length - net;
    const bytes = ta.requests && ta.sized === ta.requests && tb.sized === tb.requests ? `, ${kb(ta.bytes)} → ${kb(tb.bytes)}` : ta.requests || tb.requests ? ", bytes not measured (no content-length on every response)" : "";
    out.push({
      id: hunkId("asset-graph", app),
      artefact: "asset-graph",
      scope: app,
      severity: "fail",
      summary: `${app}: the asset graph changed: ${ta.requests} → ${tb.requests} immutable requests (JS ${ta.js} → ${tb.js}, CSS ${ta.css} → ${tb.css})${bytes}; ${net} network and ${hdr} headers difference(s) are this churn`
    });
  }
  return out;
}

/**
 * The fold, by level on `at`. Informing (today): nothing changes, and every churn hunk stays as network and headers found
 * it. Blocking (2.0): each failing churn hunk becomes information naming asset-graph, so the app's one asset-graph
 * hunk is what gates. Hunks that are not churn are returned as they were, the same object.
 */
export function foldAssetChurn(hunks: Hunk[], at: Date, table: EngineLevels = ENGINE_LEVELS): Hunk[] {
  if (levelOn("asset-graph", at, table).level !== "blocking") return hunks;
  return hunks.map((h) => (h.severity === "fail" && isAssetChurn(h) ? { ...h, severity: "info", summary: `${h.summary} (folded into asset-graph)` } : h));
}
