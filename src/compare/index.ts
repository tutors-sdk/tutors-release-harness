import type { EngineConfig } from "../normalise/masks.ts";
import type { Hunk, SideCapture } from "../types.ts";
import { ENGINES, type EngineContext } from "./engines.ts";
import { EXTRA_ENGINES } from "./extra.ts";
import { imageStatic } from "./image-static.ts"; // R5
import { resetHunkIds } from "./pages.ts";
import { RUNTIME_ENGINES } from "./runtime.ts";

/** Run every diff engine over two normalised captures. Deterministic: same inputs, same hunks in the same order. */
export function compareCaptures(a: SideCapture, b: SideCapture, config: EngineConfig, captureDir?: string): Hunk[] {
  resetHunkIds();
  const ctx: EngineContext = captureDir ? { config, captureDir } : { config };
  const hunks: Hunk[] = [];
  for (const engine of Object.values(ENGINES)) hunks.push(...engine(a, b, ctx));
  for (const engine of Object.values(EXTRA_ENGINES)) hunks.push(...engine(a, b, ctx));
  hunks.push(...imageStatic(a, b, ctx)); // R5 static image artefacts
  // R5 runtime artefacts (contract 1.2.0)
  for (const engine of Object.values(RUNTIME_ENGINES)) hunks.push(...engine(a, b, ctx));
  return hunks;
}

export { mannWhitney } from "./engines.ts";
