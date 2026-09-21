# 1. System context

The harness as one box: who uses it, and which outside systems it depends on or
stands in for. Legend and conventions: [README](README.md#legend).

```mermaid
flowchart TB
  author(["<b>Release author</b><br/>[Person]<br/>Cuts release/X.Y.Z and writes release/claims.yaml"]):::person
  reviewer(["<b>Reviewer / maintainer</b><br/>[Person]<br/>Reads the verdict, approves broad claims, decides overrides, reviews masks"]):::person
  dev(["<b>Harness developer</b><br/>[Person]<br/>Changes engines, masks, journeys and mutants"]):::person
  ops(["<b>On-call / operator</b><br/>[Person]<br/>Runs the nightly and post-deploy checks, acts on rollback issues"]):::person

  harness["<b>Tutors release harness</b><br/>[Software System]<br/>Runs a candidate beside production through identical stacks, diffs everything observable, fails unless every difference is claimed"]:::focus

  mono["<b>Tutors monorepo + CI</b><br/>[External system: tutors-sdk/tutors-mono-repo]<br/>Builds and signs images, tags candidates, dispatches events, holds claims, rules and migrations"]:::ext
  quay["<b>Quay registry</b><br/>[External system: quay.io/tutors-sdk/tutors-app]<br/>Public repositories of the app images"]:::ext
  sigstore["<b>Sigstore / cosign</b><br/>[External system]<br/>Keyless signatures and SBOM attestations, transparency log"]:::ext
  github["<b>GitHub Actions + API</b><br/>[External system]<br/>Runs the workflows; holds artifacts, two branches and issues"]:::ext
  prod["<b>Production apps</b><br/>[External system: tutors.dev, catalogue, live]<br/>The deployed reader, catalogue and live"]:::ext
  refcourse["<b>Reference course host</b><br/>[External system: reference-course.netlify.app]<br/>The published course the reference journeys read"]:::ext
  backends["<b>Supabase and GitHub OAuth</b><br/>[External systems, impersonated]<br/>What the apps talk to; the harness never contacts them"]:::ext
  bus["<b>Message bus</b><br/>[Planned in the monorepo]<br/>Not built"]:::planned

  author -->|"pushes release branch<br/>and claims.yaml"| mono
  mono -->|"signed images + SPDX SBOM<br/>[image-build.yml]"| quay
  mono -->|"release-candidate dispatch<br/>[repository_dispatch, HARNESS_TOKEN]"| github
  mono -.->|"deployed dispatch: contract built,<br/>monorepo deploy job not yet"| github
  github -->|"starts thin workflow wrappers<br/>on dispatch and schedule"| harness

  harness -->|"pulls by tag or digest<br/>[docker pull, anonymous]"| quay
  harness -->|"verifies signature and<br/>SBOM attestation [cosign 3+]"| sigstore
  harness -->|"claims, rules by URL;<br/>migrations, fallback source by git ref"| mono
  harness -->|"artifacts, job summary with report.md,<br/>noise and release-records branches,<br/>rollback and override issues"| github
  harness -->|"anonymous read-only journeys<br/>[post-deploy, every 15 min]"| prod
  harness -->|"published course fetched<br/>by the reference journeys"| refcourse
  harness -.->|"stands in for them with stubs;<br/>never contacted"| backends
  harness -.->|"planned: topics published per journey;<br/>seam built, no stub"| bus

  reviewer -->|"override reason, approvals,<br/>mask reviews"| harness
  harness -->|"verdict, report.md, report.html"| reviewer
  dev -->|"engine, mask, journey,<br/>mutant changes; version bump"| harness
  ops -->|"runs local nightly and watch;<br/>acts on rollback issues"| harness

  classDef person fill:#08427b,stroke:#052e56,color:#ffffff
  classDef focus fill:#1168bd,stroke:#0b4884,color:#ffffff
  classDef ext fill:#6b6b6b,stroke:#444444,color:#ffffff
  classDef planned fill:#ffffff,stroke:#c0392b,color:#c0392b,stroke-dasharray:6 4
```

## Who uses it

| Person | Uses the harness to | How |
| --- | --- | --- |
| Release author | Learn whether every observable difference in the candidate is one they claimed | Writes `release/claims.yaml` in the monorepo; each claim names an artefact, a scope glob, and a `reason` or a `rule` (`claims/README.md`, `docs/monorepo/README.md`) |
| Reviewer / maintainer | Decide whether a candidate ships; keep the gate honest | Reads `report.md` and `report.html`; can override a FAIL only with a written reason of 20+ characters (`--override-reason`, `--override-by`); reviews masks through CODEOWNERS (`.github/CODEOWNERS`); cuts harness releases as tags `v<version>` (`docs/contract.md`, "Compatibility") |
| Harness developer | Change what is captured, compared or gated | Any engine, mask, journey, gate or mutant change must bump the version and re-run the mutants (`src/ci/engine-change.ts`, `TESTING.md`) |
| On-call / operator | Know whether production behaves as the tested candidate did; keep the noise floor honest | `rollback` issues opened by `post-deploy.yml`; `harness local watch` and `harness local nightly` on a machine; `harness doctor` |

The on-call role is inferred from what the code produces (a `rollback` issue,
a loop that never exits on a difference), not from a role named in the code.

## What flows

| From | To | What flows | Where it is defined |
| --- | --- | --- | --- |
| Monorepo | GitHub | `release-candidate` repository dispatch: production and candidate tags, claims URL, optionally rules URL, digests, migration refs, runs | `docs/monorepo/release-dispatch.yml`, `docs/contract/workflows.json` |
| Monorepo | GitHub | `deployed` dispatch: optionally the deployed tag and image digests. **The monorepo has no deploy job that sends it yet**; the harness side is built | `docs/monorepo/README.md`, "First day on Quay" step 5; `.github/workflows/post-deploy.yml` |
| Monorepo | Quay | Multi-arch images per app, tagged `sha-<short>`, `main`, `X.Y.Z`, `X.Y.Z-rc.N`; cosign signature by digest; SPDX attestation | `docs/images.md`, section 3 |
| Harness | Quay | `docker pull` of each side's images by tag or `repo@sha256:...`; `docker buildx imagetools inspect` to resolve a tag to a digest | `src/images.ts` |
| Harness | Sigstore | `cosign verify` by digest against the identity of the monorepo's `image-build.yml` and GitHub's OIDC issuer; `cosign verify-attestation` for the SBOM. Needs the network and cosign 3 or newer | `src/images.ts`, `src/image-static/sbom.ts`, `docs/local.md` (N3) |
| Harness | Monorepo | `claims.yaml` and `rules.json` fetched by URL (`curl` in the workflow, `--rules` URL in the CLI); `supabase/migrations` by sparse git fetch; source by `git clone` only in the build-from-ref fallback | `.github/workflows/release.yml`, `scripts/fetch-migrations.sh`, `scripts/build-images.sh` |
| Harness | GitHub | Artifacts (`release-report`, `noise-report`, ...); `report.md` appended to the job summary; the `noise` and `release-records` branches; `rollback` and `harness-override` issues | `docs/contract.md` "What the harness does to a pull request"; `docs/contract/workflows.json` |
| Harness | Production apps | Anonymous, read-only requests for the published reference course. Never signs in, never writes | `src/run.ts` (post-deploy branch), `docs/contract.md` |
| Harness | Reference course host | The reader under test fetches `tutors.json` from it during the `reference` journeys, in every mode that runs that set | `traffic/journeys/reference.ts` |
| Harness | Supabase / GitHub OAuth | Nothing is sent. An identity stub and a persistence stub speak their shapes so that signed-in journeys and write attribution work | `fixtures/identity/README.md`, `fixtures/persistence/README.md` |
| Harness | Message bus | Nothing yet: `HARNESS_BUS` unset means "not collected" and says so | `docs/bus.md` |

## Boundaries worth stating

- **The harness never writes to a pull request, commit status or check.** Its
  workflows hold no `pull-requests`, `checks`, `statuses` or `deployments`
  permission, and a test enforces it. `report.md` is shaped as a PR comment,
  but posting it on the release PR is the monorepo's job with the monorepo's
  token (`docs/contract.md`, "What the harness does to a pull request").
- **The only writes it makes to GitHub** are on this repository: the `noise`
  branch, the `release-records` branch, `harness-override` issues, `rollback`
  issues (`docs/contract/workflows.json`, `writePermissions`).
- **It holds no registry credentials.** The Quay repositories are public and
  the harness pulls anonymously (`docs/monorepo/README.md`). The Quay robot
  account and `HARNESS_TOKEN` are secrets of the monorepo.
- **Production is only read**, and only through the anonymous reference-course
  journeys.
- **Everything except dispatch, the `deployed` event and GitHub-hosted
  publication runs on a laptop** with no GitHub (`docs/local.md`).

## Evidence

| Claim | Source |
| --- | --- |
| People and roles | `claims/README.md`; `src/override.ts`; `.github/CODEOWNERS`; `docs/contract.md` (Compatibility, last line); `.github/workflows/post-deploy.yml` |
| External systems | `docs/images.md`; `docs/monorepo/README.md`; `src/run.ts` (post-deploy branch, `externalSide`); `traffic/journeys/reference.ts`; `.github/workflows/*.yml` |
| Stubs stand in, never contacted | `compose.harness.yaml` (identity and persistence services); `fixtures/identity/README.md`; `fixtures/persistence/README.md` |
| Bus planned | `docs/bus.md` ("interface and rule shipped in 1.2.0, disabled until a bus exists"); no `fixtures/bus/` directory exists |
| `deployed` sender not built | `docs/monorepo/README.md`, "First day on Quay" |
