import type { EngineConfig } from "../normalise/masks.ts";
import type { Artefact, Hunk, InRunNoise, SideCapture } from "../types.ts";
import { axe, consoleMessages, dom, headers, network } from "./engines.ts";
import { focus } from "./extra.ts";

/**
 * In-run noise (since 1.24.0): side a2, a second production stack started beside a and b in the same run (`--a2`),
 * captured for the deterministic artefacts only, once. A difference between a and a2 is the harness's own noise
 * measured in this run, on these images, not a week ago; a difference between a and b that also appears between a and
 * a2 (the same artefact and scope) is noise by measurement.
 *
 * Reported, never judged: the a/a2 differences and the a/b differences they explain are listed beside the nightly A/A,
 * and no verdict, Gate, exit code or count reads them. Replacing the A/A as the noise reference is a 2.0 decision.
 *
 * Deterministic artefacts: what a page is and asks for, not how fast or how it looks in pixels. Timing, screenshots,
 * metrics, logs and load need the repeated runs and the A/A; the images are a's on both, so their static artefacts are
 * equal by construction.
 */
export const A2_ARTEFACTS = ["dom", "network", "console", "headers", "axe", "focus"] as const satisfies readonly Artefact[];

const A2_ENGINES = [dom, network, consoleMessages, headers, axe, focus];

const key = (h: Pick<Hunk, "artefact" | "scope">) => `${h.artefact}\u0000${h.scope}`;

/**
 * The differences between a and a2 a gate would read (severity fail), over the pages both reached in run 1. Run before
 * the a/b comparison, which resets the hunk counter, so the a/b hunk ids are what they would be without a2.
 */
export function a2Hunks(a: SideCapture, a2: SideCapture, config: EngineConfig): Hunk[] {
  const ctx = { config };
  return A2_ENGINES.flatMap((engine) => engine(a, a2, ctx))
    .filter((h) => h.severity === "fail" && (A2_ARTEFACTS as readonly string[]).includes(h.artefact))
    .map((h) => ({ ...h, summary: h.summary.replace(/\bon b\b/g, "on a2") }));
}

/** What the report carries: the a/a2 differences, and which a/b differences have the same artefact and scope. */
export function inRunNoise(a2: SideCapture, aToA2: Hunk[], aToB: Hunk[]): InRunNoise {
  const seen = new Set(aToA2.map(key));
  const scopes = new Map<string, { artefact: string; scope: string; summary: string }>();
  for (const h of aToA2) if (!scopes.has(key(h))) scopes.set(key(h), { artefact: h.artefact, scope: h.scope, summary: h.summary });
  return {
    stack: "a2",
    runs: 1,
    artefacts: [...A2_ARTEFACTS],
    journeys: [...new Set(a2.journeys.map((j) => j.journey))].sort(),
    hunks: [...scopes.values()],
    alsoOnB: aToB.filter((h) => h.severity === "fail" && seen.has(key(h))).map((h) => h.id)
  };
}
