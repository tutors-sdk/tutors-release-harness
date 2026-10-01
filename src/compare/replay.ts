import type { Hunk, SideCapture } from "../types.ts";
import { headers, journeyOutcomes, network } from "./engines.ts";

/**
 * The replay set (since 1.28.0; runway improvement G, after Diffy). A fourth journey set, `replay`: a fixed list of
 * course URLs (traffic/replay/urls.ts), each opened directly on both sides. It gives breadth without new journeys to
 * write. Its pages are compared on **status, headers and network only**, as the `replay` artefact. No other engine
 * sees them: not dom, screenshot, axe, focus, console, timing or persistence. So a page nobody wrote a journey for
 * adds breadth, not noise.
 *
 * Status is the document request's, which network already compares ("status changed"). A replay URL that could not be
 * opened at all is the journey failing on one side, as journeyOutcomes reports it. Every hunk keeps the engine's words
 * and is relabelled `replay`. A network hunk's scope gains its page key (`replay:note-01 GET /note/...`) and a headers
 * hunk keeps its own (`replay:note-01/x-content-type-options`). A claim's glob can name one URL or the whole set
 * (`replay:*`).
 *
 * The check ships **informing** (src/compare/levels.ts), with no date. At 2.0 it may become blocking. The runway puts G
 * after 2.0, so it is the last to be promoted.
 */
export const isReplayJourney = (journey: string) => journey === "replay-course-urls";

/** A side without the replay set's journey: what every other engine compares. The same object when it has none. */
export function withoutReplay(side: SideCapture): SideCapture {
  return side.journeys.some((j) => isReplayJourney(j.journey)) ? { ...side, journeys: side.journeys.filter((j) => !isReplayJourney(j.journey)) } : side;
}

const onlyReplay = (side: SideCapture): SideCapture => ({ ...side, journeys: side.journeys.filter((j) => isReplayJourney(j.journey)) });

/** The replay pages, compared on status, headers and network, as `replay` hunks. Severity as the engines found it. */
export function replay(a: SideCapture, b: SideCapture): Hunk[] {
  const ra = onlyReplay(a);
  const rb = onlyReplay(b);
  if (!ra.journeys.length && !rb.journeys.length) return [];
  const found = [...journeyOutcomes(ra, rb, { config: undefined as never }), ...network(ra, rb, { config: undefined as never }), ...headers(ra, rb, { config: undefined as never })];
  return found.map((h) => {
    const scope = h.artefact === "network" ? `${h.summary.slice(0, h.summary.indexOf(": "))} ${h.scope}` : h.scope;
    return { ...h, id: h.id.replace(/^[a-z-]+:/, "replay:"), artefact: "replay", scope };
  });
}
