# 13 What the user journeys check

This chapter is for anyone, technical or not, who reads a harness result and wants to know what the user journeys
actually did and why a difference matters. Each section starts in plain words and then goes a level deeper. For how to
write a journey, see [12 Rule journeys](12-rule-journeys.md).

## In one minute

The release harness acts out short scripted visits to Tutors and checks that a new build behaves exactly like the
release students use today. Eleven of those visits, the **user journeys** (Rules 0582 to 0592), are written as sentences
a student or lecturer would recognise: sign in, open a lab, answer a quiz, lock a topic, read the time app, draw on a
whiteboard.

Each journey runs twice, once against each build, in two identical sealed copies of Tutors that have fake sign-in, fake
GitHub and a fake database. Anything that comes out different is listed: what is on screen, what was saved, what went
over the network, what an accessibility checker finds. Someone has to explain each difference before a release ships.

- **Plain terms:** a robot student and a robot lecturer do the same things on the old and the new Tutors, side by side,
  and the harness reports every difference.
- **Technical terms:** each journey is an EARS Rule in a Gherkin feature file
  ([`traffic/journeys/features`](../../traffic/journeys/features)), bound to Playwright steps by role and accessible
  name, run against two compose stacks that differ only in their application images. Every page it captures is
  recorded as artefacts (DOM, screenshot, network, console, headers, axe, focus, persistence, realtime and more),
  normalised and diffed.

## How to read a result

A result is one of four words. The same build compared with itself (an **A/A**, run every night on the production
release) should always be clean; a difference there means the harness needs fixing, not Tutors.

| Word | Plain meaning | Technical meaning |
| --- | --- | --- |
| PASS | The new build did everything the old one did, the same way. | No failing hunk in any artefact; exit 0. |
| WARN | Something differs, but the harness has not yet earned the right to block on it. Read the reasons. | Findings exist but the gate may not fail (the noise status is not clean, verified and fresh, or the evidence is weak); exit 0. |
| FAIL | Something differs and nobody has explained it. A person must look before release. | Unclaimed hunks in a gating mode; exit 1. A claim in the release's `claims.yaml`, or a declared CHANGELOG hint, turns an expected difference into an explained one. |
| DEGRADED | The check could not see enough to judge, so even a clean result does not count. | A journey failed on both sides, or an image was not pulled and signature-verified in that run; the A/A is not counted as clean. |

When a journey itself breaks (a step cannot find the button it names), that is reported first and loudest. On one side
only, the build broke that journey. On both sides, the journey no longer fits Tutors and the harness must change.

## The journeys, one by one

