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
the monorepo's `release/SOP.md`, and step by step, in the SOP's order, in
[how to run a release](user-guide/10-running-a-release.md).

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
- The RCS is computed only when the Gate is PASS or WARN. Keeping the two separate
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
  (Steps 3 and 4, the changelog and the claims, are the Contributors' work; the
  command reads them, it does not write them.) It stops at step 8, the reviewer's glance, because that is the one step that
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

How the tooling holds to this (since 1.13.0):

| The rule | How the harness keeps it |
| --- | --- |
| The harness starts it, not a person remembering to | `harness release` writes a stub for a Gate FAIL, a Red band, each run rule firing and open countermeasures only rising; an escalated glance mark writes one; the rollback issue carries one |
| The first answers are facts, not recollections | Why 1 is the harness's own trace: the finding, the journeys that reach it, the hunk, the nearest claim and why it did not cover, the PR and its churn, the glance rank and mark, each a link |
| "Human error" is a prompt for the next why | `harness why check` rejects an answer that is only human error, carelessness or a person's name, and says why; blame beside a cause that can be checked is kept |
| The chain ends in a process or a tool | the file says where the chain ends and in which; the check requires both |
| One of seven kinds; a mutant is the best | exactly one kind; a mutant names its path under `mutants/` and the register links it |
| Every 5 Whys has an owner and a due date | the check requires both; `harness release` prints the open and overdue counts for SOP step 12 |
| The register is the record, not a notebook | its table is regenerated from the files and never edited by hand; CI fails when it is out of date |
| A loop that is not closing is itself a finding | each scoreboard line records the open count; three rises open a 5 Whys on the loop |

### The A3: the whole problem on one page

An A3 is Toyota's one sheet of paper for a problem: background, current condition, goal, root
cause, countermeasures, plan and follow-up, read left to right. **`harness a3`** (1.14.0) builds
it from what the harness already keeps, and the pages site shows it as `a3.html`. The final
scoring leads it (Jidoka first: the Gate, then the RCS and its band). The current condition is a
value stream map of a change, from merge to verified in production, with its waits, its
inventory and an andon on the stage that stopped, and four Paretos that cut out the vital few.
Each root-cause question is answered from the data and links to the 5 Whys in `kaizen/` that
goes deeper; countermeasures, plan and follow-up are the register. What was not read says "not
measured". It is advisory: it never changes a verdict.

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
  dimensions are re-run only to add samples (`harness local gate --runs 5`;
  `harness release` always runs 3), and the release PR says so.
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

The companion is built in five phases, one per release cycle. Before C0 comes the
one command, so that every later phase runs through it. The tooling of every
phase is now built. Building a phase is not the same as meeting its gate: each
gate is about use, and only real releases can meet it. Until a gate is met, the
phase stays advisory, as C0's score does.

| Phase | Adds | Built in | Gate to the next phase: evidence still to come from real releases |
| --- | --- | --- | --- |
| One command | `harness release --candidate <tag>`: build, test and report with no prompts in between | harness 1.8.0 | It runs a real candidate end to end |
| C0 Score | `confidence.json`: Gate first, then the RCS and its band, advisory at first | harness 1.9.0 | 3 releases scored |
| C1 Changes | `harness changes --a --b`: churn, hotspots, test delta, review coverage and dependency movement, with one risk line per PR | harness 1.10.0 | Change risk explains a drop |
| C2 Scoreboard | `scoreboard/releases.jsonl`, the trends and the run rules | harness 1.11.0 | 6 releases plotted |
| C3 SOP and glance | The monorepo's `release/SOP.md`, and the glance in the report | harness 1.12.0, and the SOP in the monorepo | 2 glances recorded |
| C4 5 Whys | `harness why`, `harness why check`, and the kaizen register (`kaizen/README.md`, `harness why register`) | harness 1.13.0 | Countermeasures verified closed |

The last gate needs the whole loop to work once: a trigger opens a 5 Whys, a
countermeasure lands, and a later release is written into `Verified by`. The
register starts empty, and entries are not invented to fill it.

C0 starts advisory. Three real releases show whether the weights match the
team's judgement before any band is allowed to hold a release.
