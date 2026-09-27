# Lean in the harness

The harness answers one question well: *is every observable difference
claimed?* That answer is binary by design, and it stays binary. It does not say
how confident we should be in a candidate that passed, whether that confidence
is rising or falling from one release to the next, or where a reviewer with
fifteen minutes should look first. The Release Confidence companion adds those
three things on top of the harness, without changing what the harness measures.

Lean is how we think about it. This guide sets out that view: the five Lean
ideas, where each one lives in a release, and the rules that stop the numbers
from taking over. It is written for anyone who runs, reviews or changes a Tutors
release. It explains why the tooling is shaped the way it is; how to use each
command is covered in [local.md](local.md), [contract.md](contract.md) and
the monorepo's `release/SOP.md`.

## The five ideas

| Lean idea | What it means here | Where it lives |
| --- | --- | --- |
| **Jidoka** (stop the line) | The gate stops the line on an unclaimed difference, and no number talks it back on. | `src/gate.ts`: the verdict PASS, WARN or FAIL, and the exit code |
| **Visual management** | One percentage, broken down, that the whole team reads the same way. | The Release Confidence Score in `confidence.json`, and the scoreboard trends |
| **Standard work** | A release is a repeatable sequence of steps. Each step has an owner, an input and a done-when. | The monorepo's `release/SOP.md`, and the one command `harness release` that scripts its steps 2 to 7 |
| **Gemba** (go and see) | Go to the artefact and look. | The reviewer's glance: at most seven ranked places to look, each linked to the exact hunk |
| **Kaizen** (continuous improvement) | Every escape or drop in confidence ends in a countermeasure that improves the harness, a spec or the SOP. It never ends in blaming a person. | `harness why`, which writes the 5 Whys, and the register in `kaizen/README.md` |

### Jidoka: the gate stops the line

- A release gets two results, always in this order:
  1. the **Gate** (PASS, WARN or FAIL, exactly as `gate.ts` decides it);
  2. the **Release Confidence Score** (RCS, 0 to 100).
- The RCS is computed only when the Gate is not FAIL. Keeping the two separate
  is what stops a percentage from arguing with a red light.
- A FAIL is a FAIL at RCS 99.
- The score is never an input to `gate.ts` and never changes an exit code.
- When the line stops, the harness says where and why: `line stopped at <stage>:
  <why>`, followed by the next standard step. A dirty A/A stops the line before
  any A/B is attempted. Missing images stop it at resolve. An unclaimed
  difference stops it at release.

### Visual management: one number, broken down

- The RCS is a weighted mean of eight dimensions, each scored from things the
  harness or the monorepo already produce:

  | Dimension | Weight |
  | --- | --- |
  | Claim coverage | 20 |
  | Noise health | 15 |
  | Statistical margin | 10 |
  | Rehearsals | 10 |
  | Test signal | 15 |
  | Requirements traceability | 10 |
  | Change risk | 15 |
  | Post-deploy history | 5 |

- Every dimension has a floor. Below it, the RCS is capped at 74, so one hollow
  dimension cannot hide behind seven strong ones.
- Bands are fixed and cannot be tuned per release:

  | Band | RCS | What happens |
  | --- | --- | --- |
  | **Green** | 90 or more | Ship on the captain's say. |
  | **Amber** | 75 to 89 | Ship only after the reviewer's glance is recorded as verified. |
  | **Red** | below 75 | Hold, open a 5 Whys, and do not re-run hoping for a better number. |

- The board is read over time, not only on the day. Each release appends one line
  to the scoreboard. The trends show:
  - the RCS against its bands;
  - the eight dimensions as small multiples;
  - mask count, and masks that never fired;
  - claims per release, and stale claims;
  - hotspot recurrence;
  - per-file and per-contributor risk.
- Run rules from statistical process control act on trends, not on a single bad
  release. Either of these opens a kaizen item:
  - three consecutive declines in a dimension;
  - two of three releases below 75.
- The board also shows whether the harness itself is getting better: mutants
  caught, how clean the noise runs are, and days since the last A/A failure. A
  harness that is quietly decaying shows up in the same picture as the product.

### Standard work: the release SOP

- The SOP is the standard work sheet for every release. It sits beside
  `claims.yaml` in the monorepo and has:
  - three roles:
    - the **Captain** runs the release and owns the go or no-go;
    - the **Reviewer** owns the glance, and never authored a PR in the release;
    - the **Contributors** own their claims and EARS files;
  - twelve steps, each with one owner;
  - a done-when for every step that is a file or a recorded action, never a feeling.
- Skipping a step does not make a release faster. It makes a release with an
  undocumented deviation, and deviations are logged in the kaizen register.
- Steps 2 to 7 are scripted as one command, `harness release --candidate <tag>`.
  It stops at step 8, the reviewer's glance, because that is the one step that
  must stay human. The command:
  - asks nothing;
  - retries nothing silently;
  - always leaves a report behind, even when it fails.