Six journeys act as a student and five involve a lecturer. Each names the monorepo Rules (Tutors' own EARS specs) it
exercises, so a difference on its pages points back to the requirement it touches.

| Rule | Who | What the person does | What it protects | What it checks, technically | Exercises |
| --- | --- | --- | --- | --- | --- |
| 0582 | Student | Signs in, opens Topic 1 and Lab 1, moves to another step and back. | Signing in works, and a lab visit is recorded once per page. | GitHub sign-in through the identity stub; lab step navigation; learning-record writes counted in the ledger. | 0011, 0250, 0252, 0260, 0303, 0330 |
| 0583 | Student | Picks how they feel about the course, then opens the online list. | Presence and sentiment show up for others. | Sentiment buttons (`aria-pressed`) in the profile menu; the View Online dialog lists the student; presence writes. | 0046, 0064, 0280 |
| 0584 | Enrolled student | Moves through a talk, a notebook and a quiz; answers, revisits and submits. | Learning content keeps its place and a quiz marks correctly. | Slide and cell navigation; quiz radios; the result, a visually hidden `role=status`. | 0047, 0049, 0050 |
| 0585 | Enrolled student | Turns on dark mode and the Dyslexia theme, then reloads. | Accessibility preferences stick. | The Preferences dialog; the Theme combobox; both survive a reload; screenshots in both appearances. | 0037, 0038, 0039 |
| 0586 | Student not on the list | Signs in to a private course they are not enrolled on, then types its address. | Private courses stay private. | Whitelist enforcement at sign-in and by direct URL: sent to My courses both times. | 0011, 0267 |
| 0587 | Enrolled student | Filters the calendar to assessments, then opens the page for AI tools. | Deadlines are findable and the LLM export works. | A calendar on fixed dates around the harness clock; the Show combobox; the course's LLM page and its downloads. | 0042, 0284 |
| 0588 | Lecturer and student | The lecturer locks Topic 2; the student stops seeing it, then sees it greyed out as Locked. | Lecturers control what students can open. | Two browser contexts; the Educator Control switch; the topic card hidden, then shown with the text Locked. | 0052, 0053, 0054 |
| 0589 | Lecturer and student | A student opens a lab; the lecturer opens Tutors Live and finds them. | Lecturers can see who is working on what, live. | Live's Courses (1) and Students tabs, reading the side's persistence stub; Realtime broadcasts relayed by the stub. | 0330, 0335 |
| 0590 | Lecturer | Opens the time app past its PIN; reads the medians and the calendar by week and by day. | Time-on-task totals and medians are computed right. | Two students' calendar rows seeded; PIN 4321 from the course's `tutors.json`; tables captured below the heat maps. | 0319 |
| 0591 | Lecturer | Reads labs by lab and by step, the learning records and the least engaged student's page. | Lab analytics and the per-student view are right. | Three students' lab records seeded; row order and totals; the student's page. | 0319 |
| 0592 | Enrolled student, alone | Opens the course whiteboard, switches to Edit and draws one stroke. | Drawing saves once and costs no Realtime when nobody else is on the board. | The Excalidraw editor in an iframe (Excalidraw and React from `esm.sh`, recorded once); one freehand stroke; `Drawing changes saved`; the `whiteboard_scenes` write and the Realtime cost compared. | 0275, 0276 |

The seven older journeys check what an anonymous visitor reads: the fixture course, its search, the catalogue and Live
home pages, a plain sign-in, a reference course, and a fixed list of course URLs replayed.

## The container approach

**In plain words:** the harness builds two copies of Tutors in sealed boxes on one machine. The two copies are identical
except for the version of Tutors inside them. Everything Tutors would normally reach out to (GitHub, the database, the
course website) is replaced by a stand-in that always answers the same way. So when the two copies behave differently,
the only possible cause is the version of Tutors.

**Technically:** [`compose.harness.yaml`](../../compose.harness.yaml) starts one Docker Compose project with two sides,
`a` (the baseline, usually production) and `b` (the candidate).

| Part | Per side or shared | What it is | Why it is there |
| --- | --- | --- | --- |
| `reader`, `catalogue`, `live`, `time` | per side | The four Tutors apps from the images under test, in anonymous mode | The reading surfaces the older journeys drive |
| `reader-auth` and its edge | per side | A second reader with sign-in on, behind a small proxy that sets `X-Forwarded-For` as production's edge does | Signed-in journeys (0582 to 0588), sign-in rate limits behaving as in production |
| `live-auth`, `time-auth` | per side | Live and the time app with anonymous mode off, reading the side's persistence stub | The lecturer journeys 0589 to 0591 |
| `persistence` | per side | A small Node stub that speaks the Supabase REST and Realtime protocols | Every write a side makes is recorded and attributed to that side (the ledger); seeded rows and broadcast relay on request |
| `identity` | shared | A GitHub OAuth stub with a fixed address and a test CA the readers trust | Sign-in without GitHub; one role per run (student, enrolled, lecturer) |
| `course` | shared | A static server for the fixture course (8080) and the Rule journeys' course (8081) | Both sides read the same bytes of the same course |
| `edge`, `a2` | profiles | A proxy in front of both readers (rolling upgrade); a second copy of side a (in-run noise) | Upgrade rehearsal; measuring noise inside one run |

Every app container runs as production does: read-only root filesystem, no Linux capabilities, `no-new-privileges`, a
health check on `/healthz/live`, JSON logs. Nothing may differ between the sides except the image reference; any other
difference would show up as the harness's own noise.

**Where the images come from.** For a release, the harness pulls the published images from `quay.io/tutors-sdk`, pins
each to its digest and verifies its cosign signature against the monorepo's `image-build.yml` workflow before compose
starts ([images](../images.md)). Compose never pulls an app image itself. An image not pulled and verified in that run
makes the run DEGRADED. Locally, the images can be the monorepo's own build (`tutors/<app>:local`).

**What is held still.** Wall-clock time is frozen in every browser at `HARNESS_NOW` (2026-09-16 09:05 UTC) and passed to
every container ([clock](../../fixtures/clock/README.md)). Fonts, icons, KaTeX and the whiteboard's editor, which the
apps load from third-party hosts, are fetched once and answered from a recorded copy on both sides
([noise burn-down](../noise-burndown.md)). Each journey starts from a reset persistence stub. Sign-ins are paced to
stay under the reader's rate limiter.

## How a journey is validated

**In plain words:** the harness does not take its own word for it. Every night it compares production with itself, and
that must come out clean. Every week, and on every change to the harness, it plants deliberate faults in Tutors and
checks that it catches each one. Only when both of those hold is the harness allowed to fail a release.

**Technically,** a journey's result is trusted in four layers:

1. **The steps find things the way a person does.** Steps locate elements by ARIA role and accessible name only, never
   by CSS selector. A step that cannot find what it names has found an accessibility problem or a real change. Each
   step sentence and its one-line doc live in [`traffic/journeys/steps.ts`](../../traffic/journeys/steps.ts), and a
   unit test keeps the guide's step list equal to it.
2. **What is captured is normalised.** Before two pages are compared, values that differ for reasons nobody cares about
   (the side's host names, generated ids, storage keys such as `sb-persistence-a-`) are rewritten to placeholders, and
   the remaining known blind spots are masks, each in its own reviewed change ([masks](../../normalise/masks.yaml)).
3. **The A/A proves the comparison is quiet.** The nightly A/A runs every journey, five times per side, on the
   production tag. It must produce zero failing hunks, with every image verified, within the last seven days, before
   the Gate may fail anything. A journey that fails on both sides of an A/A makes it DEGRADED, so a broken journey can
   never pass as quiet.
4. **The mutants prove the comparison is loud.** The self-test builds sixteen deliberately broken variants of the
   production images (a dropped header, a route answering 500, a console error, a missing alt text, a changed focus
   order, a slower server, a swapped base image, an added package and more) and checks that each is caught and
   attributed to the artefact it should move ([mutants](../../mutants/README.md)). Every harness pull request runs it,
   after an A/A of all journeys on the production tag, so a new journey must work on production before it can merge.

Since 1.43.0 a difference on a journey's page carries its Rule, so the A3 can say which behaviour moved: its page key is
`<app>:rule-<id>-<name>`, and the Rule names the monorepo Rules it exercises.

**What validating 0592 looked like.** The whiteboard's editor loads from `esm.sh`. The first CI A/A failed on both sides
at the Draw tool: Excalidraw keeps its tool radios visually hidden under their icons, so a plain click never lands. The
step now selects the tool past its icon, and the next A/A on 17.0.0 was clean.

## What the journeys do not check

The journeys compare two builds; they do not say whether either is right in absolute terms. A behaviour that is wrong
on both sides passes, which is why the findings below were raised on their own.

- Real GitHub, Supabase and Netlify: everything external is a stub. The post-deploy check covers the live site.
- Two people on one whiteboard, running notebook code (it would fetch Pyodide), and load: one robot per role, a handful
  of rows each.
- Speed is advisory: timings are flagged against control-chart limits as outliers to investigate, never a failure.

## What they found on the monorepo's main

Found while the journeys were built against main `83d4ccf`. Each is a monorepo pull request that names the journey that
found it.

| Finding | Effect for a person | Found by | Fix |
| --- | --- | --- | --- |
| The course page for LLMs links `https` on an `http` course | The LLM downloads break on a course served over http | 0587 | monorepo #506 (Rule 0600) |
| The time app makes a new Supabase client for every read | About one first load in eight never finishes | 0590, 0591 | monorepo #507 (Rule 0601) |
| Labs by lab and by step key a lab by its last path segment | Two topics' Lab 1 add up into one column | 0591 | Rule 0602 |
| The time app reads the PIN from `<id>.netlify.app` only | A course served anywhere else never opens past the PIN | 0590, 0591 | Rule 0603 |
| The heat maps lay out differently from one load to the next | Their screenshots never compare; the journeys capture the tables below | 0590, 0591 | Rule 0604 |
| A turned-away student still has the private course in Recently accessed | The course's name and card are shown to someone it turned away | 0586 | Rule 0605 |

## Technical reference

| What | Where |
| --- | --- |
| The Rules | [`traffic/journeys/features/student.feature`](../../traffic/journeys/features/student.feature), [`lecturer.feature`](../../traffic/journeys/features/lecturer.feature) |
| The steps | [`traffic/journeys/steps.ts`](../../traffic/journeys/steps.ts), parsed by `gherkin.ts`, built into journeys by `rules.ts` |
| The Rule journeys' course | [`fixtures/course-server/rules-course`](../../fixtures/course-server/README.md), built from the monorepo's own scaffolder by `scripts/build-rules-course.sh` |
| The stubs | [`fixtures/identity`](../../fixtures/identity), [`fixtures/persistence`](../../fixtures/persistence), [`fixtures/edge`](../../fixtures/edge) |
| Run one locally | `pnpm harness run --mode noise --a local --b local --runs 3 --journey rule-0592-whiteboard --no-load` |
| Where they run | The nightly A/A, Main to RC (the A3), every release run, and every harness PR's mutants check |
| Adding one | [12 Rule journeys, Writing one](12-rule-journeys.md#writing-one); ids 0593 to 0599 are reserved |
