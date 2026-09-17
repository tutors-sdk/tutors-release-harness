import type { JourneyCapture, PageCapture, SideCapture } from "../types.ts";

export interface PagePair {
  journey: string;
  run: number;
  pageKey: string;
  path: string;
  a: PageCapture;
  b: PageCapture;
}

/** Pair up the pages both sides reached in the same journey and run. */
export function pagePairs(a: SideCapture, b: SideCapture, onlyRun: number | undefined = 1): PagePair[] {
  const pairs: PagePair[] = [];
  for (const ja of a.journeys) {
    if (onlyRun !== undefined && ja.run !== onlyRun) continue;
    const jb = b.journeys.find((j) => j.journey === ja.journey && j.run === ja.run);
    if (!jb) continue;
    for (const pa of ja.pages) {
      const pb = jb.pages.find((p) => p.pageKey === pa.pageKey);
      if (pb) pairs.push({ journey: ja.journey, run: ja.run, pageKey: pa.pageKey, path: pa.path, a: pa, b: pb });
    }
  }
  return pairs;
}

export function journeyPairs(a: SideCapture, b: SideCapture): { a: JourneyCapture; b: JourneyCapture }[] {
  return a.journeys.flatMap((ja) => {
    const jb = b.journeys.find((j) => j.journey === ja.journey && j.run === ja.run);
    return jb ? [{ a: ja, b: jb }] : [];
  });
}

let counter = 0;
export function hunkId(artefact: string, scope: string): string {
  counter += 1;
  return `${artefact}:${scope.replace(/[^a-z0-9:/_.-]/gi, "_")}:${counter}`;
}
export function resetHunkIds() {
  counter = 0;
}
