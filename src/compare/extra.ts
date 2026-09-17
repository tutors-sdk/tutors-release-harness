import { structuredPatch } from "diff";
import type { EngineConfig } from "../normalise/masks.ts";
import type { Hunk, SideCapture } from "../types.ts";
import { mannWhitney } from "./engines.ts";
import { hunkId, journeyPairs, pagePairs } from "./pages.ts";

type Engine = (a: SideCapture, b: SideCapture, ctx: { config: EngineConfig }) => Hunk[];

// ---- focus (keyboard order) -----------------------------------------------------------

export const focus: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of pagePairs(a, b)) {
    if (!pair.a.focus.length && !pair.b.focus.length) continue;
    const textA = pair.a.focus.join("\n");
    const textB = pair.b.focus.join("\n");
    if (textA === textB) continue;
    const patch = structuredPatch("a", "b", textA, textB, undefined, undefined, { context: 1 });
    hunks.push({
      id: hunkId("focus", pair.pageKey),
      artefact: "focus",
      scope: pair.pageKey,
      path: pair.path,
      severity: "fail",
      summary: `${pair.pageKey}: keyboard order changed (${pair.a.focus.length} stops on a, ${pair.b.focus.length} on b)`,
      detail: patch.hunks.map((h) => h.lines.join("\n")).join("\n...\n")
    });
  }
  return hunks;
};

// ---- persistence ---------------------------------------------------------------------------

function tally(writes: SideCapture["journeys"][number]["persistence"]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of writes) {
    const key = `${w.kind === "rpc" ? "RPC" : w.method} ${w.table}`;
    map.set(key, (map.get(key) ?? 0) + Math.max(1, w.rows));
  }
  return map;
}

/**
 * What each side tried to persist during each journey, by table and method.
 * Two rules: the sides must agree; and an anonymous journey must write nothing.
 */
export const persistence: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  for (const pair of journeyPairs(a, b)) {
    if (pair.a.run !== 1) continue;
    const ta = tally(pair.a.persistence);
    const tb = tally(pair.b.persistence);
    const keys = new Set([...ta.keys(), ...tb.keys()]);
    for (const key of [...keys].sort()) {
      const ca = ta.get(key) ?? 0;
      const cb = tb.get(key) ?? 0;
      const [method, table] = key.split(" ") as [string, string];
      const scope = `${pair.a.journey}/${table}`;
      const isWrite = method !== "RPC";
      if (pair.a.anonymous && isWrite && cb > 0) {
        // The anonymous rule, regardless of what a did.
        const also = ca > 0 ? ` (also ${ca} on a: a product finding, not a release diff)` : "";
        hunks.push({ id: hunkId("persistence", scope), artefact: "persistence", scope, severity: ca > 0 ? "info" : "fail", summary: `${pair.a.journey}: anonymous journey wrote ${cb} row(s) to ${table} (${method}) on b${also}` });
        continue;
      }
      if (ca === cb) continue;
      hunks.push({
        id: hunkId("persistence", scope),
        artefact: "persistence",
        scope,
        severity: "fail",
        summary: `${pair.a.journey}: ${method} ${table} — ${ca} row(s) on a, ${cb} on b`
      });
    }
  }
  return hunks;
};

// ---- load (k6) -------------------------------------------------------------------------------

export const load: Engine = (a, b, ctx) => {
  const hunks: Hunk[] = [];
  if (!a.load || !b.load || a.external || b.external) return hunks;
  const { minEffect, minShiftMs, alpha } = ctx.config.timing;
  const scope = "load/http_req_duration";

  const failRate = (l: NonNullable<SideCapture["load"]>) => (l.requests ? (l.failed + l.serverErrors) / l.requests : 0);
  if (failRate(b.load) > failRate(a.load) + 0.005) {
    hunks.push({ id: hunkId("timing", "load/errors"), artefact: "timing", scope: "load/errors", severity: "fail", summary: `under load, failed or 5xx responses: ${(failRate(a.load) * 100).toFixed(2)}% on a, ${(failRate(b.load) * 100).toFixed(2)}% on b` });
  }

  const effect = a.load.p95 > 0 ? (b.load.p95 - a.load.p95) / a.load.p95 : 0;
  if (effect >= minEffect && b.load.p95 - a.load.p95 >= minShiftMs) {
    const { p } = mannWhitney(a.load.samples, b.load.samples);
    const summary = `under load, p95 ${a.load.p95}ms → ${b.load.p95}ms (+${(effect * 100).toFixed(0)}%), p50 ${a.load.p50}ms → ${b.load.p50}ms, n=${a.load.requests}/${b.load.requests}, p=${p.toExponential(1)}`;
    hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, severity: p < alpha ? "fail" : "info", summary });
  } else if (a.load.p95 > 0 && effect <= -minEffect) {
    hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, severity: "info", summary: `under load, p95 improved ${a.load.p95}ms → ${b.load.p95}ms` });
  }
  return hunks;
};

export const EXTRA_ENGINES: Record<string, Engine> = { focus, persistence, load };
