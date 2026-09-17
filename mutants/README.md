# Mutants

Deliberately broken candidate images the harness must catch. Each is the
production reader image plus one planted fault, listed in `mutants.yaml` with
the artefact the report must attribute it to.

```bash
pnpm harness mutants --base 16.2.0          # builds six images, runs A/A then six A/B runs
```

The self-test first runs noise mode on the base (so the harness has the right
to fail anything), then release mode against each mutant. It passes only when
every mutant produces a FAIL verdict with an unclaimed hunk of the expected
artefact. Run it weekly; run it whenever a mask or an engine changes.

## How faults are planted

`wrap.mjs` replaces the image's command: it starts the real server on an
internal port and proxies port 3000 to it, applying the fault at the HTTP
edge — a dropped header, a 500 on a route, injected HTML, a delay. Nothing
else about the image changes, so a mutant is a fair stand-in for a release
that shipped that regression.

Edge mutants cover six of the runway's list. Two need source access and
belong in the monorepo's own negative fixtures until this project can build
from a git ref:

- a lab page that writes a row for anonymous users (needs the persistence
  collector, phase H4)
- a navigator with a broken focus order (needs a keyboard-order collector; the
  journeys already press ArrowRight in the lab, so a mutant that breaks that
  would be caught as a journey failure today)

## Adding one

1. Add a `case` to `wrap.mjs` (or a new header/route rule).
2. Add it to `mutants.yaml` with the artefact(s) it must be attributed to.
3. Run `pnpm harness mutants` and confirm it is caught before merging.
