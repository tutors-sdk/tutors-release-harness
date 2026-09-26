# release-records

Written by the `publish-record` job of `.github/workflows/release.yml`, one commit per judged candidate. Do not edit.

- `releases/<candidate>.json`: what release mode judged for that candidate (`docs/contract/release-record.schema.json`).
- `releases/<release>.json`: the newest candidate of that release that could ship. `post-deploy.yml` reads this one.
- `reports/index.json`: every judged candidate, newest first; `reports/<ranAt>-release/report.{json,md,html}` for each.

See `docs/contract.md`, "The release record", on the default branch.
