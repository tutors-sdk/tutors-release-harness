# 2. Containers

The runnable units and data stores. In C4 a *container* is anything that runs
or holds state, not necessarily a Docker container; the technology tag says
which. Four views: what runs on a machine (A), the compose stacks up close (B),
the GitHub side (C), and the state stores (D). Legend:
[README](README.md#legend).

The **time** app is drawn amber and dashed: **time app: pending PR** (built on
`feat/harness-1.2.1-followups`, not in this branch).

## 2A. What runs on a machine (laptop or CI runner)

```mermaid
flowchart LR
  subgraph sys["Tutors release harness [Software System]"]
    cli["<b>harness CLI</b><br/>[Container: Node.js 22+, TypeScript via tsx]<br/>run, images, stack, kind, mutants, compare, doctor, noise, guard, override, local"]:::container
    compose["<b>Compose substrate</b><br/>[Container: Docker Compose, compose.harness.yaml]<br/>Two isolated stacks A and B plus shared stubs (see 2B)"]:::container
    kind["<b>kind substrate</b><br/>[Container: kind cluster + kubectl]<br/>Namespaces harness-a and harness-b under restricted PSA"]:::container
    chromium["<b>Playwright Chromium</b><br/>[Container: host browser process]<br/>Drives the journeys and captures each page"]:::container
    k6["<b>k6</b><br/>[Container: grafana/k6 image, docker run --rm]<br/>Load and rollout traffic"]:::container
    tools["<b>Image tooling</b><br/>[Container: host CLIs docker, cosign, syft, grype]<br/>Pull, verify, inspect, SBOM, scan"]:::container
    pg["<b>Throwaway Postgres</b><br/>[Container: postgres:16-alpine]<br/>Migration rehearsal only"]:::container
    mutants["<b>Mutant images</b><br/>[Container: local images tutors-harness/mutant-name]<br/>Base reader image plus one planted fault"]:::container
    home[("<b>HARNESS_HOME store</b><br/>[Data store: files, default checkout/.harness]<br/>Noise history, release records, override log, image cache (see 2D)")]:::store
    out[("<b>Run output</b><br/>[Data store: out/timestamp-mode/]<br/>a/ and b/ captures, report.json, .html, .md, noise-status.json, release-record.json")]:::store
  end

  quay["<b>Quay registry</b><br/>[External system]"]:::ext
  sigstore["<b>Sigstore / cosign</b><br/>[External system]"]:::ext
  mono["<b>Tutors monorepo + CI</b><br/>[External system]"]:::ext
  prod["<b>Production apps</b><br/>[External system]"]:::ext
  refcourse["<b>Reference course host</b><br/>[External system]"]:::ext

  cli -->|"docker compose up, down, logs -p project<br/>[docker CLI]"| compose
  cli -->|"kind create, kind load, kubectl apply<br/>[kubectl]"| kind
  cli -->|"launches once per side, runs journeys<br/>[Playwright API]"| chromium
  cli -->|"docker run, --network project_default<br/>[docker CLI]"| k6
  cli -->|"spawns pull, inspect, verify, SBOM, scan"| tools
  cli -->|"docker run, exec psql, pg_dump"| pg
  cli -->|"docker build from base reader"| mutants
  mutants -->|"used as side b reader image"| compose
  chromium -->|"HTTP: apps, course, identity, persistence stub"| compose
  chromium -->|"HTTP via NodePorts 4100 to 4203"| kind
  chromium -->|"anonymous reference journeys<br/>[post-deploy]"| prod
  chromium -->|"fetches the published course"| refcourse
  k6 -->|"request rate at reader-a and reader-b;<br/>through the edge for upgrade"| compose
  tools -->|"docker pull; buildx imagetools inspect"| quay
  tools -->|"cosign verify, verify-attestation"| sigstore
  cli -->|"migrations, claims, rules by ref or URL;<br/>build-from-ref source"| mono
  cli -->|"reads and writes"| home
  cli -->|"writes captures and reports"| out

  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
  style sys fill:#f4f8fc,stroke:#1168bd,stroke-dasharray:4 3,color:#1168bd
```

| Container | Technology | What it holds or does | Source |
| --- | --- | --- | --- |
| harness CLI | Node 22+ (`engines.node`), TypeScript run by `tsx`, launched by `bin/harness.mjs` or `pnpm harness` | Parses arguments, runs the pipeline, pulls and verifies images, drives the substrates, writes reports; also the local ops commands | `src/cli.ts`, `package.json`, `bin/harness.mjs` |
| Compose substrate | `docker compose -p <project> -f compose.harness.yaml`; project `tutors-harness-<8 hex of the checkout path>` | The default substrate: two full stacks and the fixtures they share | `compose.harness.yaml`, `src/stack.ts`, `src/project.ts` |
| kind substrate | kind, kubectl; cluster `tutors-harness-<8 hex>`; two namespaces under `restricted` PSA | The same two sides as Deployments and NodePort Services. Course server runs as a Node process on the host. The signed-in reader and stubs are not in it, so the `auth` journey set is skipped | `src/substrate/kind.ts`, `deploy/kind/README.md` |
| Playwright Chromium | `playwright` ^1.63, `@axe-core/playwright`; the host's Chromium, launched with `--host-resolver-rules=MAP *.harness.test 127.0.0.1` | Runs the six journeys and captures the semantic DOM, screenshot, network, console, headers, axe, focus order and timing | `src/collectors/browser.ts`, `traffic/journeys/` |
| k6 | `grafana/k6:latest` unless `HARNESS_K6_IMAGE` pins it; started per side with `docker run --rm` | Fixed-rate requests at the reader; in upgrade mode, requests through the edge while the candidate is rolled in | `src/collectors/load.ts`, `src/modes/upgrade.ts`, `traffic/load/reader.js` |
| Image tooling | host CLIs `docker`, `cosign` (3+), `syft`, `grype`; each behind an injected `Exec` so tests never start one | Pull, inspect, verify signatures and attestations, generate SBOMs, scan | `src/images.ts`, `src/image-static/` |
| Throwaway Postgres | `postgres:16-alpine` (`HARNESS_POSTGRES_IMAGE`) | Migration mode's schema catalogues, snapshot and rollback rehearsal. Removed afterwards | `src/migration/supabase-postgres.ts` |
| Mutant images | Docker images `tutors-harness/mutant-<name>:latest` built from the base reader image, with `mutants/wrap.mjs` planting an HTTP-edge fault, or a changed base or added package | The harness's own negative fixtures | `src/mutants.ts`, `src/mutant-build.ts`, `mutants/` |
| HARNESS_HOME store | Plain files under `HARNESS_HOME`, default `<checkout>/.harness` | What outlives one run on this machine | `src/local/home.ts` |
| Run output | `out/<UTC timestamp>-<mode>/` | One run's captures and reports | `src/run.ts`, `docs/contract.md` "Output directory" |

## 2B. The compose substrate, up close

Two stacks that differ **only in the image reference**, on one Compose network,
plus the fixtures both sides share. `identity` sits at the fixed address
`172.29.0.10`, which the signed-in readers' `extra_hosts` point `github.com` and
`api.github.com` at.

```mermaid
flowchart LR
  cli["<b>harness CLI</b><br/>[Container]"]:::container
  chromium["<b>Playwright Chromium</b><br/>[Container]"]:::container
  k6["<b>k6</b><br/>[Container]"]:::container

  subgraph side["Side X, made twice: a and b"]
    apps["<b>reader-X, catalogue-X, live-X</b><br/>[Container: app image]<br/>a: ports 3100 to 3102, b: 3200 to 3202"]:::container
    timex["<b>time-X</b><br/>[Container: app image]<br/>time app: pending PR, a: 3104, b: 3204"]:::pending
    authx["<b>reader-auth-X</b><br/>[Container: reader image]<br/>Sign-in on, a: 3103, b: 3203"]:::container
    percx["<b>persistence-X</b><br/>[Container: Node stub]<br/>Records every write, a: 8090, b: 8091"]:::container
  end

  subgraph shared["Shared, one instance each"]
    course["<b>course</b><br/>[Container: Node static server]<br/>Fixture course, port 8080"]:::container
    identity["<b>identity</b><br/>[Container: Node stub, TLS, test CA]<br/>GitHub-OAuth-shaped, 172.29.0.10, port 8443"]:::container
    edge["<b>edge</b><br/>[Container: Node proxy, profile upgrade]<br/>Switchable router, port 3300"]:::container
    busstub["<b>bus stub</b><br/>[Planned]<br/>Not built: no fixtures/bus"]:::planned
  end

  chromium -->|"journeys, both sides"| apps
  chromium -->|"tutors.json"| course
  chromium -->|"browser writes"| percx
  cli -->|"reads and resets write log"| percx
  cli -->|"/metrics, logs, posture, startup"| apps
  cli -->|"/metrics, logs, posture, startup;<br/>no journey drives it"| timex
  k6 -->|"load"| apps
  k6 -->|"upgrade: load"| edge
  edge -->|"upstream a, then b"| apps
  authx -->|"OAuth [HTTPS]"| identity
  authx -->|"PUBLIC_SUPABASE_URL"| percx
  cli -.->|"planned"| busstub

  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef pending fill:#fff3d6,stroke:#b7791f,color:#5c3d00,stroke-dasharray:6 4
  classDef planned fill:#ffffff,stroke:#c0392b,color:#c0392b,stroke-dasharray:6 4
```

All of this is one Compose project, `tutors-harness-<8 hex>`, on the network
`172.29.0.0/24`. Side X is drawn once because the two sides are the same service
definitions with a different image and port; `compose.harness.yaml` has the
services `reader-a`, `reader-b`, `persistence-a`, and so on. The shared stubs run
`node:22-bookworm-slim`, read-only, as UID 1001.

What makes the two sides comparable:

- Every app service uses the same YAML anchors (`x-app`, `x-env`, `x-auth-env`),
  so nothing differs but the image (`compose.harness.yaml` header comment).
  `tests/stack.test.ts` holds the two sides to that.
- The **persistence stub is per side**, so a write is attributable to a side.
  The identity, course and edge services are shared.
- Apps run as production does: anonymous mode, read-only root, `tmpfs /tmp`,
  `cap_drop: ALL`, `no-new-privileges`, JSON logs, a frozen `HARNESS_NOW`.
- The reader containers get `HARNESS_PERSISTENCE_URL`, which no app reads; the
  `anon-write` mutant does (`mutants/wrap.mjs`).
- The k6 container joins the project network to reach `reader-a` and `reader-b`
  by service name (`COMPOSE_NETWORK` in `src/stack.ts`).
- Host ports are 13 in this branch (15 with the time app), each with its own
  variable; `--port-offset` on the local commands moves them all.

## 2C. The GitHub side: workflows, branches, artifacts

The workflows are **thin wrappers**: everything they ask of the harness is a
`pnpm harness ...` line, and `tests/local-parity.test.ts` holds those lines to
the plans of the local wrappers. What is not a harness command is plumbing in
shell: `curl` for claims, `gh api` for the noise status and release record,
`git` and `jq` in the `publish-record` job, `gh issue create` for the two
issue labels.

```mermaid
flowchart LR
  mono["<b>Tutors monorepo + CI</b><br/>[External system]"]:::ext
  cron["<b>GitHub schedules</b><br/>[External platform]<br/>cron 17 2 * * *, every 15 min, weekly"]:::ext

  ci["<b>ci.yml</b><br/>[Container: workflow]<br/>every PR and push to main: unit tests, masks guard, two-stacks A/A smoke"]:::container
  nightly["<b>nightly-noise.yml</b><br/>[Container: workflow]<br/>A/A on the production tag, then publish"]:::container
  release["<b>release.yml</b><br/>[Container: workflow]<br/>release, migration, upgrade, publish-record, override-record"]:::container
  post["<b>post-deploy.yml</b><br/>[Container: workflow]<br/>reference journeys against production"]:::container
  weekly["<b>weekly-mutants.yml</b><br/>[Container: workflow]<br/>engine-change guard, ten mutants, also on every PR"]:::container

  noiseb[("<b>noise branch</b><br/>[git branch, force-pushed]<br/>status, history, summary")]:::store
  recb[("<b>release-records branch</b><br/>[git branch, one commit per candidate]")]:::store
  art[("<b>Workflow artifacts</b><br/>release-report 30d, noise-report 8d, post-deploy-report 14d")]:::store
  issues[("<b>Issues</b><br/>labels rollback and harness-override")]:::store
  cli["<b>harness CLI</b><br/>[Container]<br/>every step is a pnpm harness line"]:::container

  mono -->|"release-candidate dispatch"| release
  mono -->|"deployed dispatch, deploy.yml announce"| post
  cron --> nightly
  cron --> post
  cron --> weekly
  nightly -->|"force-push"| noiseb
  release -->|"publish-record"| recb
  nightly -->|"upload"| art
  release -->|"upload"| art
  post -->|"upload"| art
  release -->|"harness-override issue"| issues
  post -->|"rollback issue"| issues
  noiseb -->|"latest status"| release
  noiseb -->|"latest status"| post
  recb -->|"release record"| post
  art -->|"recorded release-report"| post
  ci --> cli
  nightly --> cli
  release --> cli
  post --> cli
  weekly --> cli

  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
```

Only four write scopes exist, all on this repository, and a test lists them:
`nightly-noise.yml` `publish` (`contents`, the `noise` branch), `release.yml`
`publish-record` (`contents`, the `release-records` branch), `release.yml`
`override-record` (`issues`), `post-deploy.yml` (`issues`)
(`docs/contract/workflows.json`, `writePermissions`).

## 2D. State stores

What outlives one run, where it lives on a machine, and what stands in for it on
GitHub. Every store on the left has a local home, so nothing exists only inside
a workflow (`docs/local.md`).

```mermaid
flowchart LR
  ensure["<b>harness images ensure</b><br/>[Command]"]:::component
  runrel["<b>harness run, release mode</b><br/>[Command]"]:::component
  runany["<b>harness run</b><br/>[Command]<br/>any mode, on an applied override"]:::component
  rec["<b>harness noise record</b><br/>[Command]"]:::component
  gatecmd["<b>run, release or post-deploy</b><br/>[Command]<br/>reads the noise status"]:::component
  watch["<b>harness local watch</b><br/>[Command]"]:::component
  wrappers["<b>harness local nightly, gate, mutants</b><br/>[Command]"]:::component

  subgraph home["HARNESS_HOME, default checkout/.harness [Data store: files]"]
    noise[("<b>noise/</b><br/>noise-status.json, noise-history.json, noise-summary.md<br/>GitHub twin: noise branch")]:::store
    cache[("<b>image-cache/</b><br/>images.tar, manifest.json<br/>GitHub twin: actions/cache")]:::store
    ledger[("<b>image-provenance.json</b><br/>per local image id: how it was obtained and verified<br/>GitHub twin: a file on the runner")]:::store
    releases[("<b>releases/</b><br/>candidate.json and release.json<br/>GitHub twin: release-records branch")]:::store
    overrides[("<b>overrides.jsonl</b><br/>append-only, hash-chained<br/>GitHub twin: harness-override issues")]:::store
    rollbacks[("<b>rollbacks/</b><br/>what a failing watch would have opened<br/>GitHub twin: rollback issues")]:::store
    locks[("<b>locks/</b><br/>run.lock, watch.lock<br/>GitHub twin: concurrency groups")]:::store
  end

  ensure -->|"records provenance"| ledger
  ensure -->|"saves after a fully verified pull; restores on registry outage"| cache
  runrel -->|"writes the release record"| releases
  runany -->|"appends, when a FAIL was overridden"| overrides
  rec -->|"appends the night, rewrites status, history, summary"| noise
  noise -->|"default source of --noise when omitted"| gatecmd
  releases -->|"--deployed looks the record up"| gatecmd
  ledger -->|"run reads it before starting anything"| gatecmd
  watch -->|"writes on a FAIL"| rollbacks
  wrappers -->|"take"| locks
  watch -->|"takes"| locks

  classDef component fill:#85bbf0,stroke:#5d82a8,color:#000000
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  style home fill:#f4f8fc,stroke:#1168bd,stroke-dasharray:4 3
```

| Store | Written by | Read by | Contract status |
| --- | --- | --- | --- |
| `noise/` | `harness noise record` (local nightly; the workflow's `publish` job writes the branch) | release and post-deploy mode (default `--noise`), `harness noise status`, `harness noise history` | file shapes are contract (`noise-status.schema.json`); the store's location is not |
| `releases/` | release mode, always, unless `recordRelease` is off (the mutants) | post-deploy mode, `--deployed <tag>` | `release-record.schema.json` |
| `image-cache/` | `images ensure --image-cache` | `images ensure`, only when the registry cannot answer | not contract |
| `image-provenance.json` | `images ensure`, and `run` for local images | `run`, `stack up`, `kind up`, which refuse an unverified registry image | not contract; `HARNESS_PROVENANCE_FILE` moves it |
| `overrides.jsonl` | any `run` or `compare` whose FAIL was overridden | `harness override list` | not contract |
| `rollbacks/`, `locks/` | `harness local watch`, `harness local ...` | a person; the lock check | not contract |

## Evidence

| Claim | Source |
| --- | --- |
| Containers of 2A, technologies | `src/cli.ts`, `bin/harness.mjs`, `src/stack.ts`, `src/substrate/kind.ts`, `src/collectors/browser.ts` (`launchBrowser`), `src/collectors/load.ts` (`K6_IMAGE`), `src/migration/supabase-postgres.ts` (`PG_IMAGE`), `src/mutants.ts` |
| Compose services, ports, addresses | `compose.harness.yaml` |
| Persistence stub routes | `fixtures/persistence/stub.mjs` (`/_harness/writes`, `/_harness/reset`); `src/persistence/supabase-rest.ts` |
| Edge, profile `upgrade` | `compose.harness.yaml` (`edge`), `fixtures/edge/edge.mjs`, `src/modes/upgrade.ts` |
| Course fetched by the browser, not the apps | `compose.harness.yaml` comment on `course`; `deploy/kind/README.md` |
| Identity routing | `fixtures/identity/README.md`; `src/collectors/browser.ts` (`context.route`) |
| Bus stub not built | `docs/bus.md`; no `fixtures/bus/` |
| time app | `git show feat/harness-1.2.1-followups:compose.harness.yaml` (`time-a`, `time-b`) |
| Workflow triggers, jobs, artifacts, branches | `.github/workflows/*.yml`, `docs/contract/workflows.json` |
| Local state paths | `src/local/home.ts`, `docs/local.md` "Where state lives" |
