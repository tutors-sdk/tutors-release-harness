# 5. Deployment

Where the harness runs and where its state and secrets live. There are three
places it runs: a laptop, a GitHub-hosted runner, and a kind cluster that stands
in for a real cluster. Legend: [README](README.md#legend).

**OpenShift is out of scope.** The harness does not deploy to, test on, or
rehearse OpenShift. `docs/local.md` says so in its second paragraph: "OpenShift
is out of scope. The compose and kind substrates are what runs." The kind
substrate stands in for a cluster with the same admission policy and nothing
more (5C).

The harness deploys nothing to production. Its own "deployment" is a checkout
plus Docker.

## 5A. A laptop

```mermaid
flowchart TB
  subgraph laptop["Developer laptop: Windows 11, macOS or Linux [Deployment node]"]
    subgraph host["Host processes"]
      cli["<b>harness CLI</b><br/>[Node 22+, pnpm, tsx]<br/>pnpm harness, from a checkout"]:::container
      chromium["<b>Playwright Chromium</b><br/>[Host browser]<br/>The host's fonts and anti-aliasing take the screenshots"]:::container
      tools["<b>Host CLIs</b><br/>[cosign 3+, syft, grype, git, bash]<br/>harness doctor says what is missing and how to install it"]:::container
    end
    subgraph docker["Docker Desktop or Engine, Linux containers [Deployment node]"]
      stacks["<b>Compose project</b><br/>[tutors-harness-8hex]<br/>Both stacks and the shared stubs, network 172.29.0.0/24, 13 host ports"]:::container
      k6["<b>k6</b><br/>[grafana/k6, per run]"]:::container
      pg["<b>Postgres</b><br/>[postgres:16-alpine, per migration run]"]:::container
      kind["<b>kind cluster</b><br/>[optional, --substrate kind]<br/>tutors-harness-8hex"]:::container
    end
    checkout[("<b>Checkout</b><br/>[Data store: files]<br/>out/ for runs, .harness/ for HARNESS_HOME")]:::store
    sched["<b>OS scheduler</b><br/>[Task Scheduler or cron, optional]<br/>Runs local nightly and local watch --once"]:::container
  end
  net["<b>Quay, Sigstore, production, monorepo</b><br/>[External systems, over the network]"]:::ext

  cli -->|"docker compose -p project"| stacks
  cli -->|"docker run"| k6
  cli -->|"docker run, exec"| pg
  cli -->|"kind, kubectl"| kind
  cli -->|"Playwright API"| chromium
  cli -->|"spawns"| tools
  chromium -->|"published host ports"| stacks
  chromium -->|"NodePorts 4100 to 4203"| kind
  k6 -->|"project network"| stacks
  cli -->|"reads and writes"| checkout
  sched -->|"starts"| cli
  tools -->|"pull, verify, fetch"| net
  chromium -.->|"post-deploy watch: production"| net

  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
  style laptop fill:#f4f8fc,stroke:#1168bd,stroke-dasharray:4 3
  style host fill:#ffffff,stroke:#8a8a8a
  style docker fill:#ffffff,stroke:#8a8a8a
```

**The compose project name is derived from the checkout path.**
`tutors-harness-<first 8 hex of sha256(real path of the checkout)>`, lowercased
on Windows, so two checkouts or git worktrees of the harness on one machine get
two names and never replace each other's stack (`src/project.ts`). Overrides,
most specific first: `HARNESS_COMPOSE_PROJECT`, `HARNESS_PROJECT`. The plain name
`tutors-harness` is the legacy default from before contract 1.3.0; it may be the
machine owner's, and no command adopts or removes it (`harness doctor` reports
it as "not touched", and `harness kind up` and `down` refuse a cluster of that
name). A run only ever runs `docker compose -p <its own project>` and touches its
own kind namespaces.

**Ports.** Thirteen host ports, each with its own variable; `--port-offset N` on
`harness local ...` and `harness doctor` moves them all, and a variable you set
yourself wins. The compose subnet is **not** configurable, so two harness stacks,
or any Docker network on `172.29.0.0/24`, cannot coexist. A run lock serialises
runs on one machine.

