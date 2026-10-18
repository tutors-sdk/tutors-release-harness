# 12 Rule journeys: a student's and a lecturer's side of Tutors, written as EARS Rules

Since 1.43.0 the harness has a fifth journey set, `rules`. Each journey in it is one EARS Rule written in Gherkin in
[`traffic/journeys/features/`](../../traffic/journeys/features), with one scenario a person can read top to bottom. The
harness runs the scenario on both sides and compares every artefact it captures, exactly as it does for the other
journeys. What is new is that the journey says **which behaviour it proves**: its own Rule, and the monorepo Rules its
scenario exercises. A difference on one of its pages, or in its persistence or bus ledger, then reads as "the
behaviour behind Rule 0582 (exercises 0011, 0303) moved", not only "a page changed".

The journeys are grounded on what the monorepo's main does today, never on an open PR. The proposal they come from is
the Claude Doc "Harness user journeys" (Rules 0582 to 0592).

## What runs today

| Rule | Journey | What it drives | Exercises (monorepo Rules) |
| --- | --- | --- | --- |
| 0582 | `rule-0582-signed-in-lab` | sign in as the stub student, open Topic 1 and Lab 1, move to a second step and back | 0011, 0250, 0252, 0260, 0303, 0330 |
| 0583 | `rule-0583-presence` | sign in, pick a course sentiment in the profile menu, open the online list | 0046, 0064, 0280 |
| 0584 | `rule-0584-quiz-notebook-talk` | as the enrolled student: a talk's next slide, a notebook's next cell, a quiz answered, revisited and submitted | 0047, 0049, 0050 |
| 0585 | `rule-0585-preferences` | as the enrolled student: dark appearance and the Dyslexia theme, then a reload keeps both | 0037, 0038, 0039 |
| 0586 | `rule-0586-private-course` | the stub student, whom the private course does not list, is sent to My courses at sign-in and by the course's address | 0011, 0267 |
| 0587 | `rule-0587-calendar-llm` | as the enrolled student: the calendar filtered to assessments, then the course's page for LLMs | 0042, 0284 |
| 0588 | `rule-0588-content-lock` | the lecturer locks Topic 2 in Educator Control; the enrolled student no longer sees it, then sees it greyed out and labelled Locked once the lecturer shows locked content | 0052, 0053, 0054 |
| 0589 | `rule-0589-live` | the stub student, who shares presence, opens Lab 1 of the fixture course; the lecturer opens Tutors Live and finds one course and the student on it | 0330, 0335 |

