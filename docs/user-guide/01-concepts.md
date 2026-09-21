# 01 Concepts

This chapter defines the ideas the rest of the guide relies on. Every term in bold is also in the [glossary](glossary.md).

- [A and B](#a-and-b)
- [The two stacks](#the-two-stacks)
- [Journeys](#journeys)
- [Artefacts](#artefacts)
- [Normalising and masks](#normalising-and-masks)
- [Claims](#claims)
- [Verdicts](#verdicts)
- [Noise and release: the gate](#noise-and-release-the-gate)
- [Exit codes](#exit-codes)

## A and B

Every comparison has two sides.

- **Side a** is what runs in production today. You give it as the production tag, for example `16.2.0`.
- **Side b** is the candidate, for example `16.3.0-rc.1`.

Both sides are sets of container images, one per app: `reader`, `catalogue`, `live` and `time`. The harness compares images, never checkouts, so it can compare any two tags, including two it did not build, and the release being judged cannot quietly weaken the judge.

A bare tag expands to one image per app through the image prefix. With `HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'`, `--a 16.2.0` means `quay.io/tutors-sdk/tutors-reader:16.2.0` and the same for the other apps. Where the images come from, and how they are verified, is in [chapter 2](02-running-locally.md#where-the-images-come-from).

A **mode** says what the two sides are and what the comparison is for:

| Mode | a | b | What it produces |
| --- | --- | --- | --- |
| `noise` | production tag | the same tag | The A/A run: anything that differs is noise. Writes `noise-status.json`. |
| `release` | production tag | candidate tag | The A/B run: the differences a release carries, judged against its claims. |
| `any-two` | any image | any image | An investigation. Never fails. |
| `migration` | a git ref (or `dir:<path>`) | a git ref (or `dir:<path>`) | A database migration rehearsal: expand/contract rules and a rollback check. |
| `upgrade` | production tag | candidate tag | A rolling upgrade rehearsal: the candidate rolls in under load and no request may fail. |
| `post-deploy` | the recorded candidate capture | live production URLs | The reference-course journeys against production, compared with what was tested. |

## The two stacks

`compose.harness.yaml` describes two identical stacks, a and b. Each side runs the apps as the monorepo runs them: anonymous mode, read-only root filesystem, a tmpfs `/tmp`, all capabilities dropped, no new privileges, JSON logs. Each side also has a second reader with sign-in enabled (`reader-auth`) and a **persistence stub** that records every write the reader tries to make.

Shared by both sides: a static server for the pinned fixture course, an identity stub that issues GitHub-shaped sign-ins for fixed users, and, in `upgrade` mode, an **edge** proxy in front of both readers.

The stacks differ in one thing only: the image reference. Anything else that differs is noise, so the harness fixes everything it can:

- the same frozen clock in the browser and as `HARNESS_NOW` in every container (default `2026-09-16T09:05:00.000Z`);
- the same viewport (1280 by 800), locale (`en-IE`), time zone (`Europe/Dublin`), light colour scheme and reduced motion;
- the same fixture course and identity stub, none of which send `Date`, `ETag` or `Last-Modified`.

The **kind** substrate (`--substrate kind`) runs the same two sides as two namespaces (`harness-a`, `harness-b`) in a local kind cluster under the restricted Pod Security Admission profile. Everything above the substrate is identical; the signed-in reader and its stubs are compose-only, so the `auth` journeys are skipped on kind. OpenShift is out of scope.

## Journeys

A **journey** is a scripted path a person could take, written with role-and-name selectors and parameterised only by the base URL. There are six, in three sets (`pnpm harness journeys` lists them):

| Set | Journey | Page keys it captures | Runs against |
| --- | --- | --- | --- |
| `fixture` | `anonymous-student-reads-course` | `reader:home`, `reader:course`, `reader:topic`, `reader:lab-step`, `reader:lab-step-2` | the pinned fixture course |
| `fixture` | `anonymous-student-searches` | `reader:search`, `reader:search-results` | the pinned fixture course |
| `fixture` | `catalogue-loads` | `catalogue:home` | the catalogue app |
| `fixture` | `live-loads` | `live:home` | the live app |
| `auth` | `student-signs-in` | `reader-auth:sign-in`, `reader-auth:course`, `reader-auth:topic` | the signed-in reader, the identity stub and the persistence stub |
| `reference` | `reference-course-reads` | `reference:course`, `reference:topic`, `reference:lab`, `reference:note` | the published reference course, the same upstream for both sides; the only set that can also run against production |

The **page key** (`reader:lab-step`) names a page in every artefact scope, and you will use it in claims. `--set` selects sets and `--journey` selects one journey.

The `time` app has no journey: it is client-rendered, so it is compared only through the app-level artefacts (metrics, logs, runtime, startup and the image artefacts).

Journeys are deliberately few. The harness's power comes from how much it captures at each step, not from how many paths it walks. A journey is added only after a real regression escaped that one would have caught ([chapter 9](09-extending.md#adding-a-journey)).

`--runs n` repeats every journey n times per side. One run is enough for everything deterministic; anything statistical (timing) needs several ([chapter 3](03-reading-a-report.md#timing-and-statistics)).

## Artefacts

An **artefact** is one kind of thing the harness captures and compares. Each has its own diff engine and its own scope format. There are nineteen. A **hunk** is one difference an engine found; it has an artefact, a **scope** (what a claim's glob is matched against), a summary and a severity.

Severity is `fail` (gates unless claimed) or `info` (reported, never gates, needs no claim).

### Captured per page, per journey step

| Artefact | What is compared | Hunk scope | A hunk means |
| --- | --- | --- | --- |
| `dom` | Playwright's accessibility-tree snapshot of the page body, as a line diff | the page key, e.g. `reader:course`; a journey name when a journey itself failed | Content or structure changed. A journey that completed on a and failed on b is the loudest hunk there is. |
| `screenshot` | 1280 by 800 PNG, light theme, reduced motion, compared with pixelmatch | the page key | More than 0.1% of pixels differ, or the image size changed. |
| `network` | method, path, status, content type, cache header and a hash of a JSON response's shape, as a multiset per page | `GET /route`, e.g. `GET /api/presence` | A request appeared, disappeared, or was made a different number of times; a status, cache header or response shape changed. |
| `console` | console errors and warnings, page errors, as a set | the page key | A new message on b. A message gone on b is information. |
| `headers` | the document response headers, exact, per header | `<page key>/<header>`, e.g. `reader:course/content-security-policy` | A header was added, dropped or changed. Security headers live here. |
| `axe` | WCAG 2.1 A and AA violations by rule and node | the page key | A new violation fails; a fixed one is information. |
| `focus` | what each successive Tab focuses, up to 12 stops | the page key | A focus stop was lost or reordered. |
| `timing` | document TTFB per page and journey duration, over `--runs` runs, by Mann-Whitney U; with `--load`, every k6 request's duration and the failure rate | the page key (TTFB), the journey name (duration), `load/http_req_duration`, `load/errors` | Slower on b beyond noise. Needs at least four runs per side to reach significance. |

### Captured per side, around the journeys

| Artefact | What is compared | Hunk scope | A hunk means |
| --- | --- | --- | --- |
| `metrics` | `/metrics` before and after the journeys: series presence and counter deltas (25% or 2 counts, whichever is larger) | `<app>/<series>` | A series went missing or is new, or a counter moved differently under the same traffic. |
| `logs` | container logs: JSON-ness, level counts, the set of keys, request-id propagation. Shape and volume, never the text of a line | `<app>/<key>`, `<app>/<level>`, `<app>/request-id`, `<app>/json` | The log shape or volume changed. |
| `persistence` | every write a side attempted, per journey, by table and method | `<journey>/<table>` | Data is written differently, and *any* write on b during an anonymous journey is a failure (information if a wrote it too: a product finding, not a release difference). |
| `bus` | every topic a side published to, per journey (only when a bus is configured, see [docs/bus.md](../bus.md)) | `<journey>/<topic>` | Messages are published differently; any publish on b during an anonymous journey fails, under the same rule. |

### Read from the images, before the stacks start

| Artefact | What is compared | Hunk scope | A hunk means |
| --- | --- | --- | --- |
| `image-manifest` | base, platform, user, exposed ports, entrypoint, command, layer count, size, OCI labels (except revision, version, created) | `<app>/base`, `/platform`, `/user`, `/ports/<port>`, `/entrypoint`, `/cmd`, `/layers`, `/size`, `/label/<key>` | Built from another base; now root or another user; a port or command changed; size up by at least 10% and 5 MB (shrinking is information). |
| `sbom` | the SPDX software bill of materials: the cosign attestation of a pulled image, or generated locally with syft | `<app>/<package name>` | A package was added, removed or bumped, one hunk per package. |
| `vulns` | the SBOM scanned with a pinned database (grype by default) | `<app>/<advisory id>`, or `<app>/db` | A vulnerability that is new on b fails; one gone on b is information; two sides scanned with different databases fail and the diff is not to be trusted. |

### Measured from the running containers

| Artefact | What is compared | Hunk scope | A hunk means |
| --- | --- | --- | --- |
| `runtime` | declared posture (`docker inspect` or the pod spec) and measured posture (a probe inside the container): user, capabilities, read-only root, mounts, limits, effective UID, seccomp, whether `/tmp` is writable; and EROFS errors in the log | `<app>/<field>`, `<app>/writes-outside-tmp` | A posture changed. A change that only *tightens* it is information. b running as root, with a writable root, or unable to write `/tmp` is called out. |
| `startup` | time from start to the first response and to the orchestrator's ready verdict, over `--startup-restarts` restarts (default 5), by Mann-Whitney U | `<app>/root`, `<app>/ready`, `<app>/boot`, `<app>/root-status` | A slower boot, an app that stops coming up, or `/` answering differently after a restart. |

### From the rehearsals

| Artefact | What is compared | Hunk scope | A hunk means |
| --- | --- | --- | --- |
| `migration` | the schema before and after the candidate's migrations, and a restore of the snapshot | a table (`app_errors`), a column (`app_errors.user_agent`), an index, function or policy name, or `rollback` | A change that breaks version a (a dropped or renamed column, a narrowed type, a NOT NULL without a default), or a rollback that does not restore the schema. |
| `upgrade` | k6 load through the edge while b rolls in | `rollout`, `load`, `b` | A failed or 5xx request during the rollout, or b never serving. |

### Never silent

A collector that cannot run says so. An artefact that could not be collected appears as a `not-collected` hunk (a failing one for `runtime` and `startup`; informational for the image artefacts unless `HARNESS_REQUIRE_STATIC=1`), with a `NOT COLLECTED:` line in the report's reasons. "Not collected" is never reported as "no difference". See [chapter 3](03-reading-a-report.md#degraded-and-not-collected).

## Normalising and masks

Before comparing, the harness **normalises** both captures so that things that must differ between two stacks do not count.

*Structural normalisation* needs no configuration: each side's own origin becomes `{{origin}}`, because the two sides answer on different ports.

*Masks* are the configured part. `normalise/masks.yaml` lists every field the harness deliberately does not compare, each with a reason of at least twenty characters: the `Date`, `ETag` and `x-request-id` headers, Node's runtime gauges on `/metrics`, latency histograms, third-party requests to hosts the stack does not serve, content hashes in asset names, transport headers, and a few CDN headers that exist only in front of production (masks limited to `post-deploy` mode). There are 18 masks, and the file also holds the noise floors of the engines: the screenshot pixel ratio, the metrics and log tolerances, and the timing thresholds (`minRuns`, `alpha`, `minEffect`, `minShiftMs`). A threshold is a mask of a kind.

**A mask is a blind spot you chose.** If a real regression could ever show up in a masked field, the harness will not see it. So:

- the reason must say what noise the mask hides and why that noise cannot be a regression;
- it must be as narrow as it can be: a header by name, a series by anchored prefix, a pattern that keeps the surrounding text;
- adding or loosening one lands in its own pull request, changing nothing else but its notes, its tests and the version bump, so the person reviewing a change never also reviews the blind spot that hides it;
- every report lists which masks fired and which were silent. A mask that never fires is a mask to delete.

Past about 40 masks nobody reviews the list; CI warns at that point. The playbook for deciding between a mask and a fix is [docs/noise-burndown.md](../noise-burndown.md).

## Claims

A **claim** is how a release says what it meant to change. It names an artefact, a scope glob, and either the Rule or changelog entry that justifies the difference, or (since contract 1.3.0) a `rule` id that the release's rules file must contain.

The matcher applies these rules:

1. **Every failing hunk must be claimed.** An unclaimed failing hunk fails a release run.
2. A hunk is assigned to **at most one claim**: the first that matches, in file order. `info` hunks need no claim.
3. A claim that matches nothing is **stale**. It is reported and never gates, so the changelog stays honest: a stale claim means the release did not change what it said it would.
4. A claim is **broad** when its artefact is `*` or its scope is `*`, `**` or only stars. A broad claim without `approvedBy` (a person, never a bot) fails the run.
5. The harness reports **claim hygiene**: hunks per claim, and claims that cover more than ten hunks or are broad but approved. It never gates; it is the smell test for claims becoming a checkbox.

The claims file lives with the release, in the monorepo (`release/claims.yaml`), never in this repository. [Chapter 4](04-writing-claims.md) is the full guide.

## Verdicts

Every run ends in one verdict:

| Verdict | Meaning | Exit |
| --- | --- | --- |
| `PASS` | Nothing needs attention for this mode. | 0 |
| `WARN` | There are findings, but the harness has not earned the right to fail on them, or the evidence is weak. The reasons say which. | 0 |
| `FAIL` | Unclaimed differences (or another finding that gates in this mode), and the harness has the right to fail. | 1 |

`WARN` exits 0 on purpose: a harness that has not earned the right to fail must not block a release. If you want to treat it differently, read `verdict` from `report.json`.

What each mode can return:

| Mode | PASS | WARN | FAIL |
| --- | --- | --- | --- |
| `noise` | no failing hunk | any failing hunk (the harness is advisory until this is fixed), or a clean run on weak evidence (degraded) | never |
| `any-two` | always | never | never |
| `release` | every difference claimed, no unapproved broad claim | the same findings as FAIL, but the A/A rule is not met | unclaimed hunks or unapproved broad claims, and the A/A rule is met |
| `post-deploy` | as `release` | as `release`, or a deployed image that is not the one that was judged | as `release` |
| `migration` | no unclaimed violation | never | any unclaimed expand/contract or rollback violation; needs no A/A |
| `upgrade` | no unclaimed finding | never | any unclaimed failed or 5xx request, or b never serving; needs no A/A |

Stale claims add a reason and never change a verdict. Claims apply in every mode.

## Noise and release: the gate

**Noise** is a difference between two runs of the *same* image: a date rendered on the server, a race in a page, a header derived from the moment. It says nothing about a release. **A release difference** is a difference between the production image and the candidate.

The harness tells them apart with the **A/A run** (`--mode noise`): production against itself. Everything it finds is noise, and the normaliser must mask it, or the app must be made deterministic, before the harness is trustworthy. The nightly A/A writes `noise-status.json`.

The **gate** is the rule that keeps the harness honest: release and post-deploy mode may return `FAIL` only when one of these holds:

- a noise status was supplied and it is **clean** (zero failing hunks), **verified** (no `degraded` marker, meaning every image on both sides was pulled and signature-verified in that run) and **fresh** (no more than seven days old); or
- `--noise skip` was given: an explicit, logged waiver, recorded in the report.

Otherwise the same findings come back as `WARN`, exit 0, and the first reason begins `advisory only:` and says which condition failed. This is the harness's right to fail, and it has to be re-earned continuously: a laptop that sleeps through the night, a registry outage, or a new noisy hunk all take it away until a clean, verified night is recorded again.

Without `--noise`, release and post-deploy mode look in the local noise store (`<HARNESS_HOME>/noise`); `--noise none` says do not look. [Chapter 5](05-noise-and-self-test.md) covers the store, the ratchet and the streak.

The rehearsal modes (`migration`, `upgrade`) are deterministic and gate on their own.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The verdict was `PASS` or `WARN`; or a `FAIL` was overridden with `--override-reason`; or the command simply succeeded. |
| `1` | The verdict was `FAIL` and was not overridden; or `images ensure` could not obtain an image; or `mutants` or `kind rollout` did not succeed; or `doctor` found a tool a run needs missing; or `noise record` found the ratchet broken; or `noise status --require` found a status that does not license a `FAIL`; or `guard` found a violation. |
| `2` | A usage error; or the harness itself failed; or an image may not be judged (not present locally at `run`, or a registry image that is unsigned, signed by the wrong identity, or cannot be checked because cosign is missing). No verdict was reached and there may be no `report.json`. |

The full table by command is in [chapter 7](07-reference.md#exit-codes).
