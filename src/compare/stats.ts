/**
 * The statistics the timing, load and startup engines share. Dependency-free.
 *
 * The test is a two-sided Mann-Whitney U with the normal approximation and a
 * continuity correction: fine for the small samples the harness produces, and
 * the same function is used for every engine so that one fix (or one bug) is
 * everywhere at once. `docs/noise-burndown.md` and `TESTING.md` describe how
 * the engines use it; `tests/stats.test.ts` holds the known values.
 */

/**
 * The complementary error function, erfc(x) = 1 - erf(x), for any x.
 * Numerical Recipes' Chebyshev fit (3rd ed., section 6.2): a fractional error
 * below 1.2e-7 *everywhere*, which matters here because the p-values that
 * decide a verdict live in the tail, where `1 - erf(x)` would cancel to noise
 * (and to exactly 0 for the thousands of samples a k6 run produces).
 */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

/**
 * The standard normal CDF, Phi(z) = 0.5 * (1 + erf(z / sqrt 2)) = 0.5 * erfc(-z / sqrt 2).
 * The argument of erf is z / sqrt 2, not z: passing z straight in (as the harness
 * did before 1.3.0) reads Phi at z * sqrt 2, which made every p-value too small.
 */
export function normalCdf(z: number): number {
  return 0.5 * erfc(-z / Math.SQRT2);
}

/** The upper tail 1 - Phi(z), computed directly so it keeps its precision for large z. */
export function normalUpperTail(z: number): number {
  return 0.5 * erfc(z / Math.SQRT2);
}

/** Two-sided Mann-Whitney U with normal approximation and continuity correction. Ties get average ranks. */
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
  const p = 2 * normalUpperTail(Math.max(z, 0));
  return { u, p: Math.min(1, Math.max(0, p)) };
}

/**
 * The smallest p this test can produce for samples of these sizes: the p of a
 * perfectly separated pair (every x below every y). If that is not below alpha,
 * no difference, however large, could ever be judged significant with that many
 * samples, and the engine must say so rather than pass quietly. n v n at alpha
 * 0.05: 3 v 3 gives 0.081 (cannot), 4 v 4 gives 0.030 (can).
 */
export function smallestAttainableP(n1: number, n2: number): number {
  return mannWhitney(Array.from({ length: n1 }, (_, i) => i), Array.from({ length: n2 }, (_, i) => n1 + i)).p;
}

/**
 * The smallest slowdown a comparison could have detected (since 1.20.3): reported beside a timing verdict, never judged.
 * `x` is side a, `y` side b. b's samples are scaled to a's median, keeping b's spread, then slowed uniformly by d; the
 * smallest d, on a grid of `step` (0.5%), at which the test says p < alpha is the slowdown these samples could have told
 * from noise. Slowing b only moves its ranks up, so p falls as d grows and a binary search over the grid finds it in a
 * dozen tests, even for a k6 run's thousands of samples. null when no slowdown could be detected (too few samples:
 * smallestAttainableP is not below alpha), none up to `cap` (500%) is, or a median is not positive.
 */
export function smallestDetectableSlowdown(x: number[], y: number[], alpha: number, step = 0.005, cap = 5): number | null {
  if (!x.length || !y.length || smallestAttainableP(x.length, y.length) >= alpha) return null;
  const mx = middle(x);
  const my = middle(y);
  if (!(mx > 0) || !(my > 0)) return null;
  const centred = y.map((v) => (v * mx) / my);
  const detects = (i: number) => mannWhitney(x, centred.map((v) => v * (1 + i * step))).p < alpha;
  let hi = Math.round(cap / step);
  if (!detects(hi)) return null;
  let lo = 0;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (detects(mid)) hi = mid;
    else lo = mid;
  }
  return hi * step;
}

function middle(xs: number[]): number {
  const s = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/**
 * "smallest slowdown 5/5 runs could detect: about 38%": beside a timing verdict, so a "not significant" says how large a
 * slowdown would have had to be to show. Wording only: nothing judges it.
 */
export function detectableNote(xs: number[], ys: number[], alpha: number, unit: "runs" | "samples" = "runs"): string {
  const d = smallestDetectableSlowdown(xs, ys, alpha);
  const n = `${xs.length}/${ys.length}`;
  if (d === null && smallestAttainableP(xs.length, ys.length) >= alpha) return `no slowdown could be detected with ${n} ${unit}`;
  return d === null ? `no slowdown up to 500% could be detected with ${n} ${unit}` : `smallest slowdown ${n} ${unit} could detect: about ${(d * 100).toFixed(0)}%`;
}