- The SOP is versioned like code. A change to it is a PR with a reason, ideally
  the 5 Whys that motivated it. That is how standard work improves without
  drifting.

### Gemba: go to the artefact and look

- The glance is the top of the report and of the PR comment:
  - the Gate;
  - the RCS and its band;
  - at most seven ranked items.
- Each item is a one-line finding that links straight to the artefact hunk, the
  claim that covers it and the PR that caused it.
- Items are ranked by novelty × exposure: how unusual the finding is against the
  last six releases, times how much of the journey set it touches.
- A reviewer asked to "review the report" reads what is easy. A reviewer handed
  seven ranked places to look reads what matters.
- The reviewer marks each item with one of three marks, and those marks are the
  whole job:
  - **verified:** looked, and agrees with the claim;
  - **disputed:** looked, and does not agree; it becomes a new claim or a hold;
  - **escalated:** cannot tell from the artefacts; it becomes a 5 Whys on why the
    harness could not show it.
- The ranking is visible in `confidence.json`, so it can be reviewed too. When a
  regression escapes past a verified glance, the 5 Whys asks whether the glance
  ranked the right thing.

### Kaizen: from a finding to a countermeasure

- A 5 Whys opens on four triggers, and none is optional:
  - a Gate FAIL on a candidate the team wanted to ship;
  - a Red band;
  - a rollback issue from post-deploy;
  - a run rule firing on the scoreboard.
- The harness starts it, not a person remembering to. `harness why` writes the
  kaizen file with the first answers already filled in from the harness's own
  trace, so they are facts rather than recollections.
- Every answer must be checkable against an artefact, a PR or a document. "Human
  error" is not an answer; it is a prompt for the next why.
- The chain ends when the answer is a process or a tool. The countermeasure is
  always one of seven kinds, because those are the seven things the team
  controls:
  - a mutant;
  - a journey;
  - a mask review;
  - an EARS spec;
  - claim guidance;
  - an SOP change;
  - a glance rule.
- A new mutant is the best countermeasure: it turns the escape into a permanent
  self-test.
- The register (`kaizen/README.md`) lists every 5 Whys with its trigger,
  countermeasure kind, owner and due date, and the release in which it was
  verified closed.
- Open countermeasures are plotted over time. A count that only rises means the
  loop is not closing, and that is itself a run-rule trigger.

## Guardrails

A percentage is only useful while nobody is optimising for it, so the same
discipline that protects masks protects the score.

- **The Gate wins.** A FAIL is a FAIL at RCS 99. The score never feeds
  `gate.ts` and never changes an exit code.
- **Weights and bands change only by PR, with a 5 Whys attached.** A change never
  lands in the release it would benefit. It takes effect on the next release's
  scoreboard line, tagged, so the trend shows the discontinuity.
- **Every deduction is explainable, or the rule that made it is removed.** Every
  point lost names a hunk, a PR, a file or a run. If the report cannot show where
  a point went, that rule is not ready. A dimension the harness cannot measure yet
  is reported as not measured; it is never quietly scored 100.
- **Re-running to get a better number is a logged deviation.** Statistical
  dimensions are re-run only to add samples (`--runs 5`), and the report says so.
- **Contributor risk lines are for trends and glances, not for people's
  reviews.** First contributions are flagged as a fact, not a penalty. The
  register records countermeasures to the system, and "a person was careless" is
  never a countermeasure.
- **Know where to stop:** eight dimensions, seven glance items, twelve SOP steps,
  seven countermeasure kinds. Add one only when a 5 Whys shows a real escape the
  current set could not have surfaced. The harness applies the same rule to
  journeys and mutants.

## What stays as it was

Two principles from the harness README are unchanged:

- Power comes from breadth of capture per journey, not from the number of
  journeys, so nothing in the companion adds journeys.
- A mask is a blind spot you chose. Growth in masks is watched as a trend, not
  treated as housekeeping.

## Build order

The companion is built in five phases, one per release cycle. Each phase is
gated on evidence from real releases, not on a date. Before C0 comes the one
command, so that every later phase runs through it.

| Phase | Adds | Gate to the next phase |
| --- | --- | --- |
| One command | `harness release --candidate <tag>`: build, test and report with no prompts in between | It runs a real candidate end to end |
| C0 Score | `confidence.json`: Gate first, then the RCS and its band, advisory at first | 3 releases scored |
| C1 Changes | `harness changes --a --b`: churn, hotspots, test delta, review coverage and dependency movement, with one risk line per PR | Change risk explains a drop |
| C2 Scoreboard | `scoreboard/releases.jsonl`, the trends and the run rules | 6 releases plotted |
| C3 SOP and glance | The monorepo's `release/SOP.md`, and the glance in the report | 2 glances recorded |
| C4 5 Whys | `harness why` and the kaizen register | Countermeasures verified closed |

C0 starts advisory. Three real releases show whether the weights match the
team's judgement before any band is allowed to hold a release.
