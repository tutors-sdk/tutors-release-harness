# The replay set (since 1.28.0)

Runway improvement G, after Diffy: breadth without writing journeys. `urls.ts` is a fixed list of
course URLs. The `replay-course-urls` journey (set `replay`, anonymous, read-only) opens each one
directly on both sides, once, with no screenshot, axe or focus walk. Their pages are compared on
**status, headers and network only**, as the `replay` artefact (`src/compare/replay.ts`). No other
engine sees them.

The list is the decision the runway asked for: which course URLs are fixed enough to replay. It
starts with the pinned fixture course (`fixtures/course-server/course`), which this repository
serves and nothing upstream can move. It holds pages no other journey opens: the second topic, a
talk, both notes, a step of the second lab, and a topic that does not exist (a 404 is a result
too). Add a URL only when it is anonymous, read-only and fixed. A published course's URLs belong
here once its content is pinned.

The check is **informing** until 2.0 (`src/compare/levels.ts`): a `replay` finding is reported and
never gates. Its planted mutant is `replay-header` (`mutants/mutants.yaml`).

## Later: replaying production traffic

A sanitised sample of production access logs could feed the same comparison. It would hold paths
and methods only, with no identities and no query strings that carry them, replayed with the same
ordering and pacing, as one JSON line per request (`{"t": <ms offset>, "method": "GET", "path":
"/course/..."}`) and a `SOURCE` file naming the log window and the sanitiser commit. That is not
built.