| Ports | Default |
| --- | --- |
| course, identity, edge | 8080, 8443, 3300 |
| side a: reader, catalogue, live, reader-auth, persistence | 3100, 3101, 3102, 3103, 8090 |
| side b: reader, catalogue, live, reader-auth, persistence | 3200, 3201, 3202, 3203, 8091 |
| **time app: pending PR**: time-a, time-b | 3104, 3204 (15 ports in all) |
| kind NodePorts, host side, fixed in `deploy/kind/kind-config.yaml` | 4100 to 4102 and 4200 to 4202; **time app: pending PR** adds 4103 and 4203 |

Two clusters from two checkouts cannot run at once, because every cluster made
from `kind-config.yaml` maps the same host ports.

**Docker Desktop notes** that shape the deployment (`docs/local.md`):
Linux containers only (WSL 2 backend on Windows); its VM clock drifts after sleep
and breaks pulls and signature checks, which `harness doctor` compares against the
host; `bash` must be Git's, not WSL's launcher, for the two scripts that need it
(`HARNESS_BASH`); the harness starts children with `MSYS_NO_PATHCONV=1`.

## 5B. A GitHub-hosted runner

```mermaid
flowchart TB
  subgraph runner["GitHub-hosted runner, one job [Deployment node]"]
    steps["<b>Job steps</b><br/>[actions/checkout, pnpm/action-setup, actions/setup-node 22 with the pnpm cache]<br/>pnpm install --frozen-lockfile"]:::container
    chrome["<b>Chromium</b><br/>[playwright install --with-deps chromium]<br/>Installed per job"]:::container
    cosign["<b>cosign 3</b><br/>[sigstore/cosign-installer v4.1.2]"]:::container
    syft["<b>syft</b><br/>[anchore/sbom-action download-syft, mutants job only]"]:::container
    dockerr["<b>Docker</b><br/>[the runner's own daemon: no install step in any workflow]<br/>Runs the compose project tutors-harness pinned by ci.yml"]:::container
    cli["<b>harness CLI</b><br/>[pnpm harness]"]:::container
    workdir[("<b>Workspace</b><br/>[Data store: files]<br/>out/, .harness/, noise/, releases/, recorded/")]:::store
  end
  cache[("<b>actions/cache</b><br/>[GitHub cache]<br/>.harness/image-cache, key production-images-TAG-run_id")]:::store
  art[("<b>Artifacts, issues, branches</b><br/>[GitHub]")]:::store
  ext["<b>Quay, Sigstore, monorepo</b><br/>[External systems]"]:::ext

  steps --> cli
  cli --> chrome
  cli --> cosign
  cli --> syft
  cli --> dockerr
  cli --> workdir
  cache -->|"restore before images ensure (nightly only)"| workdir
  workdir -->|"save if image_cache=refreshed (nightly only)"| cache
  workdir -->|"upload-artifact, job summary, gh api, git push"| art
  cosign -->|"verify"| ext
  cli -->|"docker pull"| ext

  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef store fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
  style runner fill:#f4f8fc,stroke:#1168bd,stroke-dasharray:4 3
```

- **A pinned runner image.** `nightly-noise.yml`, and the `release` job of
  `release.yml`, and `post-deploy.yml` run on `ubuntu-24.04`, not
  `ubuntu-latest`, because the nightly A/A measures the noise floor of that
  runner image (fonts, anti-aliasing, timing). The three move together, in one PR,
  followed by a fresh noise burn-down (comments in the workflows, and
  `docs/noise-burndown.md`). The migration, upgrade, publish, CI and mutants jobs
  use `ubuntu-latest`.
- **Caches.** `pnpm` through `setup-node`; the production images through
  `actions/cache` for the nightly only, restored with `restore-keys` so the newest
  earlier night is found, and saved only when `images ensure` reports
  `image_cache=refreshed`.
- **State is thrown away with the runner.** The provenance ledger, `out/` and the
  workspace are gone afterwards. What must outlive a job goes to an artifact
  (8 to 30 days), the `noise` branch, the `release-records` branch, or an issue.
- **One checkout per runner.** `ci.yml` pins `HARNESS_COMPOSE_PROJECT=tutors-harness`
  because a runner holds one checkout.
- **No registry credentials.** The images are public and pulled anonymously.
- **Vulnerability scanning.** No workflow installs `grype` or a vulnerability
  database. On a stock runner the `vulns` artefact would therefore be "NOT
  COLLECTED" (informational unless `HARNESS_REQUIRE_STATIC=1`). This is inferred
  from the workflow files and the code; no CI run was made to confirm it.

