import { describe, expect, it } from "vitest";
import { erfc, mannWhitney, normalCdf, normalUpperTail, smallestAttainableP } from "../src/compare/stats.ts";

/**
 * Known values, derived by hand or from published tables, never from the code under test.
 *
 * The bug this file exists for: `normalCdf` once passed z to the erf
 * approximation where Phi(z) = 0.5 * (1 + erf(z / sqrt 2)) needs z / sqrt 2.
 * That reads the table at z * sqrt 2, so 5 v 5 perfectly separated reported
 * p = 0.0004 where the right answer is 0.0122.
 */

/** 0..n-1 and n..2n-1: every x below every y, the most separated two samples can be. */
const low = (n: number) => Array.from({ length: n }, (_, i) => i);
const high = (n: number, from = n) => Array.from({ length: n }, (_, i) => from + i);

describe("erfc and the normal CDF", () => {
  it("matches published values of Phi", () => {
    // Phi(z) from standard tables (10 decimals); the approximation's fractional error is 1.2e-7.
    const table: [number, number][] = [
      [0, 0.5],
      [1, 0.8413447461],
      [-1, 0.1586552539],
      [1.96, 0.9750021049],
      [-1.96, 0.0249978951],
      [2.5758293035, 0.995],
      [3, 0.998650102],
      [-3, 0.001349898]
    ];
    for (const [z, phi] of table) expect(normalCdf(z)).toBeCloseTo(phi, 6);
  });

  it("keeps its precision in the tail, where verdicts are decided", () => {
    // 1 - Phi(5) = 2.8665157e-7, 1 - Phi(8) = 6.2209606e-16: cancellation in 1 - erf would give 0 or noise.
    expect(Math.abs(normalUpperTail(5) / 2.8665157e-7 - 1)).toBeLessThan(1e-5);
    expect(Math.abs(normalUpperTail(8) / 6.2209606e-16 - 1)).toBeLessThan(1e-5);
    expect(normalUpperTail(20)).toBeGreaterThan(0); // no underflow to exactly 0 far past anything a harness sample reaches
  });

  it("erfc reflects: erfc(x) + erfc(-x) = 2, and erfc(0) = 1", () => {
    expect(erfc(0)).toBeCloseTo(1, 7);
    for (const x of [0.3, 1, 2.2, 4]) expect(erfc(x) + erfc(-x)).toBeCloseTo(2, 7);
  });

  it("Phi is symmetric and monotone", () => {
    for (const z of [0.1, 0.5, 1, 1.7, 2.5, 4]) expect(normalCdf(z) + normalCdf(-z)).toBeCloseTo(1, 7);
    let last = -1;
    for (let z = -6; z <= 6; z += 0.25) {
      const v = normalCdf(z);
      expect(v).toBeGreaterThan(last);
      last = v;
    }
  });
});

describe("mannWhitney: hand-derived known values", () => {
  // Each perfectly separated n v n case: U = 0, mu = n*n/2, sigma = sqrt(n*n*(2n+1)/12),
  // z = (mu - 0.5) / sigma (continuity correction), p = 2 * (1 - Phi(z)).

  it("5 v 5: mu = 12.5, sigma = sqrt(25*11/12) = 4.7871, z = 12 / 4.7871 = 2.5068, p = 0.0122", () => {
    const { u, p } = mannWhitney(low(5), high(5));
    expect(u).toBe(0);
    expect(p).toBeCloseTo(0.0122, 4); // the buggy code gave 0.0004
  });

  it("3 v 3: mu = 4.5, sigma = sqrt(9*7/12) = 2.2913, z = 4 / 2.2913 = 1.7457, p = 0.0809", () => {
    expect(mannWhitney(low(3), high(3)).p).toBeCloseTo(0.0809, 4); // the buggy code gave 0.014
  });

  it("4 v 4: mu = 8, sigma = sqrt(16*9/12) = sqrt 12 = 3.4641, z = 7.5 / 3.4641 = 2.1651, p = 0.0304", () => {
    expect(mannWhitney(low(4), high(4)).p).toBeCloseTo(0.0304, 4);
  });

  it("2 v 2: mu = 2, sigma = sqrt(4*5/12) = 1.2910, z = 1.5 / 1.2910 = 1.1619, p = 0.2453", () => {
    expect(mannWhitney(low(2), high(2)).p).toBeCloseTo(0.2453, 4);
  });

  it("6 v 6: mu = 18, sigma = sqrt(36*13/12) = 6.2450, z = 17.5 / 6.2450 = 2.8023, p = 0.0051", () => {
    expect(mannWhitney(low(6), high(6)).p).toBeCloseTo(0.0051, 4);
  });

  it("5 v 5 with one adjacent pair swapped: U = 1, z = 11 / 4.7871 = 2.2978, p = 0.0216", () => {
    const { u, p } = mannWhitney([0, 1, 2, 3, 5], [4, 6, 7, 8, 9]);
    expect(u).toBe(1);
    expect(p).toBeCloseTo(0.0216, 4);
  });

  it("4 v 4 with one adjacent pair swapped: U = 1, z = 6.5 / 3.4641 = 1.8764, p = 0.0606: no longer below 0.05", () => {
    expect(mannWhitney([0, 1, 2, 4], [3, 5, 6, 7]).p).toBeCloseTo(0.0606, 4);
  });

  it("unequal sizes, 3 v 5 separated: mu = 7.5, sigma = sqrt(15*9/12) = 3.3541, z = 7 / 3.3541 = 2.0870, p = 0.0369", () => {
    expect(mannWhitney(low(3), high(5, 3)).p).toBeCloseTo(0.0369, 4);
  });

  it("a large separated sample is decisive (200 v 200: z = 19.9) and does not underflow to 0", () => {
    const { p } = mannWhitney(low(200), high(200));
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1e-50);
  });
});

