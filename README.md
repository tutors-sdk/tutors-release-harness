# noise

Written by `.github/workflows/nightly-noise.yml`, force-pushed every night. Do not edit.

- `noise-status.json`: the latest A/A result. `release.yml` and `post-deploy.yml` read it; the gate may FAIL a release only while it is clean, verified and no more than seven days old.
- `noise-history.json`: one entry per night, for the ratchet.
- `noise-summary.md`: tonight's summary.

See `docs/noise-burndown.md` on the default branch.
