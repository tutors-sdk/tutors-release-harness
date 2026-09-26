# Example: release gate, 16.2.1 → 16.2.2

A real run, checked in so the report and its scorecard can be read without an
Actions token and without running anything. It was the first run of
`release.yml`: [run 36241969041](https://github.com/tutors-sdk/tutors-release-harness/actions/runs/36241969041),
dispatched by hand on 2026-09-26 with `production=16.2.1`, `candidate=16.2.2`,
`runs=5` and no claims file (neither tag has a `release/claims.yaml`).

| File | What it is |
| --- | --- |
| `report.json`, `report.md`, `report.html` | The release-mode report, byte for byte as the run kept it on the `release-records` branch |
| `scorecard.json`, `scorecard.md` | `pnpm harness scorecard --report examples/release-16.2.1-to-16.2.2` over that report |

`tests/examples.test.ts` recomputes the scorecard from `report.json` and fails
if it differs from the checked-in one, so a change to the scoring shows up here as
a diff to review.

## What it says

- **Verdict FAIL, score 40/100 (D).** 38 diffs, none claimed, because nobody
  wrote claims for 16.2.2. That is the expected result for a release with no
  claims: every observable change is listed for someone to own.
- **Normalness: normal.** The run consulted the nightly A/A of 26 Sep 07:57,
  which was clean (0 diffs) on verified images, so these diffs are not noise.
- **16 of the 38 diffs come from how side a was obtained.** 16.2.1 is not in
  Quay, so the harness built it from the `v16.2.1` tag (reported as
  `built-from-ref`). A local build carries no cosign SBOM attestation (the
  `sbom` and `vulns` "not collected" diffs) and lacks two OCI labels the
  published images have (`image-manifest`). Pushing 16.2.1 to Quay, or
  comparing two published tags, removes these.
- **The rest is what changed for a student**, and is what the "test by hand"
  list points at:
  - topic pages: DOM and screenshot changes (0.60% of pixels). This is
    consistent with the 16.2.2 CHANGELOG entry "Card summaries: markdown in the
    summary line ... now renders on the card" (PR #263). That is an inference: no
    claim ties them yet.
  - the reference course topic page: five one-line DOM changes;
  - keyboard focus order changed on nine pages with the same number of stops;
  - new console messages on the catalogue home page and the signed-in topic page.
- **Load:** 600 requests per side, no failures; p95 2.30 ms on 16.2.1 and
  2.04 ms on 16.2.2.
- The migration rehearsal passed. The upgrade rehearsal failed; its report is
  only in the run's `upgrade-report` artifact.

## Turning this into a passing release

Add a `release/claims.yaml` to the release branch with one claim per intended
change (`pnpm release:claims:draft` drafts them from the Rules that changed),
publish `rules.json` with `pnpm release:rules`, and dispatch the gate again with
`claims_url` and `rules_url`. The scorecard's Rule table then shows each Rule,
the diffs it covered and its PRs, and anything left over stays at the top of the
"test by hand" list.
