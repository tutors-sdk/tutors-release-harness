# scoreboard

Written by the `scoreboard` job of `.github/workflows/release.yml` (one line per release run) and the `record` job of
`.github/workflows/weekly-mutants.yml` (one line per weekly self-test). Append-only, never forced. Do not edit.

- `scoreboard/releases.jsonl`: one line per release run (`docs/contract/scoreboard-line.schema.json`); a re-run is the same tag with the next run number.
- `scoreboard/mutants.jsonl`: the harness's weekly mutants, caught of planted.

`harness scoreboard trends --file scoreboard/releases.jsonl` reads it; the reports site draws it (scoreboard.html).
See `docs/contract.md`, "The scoreboard", on the default branch.
