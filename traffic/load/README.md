# Load scripts (planned, phase H5)

`k6` scripts used by two modes:

- **timing** (H4): the reader at a fixed request rate for a fixed window on
  each side, three runs per side, p95 compared with Mann–Whitney U in
  `src/compare/timing.ts`. Deterministic artefacts are compared once;
  anything statistical is compared over repeats or not at all.
- **upgrade** (H5): the candidate is rolled in under load, and any 5xx or
  dropped presence during the rollout blocks the release.

Until the scripts exist, timing hunks come from the journeys' own navigation
timing (TTFB, DOMContentLoaded, load) and journey wall-clock, which is enough
to catch a planted 30% SSR regression with `--runs 3`.
