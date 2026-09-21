# Decision: `HARNESS_NOW` and time-derived stats

Status: decided; the contract below is for the apps, the probe is the harness's.

## The problem

`live` will gain daily, weekly and monthly stats. A stat like "views today" or
"this week" depends on *now*. The harness runs both sides at the same moment
with a frozen clock ([fixtures/clock](../fixtures/clock/README.md)): Playwright
freezes `Date` in the browser and every app container gets the same
`HARNESS_NOW`. What the server derives from the clock is either the frozen
instant (deterministic) or the real time (noise). Decide which before the
feature lands, or the first release that carries it is judged on noise.

The noise is the worst kind. Stats labelled from the wall clock differ between
two sides started seconds apart only when a boundary falls between them:
midnight UTC for the day, Monday for the week, the first for the month. A/A is
clean almost every night and dirty, unreproducibly, when one of those instants
lands mid-run, so the ratchet ("A/A reaches 0 and stays there") can neither
pass nor be debugged. Post-deploy mode is worse: it compares a capture recorded
at release time with production days later, so a wall-clock stat differs every
time. A mask would hide the stat entirely, which is the feature's whole point.

## Decision

**Stats derived from the frozen instant are deterministic and the apps must
derive them that way. Anything derived from the real wall clock is noise, and
is either masked with a reason or, better, not rendered.**

### The contract the apps honour

1. **Read `HARNESS_NOW` once at process start.** When set, it is an ISO 8601 UTC
   instant (`2026-09-16T09:05:00.000Z`). When unset (production), use the real
   clock. An unparsable value is a startup error, not a silent fall back.
2. **One `now()` in one place.** Every server-side use of the current time that
   can reach a response body, a header other than `Date`, a cache key or a
   database query goes through it: stat windows (today, this week, this month,
   "last 7 days"), "last updated", relative times rendered server-side,
   copyright years, cache and expiry arithmetic.
3. **Windows are computed from that instant, in UTC.** A day is the UTC
   calendar day containing `now()`. A week starts on a stated day (state it in
   the app; the harness has no opinion). A month is the UTC calendar month.
   The bucket *labels* are part of what is compared, so they come from `now()`
   too.
4. **The real clock is still right for what is not rendered:** durations and
   latency, timeouts, retry backoff, log timestamps, `/metrics`, and the `Date`
   header Node sets itself. Logs and the `Date` header are masked; the rest
   never reaches the comparison.
5. **`HARNESS_NOW` is never set in production.** The harness's compose file and
   kind manifests set it; the monorepo's overlays must not. An app that finds
   it set logs one line saying its clock is frozen, so a stray value is
   visible.
6. **The stub data is the data.** The persistence stub answers every read with
   an empty table, so under the harness the stats are empty windows. That is
   still worth comparing: the *windows, labels and shape* are what a release
   can break. Stats over seeded rows are a later fixture (a journey with data),
   not something to fake in the app.

### The limit: post-deploy mode

Point 5 has a cost. Production never has `HARNESS_NOW`, so in post-deploy mode
the recorded side (frozen) and the live side (real clock) can never agree on a
server-derived time stat, however well the app behaves. The honest handling is
a mask limited to `modes: [post-deploy]` naming the stat routes, with that
reason, added when `live` gains them; not an app that honours `HARNESS_NOW` in
production. Everything in release, noise and upgrade modes stays comparable.

## How the harness detects an app that ignores it

The plan proposed comparing "the server-stamped date in a response" against
the frozen instant. The `Date` header is the obvious candidate and the wrong
one: Node writes it on every response whatever the app does, which is why it is
masked (`response-date` in `normalise/masks.yaml`). Reading it would call every
app a violator.

What works without touching an app: **the browser's clock is frozen, so any
instant in a captured page that is near the real time of the capture, and not
near the frozen instant, was stamped by the server.** `src/clock-probe.ts`
(`probeClock`) reads the aria snapshots and the `last-modified` and `expires`
headers of a capture, finds ISO-style instants and dates, and classifies each
as the frozen clock, the wall clock (within 30 minutes of `capturedAt`, or the
same UTC day for a date-only string) or neither (a course's start date is data,
not a clock). Verdicts:

| Verdict | Meaning |
| --- | --- |
| `honours` | server-stamped instants found, all the frozen one |
| `ignores` | at least one instant is the real time of the capture |
| `no-evidence` | nothing in the capture carries a server-stamped instant. Today's honest answer for most apps: not a pass |
| `indistinguishable` | the frozen instant is within the tolerance of the capture, so the clocks cannot be told apart (run with `--now` set to a different day) |

It is pure and tested (`tests/clock-probe.test.ts`) and **not yet wired into a
report**: wiring it changes what a report says, which is a contract decision
(a new informational artefact or a `reasons` line) for the maintainer. The
intended use is attribution. Nightly A/A already turns a wall-clock stamp into
a `dom` hunk when a boundary falls between the sides; the probe says *why*
("`live` ignores `HARNESS_NOW`: `2026-09-21` on a page frozen at
`2026-09-16`") before a mask is written. It also fails safe: it can only ever
say `ignores` from an instant it saw.

It cannot see a stamp the page never renders (a cache key, a query bound), and
it needs the capture to be on a different day from the frozen instant. For
certainty, the opt-in canary needs one small app change: a route that returns
its own `now()` (a `/healthz` field or the existing build-info endpoint the
plan asks for in M20). The harness would fetch it and compare with
`HARNESS_NOW`, and the probe would become a fallback for apps that lack it.

## What the monorepo does

- Add the single `now()` helper in the shared library and read `HARNESS_NOW`
  there (plan item M16), and have `live`'s stats use it from their first commit.
- Keep the wall clock out of anything rendered.
- Optionally expose `now()` on the build-info route.

Until an app adopts this, its server-rendered timestamps stay masked and each
mask says so, as the clock README already promises.