describe("mannWhitney: properties", () => {
  it("is symmetric in its arguments", () => {
    const x = [4, 8, 15, 16, 23];
    const y = [42, 3, 9, 11, 30, 2];
    expect(mannWhitney(x, y).p).toBeCloseTo(mannWhitney(y, x).p, 12);
    expect(mannWhitney(x, y).u).toBe(mannWhitney(y, x).u);
  });

  it("depends on ranks only: a monotone rescale of the data changes nothing", () => {
    const x = [4, 8, 15, 16, 23];
    const y = [42, 3, 9, 11, 30];
    expect(mannWhitney(x.map((v) => v * 1000 + 7), y.map((v) => v * 1000 + 7)).p).toBeCloseTo(mannWhitney(x, y).p, 12);
  });

  it("p never rises as the samples separate further", () => {
    // Slide y up past a fixed x of 6, half a unit at a time: from fully interleaved to fully separated.
    const x = [10, 11, 12, 13, 14, 15];
    let last = 2;
    for (let shift = 0; shift <= 20; shift += 0.5) {
      const { p } = mannWhitney(x, x.map((v) => v + 0.25 + shift));
      expect(p).toBeLessThanOrEqual(last + 1e-12);
      last = p;
    }
    expect(last).toBeCloseTo(smallestAttainableP(6, 6), 12);
  });

  it("the perfectly separated p falls as n grows", () => {
    let last = 2;
    for (let n = 2; n <= 12; n += 1) {
      const p = smallestAttainableP(n, n);
      expect(p).toBeLessThan(last);
      last = p;
    }
  });

  it("p is always in [0, 1]", () => {
    const cases: [number[], number[]][] = [[[1], [2]], [[1, 1, 1], [1, 1, 1]], [low(7), high(7)], [[5, 5, 6], [5, 6, 6, 7]]];
    for (const [x, y] of cases) {
      const { p } = mannWhitney(x, y);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});

describe("mannWhitney: boundaries", () => {
  it("identical samples give p = 1 (U = mu, and the continuity correction never goes below 0)", () => {
    expect(mannWhitney([5, 5, 5, 5], [5, 5, 5, 5]).p).toBe(1);
    expect(mannWhitney([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]).p).toBe(1);
  });

  it("1 v 1: mu = 0.5, sigma = 0.5, z = (0.5 - 0.5) / 0.5 = 0, p = 1: one observation a side can never be significant", () => {
    expect(mannWhitney([1], [100]).p).toBe(1);
  });

  it("an empty side has no evidence: p = 1, not NaN", () => {
    expect(mannWhitney([], [1, 2, 3]).p).toBe(1);
    expect(mannWhitney([1, 2, 3], []).p).toBe(1);
    expect(mannWhitney([], []).p).toBe(1);
  });

  it("ties across the sides take average ranks: [1,2,2] v [2,3,4]", () => {
    // Pooled 1,2,2,2,3,4 has ranks 1, 3, 3, 3, 5, 6. R1 = 1 + 3 + 3 = 7, U1 = 7 - 6 = 1, U2 = 9 - 1 = 8, U = 1.
    // mu = 4.5, sigma = 2.2913, z = (3.5 - 0.5) / 2.2913 = 1.3093, p = 0.1904.
    const { u, p } = mannWhitney([1, 2, 2], [2, 3, 4]);
    expect(u).toBe(1);
    expect(p).toBeCloseTo(0.1904, 3);
  });
});

describe("smallestAttainableP: the fewest samples that can ever reach alpha", () => {
  it("is the p of a perfectly separated pair", () => {
    expect(smallestAttainableP(5, 5)).toBeCloseTo(0.0122, 4);
    expect(smallestAttainableP(3, 3)).toBeCloseTo(0.0809, 4);
  });

  it("n v n first reaches alpha 0.05 at 4 (3 v 3 cannot), 0.01 at 6, 0.001 at 8", () => {
    const least = (alpha: number) => [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((n) => smallestAttainableP(n, n) < alpha);
    expect(least(0.05)).toBe(4);
    expect(least(0.01)).toBe(6);
    expect(least(0.001)).toBe(8);
  });

  it("with an empty side nothing can be judged (p = 1)", () => {
    expect(smallestAttainableP(0, 5)).toBe(1);
  });
});