0582 and 0583 read the fixture course. Since 1.44.0, 0584 to 0587 read the **Rule journeys' course**
([`fixtures/course-server/rules-course`](../../fixtures/course-server/README.md#the-rule-journeys-course-since-1440)):
signed in and private, with a quiz, a notebook, a calendar on fixed dates and an LLM page; since 1.45.0 a second topic,
which 0588 locks. Since 1.46.0, 0589 opens Tutors Live on the side's `liveAuth` (below). The time app and whiteboard
journeys (0590 to 0592) follow as the stubs grow. The ids 0582 to 0599 are reserved for the harness's journeys;
`tests/rule-journeys.test.ts` fails on an id outside that block.

## Running them

```console
pnpm harness journeys                        # every journey; a Rule journey with its Rule and what it exercises
pnpm harness run --mode noise --a <tag> --b <tag> --set rules --runs 3
pnpm harness run --mode noise --a <tag> --b <tag> --journey rule-0583-presence
```

`rules` is in the default sets, so a plain `harness run` runs them too. They need the signed-in reader (`readerAuth`)
on each side, the identity stub and the persistence stub, as the `auth` journey does.

## Reading what they found

- **Page keys** are `<app>:rule-<id>-<name>`, from the step `the page is captured as "<name>"`: `reader-auth:rule-0582-lab-step`.
  A claim names that key as its scope, like any other page.
- **Ledgers** are scoped `rule-<id>-<slug>/<table>`: the rows the journey wrote, by table and method.
- **Causes** (`report.json` `causes.rules`, contract 1.43.0) list the Rule journeys among the unclaimed differences,
  most differences first, with the Rules each exercises and the artefacts that moved. `report.md` and `report.html`
  print them under the cause table; the A3's gap section prints them under its table.
- **A step that fails** fails its journey, and the report's journey error leads with the step and its line:
  `step "When the student presses the button \"confident\"" (traffic/journeys/features/student.feature:37) failed: ...`.

All of this is informational: no verdict, Gate or exit code reads `causes.rules`.

## Writing one

```gherkin
@rule-0583 @ears-event-driven @journey-presence
Rule: When the harness runs the presence journey, it shall ...

  Scenario: A student who shares presence sees themself online (exercises Rules 0046, 0064, 0280)
    Given the student signs in from the course
    When the student presses the button "Profile menu"
    Then the page shows the button "Share Presence · On"
    And the page is captured as "profile-menu"
```

- **Tags on the Rule**: `@rule-NNNN` (the next free id in 0582 to 0599), one `@ears-*` pattern (`ubiquitous`,
  `event-driven`, `state-driven`, `unwanted`, `optional`, `complex`), `@journey-<slug>` (the journey is
  `rule-<id>-<slug>`), and optionally `@role-<role>`: who the identity stub signs in as (`student` by default,
  `enrolled`, `lecturer`, `owner`, `admin`), and `@course-rules` (since 1.44.0): read the Rule journeys' course, not
  the fixture course. Its whitelist lists the `enrolled` role only, so a journey there signs in `@role-enrolled` unless it
  proves the turning away.
- **Two people in one journey** (since 1.45.0): every "the student ..." step can be said of "the lecturer ..."
  instead. The lecturer gets a browser of their own on the same side, signed in through the identity stub as the
  `lecturer` role (the enrollment list names them as an educator), opened the first time a step names them; "the
  student" stays the journey's `@role`. A step that names nobody (`the page shows ...`, `the page is captured as ...`)
  runs in the browser of whoever acted last, so a capture is of that person's page. Both browsers write to the same
  side's persistence stub, so the lecturer's lock reaches the student (see below), and a capture's network and ledger
  hold what both did since the previous capture.
- **The Rule's sentence** is about the harness: when it runs the journey, what it drives and what it compares.
- **The scenario's name** ends `(exercises Rules 0011, 0250-0258)`: ids and ranges as the monorepo numbers them. Since
  1.44.0 a `;` ends the ids and starts a note, for a monorepo scenario that has no Rule yet:
  `(exercises Rules 0011, 0267; whitelist-management.feature "Non-whitelisted student denied access")`.
- **One scenario per Rule.** No Background, Outline, table or doc string: the reader (`traffic/journeys/gherkin.ts`)
  rejects them with the file and line.
- **Every step must be one of the sentences below.** An unbound sentence fails when the journeys load (and so
  `pnpm test`), never halfway through a run. Every journey captures at least one page.
- **Capture after the interaction, not during it.** A capture walks the focus order with Tab, which closes open menus
  and dialogs; open what you want to see, check it, then capture, and use `the student closes every dialog` before
  the next step.

### The steps

- the student signs in from the course: GitHub sign-in through the identity stub, back on the course page
- the student signs in from the course and is turned away: signed in, then sent to My courses, not the course (a private course they are not enrolled on)
- the student opens the course by its address and is turned away: the course URL typed in, then sent to My courses
- the student opens Tutors Live: Live's home page on this side, reading the side's persistence stub (said of the lecturer, since 1.46.0)
- the student opens the topic "Topic 1": its card on the page
- the student opens the lab "Lab 1": its card on the page, then its first step
- the student opens the quiz "Quiz 1" (also talk, note, notebook): its card on the page
- the student goes back to the topic "Topic 1": its link in the breadcrumbs
- the student reloads the page: as the browser's reload button does, then the banner is back
- the student moves to the step "Step 1": its link in the lab's step navigation
- the student presses the button "Profile menu" (also link, tab, menuitem): exact accessible name
- the student presses the button starting "View Online": a name that ends in a count or a state
- the student opens the Preferences menu: its header button (named "Preferences", or "Open Theme Menu" up to 17.0.0), then the dialog "Preferences"
- the student chooses "const" in the group "1. Which keyword declares a constant?": a radio button by its label
- the student selects "Assessments" in the combobox "Show": an option of a select by its label
- the student switches on "Lock Topic 2" (also off): a switch by its accessible name, then it reads as asked
- the student closes the dialog "View Online": Escape, then it is gone
- the student closes every dialog: Escape until none is open (a capture's focus walk may already have closed some)
- the page shows the heading "Lab 1" (a status or alert by its text, present even when visually hidden; also button, link, dialog, tab, checkbox, menuitem, region, navigation, article, status, alert, group, radio, combobox, table, row, progressbar): exact accessible name, visible
- the page shows no heading "Harness Rules Course": nothing visible by that role and exact name
- the page shows the button starting "Share Presence" (also link, row)
- the page shows no link starting "Topic 2" (also button, row): nothing visible whose name starts so
- the card "Topic 2" shows the text "Locked": the article whose heading is the card's title holds the words
- the page shows the Preferences button: named "Preferences", or "Open Theme Menu" up to 17.0.0
- the page shows the text "2 of 4": words on the page that no role names
- the combobox "Theme" shows "Dyslexia": its selected option
- the table "Calendar" has 2 rows: its header row included
- the dialog "View Online" shows the link "Harness Student"
- the button "confident" is pressed: aria-pressed is true
- the lab step "Step 1" is shown: the step's level-1 heading
- the page is captured as "lab-step": every artefact, under the page key <app>:rule-<id>-lab-step

A new sentence goes in [`traffic/journeys/steps.ts`](../../traffic/journeys/steps.ts) with its one-line `doc`; this
list is held to that file by `tests/rule-journeys.test.ts`. Steps use roles and accessible names only, like every
journey: a step that cannot find what it names by role has found an accessibility problem.

## Signing in more than once

The reader's Better Auth limits sign-in paths to 3 requests in 10 seconds per client, and its count resets only after
a 10-second quiet gap. Several Rule journeys sign in one after another, so the harness paces sign-ins per reader
origin (`paceSignIn` in `traffic/journeys/ui.ts`): after two quick sign-ins it waits out the gap. Since 1.44.0 the gap
runs from when a sign-in landed (its callback is its last request), and a sign-in the reader refuses ("Unable to
load") is tried once more after a whole gap; a second refusal fails the journey, naming the limiter. The local edge also
sends `X-Forwarded-For`, as production's edge does, so the reader can name the client and logs no warning about it.

## What the persistence stub keeps (since 1.45.0)

The persistence stub answers reads with an empty table, so nothing one browser writes is seen by another. The content
lock journey needs the opposite: the student's reader reads the course's locks from `tutors_content_locks`, which the
lecturer's reader has just written. So the stub keeps the rows written to that one table until the next journey's
reset and answers reads of it with them (`col=eq.value` filters, `on_conflict` upserts, deletes). Since 1.46.0 it
also keeps `tutors-connect-latest`, the latest learning object of each student who shares presence: Tutors Live reads
it (`gte`, `order` and `limit` too) to show who is online when no Realtime message reaches it, which in the harness is
always. Every other table still reads empty, and the ledger is unchanged: it records the writes, never what is kept.

## Tutors Live reading the stub (since 1.46.0)

Each compose side runs a second Live, `live-auth-a` and `live-auth-b` (host ports 3105 and 3205,
`LIVE_AUTH_PORT_A`/`_B`), with anonymous mode off and the side's persistence stub as its Supabase, as `reader-auth`
is the reader set up that way. Live has no sign-in of its own, so the lecturer's browser just opens it. Its pages are
captured as `live-auth:rule-<id>-<name>`. The plain `live-a` and `live-b` stay anonymous, as before. kind runs no
`live-auth`, so on kind 0589 fails with a step saying so, as the signed-in journeys do without `readerAuth`.

Running locally behind an HTTP proxy, add `.harness.test` to `no_proxy`. Chromium sends a WebSocket to a host it
does not bypass through the proxy, which refuses `persistence-a.harness.test`, and Live's Realtime socket then
logs a 403 on both sides.
