# Kaizen register

Every escape, and every drop in confidence, ends here: in a countermeasure to the system,
never in blame. This directory holds one file per 5 Whys, and this page lists them all. The
Lean view behind it is [docs/lean.md](../docs/lean.md) ("Kaizen"); the release SOP reviews
this register at step 12.

## What opens a 5 Whys

The harness starts it, not a person remembering to. `harness release` writes a stub into its
own `<timestamp>-release-command/kaizen/` for each trigger that fires, and `post-deploy.yml`
puts one in the rollback issue:

| Trigger | Opened by | `--finding` |
| --- | --- | --- |
| Gate FAIL on a release run | `harness release` | `gate` |
| Red band (RCS below 75) | `harness release` | `band` |
| Rollback issue (post-deploy mode FAIL) | `post-deploy.yml`, in the issue body | `rollback` |
| A run rule on the scoreboard | `harness release` | `<rule>:<series>`, e.g. `three-declines:change-risk`; `countermeasures-rising` for this register's own rule |
| An escalated glance mark | `harness glance mark --mark escalated` | `<glance kind>:<key>` |

Any other finding can be opened by hand: `harness why --run <run dir | release dir> --finding
<hunk id>` (a hunk id from `report.json`).

## How to use it

1. **Open.** Take the stub the harness wrote, or run `harness why --run <dir> --finding <id>`
   from this checkout (it writes into `kaizen/`). Why 1 is already answered: the harness's own
   trace of the finding, with links to the hunk, the claim and the PR.
2. **Ask why, four more times at most.** Each answer is checkable against an artefact, a PR or a
   document. "Human error" is not an answer; it is the prompt for the next why. Stop at the
   first answer that is a process or a tool, and say so (`Chain ends at`, `Ends in`).
3. **Choose one countermeasure**, of exactly one of the seven kinds the team controls: **mutant**,
   **journey**, **mask review**, **EARS spec**, **claim guidance**, **SOP change**, **glance rule**.
   A mutant is the best kind: it turns the escape into a permanent self-test, so name its path
   under `mutants/`.
4. **Give it an owner and a due date**, then check it: `harness why check kaizen/<file>.md`.
5. **Add it to the register** in a PR: the file, and this table regenerated with
   `harness why register --write`. CI runs both checks, so the register stays honest.
6. **Close it** when a release shows the countermeasure working: put that release in
   `Verified by` and regenerate. Open countermeasures go on the scoreboard with every release;
   a count that only rises is itself a run rule, and opens a 5 Whys on the loop.

The rows below are generated from the files. Do not edit them by hand: edit the 5 Whys, then
run `harness why register --write`. This header is written by people and is left alone.

## The register

<!-- register:start -->
| 5 Whys | Trigger | Release | Countermeasure | Owner | Due | Verified closed in |
| --- | --- | --- | --- | --- | --- | --- |

No 5 Whys yet.
<!-- register:end -->
