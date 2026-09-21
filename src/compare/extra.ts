import { structuredPatch } from "diff";
import type { EngineConfig } from "../normalise/masks.ts";
import type { Hunk, SideCapture } from "../types.ts";
import { notCollectedHunk, requirements } from "../not-collected.ts";
import { mannWhitney, smallestAttainableP } from "./stats.ts";
import { ledgerHunks } from "./ledger.ts";
import { hunkId, pagePairs } from "./pages.ts";

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

/**
 * What each side tried to persist during each journey, by table and method.
 * Two rules (src/compare/ledger.ts): the sides must agree; and an anonymous
 * journey must write nothing. It reads the normalised `PersistenceWrite`
 * records only, so it does not know which backend recorded them.
 */
export const persistence: Engine = (a, b) =>
  ledgerHunks(a, b, {
    artefact: "persistence",
    unit: "row(s)",
    anonymousVerb: "wrote",
    entries: (j) => j.persistence.map((w) => ({ operation: w.kind === "rpc" ? "RPC" : w.method, target: w.table, count: w.rows, isWrite: w.kind !== "rpc" }))
  });

// ---- bus (topics published) ---------------------------------------------------------------

/**
 * What each side published to the message bus during each journey, by topic:
 * the same two rules as persistence, when both sides collected bus traffic.
 * A side that collected against one that did not is one informational hunk,
 * never a failure (a live deployment has no recorder). Neither side collecting
 * yields nothing here by default, the loud "not collected" being the collector's
 * job (its run log line and `capture.json`): no bus exists yet, so a hunk on every
 * report would be noise. When a pipeline requires the artefact
 * (HARNESS_REQUIRE_ARTEFACTS=bus) the gap is a failing `bus/not-collected` hunk
 * (src/not-collected.ts), except against a live deployment, which has no recorder.
 */
export const bus: Engine = (a, b) => {
  const bothCollected = a.bus?.collected === true && b.bus?.collected === true;
  const hunks = bothCollected
    ? ledgerHunks(a, b, {
        artefact: "bus",
        unit: "message(s)",
        anonymousVerb: "published",
        entries: (j) => j.bus?.map((p) => ({ operation: "PUBLISH", target: p.topic, count: p.messages, isWrite: true }))
      })
    : [];
  if (!bothCollected && (a.bus?.collected || b.bus?.collected)) {
    const side = a.bus?.collected ? "a" : "b";
    hunks.push({ id: hunkId("bus", "collection"), artefact: "bus", scope: "collection", severity: "info", summary: `bus traffic was collected on ${side} only; no bus comparison was possible` });
  }
  if (!a.external && !b.external && requirements().required.has("bus")) {
    const gaps = [["a", a.bus], ["b", b.bus]].flatMap(([side, s]) => (s && typeof s === "object" && s.collected === false ? [{ side: side as "a" | "b", reason: s.reason }] : []));
    if (gaps.length) hunks.push(notCollectedHunk({ artefact: "bus", scopeSubject: "bus", what: "bus traffic", side: gaps.length === 2 ? "both" : gaps[0]!.side, reason: gaps.length === 2 && gaps[0]!.reason !== gaps[1]!.reason ? `a: ${gaps[0]!.reason}; b: ${gaps[1]!.reason}` : gaps[0]!.reason }));
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
    const shift = `under load, p95 ${a.load.p95}ms → ${b.load.p95}ms (+${(effect * 100).toFixed(0)}%), p50 ${a.load.p50}ms → ${b.load.p50}ms, n=${a.load.requests}/${b.load.requests}`;
    // Normally hundreds of samples a side, but a k6 run that lost most of its requests can leave too few to ever reach alpha: say so.
    const floor = smallestAttainableP(a.load.samples.length, b.load.samples.length);
    if (floor >= alpha) {
      hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, severity: "info", summary: `${shift}; ${a.load.samples.length}/${b.load.samples.length} samples cannot reach alpha ${alpha} (best possible p=${floor.toFixed(3)}). Raise --load's rate or duration` });
      return hunks;
    }
    const { p } = mannWhitney(a.load.samples, b.load.samples);
    const summary = `${shift}, p=${p.toExponential(1)}`;
    hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, severity: p < alpha ? "fail" : "info", summary });
  } else if (a.load.p95 > 0 && effect <= -minEffect) {
    hunks.push({ id: hunkId("timing", scope), artefact: "timing", scope, severity: "info", summary: `under load, p95 improved ${a.load.p95}ms → ${b.load.p95}ms` });
  }
  return hunks;
};

export const EXTRA_ENGINES: Record<string, Engine> = { focus, persistence, bus, load };
