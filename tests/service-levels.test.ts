/**
 * The harness's own service levels (since 1.35.0): freshness and rates on the readiness page. Opinionated, advisory,
 * and a ratchet: the targets are pinned here.
 */
import { describe, expect, it } from "vitest";
import type { WeeklyMutants } from "../src/a3/quality.ts";
import { buildReadiness, nightsUpTo } from "../src/readiness/model.ts";
import { renderReadiness } from "../src/readiness/render.ts";
import { SERVICE_LEVEL_NIGHTS, SERVICE_LEVEL_TARGETS, buildServiceLevels, type ServiceLevelInputs } from "../src/readiness/service-levels.ts";
import type { AaNight } from "../src/readiness/soak.ts";

const NOW = new Date("2026-10-11T12:00:00Z");
const nights = (states: string[]) => nightsUpTo(NOW, states.length).map((night, i) => ({ night, state: states[i] as never, forecasts: [] }));
// tonight, then 14 finished nights
const ALL_JUDGED = nights(["not yet", ...Array(SERVICE_LEVEL_NIGHTS).fill("judged")]);
// one A/A a night at 02:00, tonight's included (tonight is left out of the rate, not of freshness)
const aaEvery = (hunks = 0, degraded: string[] = []): AaNight[] => ALL_JUDGED.map((n) => ({ ranAt: `${n.night}T02:00:00.000Z`, hunks, degraded }));
const mutants = (caught: number | null, total = 17, ranAt = "2026-10-06T03:00:00.000Z"): WeeklyMutants[] => [{ ranAt, caught, total }];
const build = (over: Partial<ServiceLevelInputs> = {}) =>
  buildServiceLevels({ now: NOW, nights: ALL_JUDGED, forecasts: [{ ranAt: "2026-10-11T02:30:00.000Z" }], aa: aaEvery(), mutants: mutants(17), ...over });
const level = (s: ReturnType<typeof build>, id: string) => s.levels.find((l) => l.id === id)!;

describe("the targets", () => {
  it("are pinned: a ratchet, raised by PR, never lowered to make the panel green", () => {
    expect(SERVICE_LEVEL_TARGETS).toEqual({ forecastMaxAgeHours: 26, aaMaxAgeHours: 26, mutantsMaxAgeHours: 192, nightsJudged: 0.9, aaClean: 0.9, mutantsCaught: 1 });
    expect(SERVICE_LEVEL_NIGHTS).toBe(14);
  });
});

describe("the harness's own service levels", () => {
  it("a harness that ran every night, clean, holds all six", () => {
    const s = build();
    expect(s.levels.map((l) => [l.id, l.holds])).toEqual([
      ["forecast-fresh", true],
      ["aa-fresh", true],
      ["mutants-fresh", true],
      ["nights-judged", true],
      ["aa-clean", true],
      ["mutants-caught", true]
    ]);
    expect(s.headline).toBe("All 6 hold.");
    expect(level(s, "forecast-fresh").value).toBe("10 hours old");
    expect(level(s, "nights-judged").value).toBe("14 of 14 nights (100%)");
  });

  it("freshness: a forecast three days old is missed, and says how old", () => {
    const s = build({ forecasts: [{ ranAt: "2026-10-08T02:00:00.000Z" }] });
    expect(level(s, "forecast-fresh")).toMatchObject({ holds: false, value: "3 days old" });
    expect(s.headline).toMatch(/^5 of 6 hold; missed: forecast-fresh\./);
    expect(level(build({ forecasts: [] }), "forecast-fresh")).toMatchObject({ holds: false, value: "none kept" });
  });

  it("rates: two failed nights of fourteen is 86%, under 90%; unchanged nights count as judged", () => {
    const states = ["running", ...Array(10).fill("judged"), "unchanged", "unchanged", "not judged", "did not run"];
    expect(level(build({ nights: nights(states) }), "nights-judged")).toMatchObject({ holds: false, value: "12 of 14 nights (86%)" });
  });

  it("an unclean or degraded A/A breaks the clean rate", () => {
    const aa = aaEvery();
    aa[1] = { ...aa[1]!, hunks: 3 };
    aa[2] = { ...aa[2]!, degraded: ["cached"] };
    expect(level(build({ aa }), "aa-clean")).toMatchObject({ holds: false, value: "12 of 14 nights (86%)" });
  });

  it("a mutant that escaped, or a self-test that could not run, misses mutants-caught", () => {
    expect(level(build({ mutants: mutants(16) }), "mutants-caught")).toMatchObject({ holds: false, value: "16 of 17 mutants (94%)" });
    expect(level(build({ mutants: mutants(null) }), "mutants-caught").holds).toBe(false);
    expect(level(build({ mutants: mutants(17, 17, "2026-09-30T03:00:00.000Z") }), "mutants-fresh")).toMatchObject({ holds: false, value: "11 days old" });
  });

  it("what was not read is not judged, never guessed", () => {
    const s = buildServiceLevels({ now: NOW, nights: nights(["not yet", ...Array(14).fill("not known")]), forecasts: [] });
    expect(s.levels.filter((l) => l.holds === null).map((l) => l.id)).toEqual(["aa-fresh", "mutants-fresh", "nights-judged", "aa-clean", "mutants-caught"]);
    expect(level(s, "aa-fresh").value).toBe("not read");
  });

  it("is on the readiness page and in readiness.json", () => {
    const r = buildReadiness({ now: NOW, harness: "1.35.0", forecasts: [], github: "not read", aa: aaEvery(), mutants: mutants(17) });
    expect(r.serviceLevels.levels).toHaveLength(6);
    const html = renderReadiness(r);
    expect(html).toContain('id="service-levels"');
    expect(html).toContain("The harness's own service levels:");
    expect(html).toContain('<a href="#service-levels">service levels</a>');
  });
});
