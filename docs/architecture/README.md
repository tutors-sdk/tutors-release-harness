# Architecture of the Tutors release harness

C4 diagrams of the harness for a new maintainer, a reviewer, or the owner
presenting it. They answer four questions without opening the source: what the
system is, who uses it, what it is built from, and how a run flows.

Every box, arrow and label was traced to code or a document. Each page ends
with an **Evidence** table naming the file for each claim, so a reviewer can
check a diagram in a minute. Where something is planned, or built somewhere
other than the default branch, the diagram says so with a style, never as fact
(see the [legend](#legend)).

**State drawn:** the harness at `origin/main` `5da3a39` (harness 1.4.1, contract
1.4.0), and the monorepo at `origin/main` `5d7283e`. File and line pointers were
re-checked against that code.

## What the harness is, in one paragraph

The harness runs a Tutors release candidate beside the production image, drives
the same scripted traffic through both, normalises the noise, diffs everything
observable (DOM, screenshots, network, headers, accessibility, timing, metrics,
logs, persistence writes, image contents, container posture, startup time) and
fails unless every difference is claimed by a changelog entry or a Rule. It
consumes the monorepo's signed images from Quay by tag or digest, verifies each
signature with cosign before judging anything, and knows nothing of the
monorepo's source except through a loud build-from-ref fallback. It is a
command-line tool (`harness`) that runs the same on a laptop as on GitHub
Actions; the workflows are thin wrappers that add scheduling, dispatch, and a
place to keep the noise history and release records. It gates a release only
while its own A/A run is clean, fresh and verified. Otherwise the same findings
are a warning. Its own signal is ten planted regressions (mutants) it must
catch. It stacks four apps (`reader`, `catalogue`, `live`, `time`), runs six
journeys in three sets, and compares 19 artefacts.

## How to read the set

| Page | C4 level | Read it to learn |
| --- | --- | --- |
| [01-system-context.md](01-system-context.md) | 1, System Context | Who uses the harness and which outside systems it touches, and what flows between them |
| [02-containers.md](02-containers.md) | 2, Container | What runs (CLI, stacks, browser, k6) and what stores state, on a machine and on GitHub |
| [03-components-pipeline.md](03-components-pipeline.md) | 3, Component | Inside the CLI: the run pipeline, capture, compare-claim-gate, image acquisition, the local ops layer |
| [04-dynamic.md](04-dynamic.md) | Dynamic | Sequence diagrams: a release candidate, the nightly A/A, post-deploy, a laptop with no GitHub |
| [05-deployment.md](05-deployment.md) | Deployment | The laptop, the CI runner, kind; where each store and secret lives |
| [06-decisions.md](06-decisions.md) | Decisions | The design decisions visible in the code, each with a pointer |

Suggested paths:

- **Ten minutes, to understand it:** 01, the first diagram of 02, the pipeline
  overview in 03, then 04a.
- **Reviewing a change:** 03 for the module a change touches, then 06 for the
  decision it may bend.
- **Presenting it:** 01, 03's pipeline overview, 04a and 04b, then 06.
- **Operating it:** 04b, 04c, 04d and 05.

Level 4 (code) is not drawn. The source is level 4; each level 3 element names
the file that implements it.

## The C4 levels used

| Level | Scope | Notation here |
| --- | --- | --- |
| 1 System Context | the harness as one box, with people and external systems | one diagram |
| 2 Container | a *container* is a runnable unit or a data store: a process, an image, a directory, a branch. It is not a Docker container unless it says so | four diagrams (machine, compose stacks, GitHub side, state stores) |
| 3 Component | inside the `harness` CLI, the one container with real internal structure | five diagrams, each a zoom of the last |

Every element carries a name, a type tag in brackets, a technology where one
applies, and a short description. Every relationship is labelled with what
flows, and the technology in brackets when it matters. A diagram holds about
12 to 20 elements; where more was needed, it was split.

## Why `flowchart`, not Mermaid's native C4 syntax

Levels 1 to 3 use Mermaid `flowchart` with C4-style classes and subgraphs, not
`C4Context` / `C4Container` / `C4Component`. The reasons:

1. Mermaid's own documentation marks its C4 diagram type as experimental.
2. Native C4 lays elements out in fixed rows with no control over placement, and
   relationship labels overlap once a diagram has more than a handful of arrows.
   These diagrams have up to 25.
3. A legend that distinguishes built, pending and planned needs a per-element
   dashed style, which `flowchart` classes give directly.

The native syntax was not tried on GitHub, so this is a judgement about
control, not a measured failure. `sequenceDiagram` is used for the dynamic views
because it is the natural form there.

## Legend

Colours follow the usual C4 palette. Shape carries the type as well, so a
diagram survives being printed in grey.

```mermaid
flowchart LR
  person(["<b>Person</b><br/>[Person]<br/>rounded ends"]):::person
  focus["<b>Harness</b><br/>[Software System]<br/>the system in focus"]:::focus
  ext["<b>External system</b><br/>[External system]<br/>not ours; grey"]:::ext
  cont["<b>Container</b><br/>[Container: technology]<br/>a runnable unit; blue"]:::container
  store[("<b>Data store</b><br/>[Data store]<br/>cylinder")]:::store
  comp["<b>Component</b><br/>[Component: file]<br/>inside a container; light blue"]:::component
  pending["<b>Pending</b><br/>[amber, dashed]<br/>built on a branch, not on main"]:::pending
  planned["<b>Planned</b><br/>[red, dashed]<br/>designed or documented, not built"]:::planned

  person -->|"solid arrow: built, labelled with what flows"| focus
  focus -.->|"dashed arrow: planned or stands-in-for, said in the label"| ext

  classDef person fill:#08427b,stroke:#052e56,color:#ffffff
  classDef focus fill:#1168bd,stroke:#0b4884,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef pending fill:#fff3d6,stroke:#b7791f,color:#5c3d00,stroke-dasharray:6 4
  classDef planned fill:#ffffff,stroke:#c0392b,color:#c0392b,stroke-dasharray:6 4
```

| Style | Meaning |
| --- | --- |
| solid box, solid arrow | built and on the default branch of its repository |
| **amber dashed box** | **pending:** built on a branch that is not on `origin/main`. Only one element uses it today (the monorepo's `release-harness-report.yml`, see [Pending](#pending)) |
| **red dashed box or arrow** | **planned, not built.** The code has a seam or a document describes it, but nothing runs |
| dashed grey arrow | a relationship that is not a call: "stands in for" (a stub impersonating a service) |
| grey box | external: not part of the harness |

### Planned, not built (red dashed)

- **A message bus and its stub.** The monorepo plans a bus. The harness ships
  the seam (`src/bus/transport.ts`) and one transport, `http-recorder`, but no
  `fixtures/bus/` stub exists. With `HARNESS_BUS` unset the collector adds no
  hunk and says `NOT COLLECTED` in the run log and `capture.json`;
  `HARNESS_REQUIRE_ARTEFACTS=bus` makes that a failing `bus/not-collected` hunk
  (`docs/bus.md`, `src/not-collected.ts`).
- **Three proposed mutants: `posture-root`, `posture-volume`, `slow-boot`.** They
  are not in `mutants/mutants.yaml` (ten mutants), and no file in the repository
  names them; they are taken from the owner's plan. The self-test does say why
  there is no slow-boot mutant: it turns startup sampling off
  (`src/mutants.ts:74-76`).
- **Wiring the clock probe into reports.** `src/clock-probe.ts` is pure and its
  header says "Not wired into the report yet" (line 15).
- **A boot probe as an arbitrary UID** (what OpenShift's restricted-v2 assigns),
  named as "not built yet" in `docs/modes.md`.

### Built on the monorepo side

Read from `origin/main` of `tutors-sdk/tutors-mono-repo` at `5d7283e`. The
diagrams show only what the harness sees of it; they are not a monorepo
architecture document.

| What | Where in the monorepo | PR |
| --- | --- | --- |
| `deploy.yml`: verifies the overlay pins against the registry and signature, then, in the `production` environment, sets `HARNESS_PRODUCTION_TAG` on the harness repository and dispatches `deployed` with `production` and `digests` (all four apps, `time` included) | `.github/workflows/deploy.yml` | #298, #310 |
| Overlays pinned by digest (`newTag` beside `digest`), `pnpm deploy:pin`, `pnpm check:deploy-pins` | `deploy/k8s/overlays/*`, `scripts/deploy-pin.ts`, `scripts/checks/deploy-pins.ts` | #298 |
| `image-build.yml` is the only image publisher (`images.yml` removed) | `.github/workflows/image-build.yml` | #305 |
| The final tag **promotes** the judged `X.Y.Z-rc.N` digest instead of rebuilding; an app that cannot be promoted is rebuilt with a `REBUILT` warning (or fails, with `require_promotion`) | `scripts/promote-image.ts` | #303 |
| The `release-candidate` dispatch carries `runs: 5`, `production_digests` and `candidate_digests` (four apps) and `rules_url` when a `rules.json` was published | `.github/workflows/release-dispatch.yml` | #310 |
| `pnpm release:harness`: builds the `release-candidate` payload from a local clone and can run the harness's `local gate`, `local watch --once` or `local nightly`; a test holds it to the workflow's payload | `scripts/release-harness.ts` | #307 |
| `pnpm release:rules`: writes `rules.json`, the file behind the `rules_url` field and `rule:` claims | `scripts/release-rules.ts` | #308 |
| EARS Rule ids and `pnpm release:claims:draft`, which drafts claim stubs from the Rules that changed | `scripts/release-claims-draft.ts` | #301 |
| The claims check accepts the harness's full artefact vocabulary (19 artefacts) | `scripts/checks/release-claims.ts` | #309 |
| `pnpm check:migrations` and changelog artefact hints for claims | `scripts/checks/migrations.ts`, `CONTRIBUTING.md` | #300 |
| Build identity on one endpoint, `GET /version`; `HARNESS_NOW` frozen clock | `scripts/checks/build-identity.ts` | #296 |
| JSON logs and an `x-request-id` per request | the apps | #297 |

**Not on `origin/main` when checked:** `release-harness-report.yml`, which posts
the harness verdict on the release pull request. It exists on the monorepo
branch `feat/release-dispatch-digests-and-report` (commit `da7850d`, one commit
ahead of main), together with a `report` job in `release-dispatch.yml` that
starts it. It is drawn amber. See [Pending](#pending).

Still on the monorepo's side of the line and not drawn as harness code: the
OpenShift overlays (`deploy/k8s/variants/openshift`) and their conformance check.
The harness does not use them (see [Out of scope](#out-of-scope)).

### Out of scope

**OpenShift is out of scope** (`docs/local.md`, line 13: "OpenShift is out of
scope. The compose and kind substrates are what runs."). The kind substrate
stands in for a cluster with the same admission policy (`restricted` Pod
Security Admission); it does not rehearse Routes, the router's headers or
arbitrary-UID assignment (`deploy/kind/README.md`).

## Pending

Not drawn in the diagrams except where stated. Each gets a one-line update when
it lands.

- **`harness local compare`**: main against the last release in one command. A
  small harness PR; in flight.
- **A deterministic-settle collector fix** for the signed-in reader's A/A flake.
  A small harness PR; in flight.
- **The monorepo's `release-harness-report.yml`** (verdict on the release PR).
  Drawn amber because it is on a monorepo branch, not on `origin/main`, at the
  time of writing (see above). It needs the `HARNESS_TOKEN` permission
  **Actions: read** on the harness repository, and depends on the harness's
  `run-name: release <candidate>`, which is built.

## Keeping them true

Every Mermaid block was parsed with `@mermaid-js/mermaid-cli` (`mmdc`, Mermaid
11.17) against a headless Chrome, and rendered to SVG, as part of writing these
pages. To re-check after editing:

```bash
# from a scratch directory
npm install @mermaid-js/mermaid-cli   # set PUPPETEER_SKIP_DOWNLOAD=1 and pass -p with executablePath
# extract each ```mermaid block to a file and run: mmdc -i block.mmd -o block.svg -p puppeteer.json
```

A change to what the harness does that alters a diagram should change the
diagram in the same PR. The contract (`docs/contract.md`) is held to the code by
`tests/contract.test.ts`; these diagrams are not, so the Evidence tables are
the way to re-verify one.
