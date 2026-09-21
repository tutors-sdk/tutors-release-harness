# Load scripts

One [k6](https://k6.io) script, `reader.js`: a constant arrival rate of `GET` requests
(home, the course page, `/healthz/live`, in rotation) against one base URL. k6 is a
container, not a dependency (`grafana/k6:latest`; pin it with `HARNESS_K6_IMAGE`,
`harness doctor` warns while it is not pinned). Environment: `BASE` (required),
`COURSE`, `RATE` (requests per second, default 20), `DURATION` (default `20s`).

It is used by two modes.

- **The load leg of a run: `--load <rate>x<duration>`** (e.g. `--load 20x30s`, what
  `release.yml` and `nightly-noise.yml` pass). After the journeys, `src/collectors/load.ts`
  runs the script once against each side's reader and keeps every request's duration
  (k6's `--out json`, capped at 2000 samples) and the count of failed and 5xx
  responses. The `load` engine (`src/compare/extra.ts`, artefact `timing`, scope
  `load/http_req_duration` and `load/errors`) compares them: a p95 that rose by the
  configured effect and shift is tested with Mann-Whitney U at the configured alpha;
  more failed or 5xx responses on b than on a is a finding at once. When there are too
  few samples to ever reach alpha the hunk says so and is `info`; raise the rate or the
  duration. Without `--load` nothing runs.
- **upgrade mode** (`--upgrade-seconds`, `--upgrade-rate`, `src/modes/upgrade.ts`): the
  same script runs through the `edge` proxy while the candidate is rolled in. The
  edge tags every response with `x-harness-upstream`, recorded as the `upstream` tag
  of the `edge_*` metrics, so a failure names its side. Any failed or 5xx request
  blocks the release.

The journeys' own navigation timing (TTFB, DOMContentLoaded, load) and wall-clock are
a separate, cheaper signal, compared by the `timing` engine over `--runs` repetitions
(three cannot reach alpha 0.05; five is recommended, and the mutant `slow-ssr` runs five).
Thresholds in `reader.js` are informational: the harness judges the exported samples,
not k6's own pass or fail.