## 5C. kind: a stand-in for a cluster

```mermaid
flowchart TB
  subgraph host["Host: laptop or runner"]
    direction LR
    cli["<b>harness CLI</b><br/>[kind, kubectl]"]:::container
    chromium["<b>Playwright Chromium</b>"]:::container
    k6["<b>k6</b>"]:::container
    course["<b>Course server</b><br/>[Node process on the host]<br/>Port 8080. The browser fetches the course, the apps never do"]:::container
  end
  subgraph nsa["kind: namespace harness-a, PSA restricted enforce and warn"]
    direction LR
    da["<b>reader, catalogue, live</b><br/>[Deployments and NodePort Services]<br/>NodePorts 30100 to 30102"]:::container
    ta["<b>time</b><br/>[Deployment]<br/>time app: pending PR, 30103"]:::pending
  end
  subgraph nsb["kind: namespace harness-b, PSA restricted enforce and warn"]
    direction LR
    db["<b>reader, catalogue, live</b><br/>[Deployments and NodePort Services]<br/>NodePorts 30200 to 30202"]:::container
    tb["<b>time</b><br/>[Deployment]<br/>time app: pending PR, 30203"]:::pending
  end

  cli -->|"kind create, kind load docker-image, kubectl apply"| da
  cli -->|"same, for side b"| db
  chromium -->|"host ports 4100 to 4202, mapped one to one"| da
  chromium -->|"same"| db
  chromium -->|"tutors.json"| course
  k6 -->|"kind rollout: RollingUpdate under load"| da

  classDef container fill:#2e6fae,stroke:#1f4d7a,color:#ffffff
  classDef pending fill:#fff3d6,stroke:#b7791f,color:#5c3d00,stroke-dasharray:6 4
  style host fill:#ffffff,stroke:#8a8a8a
  style nsa fill:#eef6ee,stroke:#3b7d3b
  style nsb fill:#fdf1e6,stroke:#b5651d
```

Not in kind: the signed-in reader, the identity and persistence stubs, and the
edge. The `auth` journey set is skipped, and the time app (pending PR) has ports
4103 and 4203 on the host.

- **Why restricted PSA.** OpenShift's restricted SCC requires a non-root
  arbitrary UID, no privilege escalation, dropped capabilities and a
  runtime-default seccomp profile. `restricted` Pod Security Admission requires the
  same set. The manifests carry the same security context as the monorepo's
  kustomize base, so a release that passes here would pass admission there
  (`deploy/kind/README.md`).
