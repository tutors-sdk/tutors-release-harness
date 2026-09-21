# 3. Components: inside the `harness` CLI

The CLI is the one container with real structure. Five views, each a zoom of
the one before: the run pipeline (3.1), capture (3.2), compare, claim, gate and
report (3.3), image acquisition (3.4), and the local ops layer (3.5). Each
element names the file that implements it. Legend:
[README](README.md#legend).

Everything drawn is built on `origin/main` (harness 1.4.1) except the red
dashed "planned" elements.

## 3.1 The run pipeline

`harness run --mode <mode>` is `run()` in `src/run.ts`. Whatever a mode does to
get its evidence, it ends in the same place: one `CompareResult` of hunks,
matched against claims, judged by `src/gate.ts`, written as `report.json`,
`report.html` and `report.md`.

```mermaid
flowchart TB
  clits["<b>cli.ts</b><br/>[Component: src/cli.ts]<br/>Parses flags, dispatches commands, turns the outcome into an exit code"]:::component
  run["<b>run()</b><br/>[Component: src/run.ts]<br/>Orchestrates one run for one mode"]:::component
  claimsfile[("<b>claims.yaml, rules.json</b><br/>[Data: files or URL]")]:::store
  preflight["<b>Preflight</b><br/>[Component: claims/schema.ts, claims/rules.ts, images.ts, image-static/collect.ts]<br/>Load claims and rules, resolve image provenance, read manifest, SBOM and vulnerabilities from the images"]:::component
  stack["<b>Stack lifecycle</b><br/>[Component: stack.ts, substrate/kind.ts]<br/>Both sides up before capture, down in a finally"]:::component
  capture["<b>Capture</b><br/>[Component: collectors/index.ts captureSide]<br/>Per side: journeys, ledgers, metrics, logs, k6, runtime. Zoom in 3.2"]:::component
  rehearse["<b>Rehearsal modes</b><br/>[Component: modes/migration.ts, modes/upgrade.ts]<br/>Produce hunks of their own, migration with no stacks, upgrade after capture"]:::component
  captures[("<b>a/capture.json, b/capture.json</b><br/>[Data: files under out/]")]:::store
  masks[("<b>normalise/masks.yaml</b><br/>[Data: reviewed list of blind spots]")]:::store
  subgraph normg["Normaliser: normalise() in normalise/masks.ts, the same steps on both sides, in this order"]
    direction LR
    red["<b>1 Redact</b><br/>[Component: normalise/redact.ts]<br/>apikey, Authorization, JWT and Supabase keys become redacted"]:::component
    org["<b>2 Origins</b><br/>[Component: normalise/origins.ts]<br/>An external side's URL reads as {{origin}} on both sides"]:::component
    can["<b>3 Canonical forms</b><br/>[Component: normalise/canonical.ts]<br/>content-type and cache-control in one spelling"]:::component
    msk["<b>4 Masks</b><br/>[Component: normalise/masks.ts]<br/>Header, pattern, series and key masks; drop for network and console; counts which fired"]:::component
  end
  cmp["<b>Compare engines</b><br/>[Component: compare/index.ts]<br/>One engine per artefact. Zoom in 3.3"]:::component
  match["<b>Claim matcher</b><br/>[Component: claims/matcher.ts, claims/hygiene.ts]<br/>Every failing hunk needs a claim"]:::component
  noisefile[("<b>noise-status.json</b><br/>[Data: from the noise store or branch]")]:::store
  depcheck["<b>Deployment check</b><br/>[Component: release-record.ts judgeDeployment]<br/>post-deploy only: deployed digests against the release record"]:::component
  gate["<b>Gate</b><br/>[Component: gate.ts, override.ts]<br/>Verdict per mode; may FAIL only while the A/A is trusted; post-deploy wording says roll back or open an issue"]:::component
  reports["<b>Report renderers</b><br/>[Component: report/index.ts, html.ts, markdown.ts]<br/>report.json, report.html, report.md"]:::component
  records["<b>Post-run records</b><br/>[Component: run.ts, release-record.ts]<br/>noise-status.json in noise mode; release-record.json in release mode"]:::component

  clits -->|"run(options); compare --dir re-enters at the captures"| run
  claimsfile -->|"loaded first: a bad file is exit 2 before anything starts"| preflight
  run --> preflight
  preflight --> stack
  stack -->|"up() before, down() in finally"| capture
  capture -->|"writes"| captures
  run -.->|"migration and upgrade modes"| rehearse
  rehearse -->|"extraHunks"| cmp
  captures --> red
  red --> org
  org --> can
  can --> msk
  masks --> msk
  msk -->|"normalised captures"| cmp
  cmp -->|"hunks"| match
  match -->|"CompareResult: unclaimed, stale, broad"| gate
  noisefile --> gate
  depcheck -->|"a PASS becomes WARN, a FAIL is never softened"| gate
  gate -->|"verdict, reasons"| reports
  gate --> records
  reports -->|"exitCodeForReport"| clits

  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  style normg fill:#f4f8fc,stroke:#1168bd,stroke-dasharray:4 3
```

**Why the normaliser has an order.** Redaction comes first, so no later step, hunk
or report ever holds a secret-shaped value (`normalisePage` in
`src/normalise/masks.ts:114` calls `redactPage` before anything else). Origins
next: an external side's URLs, read from its `external:<url>` images, are
rewritten to `{{origin}}` in the other side's captures too, so a literal link to
production on the recorded side reads the same as production's own rewritten one
(`src/normalise/origins.ts:22`, wired in `compareFromCaptures`,
`src/run.ts:150`). Canonical forms next, so a mask pattern is written against
one spelling of `content-type` and `cache-control`
(`src/normalise/canonical.ts:108`). Masks last. None of the first three is a
mask: they hide nothing that a release could change. In post-deploy mode the
recorded capture is also redacted when it is loaded (`redactCapture`,
`src/run.ts`), and the collector redacts what it records, so a new
`capture.json` does not hold a key either.

`normalise/masks.yaml` holds 25 masks (the review guard warns past 40): 10 apply
in post-deploy mode only (CDN headers, a RUM beacon, revalidation forms that
exist only because production sits behind Netlify), four `drop` whole network
requests or console messages (third-party hosts, the persistence stub's
Supabase paths, the CDN's RUM request, the Realtime REST-fallback warning), and
`footer-tutors-version` masks the footer's build version. The report lists which
masks fired and which were silent.

What each mode does (`src/run.ts`, `docs/modes.md`):

| Mode | Stacks | Evidence | Gate outcome |
| --- | --- | --- | --- |
| `noise` | two, same tag on both sides | captured diffs; refuses if `--a` and `--b` differ | never FAIL. WARN on any failing hunk, or on a clean but degraded run; writes `noise-status.json` |
| `release` | two, production against candidate | captured diffs, k6 with `--load` | FAIL on unclaimed hunks only while the A/A is trusted, else WARN; then writes a release record |
| `any-two` | two, any images | captured diffs | always PASS: investigation only |
| `upgrade` | two plus the edge (profile `upgrade`), compose only | both sides captured once, then k6 through the edge while `b` is rolled in | FAIL on any failed or 5xx request, or `b` never serving |
| `migration` | none: a throwaway Postgres | expand/contract and rollback hunks from two sets of migrations | FAIL on any violation |
| `post-deploy` | none: side b is live production | the release run's recorded `b` capture, filtered to the `reference` journeys, against the same journeys on production | as `release`, plus the deployment check |

Each stage is the same code in every mode. `compareFromCaptures` (normalise,
compare, claim, gate, report) is also what `harness compare --dir` calls on
captures already on disk.

## 3.2 Capture

`captureSide` (`src/collectors/index.ts`) runs once per side. It resets the
write ledgers before each journey and reads them after, so a write is attributed
to the journey that made it. The static image artefacts are read from the
images by `run()` before any stack starts and attached to the capture.

```mermaid
flowchart LR
  journeys["<b>Journeys</b><br/>[Component: traffic/journeys/journeys.ts]<br/>Six journeys in three sets: fixture, auth, reference; parameterised by URL"]:::component
  cs["<b>captureSide</b><br/>[Component: collectors/index.ts]<br/>Metrics before, each journey run times, metrics after, logs, load, runtime"]:::component
  br["<b>captureJourney</b><br/>[Component: collectors/browser.ts]<br/>dom, screenshot, network, console, headers, axe, focus order, timing"]:::component
  led["<b>Ledgers</b><br/>[Component: collectors/ledgers.ts]<br/>reset before, read after each journey"]:::component
  pers["<b>Persistence recorder</b><br/>[Component: persistence/recorder.ts, supabase-rest.ts]<br/>Writes by table and method"]:::component
  bus["<b>Bus collector</b><br/>[Component: bus/transport.ts, http-recorder.ts]<br/>Publishes by topic; inert unless HARNESS_BUS is set"]:::component
  met["<b>Metrics</b><br/>[Component: collectors/metrics.ts]<br/>Prometheus text to series and values"]:::component
  logs["<b>Logs</b><br/>[Component: collectors/logs.ts]<br/>JSON-ness, level counts, field set, request-id ratio"]:::component
  load["<b>Load</b><br/>[Component: collectors/load.ts]<br/>k6 samples, p50, p95, failures"]:::component
  rt["<b>Runtime</b><br/>[Component: runtime/index.ts, posture.ts, startup.ts]<br/>Container posture; startup time over N restarts; runs last"]:::component
  st["<b>Static image artefacts</b><br/>[Component: image-static/collect.ts, manifest.ts, sbom.ts, vulns.ts]<br/>Read from the images before the stack starts"]:::component
  capf[("<b>capture.json + screenshots</b><br/>[Data: files under out/side/]")]:::store

  apps["<b>Apps under test</b><br/>[Container: compose or kind]<br/>reader, catalogue, live, time"]:::container
  pstub["<b>Persistence stub</b><br/>[Container]"]:::container
  busx["<b>Bus recorder stub</b><br/>[Planned]<br/>Not built"]:::planned

  cs --> br
  journeys -->|"role and name selectors"| br
  br -->|"Playwright"| apps
  cs --> led
  led --> pers
  led --> bus
  pers -->|"GET /_harness/writes, POST /_harness/reset"| pstub
  bus -.->|"planned: /_harness/published"| busx
  cs --> met
  met -->|"GET /metrics"| apps
  cs -->|"docker compose logs --since"| logs
  cs --> load
  load -->|"k6 container"| apps
  cs --> rt
  rt -->|"docker inspect, exec, stop and start; kubectl on kind"| apps
  st -->|"attached to the side spec"| cs
  cs -->|"writes"| capf

  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef planned fill:#ffffff,stroke:#c0392b,color:#c0392b,stroke-dasharray:6 4
```

### The collectors

Seventeen artefact names are captured; two more (`migration`, `upgrade`) come
from the rehearsal modes. All nineteen are in `ARTEFACTS` (`src/types.ts:13`).
Load results are reported under `timing` (scope `load/...`).

| Artefact | Collector | Read from | Engine | A difference means |
| --- | --- | --- | --- | --- |
| `dom` | `collectors/browser.ts` | Playwright aria snapshot per page | `engines.ts` `dom`: line diff, hunks | content or structure changed |
| `screenshot` | `browser.ts` | 1280x800, light, reduced motion | `screenshot`: pixelmatch, thresholded by `masks.yaml` | visual change |
| `network` | `browser.ts` | each response: method, path, status, content type, cache headers, JSON shape hash | `network`: multiset of `METHOD url` counts, then per-entry fields | new or missing calls, status, cache or schema change |
| `console` | `browser.ts` | console and page errors | `console`: set diff | a new error or warning |
| `headers` | `browser.ts` | document response headers | `headers`: exact per header | any change |
| `axe` | `browser.ts` | axe-core, WCAG 2.1 A and AA | `axe`: set diff by rule and target | a new violation |
| `focus` | `browser.ts` | what each successive Tab focuses | `extra.ts` `focus`: ordered sequence diff | a focus stop lost or reordered |
| `timing` (pages) | `browser.ts` | Playwright request timing: TTFB and journey duration | `engines.ts` `timing`: Mann-Whitney U, needs `minRuns` | slower beyond noise |
| `metrics` | `metrics.ts` | `/metrics` before and after | `metrics`: series presence and counter deltas | a missing or new series, a counter that moved differently |
| `logs` | `logs.ts` | container logs since capture began (compose only) | `logs`: aggregate | log shape or volume changed |
| `persistence` | `ledgers.ts`, `persistence/` | per-side stub | `extra.ts` `persistence` through `ledger.ts` | writes differ; **any** write in an anonymous journey |
| `bus` | `bus/` | a transport, if `HARNESS_BUS` is set | `extra.ts` `bus` through `ledger.ts` | publishes differ; any publish in an anonymous journey |
| `timing` (load) | `load.ts` | k6 JSON output | `extra.ts` `load`: failure rate, p95 shift, Mann-Whitney on samples | latency or errors regressed under load |
| `image-manifest` | `image-static/manifest.ts` | `docker image inspect` | `compare/image-static.ts`: exact per field, size with a tolerance | a different base, a root user, a port or command |
| `sbom` | `image-static/sbom.ts` | cosign attestation, or a local generator | `image-static.ts`: set diff on `name@version` | a package added, removed or bumped |
| `vulns` | `image-static/vulns.ts` | a scanner over that SBOM, database pinned | `image-static.ts`: set diff by advisory | a vulnerability new on b |
| `runtime` | `runtime/posture.ts` | declared (`docker inspect` or pod spec) and measured (a probe inside the container) | `compare/runtime.ts`: exact per field | a changed user, capability, writable root or mount |
| `startup` | `runtime/startup.ts` | restart each app N times, time to first healthy response and to the orchestrator's ready verdict | `runtime.ts`: Mann-Whitney U with a millisecond floor | a slower boot; an app that stops coming up |

Behaviours worth knowing:

- Only the first run of a journey produces screenshots, axe and focus. Later
  runs exist for the timing samples.
- `runtime` and `startup` **fail** when they cannot be collected
  ("NOT COLLECTED" is a failing, claimable hunk), so a missing collector cannot
  read as a clean one. See the convention below.
- Post-deploy skips metrics, logs, runtime, startup, load and persistence: a live
  deployment is not the harness's to read (`captureSide`, `spec.external`).
- Nothing is retried anywhere. A noisy result is investigated, not re-run.
- A JSON response body that is not read within three seconds is recorded as
  `unread` and its shape is not compared (`BODY_READ_MS`, `SCHEMA_UNREAD` in
  `src/collectors/browser.ts`), so a request nobody reads cannot stall a run or
  read as a schema change.
- The `time` app has no journey, so it contributes `metrics`, `logs`, `runtime`,
  `startup` and the three image artefacts only.

### Not collected: one convention

`src/not-collected.ts` gives every artefact that can come up empty the same
shape (`docs/contract.md`, "Not collected: one convention"):

| Rule | Value |
| --- | --- |
| Text | `NOT COLLECTED: <what>[ of <subject>][ on side a\|b, or on both sides]: <reason>`, in `reasons`, a hunk `summary` and the run log |
| Hunk | the artefact's own name, scope `<subject>/not-collected` (an app, or the artefact when all of it is missing) |
| Severity | informational, unless the artefact is required, and then failing. Always informational when the operator switched it off (`--no-runtime`, `--startup-restarts 0`) |
| Required by default | `runtime` and `startup` (`DEFAULT_REQUIRED`, line 39) |
| Required on request | `HARNESS_REQUIRE_ARTEFACTS=<list>`: artefact names, `static` (the three image artefacts) or `all`; only ever adds; an unknown name is exit 2. `HARNESS_REQUIRE_STATIC=1` is an alias for `static`; the nightly and the release job set it |
| `bus` | adds no hunk by default (`docs/bus.md`: a run with no bus is byte-for-byte what it was); a failing `bus/not-collected` hunk under `HARNESS_REQUIRE_ARTEFACTS=bus`, never asked of a live deployment |

## 3.3 Compare, claim, gate, report

```mermaid
flowchart LR
  norm["<b>Normaliser</b><br/>[Component: normalise/]<br/>Redact, origins, canonical forms, masks, the same on both sides"]:::component
  cmp["<b>compareCaptures</b><br/>[Component: compare/index.ts]<br/>Runs every engine in a fixed order; deterministic"]:::component
  eng["<b>Page and side engines</b><br/>[Component: compare/engines.ts, extra.ts]<br/>dom, screenshot, network, console, headers, axe, focus, metrics, logs, timing, load"]:::component
  led["<b>Ledger rule</b><br/>[Component: compare/ledger.ts]<br/>Sides must agree; an anonymous journey may write nothing. Shared by persistence and bus"]:::component
  img["<b>Image engines</b><br/>[Component: compare/image-static.ts, runtime.ts]<br/>image-manifest, sbom, vulns, runtime, startup"]:::component
  mw["<b>Mann-Whitney U</b><br/>[Component: compare/stats.ts]<br/>mannWhitney and smallestAttainableP: says when the samples cannot reach alpha"]:::component
  nc["<b>Not-collected convention</b><br/>[Component: not-collected.ts]<br/>One text, one scope, one severity rule"]:::component
  match["<b>matchClaims</b><br/>[Component: claims/matcher.ts]<br/>First matching claim in file order; artefact plus scope glob"]:::component
  hyg["<b>claimHygiene</b><br/>[Component: claims/hygiene.ts]<br/>Reports broad or greedy claims; never gates"]:::component
  gate["<b>gate()</b><br/>[Component: gate.ts]<br/>Verdict and reasons for the mode"]:::component
  trust["<b>trustNoise</b><br/>[Component: gate.ts]<br/>Waived, or a status that is clean, not degraded, at most 7 days old"]:::component
  ovr["<b>Override</b><br/>[Component: override.ts]<br/>Reason of 20+ characters and a person; verdict stays FAIL, exit becomes 0"]:::component
  rep["<b>writeReports</b><br/>[Component: report/index.ts]<br/>json, html, markdown, with provenance, deployment and image sections"]:::component
  ns["<b>noise-status.json</b><br/>[Data: file]<br/>clean, hunks, degraded"]:::store
  exit["<b>Exit code</b><br/>[Component: override.ts exitCodeForReport]<br/>0 pass, warn or overridden fail; 1 fail; 2 usage or cannot judge"]:::component

  norm --> cmp
  cmp --> eng
  cmp --> img
  eng -->|"persistence, bus"| led
  eng -->|"timing, load"| mw
  img -->|"startup"| mw
  nc -->|"NOT COLLECTED hunks"| img
  nc -->|"bus, when required"| eng
  eng -->|"hunks"| match
  led -->|"hunks"| match
  img -->|"hunks"| match
  mw -->|"p-value decides fail or info"| match
  match -->|"CompareResult"| hyg
  match -->|"unclaimed, stale, broad without approvedBy"| gate
  trust -->|"release and post-deploy only"| gate
  gate -->|"verdict"| ovr
  ovr --> rep
  rep --> exit
  gate -->|"noise mode"| ns

  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
```

**Timing statistics.** `timing`, `load` and `startup` share one two-sided
Mann-Whitney U with continuity correction, `src/compare/stats.ts:40`. Before
judging, each asks `smallestAttainableP` (line 70): if a perfectly separated pair
of that many samples could not reach alpha 0.05, the finding is informational and
says "cannot reach alpha, raise --runs" (`engines.ts` `timing`, `extra.ts` `load`,
`runtime.ts` `startup`). Three runs a side cannot reach it (best p is 0.081), four
can, which is why the nightly, the release workflow and the `slow-ssr` mutant run
five (`.github/workflows/nightly-noise.yml`, `release.yml`, `mutants/mutants.yaml`).

**Hunks.** An engine emits `Hunk`s (`src/types.ts`): an artefact, a scope, a
severity (`fail` or `info`) and a summary. Only `fail` hunks need a claim.
Improvements (a fixed axe violation, a console message gone, a vulnerability
fixed) are `info`.

**Claims.** `matchClaims` assigns each failing hunk to at most one claim, the
first that matches in file order. A claim matches on artefact (or `*`) and a
`picomatch` glob against the hunk's scope, its path, or the part of its scope
before the first `/`. The result is `unclaimed` (what gates), `staleClaims`
(matched nothing, reported, never gates) and `broadUnapproved` (artefact `*` or a
scope like `**` without `approvedBy`, which does gate). A claim carries a
`reason`, or since 1.3.0 a `rule: "0031"` that the release's `rules.json` must
contain; a claim naming a rule that is not there stops the run with exit 2
before any stack starts.

**The gate** (`gate.ts`), per mode:

| Mode | pass | warn | fail |
| --- | --- | --- | --- |
| `noise` | no failing hunk and not degraded | a failing hunk, or clean but degraded | never |
| `any-two` | always | never | never |
| `release`, `post-deploy` | no unclaimed hunk and no unapproved broad claim | the same findings, when the A/A is not trusted; text starts "advisory only" | those findings, when the A/A is trusted |
| `migration`, `upgrade` | no violation | never | any violation; needs no A/A |

`trustNoise` returns true when `--noise skip` waived it, or when a status is
present, has no `degraded`, is `clean`, and is no older than
`noiseMaxAgeDays` (default 7). The post-deploy reason says "decide whether to
roll back" instead of "open a rollback issue" when no CI step will open one
(`HARNESS_ROLLBACK_ISSUE`, else `GITHUB_ACTIONS`; `rollbackIssueConfigured`,
`src/gate.ts`). **The noise-status rule is the harness's licence
to fail: without it the same findings are a warning with the reason stated.**

**Exit codes** (`docs/contract.md`): 0 for pass, warn, or a FAIL overridden with a
reason and a person; 1 for a FAIL; 2 for a usage error, a harness error, or an
image that may not be judged (`ImageTrustError`, `cannot judge:`).

## 3.4 Image acquisition: `harness images ensure`

The one place the harness touches source, and only to produce an image it then
treats like any other. Run before `run`; `run` itself refuses an image that is
absent or unverified, so compose never pulls one silently.

```mermaid
flowchart TB
  spec["<b>Image spec</b><br/>[Input]<br/>--a and --b: bare tag, full reference, reader=REF,...; optional digests, --ref-a, --image-cache"]:::ext
  parse["<b>Reference parsing</b><br/>[Component: image-ref.ts, digests.ts]<br/>imagesFor, pinImages; HARNESS_IMAGE_PREFIX prefix or template"]:::component
  agree["<b>Tag and digest agree?</b><br/>[Component: images.ts tagAgreesWithDigest]<br/>docker buildx imagetools inspect; a moved tag is exit 2"]:::component
  local["<b>Already local?</b><br/>[Component: images.ts]<br/>docker image inspect"]:::component
  pull["<b>Registry pull</b><br/>[Component: images.ts]<br/>docker pull by tag or repo@sha256; names with no registry host are never pulled"]:::component
  classify["<b>Why did the pull fail?</b><br/>[Component: image-cache.ts classifyPullFailure]<br/>absent, or the registry could not answer"]:::component
  cache["<b>Image cache restore</b><br/>[Component: image-cache.ts]<br/>docker load of the last verified images; recorded as cached"]:::component
  build["<b>Build from ref</b><br/>[Component: scripts/build-images.sh]<br/>Tries v-tag, tag, release/tag; loud; never for a pinned image"]:::component
  verify["<b>Provenance and signature check</b><br/>[Component: images.ts resolveSideProvenance, verifySignature]<br/>Registry images: cosign verify by digest against the identity of image-build.yml and GitHub's OIDC issuer. Built and local images are recorded, not verified"]:::component
  ledger[("<b>Provenance ledger</b><br/>[Data: image-provenance.json]<br/>keyed by local image id")]:::store
  refresh["<b>Cache refresh</b><br/>[Component: image-cache.ts saveImageCache]<br/>Only when every image was pulled and verified in this run"]:::component
  result["<b>Result</b><br/>[Output]<br/>exit 0, 1 or 2; image_cache=used, refreshed or none to GITHUB_OUTPUT"]:::ext
  quay["<b>Quay registry</b><br/>[External system]"]:::ext
  sig["<b>Sigstore / cosign</b><br/>[External system]"]:::ext
  mono["<b>Tutors monorepo</b><br/>[External system]"]:::ext

  spec --> parse
  parse -->|"pinned by digest"| agree
  parse -->|"unpinned"| local
  agree -->|"agree"| local
  local -->|"present"| verify
  local -->|"missing, registry name"| pull
  pull <-->|"pull, resolve"| quay
  pull -->|"pulled"| verify
  pull -->|"failed"| classify
  classify -->|"registry unreachable, cache given"| cache
  classify -->|"absent, or no cache"| build
  cache -->|"provenance cached: run is degraded"| verify
  build -->|"git clone, docker build of the monorepo Dockerfile"| mono
  build -->|"provenance built-from-ref: not evidence"| verify
  verify <-->|"verify by digest"| sig
  verify -->|"pulled+verified, or ImageTrustError exit 2"| ledger
  ledger --> refresh
  ledger --> result
  refresh --> result

  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
```

Provenance values (`src/types.ts`, `docs/images.md` section 7):

| Provenance | Meaning | Counts as evidence for a release |
| --- | --- | --- |
| `pulled+verified` | pulled from a registry, signature verified by digest against the monorepo's workflow identity | yes |
| `pulled-unverified` | pulled, verification failed, `--allow-unsigned` given | no; the report says so |
| `cached` | restored from the image cache because the registry could not be reached | no; the run is degraded |
| `built-from-ref` | built here from a monorepo ref | no; "it is not the image that ships" |
| `local` | already present, not from a registry (mutants, `tutors/<app>:local`) | recorded as unverified |

Decisions the diagram encodes:

- **A tag the registry says does not exist never borrows a cache.**
  `classifyPullFailure` separates "absent" (falls through to build-from-ref) from
  "unreachable" (may use the cache).
- **A pinned image is never built from source**: a rebuild is not the image the
  digest names.
- **Verification is by digest, never the tag**, which could move between pull
  and check.
- **The cache is only ever written from images pulled and verified in the same
  run**, so an unverified image can never enter it.
- Exit codes: 0 every image may be judged; 1 an image could not be obtained; 2 an
  image may not be judged (unsigned, wrong identity, cosign missing or older than
  3, a moved tag). 2 wins when both occur.

## 3.5 The local ops layer

What lets everything run on a laptop with no GitHub. The workflows call the same
`harness` commands; `tests/local-parity.test.ts` holds the two to the same plans.

```mermaid
flowchart TB
  clits["<b>cli.ts</b><br/>[Component: src/cli.ts]<br/>doctor, noise, guard, override, local"]:::component
  lcli["<b>Local commands</b><br/>[Component: local/cli.ts]<br/>doctorCommand, noiseCommand, guardCommand, overrideCommand, localCommand"]:::component
  doctor["<b>Doctor</b><br/>[Component: local/doctor.ts, doctor-real.ts]<br/>Read-only checks of the machine, including grype version and database age; how to install what is missing"]:::component
  tasks["<b>Task plans</b><br/>[Component: local/tasks.ts]<br/>planNightly, planGate, planMutants, planWatch: lists of harness argv, run by executePlan"]:::component
  lock["<b>Run lock</b><br/>[Component: local/lock.ts]<br/>One heavy run per machine; a stale pid is taken over"]:::component
  nstore["<b>Noise store</b><br/>[Component: local/noise-store.ts, ci/noise-history.ts]<br/>recordNight, defaultNoise, status, history, ratchet"]:::component
  prune["<b>Prune</b><br/>[Component: local/prune.ts]<br/>Old run directories and an old image cache; a dry run unless --yes; keeps the newest good release run"]:::component
  vdb["<b>Vulnerability database</b><br/>[Component: local/vuln-db.ts]<br/>vuln-db update and status: one pinned grype database, never updated during a run"]:::component
  olog["<b>Override log</b><br/>[Component: local/override-log.ts]<br/>Append-only, each line carries the hash of the last"]:::component
  guard["<b>Guards</b><br/>[Component: local/guard.ts]<br/>Resolve a base ref, run the CI scripts against it"]:::component
  masks["<b>mask-change.ts, engine-change.ts</b><br/>[Component: ci/]<br/>Masks in their own PR; engine change needs a version bump"]:::component
  naming["<b>Names and ports</b><br/>[Component: project.ts, local/ports.ts, local/bash.ts]<br/>Compose project and kind cluster from the checkout path; --port-offset; HARNESS_BASH"]:::component
  home["<b>HARNESS_HOME</b><br/>[Data store: local/home.ts]<br/>noise, image-cache, releases, overrides.jsonl, rollbacks, locks, image-provenance.json"]:::store
  rh["<b>pnpm release:harness</b><br/>[External: monorepo scripts/release-harness.ts]<br/>Builds the dispatch payload from git; with --run calls local gate, local watch --once or local nightly"]:::ext
  core["<b>Run pipeline and image acquisition</b><br/>[Component: 3.1 and 3.4]<br/>The same run() and ensureImages() the workflows use"]:::component

  clits --> lcli
  rh -->|"spawns pnpm harness local ..."| clits
  lcli --> doctor
  lcli --> tasks
  lcli --> nstore
  lcli --> olog
  lcli --> prune
  lcli --> vdb
  prune -->|"removes from out/ and image-cache/"| home
  vdb -->|"vuln-db/"| home
  lcli --> guard
  guard -->|"spawns with --base"| masks
  tasks -->|"acquires"| lock
  tasks -->|"harness images ensure, run, noise record, mutants"| core
  lcli -->|"writes rollbacks/ when a watch sees a difference"| home
  naming -->|"read by doctor, stack, kind and tasks"| tasks
  nstore -->|"reads and writes noise/"| home
  olog -->|"appends overrides.jsonl"| home
  lock -->|"locks/"| home
  core -->|"image-cache, provenance, releases"| home
  doctor -.->|"checks HOME is writable, tools, ports, subnet, stale projects"| home

  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
```

The five tasks, each planned as the workflow's own commands (`--dry-run` prints
the plan and starts nothing):

| Task | Steps | Workflow it mirrors |
| --- | --- | --- |
| `harness local nightly` | `images ensure --image-cache`, `run --mode noise --require-verified`, `noise record` | `nightly-noise.yml` |
| `harness local gate` | `noise status`, `images ensure`, then release, migration and upgrade runs as separate streams: a FAIL in one does not hide the others; writes `gate.md` and `gate.json` | `release.yml` |
| `harness local mutants` | `images ensure`, `mutants --base` | `weekly-mutants.yml` |
| `harness local watch` | `run --mode post-deploy` once or every 15 minutes; a difference writes `rollbacks/<time>-rollback.md`; never exits on a difference; needs no Docker | `post-deploy.yml` |
| `harness local smoke` (also `pnpm smoke`) | `images ensure`, a one-journey A/A on both stacks, the expanding migration fixture must pass, the contracting one must be rejected (`expectFailure`); `--only stacks\|migration` | `ci.yml` |

The monorepo's `pnpm release:harness` (#307) is the local trigger for these
tasks: it builds the `release-candidate` payload from a local clone with git
alone and, with `--run`, calls `local gate` (`--deployed --run` calls `local
watch --once`, `--nightly --run` calls `local nightly`). It lives in the
monorepo, so it is drawn as an external element.

The local store is this machine's calibration: the noise floor of a laptop's
Chromium is not a Linux runner's, so the same rule (clean, verified, at most
seven days) applies to the store, and a CI status must not be copied into it
(`docs/local.md`, "The noise store is this machine's calibration").

