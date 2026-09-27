# main-preview

Written by `.github/workflows/main-preview.yml` ("Main to RC"), one commit per run. Do not edit.

Each run is release mode with production on side a and the monorepo's main (`sha-<short>`) on side b, judged
against main's `release/claims.yaml`: what the next release candidate would get if it were cut today. A
forecast, never a gate or a release record.

- `reports/index.json`: the last 60 runs, newest first, each with its verdict and scorecard headline.
- `reports/<ranAt>-release/report.{json,md,html}` and `scorecard.{json,md}` for each.

See `docs/contract.md`, "Main to RC", on the default branch.