- **What it does not rehearse:** Routes, the OpenShift router's headers, and the
  arbitrary-UID **assignment** (kind runs the image's own UID). A boot probe as a
  random UID is named "not built yet" in `docs/modes.md`. **This is why OpenShift
  is out of scope: nothing here is OpenShift.**
- **Images:** never pulled by the cluster (`imagePullPolicy: IfNotPresent`), always
  loaded by `kind load docker-image` after `images ensure`; a digest-pinned image
  is loaded under a local tag derived from its digest.
- **The upgrade rehearsal** on kind is a real `RollingUpdate` (`maxUnavailable: 0`,
  `maxSurge: 1`) run with `harness kind rollout`, not part of `harness run --mode
  upgrade`, which is compose-only.
- **`kind down`** deletes the namespaces; the cluster stays until
  `kind delete cluster --name <name>`.

## 5D. Where each store and secret lives

### Stores

| Store | On a laptop | In CI |
| --- | --- | --- |
| Run output | `<checkout>/out/<timestamp>-<mode>/` (`--out`) | the runner's workspace, uploaded as an artifact (7 to 30 days) |
| Noise status and history | `HARNESS_HOME/noise/` | the `noise` branch, force-pushed nightly; the status also as a `noise-status` artifact for 8 days |
| Release records | `HARNESS_HOME/releases/` | the `release-records` branch, one commit per candidate; also inside the `release-report` artifact |
| Image cache | `HARNESS_HOME/image-cache/` | `actions/cache`, path `.harness/image-cache` |
| Provenance ledger | `HARNESS_HOME/image-provenance.json` (`HARNESS_PROVENANCE_FILE` moves it) | a file on the runner, lost with it |
| Override record | `HARNESS_HOME/overrides.jsonl`, hash-chained | `harness-override` issues on this repository |
| Rollback record | `HARNESS_HOME/rollbacks/` | `rollback` issues on this repository |
| Run locks | `HARNESS_HOME/locks/` | `concurrency:` groups |
| Masks, journeys, fixtures, mutants | this repository | this repository |
| Claims, rules | the monorepo checkout (`--claims`, `--rules`) | fetched by URL from the monorepo |

`HARNESS_HOME` defaults to `<checkout>/.harness`, which is gitignored.

### Secrets and credentials

Only what the code and documents establish.

| Item | Where it lives | Used by | Notes |
| --- | --- | --- | --- |
| `HARNESS_TOKEN` | a secret of the **monorepo**: a fine-grained PAT with `contents: write` on the harness repository | the monorepo's `release-dispatch.yml`, to send `repository_dispatch` | what GitHub requires for that call. The harness never holds it |
| `QUAY_USERNAME`, `QUAY_PASSWORD` | secrets of the **monorepo**: a Quay robot account with write access to the four `tutors-*` repositories | the monorepo's `image-build.yml`, to push | **the harness needs no registry credential**: the repositories are public and it pulls anonymously |
| the workflow's `github.token` | GitHub, per job | `gh api` and `gh issue create`, and `git push` in the two publish jobs | read-only by default. `contents: write` only in `nightly-noise.yml` `publish` and `release.yml` `publish-record`. `issues: write` only in `release.yml` `override-record` and in `post-deploy.yml`. A test lists these and fails on any other |
| `pull-requests`, `checks`, `statuses`, `deployments` | never held | | forbidden; a test enforces it |
| cosign signing key | none: signatures are keyless (GitHub OIDC), and the harness only **verifies**, against `HARNESS_COSIGN_IDENTITY` and `HARNESS_COSIGN_ISSUER` | `src/images.ts` | no key material in this repository |
| Repository variables | GitHub, on the harness repository | the workflows | `HARNESS_IMAGE_PREFIX`, `HARNESS_COSIGN_IDENTITY`, `HARNESS_PRODUCTION_TAG`, `HARNESS_PRODUCTION_URLS`. Configuration, not secrets |
| Values that look like secrets in the stacks | `compose.harness.yaml`, `src/substrate/kind.ts` | the apps under test | `PRIVATE_AUTH_SECRET: harness-only-not-a-real-secret-...`, `harness-client-id`, `harness-client-secret`, `harness-anon-key`: fixed fakes that exist only inside a stack |
| Test CA and server certificate | `fixtures/identity/certs/`, committed on purpose | the identity stub, `NODE_EXTRA_CA_CERTS` in the signed-in readers | private keys "protect nothing"; trusted only inside the stack |

The production URLs are configuration (`HARNESS_PRODUCTION_URLS`). Post-deploy
mode sends anonymous requests and needs no credential.

## Evidence

| Claim | Source |
| --- | --- |
| Laptop prerequisites, ports, subnet, project name, scheduling | `docs/local.md`; `src/project.ts`; `src/local/ports.ts`; `src/local/home.ts` |
| Runner images, tool installs, caches | `.github/workflows/nightly-noise.yml`, `release.yml`, `post-deploy.yml`, `ci.yml`, `weekly-mutants.yml` |
| Docker on the runner is the runner's own | inferred: no workflow installs Docker, and `ci.yml` calls `docker compose` |
| No workflow installs grype | `grep` over `.github/workflows`: `syft` only, in `weekly-mutants.yml` |
| kind namespaces, PSA, NodePorts, manifests | `src/substrate/kind.ts`, `deploy/kind/kind-config.yaml`, `deploy/kind/README.md` |
| OpenShift out of scope | `docs/local.md:13`; `deploy/kind/README.md` ("Why restricted PSA stands in for the restricted SCC") |
| Secrets and permissions | `docs/monorepo/README.md`; `docs/contract/workflows.json`; `docs/contract.md` "What the harness does to a pull request"; `fixtures/identity/README.md` |
| time app ports | `git show feat/harness-1.2.1-followups:compose.harness.yaml`, `deploy/kind/kind-config.yaml` on that branch |