## Evidence

| Claim | Source |
| --- | --- |
| Pipeline order, preflight before stacks, `finally` teardown | `src/run.ts:256-376` (`run`) |
| `compareFromCaptures` order: normalise, compare, claims, noise, gate, deployment, override, hygiene, reports | `src/run.ts:150-209` |
| Normaliser order: redact, origins, canonical, masks | `src/normalise/masks.ts:114-166` (`normalisePage`); `src/normalise/redact.ts`, `origins.ts:22`, `canonical.ts:108` |
| Mode behaviours | `src/run.ts:269` (migration), `:278` (post-deploy), `src/modes/`, `docs/modes.md`, `src/gate.ts:51` |
| `captureSide` steps | `src/collectors/index.ts:53` |
| Artefact list (19) | `src/types.ts:13` |
| Six journeys, three sets | `traffic/journeys/journeys.ts:199` |
| Ten mutants, eight edge and two image-level | `mutants/mutants.yaml`; held by `tests/docs-counts.test.ts` |
| Engines and their rules | `src/compare/engines.ts`, `extra.ts`, `ledger.ts`, `image-static.ts`, `runtime.ts` |
| Not collected: one convention | `src/not-collected.ts`; callers `src/compare/runtime.ts:49,143,192`, `image-static.ts:147`, `extra.ts:79`; `docs/contract.md` "Not collected: one convention"; `tests/not-collected.test.ts` |
| Timing statistics | `src/compare/stats.ts:40,70`; `src/compare/engines.ts:262` (`timing`), `extra.ts:86` (`load`), `runtime.ts:171` (`startup`) |
| Claim matching | `src/claims/matcher.ts:23`, `src/claims/schema.ts`, `src/claims/rules.ts` |
| Gate and `trustNoise` | `src/gate.ts:51`, `:94` |
| Override | `src/override.ts` |
| Image acquisition | `src/images.ts:352` (`ensureImages`), `:321` (`tagAgreesWithDigest`), `:176` (`verifySignature`), `src/image-cache.ts`, `src/image-ref.ts`, `src/digests.ts`, `scripts/build-images.sh` |
| Local layer | `src/local/*` (`prune.ts:240`, `vuln-db.ts`, `tasks.ts:149` `planSmoke`), `src/project.ts`, `docs/local.md`, `tests/local-parity.test.ts`; monorepo `scripts/release-harness.ts` |
