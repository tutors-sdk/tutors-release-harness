# Clock fixture

Wall-clock time is the most common source of A/A noise, so the harness fixes
it on both sides of the comparison.

**Browser.** Every page the harness drives has its clock frozen with
Playwright's `page.clock.setFixedTime(HARNESS_NOW)` before the first
navigation. Timers still fire; `Date.now()` and `new Date()` return the fixed
instant. Anything the client renders from the clock — "today" in a calendar,
relative times, a copyright year — is identical on both sides.

**Server.** The same instant is passed to every app container as
`HARNESS_NOW` (see `compose.harness.yaml`). This is a contract for the apps to
honour in test builds; a value they ignore today costs nothing and starts
working the release they adopt it. Until then, server-rendered timestamps are
masked in `normalise/masks.yaml` and each mask says so.

What the apps must honour, and how the harness notices when they do not, is a
decision: [docs/harness-now.md](../../docs/harness-now.md).

The default instant is `2026-09-16T09:05:00.000Z`, a Wednesday at five past
nine: the lecture-hall spike in the runway. Override with `HARNESS_NOW` in the
environment or `--now` on the CLI. Both sides always receive the same value;
the harness will not run with two different clocks.
