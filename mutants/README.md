# Mutants

Deliberately broken candidate images the harness must catch. Each is the
production reader image plus one planted fault, listed in `mutants.yaml` with
the artefact the report must attribute it to.

```bash
pnpm harness mutants --base 16.2.0          # builds thirteen images, runs A/A then thirteen A/B runs
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

Eight mutants are edge faults (`kind: edge`, the default), all built this way:
`dropped-header`, `route-500`, `console-error`, `dom-note`, `missing-alt`,
`slow-ssr`, `anon-write` (every page records a learning event for anonymous readers,
caught by the `persistence` collector) and `focus-order` (navigator links leave
the tab order, caught by the `focus` collector). All eight are in
`mutants.yaml` and are built and run; none is waiting on anything.

## Image-level mutants (R5)

Two mutants change what the image *is* rather than what the app does, so no
edge wrapper can plant them. They are built by `src/mutant-build.ts` and
caught by the static image artefacts, not by anything a browser sees:

| Mutant | `kind` | Built as | Must be attributed to |
| --- | --- | --- | --- |
| `base-swap` | `base-swap` | the production filesystem copied over another base (`ubuntu:24.04`, or `HARNESS_MUTANT_ALT_BASE`), with production's user, working directory, environment, ports, entrypoint and command restated from `docker image inspect` | `image-manifest` (`reader/base`: the lowest layer differs) |
| `added-package` | `planted-package` | `mutants/Dockerfile.planted-package`: the production image plus one npm package (`harness-planted-package@9.9.9`) `COPY`ed into `./node_modules`, so no root, no network and no package manager is needed | `sbom` (`reader/harness-planted-package`) |

Both are built locally, so they have no cosign attestation. `harness mutants`
therefore sets `HARNESS_SBOM_SOURCE=generate`, which runs a local SBOM generator
(`syft` by default, `HARNESS_SBOM_CMD` to change it) over the base and over each
mutant, so the two SBOMs come from the same tool. `syft` must be on `PATH`;
without it `added-package` escapes, loudly. A `base-swap` build that did not
change the lowest layer (the alternative base is the production base) is refused
rather than run as a mutant that plants nothing.

## Policy-check mutants (since 1.25.0)

Each check of the policy family (`src/compare/policy.ts`) has a planted fault of its own, so each check that
2.0 may make blocking is first shown to fail at all (the runway's soak, on the readiness page):

| Mutant | `kind` | Built as | Must be attributed to |
| --- | --- | --- | --- |
| `secret-env` | `planted-secret` | `mutants/Dockerfile.planted-secret`: the production image plus `ENV HARNESS_PLANTED_API_TOKEN=...`, a harmless fixed value under a name that says it is a secret | `image-hardening` (`reader/env/HARNESS_PLANTED_API_TOKEN`) |
| `vulnerable-package` | `planted-vuln` | `mutants/Dockerfile.planted-vuln`: the manifest of `ejs` 3.1.6 (critical, fixed in 3.1.7) copied to `/opt/harness-planted-vuln/node_modules/`, no code and nothing loads it | `vuln-ceiling` (`reader/<advisory id>`) |
| `unsigned-build` | `unsigned` | `docker tag` of the production image to a local name: the same bytes, but this run did not pull it and verify its signature | `build-provenance` (`reader/unverified`) |

The three checks are **informing** until 2.0 (`src/compare/levels.ts`), so none of them can FAIL a run.
Such a mutant is caught when its check reports a finding that the base did not have in the
self-test's own A/A (a "new on b" finding), and the log says `caught by an informing check`;
`mutants.json` lists it under `byInforming`. Two of them also trip a blocking engine on the way
(`secret-env` changes the image config, `image-manifest`; `vulnerable-package` adds a package and an
advisory, `sbom` and `vulns`), so the run FAILs; `unsigned-build` changes nothing a diff engine
reads and the run passes, which is the point: only the provenance check can see it. The day a check
becomes blocking its mutant must FAIL the run like any other.

`vulnerable-package` needs the scanner database the weekly job fetches; `unsigned-build` needs the
base pulled and verified (a registry prefix), or the A/A already reports `unverified` on the base
and the mutant has nothing new to show.

## Adding one

1. Add a `case` to `wrap.mjs` (or a new header/route rule), or a new `kind` in
   `src/mutant-build.ts` for one that changes the image itself.
2. Add it to `mutants.yaml` with the artefact(s) it must be attributed to.
3. Run `pnpm harness mutants` and confirm it is caught before merging.
