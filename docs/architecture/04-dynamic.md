# 4. Dynamic views

Four scenarios as sequence diagrams (4c is two diagrams). Everything drawn is
built; the monorepo side was read from its `origin/main` at `c14c3ee`
(`deploy.yml`, `image-build.yml` promotion, `pnpm release:harness`). Legend and
conventions: [README](README.md#legend).

Where a default changes when the pending PR lands, it is in the notes:
**time app: pending PR** adds the `time` app to every stack and image step, and
raises the `--runs` default of the nightly and release workflows from 3 to 5
(see the [README](README.md#what-pending-pr-contains)).

## 4a. A release candidate, end to end

Two diagrams: from the push to the verified images, then from the images to the
verdict and the release record.

### 4a-1. Dispatch and image acquisition

```mermaid
sequenceDiagram
  autonumber
  participant Author as Release author
  participant Mono as Monorepo and its CI
  participant Quay as Quay registry
  participant GH as GitHub Actions
  participant Job as release.yml job
  participant CLI as harness CLI
  participant Sig as Sigstore

  Author->>Mono: push release/X.Y.Z with release/claims.yaml
  Mono->>Mono: tag vX.Y.Z-rc.N, read the production tag from the reader overlay on main
  Mono->>Quay: image-build.yml pushes images, signs by digest, attaches SPDX SBOM
  Mono->>Quay: wait until the registry serves every tag, read the digests
  Mono->>GH: repository_dispatch release-candidate, using HARNESS_TOKEN
  Note over Mono,GH: payload: production, candidate, claims_url, runs, migrations_a and b, optionally rules_url and both digest sets
  GH->>Job: start release.yml, three jobs: release, migration, upgrade
  Job->>CLI: harness images ensure --a production --b candidate, with --a-digests and --b-digests if sent
  loop each side
    opt digests were sent
      CLI->>Quay: buildx imagetools inspect tag, must equal the pinned digest
    end
    CLI->>Quay: docker pull, by digest when pinned
    CLI->>Sig: cosign verify by digest, identity image-build.yml, GitHub OIDC issuer
  end
  alt tag not in the registry and the image is not pinned
    CLI->>Mono: git clone the ref, build the images here, recorded built-from-ref
    Note over CLI: loud, and never evidence for a release
  else unsigned, wrong identity, moved tag, cosign missing
    CLI-->>Job: exit 2, cannot judge
  end
  CLI-->>Job: exit 0, provenance kept in image-provenance.json
```

Two things about the monorepo side of this diagram:

- `release-dispatch.yml` builds the payload with `gh api` and `jq`. The same
  payload can be built from a local clone with `pnpm release:harness` (#307),
  which reads git only and dispatches nothing; a monorepo test holds the two to
  the same fields and order. `rules_url` points at the `rules.json` that
  `pnpm release:rules` (#308) writes.
- The candidate's image built here, `X.Y.Z-rc.N`, is the one that ships. On the
  final tag `image-build.yml` promotes its digest (see 4c-1).

### 4a-2. Capture, compare, claim, gate, record

```mermaid
sequenceDiagram
  autonumber
  participant Job as release.yml job
  participant CLI as harness CLI
  participant Mono as Monorepo
  participant Stacks as Compose stacks A and B
  participant Br as Chromium and k6
  participant Noise as noise branch
  participant Out as Artifacts and job summary
  participant Rec as release-records branch

  Job->>Mono: curl claims_url into claims.yaml
  Job->>Noise: gh api noise-status.json, then harness noise status vets it
  Job->>CLI: harness run --mode release --a --b --runs 3 --load 20x30s with claims, rules, digests, noise file
  CLI->>Mono: GET rules.json if rules_url was sent
  Note over CLI: claims and rules load first, an invalid file is exit 2 with no stack started
  CLI->>CLI: image provenance for both sides, then manifest, SBOM and vulnerabilities from the images
  CLI->>Stacks: docker compose up -d --wait, same stack, only the image differs
  loop side a, then side b
    CLI->>Stacks: read /metrics before
    loop each journey, each run
      CLI->>Stacks: reset the persistence ledger
      Br->>Stacks: journey over HTTP, capturing DOM, network, console, headers, axe, focus, timing
      CLI->>Stacks: read the persistence ledger
    end
    CLI->>Stacks: read /metrics after, read container logs
    Br->>Stacks: k6 at 20 req/s for 30 s
    CLI->>Stacks: posture, then restart each app for startup time
  end
  CLI->>Stacks: docker compose down
  CLI->>CLI: normalise with masks.yaml, run every engine
  CLI->>CLI: match every failing hunk to a claim
  CLI->>CLI: gate, FAIL only if the noise status is clean, verified and at most 7 days old
  CLI->>CLI: write report.json, report.html, report.md, then release-record.json
  CLI-->>Job: exit 0 for pass or warn, 1 for fail
  Job->>Out: upload release-report, append report.md to the job summary
  Job->>Rec: publish-record pushes releases/candidate.json, and releases/release.json if it could ship
  Note over Out: the harness does not post on the PR. Posting report.md is the monorepo's job
```

Notes:

- The `migration` and `upgrade` jobs run alongside the `release` job on separate
  runners. `migration` fetches migrations from two monorepo refs and needs no
  images. `upgrade` runs its own `images ensure`, then rolls `b` in through the
  edge under load.
- `publish-record` runs whenever `release` did not skip; a run that never
  reached a verdict left no record and that is not an error. A record for a
  candidate is written whatever its verdict. The record under the release's own
  name (`16.3.0.json`) is only the newest candidate that could ship (verdict not
  FAIL, or a FAIL that was overridden).
- With `override_reason` given on a manual dispatch, the verdict stays FAIL, the
  job exits 0, and `override-record` opens a `harness-override` issue. A
  `repository_dispatch` payload cannot override.

## 4b. The nightly A/A and the noise ratchet, including the degraded path

The harness may only FAIL a release while the latest nightly A/A is clean,
verified and at most seven days old. This is how that status is produced.

```mermaid
sequenceDiagram
  autonumber
  participant Cron as GitHub schedule
  participant Noise as noise job
  participant Cache as actions/cache
  participant CLI as harness CLI
  participant Quay as Quay registry
  participant Pub as publish job
  participant NB as noise branch
  participant Rel as release and post-deploy runs

  Cron->>Noise: 02:17 UTC every night
  Noise->>Cache: restore .harness/image-cache, newest earlier key
  Noise->>CLI: images ensure --a TAG --b TAG --image-cache
  alt registry answers and the signature verifies
    CLI->>Quay: docker pull, cosign verify by digest
    CLI->>CLI: provenance pulled+verified, refresh the cache with docker save
    CLI-->>Noise: image_cache=refreshed
    Noise->>Cache: save for the next night
  else registry cannot answer, rate limit or 5xx or timeout
    CLI->>Cache: docker load last night's verified images
    CLI->>CLI: provenance cached, cache left alone
    CLI-->>Noise: image_cache=used, the night will be DEGRADED
  else tag is absent from the registry
    Note over CLI: an absent tag never borrows a cache, a bare tag falls to build from ref, which is built-from-ref and also degraded
  end
  Noise->>CLI: run --mode noise --a TAG --b TAG --runs 3 --load 20x30s --require-verified
  CLI->>CLI: capture both sides, normalise, compare
  CLI->>CLI: any image not pulled+verified in this run gives a degraded reason
  CLI-->>Noise: noise-status.json with ranAt, clean, hunks and degraded if any
  Note over CLI: clean and verified is PASS, any diff is WARN, clean but degraded is WARN
  Noise->>Noise: upload noise-status and noise-report, 8 days
  Note over Noise,Pub: publish runs only when the noise job succeeded, otherwise the last status ages out
  Pub->>NB: gh api noise-history.json
  Pub->>CLI: noise record --status --report --store publish --tag --run-url --summary
  CLI->>CLI: append the night, assess the ratchet and the clean streak of 7
  Note over CLI: ratchet broken means the count had reached 0 on verified evidence and is not 0 tonight. A degraded night neither extends the streak nor breaks the ratchet
  CLI-->>Pub: exit 1 if the ratchet is broken
  Pub->>NB: force-push noise-status.json, history, summary, README, even if the ratchet is broken
  Pub-->>Pub: fail the night if the ratchet is broken
  Rel->>NB: gh api noise-status.json
  Rel->>CLI: the gate trusts it only if clean, no degraded, at most 7 days old, else WARN
```

Points a maintainer needs:

- The status is published even when dirty or degraded, so a bad night
  **supersedes** an older clean one. A clean night from last week never stands in
  for a dirty one since (`docs/contract.md`).
- A degraded night does not count in either direction. Release runs then only
  warn until a verified clean night is published.
- Statistics: with three runs a side the timing engine cannot reach alpha 0.05.
  The pending PR fixes the Mann-Whitney function and moves the nightly to five
  runs. Reports and A/A history from before it are not evidence about the
  corrected engines (`docs/releases/1.3.0.md` on `feat/harness-1.2.1-followups`).

## 4c. From the judged candidate to production, and the post-deploy check

Two diagrams: the monorepo's path from the judged rc to a `deployed` event
(built, on `origin/main`), then the harness's response.

### 4c-1. Promote, pin, verify, announce

```mermaid
sequenceDiagram
  autonumber
  participant Maint as Maintainer
  participant IB as image-build.yml
  participant Quay as Quay registry
  participant Sig as Sigstore
  participant Dep as deploy.yml
  participant Env as production environment
  participant GH as GitHub API
  participant HR as Harness repository

  Note over IB,Quay: the judged image is X.Y.Z-rc.N, built and signed earlier (4a-1)
  Maint->>IB: push tag vX.Y.Z
  IB->>Quay: per app, promote-image plan: rc tag exists, same git tree, revision label is the rc commit
  IB->>Sig: cosign verify the rc digest, identity image-build.yml at the rc tag
  alt every check passes for the app
    IB->>Quay: retag the rc digest as X.Y.Z, X.Y, latest, sha-short, nothing rebuilt
    Note over IB: Trivy runs again on the promoted digest before any tag moves
  else no rc, different tree, wrong revision or signature
    IB->>Quay: rebuild, sign and attest, warning and job summary say REBUILT
    Note over IB: with require_promotion the run fails instead of rebuilding
  end
  Maint->>Maint: pnpm deploy:pin X.Y.Z rewrites the four overlays, newTag beside digest, opens a PR
  Maint->>Dep: PR touches deploy/k8s/overlays, deploy.yml verify job
  Dep->>Quay: check:deploy-pins --registry, the tag resolves to the pinned digest
  Dep->>Sig: the digest is signed by image-build.yml, either signing ref
  Note over Maint: merge, then roll out outside the repository (oc apply -k or GitOps)
  Dep->>Dep: a push to main changed a pin, so announce may run
  Dep->>Env: announce job waits for the environment's reviewers, if any are configured
  Env-->>Dep: approved, the rollout has happened
  Dep->>HR: gh variable set HARNESS_PRODUCTION_TAG, using HARNESS_TOKEN
  Dep->>GH: repository_dispatch deployed with production and digests
```

- **The released digest equals the judged rc digest** for every app that was
  promoted, so the digest in the overlays, the digest in the `deployed` payload
  and the digest the harness recorded in the release record are the same bytes.
  A `REBUILT` app breaks the equality, and then post-deploy's journeys are the
  only check that production behaves like the judged image
  (`guides/Release-Strategy.md`, "Pinned digest equals judged digest").
- **Where the digests come from.** `deploy.yml` sends the digests the overlays
  pin, after checking them against the registry and the signature. It does not
  read a digest off a running cluster, because the rollout is outside the
  repository.
- **Only three digests are sent.** The payload's `digests` is built from
  `reader`, `catalogue` and `live`. Once the `time` app is in the harness stack
  (pending PR), the release record will hold a `time` digest too, and
  `judgeDeployment` treats "the record has a digest and the deploy reported none"
  as a gap: status `incomplete`, a warning. This is inferred from
  `deploy.yml`'s `jq` expression and `src/release-record.ts:172`; no run
  confirmed it. Either the monorepo sends `time` or the harness ignores it.

### 4c-2. The post-deploy run

The every-15-minutes schedule runs the same job with no payload; only a
`deployed` dispatch carries a tag and digests to check.

```mermaid
sequenceDiagram
  autonumber
  participant GH as GitHub Actions
  participant PD as post-deploy.yml job
  participant Art as Artifacts
  participant NB as noise branch
  participant RB as release-records branch
  participant CLI as harness CLI
  participant Prod as Production apps
  participant Iss as Issues

  Note over GH: deploy.yml already set HARNESS_PRODUCTION_TAG, so tonight's noise run and the weekly mutants use the new tag
  GH->>PD: repository_dispatch deployed, or the 15 minute schedule
  PD->>Art: download release-report of the latest successful release.yml run
  PD->>NB: gh api noise-status.json, harness noise status vets it
  opt the payload named a deployed tag
    PD->>RB: gh api releases/tag.json
  end
  PD->>CLI: run --mode post-deploy --recorded --production URLs --noise, and --deployed --release-record --deployed-digests if sent
  CLI->>CLI: load the recorded b capture, keep only the reference journeys
  CLI->>Prod: reference-course-reads with Chromium, anonymous and read-only
  Prod-->>CLI: course, topic, lab and note pages
  opt a deployed tag or digests were given
    CLI->>CLI: compare the digests the deploy reported with the release record
    Note over CLI: status is match, differs, incomplete, no-record or not-reported
  end
  CLI->>CLI: normalise, CDN header masks apply only here, compare against the recorded capture, gate
  Note over CLI: FAIL needs a trusted noise status, else WARN. A deployment mismatch turns PASS into WARN and never softens a FAIL
  CLI-->>PD: exit 1 on FAIL, else 0
  PD->>Art: upload post-deploy-report, 14 days
  alt exit 1
    PD->>Iss: gh issue create, label rollback, body report.md
  end
```

What the digest comparison establishes: `judgeDeployment` compares the digests
**the deploy job reported** (the verified overlay pins) with the digests
**release mode recorded**. The harness does not read a digest off production, so
this catches a deploy that pins something other than what was judged, not a
cluster that runs something other than what was pinned (`src/release-record.ts`).

## 4d. A purely local run, from a laptop with no GitHub

Nothing here needs GitHub: no dispatch, no branch, no artifact. The network is
needed only to pull from Quay and to verify with Sigstore, and not at all when
both sides are local builds (`--a local --b local`, `docs/images.md` section 6).

```mermaid
sequenceDiagram
  autonumber
  participant Dev as Maintainer at a terminal
  participant CLI as harness CLI
  participant Home as HARNESS_HOME
  participant Net as Quay and Sigstore
  participant Dock as Docker and k6
  participant Out as out directory
  participant Prod as Production apps
  participant Mono as Monorepo checkout

  Dev->>CLI: pnpm harness doctor
  CLI-->>Dev: what the machine lacks and how to install it, exit 0 or 1
  Dev->>CLI: harness local nightly, or --dry-run to print the plan
  CLI->>Home: take locks/run.lock, one heavy run per machine
  CLI->>Net: images ensure --image-cache HOME/image-cache
  CLI->>Dock: compose up, project tutors-harness-8hex, ports optionally offset
  CLI->>Dock: run --mode noise --require-verified, journeys and k6
  CLI->>Out: captures, report.json, report.html, report.md, noise-status.json
  CLI->>Home: noise record, into noise/ status, history and summary
  CLI-->>Dev: exit code is the worst step
  Dev->>Mono: pnpm release:harness, print the release-candidate payload from git alone
  Mono-->>Dev: production, candidate, migration refs, claims URL, runs
  Dev->>CLI: harness local gate --a production --b candidate --claims file, or pnpm release:harness --run
  CLI->>Home: read the noise store, does it license a FAIL
  CLI->>Net: images ensure, build from ref if the registry lacks a tag
  CLI->>Dock: release, then migration, then upgrade, one after another under the lock
  CLI->>Home: releases/candidate.json, and overrides.jsonl if a FAIL was overridden
  CLI->>Out: gate.md and gate.json, the PR comments for reading here
  CLI-->>Dev: exit 1 if any rehearsal FAILed and was not overridden
  Dev->>CLI: harness local watch --once, or without --once every 15 minutes
  CLI->>Prod: reference journeys, no Docker needed
  CLI->>Home: rollbacks/time-rollback.md if it differs from the recorded run
```

What differs from CI, all by design (`docs/local.md`):

- The noise store is **this machine's** calibration. A laptop's Chromium has a
  different noise floor from a Linux runner's, so a CI `noise-status.json` must
  not be copied in. The same rule applies to it: clean, verified, at most seven
  days.
- The three release jobs run one after another under a run lock, because they
  share one compose project, its ports and its subnet.
- Nothing is posted anywhere: `gate.md` is read in place, and
  `gh pr comment <n> --body-file` is the manual step.
- A registry outage is survived from `HARNESS_HOME/image-cache`, and the night is
  degraded, exactly as in CI.
- **The local trigger now exists, on the monorepo side.** `pnpm release:harness`
  (#307) builds the dispatch payload from a local clone and, with `--run`, calls
  `local gate`; `--deployed --run` calls `local watch --once` with
  `HARNESS_PRODUCTION_TAG` set; `--nightly --run` calls `local nightly`. It tags,
  pushes and dispatches nothing, so a candidate the registry lacks is built from
  its tag by the harness (not evidence) unless the tag was pushed first. The
  monorepo checkout and the harness checkout sit side by side, or `HARNESS_DIR`
  names the harness.

## Evidence

| Diagram | Source |
| --- | --- |
| 4a-1 | `docs/monorepo/release-dispatch.yml` (jobs `candidate`, `images`, `dispatch`); `.github/workflows/release.yml` (steps up to "Pull and verify"); `src/images.ts`; `docs/images.md` |
| 4a-2 | `.github/workflows/release.yml`; `src/run.ts:249-364`; `src/collectors/index.ts`; `src/gate.ts`; `src/release-record.ts`; `docs/contract.md` "What the harness does to a pull request" |
| 4b | `.github/workflows/nightly-noise.yml`; `src/images.ts` (`ensureImages`); `src/image-cache.ts`; `src/run.ts` (`evidenceGaps`); `src/gate.ts`; `src/ci/noise-history.ts` (`assess`, `record`); `docs/noise-burndown.md` |
| 4c-1 | monorepo `.github/workflows/image-build.yml`, `scripts/promote-image.ts` (#303), `scripts/deploy-pin.ts`, `scripts/checks/deploy-pins.ts`, `.github/workflows/deploy.yml` (#298), `guides/Release-Strategy.md` "Deploy and post-deploy" |
| 4c-2 | `.github/workflows/post-deploy.yml`; `src/run.ts:267-283, 367-372`; `src/release-record.ts` (`judgeDeployment`); `normalise/masks.yaml` (`modes: [post-deploy]`) |
| 4d | `docs/local.md`; `src/local/cli.ts`, `tasks.ts`, `lock.ts`, `home.ts`; monorepo `scripts/release-harness.ts` |
