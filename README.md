# main-preview

Written by `.github/workflows/main-preview.yml` ("Main to RC"), one commit per run. Do not edit.

Each run is release mode with production on side a and the monorepo's main (`sha-<short>`) on side b, judged
against main's `release/claims.yaml`: what the next release candidate would get if it were cut today. A
forecast, never a gate or a release record.

- `reports/index.json`: the last 60 runs, and every run of the last 10 days, newest first, each with its
  verdict and scorecard headline, (since harness 1.13.1) the Gate, the RCS and its band, the glance and the
  change risk, and (since 1.16.1) the delta: what is new and gone in the unclaimed set since the previous
  forecast beside the same production.
- `reports/<ranAt>-release/report.{json,md,html}` and `scorecard.{json,md}` for each; since 1.13.1 also
  `confidence.json` and `changes.json`, with report.md and report.html led by the Gate, the RCS and its
  band, the reviewer's glance and the change risk per PR, as `harness release` leads its report; since
  1.16.0 also `migration/` and `upgrade/`, the two rehearsals' reports, which `confidence.json` links. Since
  1.16.1 the kept report leads with what is new since the last forecast. Since 1.18.0 also `quality.json`,
  the monorepo's quality record the score's Test signal read (for the commit judged, or the newest before it).
  Since 1.20.1 the lead names each cause's PRs: a new cause against the PRs merged since the last forecast.
  Since 1.20.2 it shows the claims owed, one draft per cause to paste into release/claims.yaml, where the
  glance was.

See `docs/contract.md`, "Main to RC", on the default branch.
