import { describe, expect, it } from "vitest";
import { diffRegion } from "../src/compare/engines.ts";

/** A pixelmatch-style diff image: grey everywhere, red where pixels differ. */
function diffImage(width: number, height: number, red: [number, number][], yellow: [number, number][] = []) {
  const data = new Uint8Array(width * height * 4).fill(200);
  const paint = ([x, y]: [number, number], rgb: [number, number, number]) => data.set([...rgb, 255], (y * width + x) * 4);
  for (const p of red) paint(p, [255, 0, 0]);
  for (const p of yellow) paint(p, [255, 255, 0]);
  return { width, height, data };
}

describe("screenshot diff region", () => {
  it("boxes every differing pixel, so a log says where on the page the diff is", () => {
    expect(diffRegion(diffImage(100, 50, [[10, 5], [40, 20], [12, 30]]))).toEqual({ x: 10, y: 5, width: 31, height: 26 });
  });

  it("ignores anti-aliasing (yellow) and has no region when nothing differs", () => {
    expect(diffRegion(diffImage(10, 10, [], [[3, 3]]))).toBeUndefined();
    expect(diffRegion(diffImage(10, 10, [[7, 2]], [[0, 0]]))).toEqual({ x: 7, y: 2, width: 1, height: 1 });
  });
});
