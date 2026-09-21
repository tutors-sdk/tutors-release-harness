# Modes

Every mode ends in the same place: a `CompareResult` of hunks, matched against
claims, judged by `src/gate.ts`, written as `report.{json,html,md}`. They
differ in what produces the hunks.

| Mode | a | b | Produces | Gates on |
| --- | --- | --- | --- | --- |
| `noise` | production tag | the same tag | captured diffs | never; writes `noise-status.json` (`--require-verified` marks it `degraded` unless every image was pulled and verified in the run) |
| `release` | production tag | candidate tag | captured diffs (+ k6 with `--load`) | unclaimed diffs, while a clean A/A ≤ 7 days old is supplied |
| `any-two` | any | any | captured diffs | never |
| `migration` | git ref or `dir:` | git ref or `dir:` | expand/contract and rollback hunks | any violation |
| `upgrade` | production tag | candidate tag | rollout hunks from k6 through the edge | any failed/5xx request, or b never serving |
| `post-deploy` | recorded candidate capture | live production URLs | captured diffs on the reference journeys | new diffs → rollback issue, subject to the A/A rule |

## noise, release, any-two

```bash
pnpm harness run --mode noise   --a 16.2.0 --b 16.2.0 --runs 3
pnpm harness run --mode release --a 16.2.0 --b 16.3.0-rc.1 --claims claims.yaml --noise out/<noise run> --runs 3 --load 20x30s
```

Both stacks come up from `compose.harness.yaml` (or two kind namespaces with
`--substrate kind`), every selected journey runs `--runs` times per side, and
each page is captured: aria snapshot, screenshot, network, console, document
headers, axe, keyboard order, TTFB. Around the journeys: `/metrics` before
and after, container logs since the side's capture started, and what the
persistence stub recorded per journey. `--load` adds a k6 run per side and
compares latency distributions.

Journey sets (`--set`): `fixture` (the pinned course, anonymous), `auth`
(sign in through the identity stub, then read), `reference` (the published
reference course — the only set that can also run against production).
Default: all three.

### Container runtime artefacts (since contract 1.2.0)

After the journeys, load and logs of each side, two more collectors describe
what the containers *are*. Both need Docker (compose) or kubectl (kind); on a
live deployment there is nothing to inspect, so post-deploy mode skips them.

**`runtime` — container posture, exact match.** Per app (`reader`,
`catalogue`, `live`, and the signed-in `reader-auth` under compose):

- declared: `docker inspect` (compose) or the pod spec (kind) — configured
  user, privileged, read-only root filesystem, capabilities added and dropped,
  security options, writable mounts (tmpfs, emptyDir, a `VOLUME` the image adds),
  memory/cpu/pids requests and limits;
- measured: a `node -e` started inside the container reads `/proc` — effective
  UID/GID, effective and bounding capabilities, no-new-privileges, seccomp mode,
  whether the root filesystem is mounted `ro`, whether `/tmp` is writable and the
  app's own directory is not;
- `writes-outside-tmp`: read-only filesystem errors (`EROFS`) in the container's
  log. Both stacks already run every app with a read-only root and a tmpfs
  `/tmp` (`compose.harness.yaml`, the kind manifests), so an app that writes
  anywhere else logs the error; the stack itself is the read-only boot probe.
  Whether an image *runs* as root is measured (`uid`); whether it *needs* root
  is only partly answered here (it booted and served with every capability
  dropped and no-new-privileges set, but as its own USER, not as the random UID
  OpenShift's restricted-v2 assigns; that boot probe is not built yet).

Any difference is a failing hunk with scope `<app>/<field>`; a change that only
tightens the posture is information; running as root, with a writable root, or
unable to write `/tmp` is called out, and shared by both sides is information.

**`startup` — time to healthy, Mann-Whitney.** Each app is stopped and started
`--startup-restarts` times (default 5; kind: scaled to zero and back, because
a rolling update leaves the old pod answering). Per restart: milliseconds from
the start command to the first response to `GET /` below status 500
(`<app>/root`) and to the orchestrator's ready verdict (`<app>/ready`:
compose's healthcheck healthy, or the pod's Ready condition — compose's ticks
every 2 s, so it is coarse). Judged like TTFB: `timing.minRuns`, `timing.alpha`
and `timing.minEffect` from `normalise/masks.yaml`, plus `startup.minShiftMs`.
The starts are warm (the image is already loaded); a cold pull would measure the
registry. A restart that never comes up in 60 s is a `<app>/boot` failure. A
noisy run is never retried: raise `--startup-restarts` or, with a reason in
`masks.yaml`, widen alpha.

**Neither passes silently.** A collector that cannot run — no container, no
`docker` or `kubectl`, an unreadable probe — leaves `not collected: <reason>`,
which is a failing, claimable hunk. `--no-runtime` and `--startup-restarts 0`
switch an artefact off as information. `upgrade` mode and the `mutants`
self-test do not sample startup (they are about the rollout, and about nine runs
of restarts). Informational `runtime/summary` and `startup/summary` hunks list
what was collected.

## migration

```bash
pnpm harness run --mode migration --a v16.2.0 --b release/16.3.0
pnpm harness run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-bad
```

No app stacks. A throwaway `postgres:16-alpine` gets the Supabase baseline
roles, then a's `supabase/migrations`, is snapshotted with `pg_dump`, gets the
migrations b adds, and the two schema catalogues are compared with the
expand/contract rule (`fixtures/migrations/README.md`). The snapshot is then
restored into a fresh database and must equal a's catalogue. `--snapshot
<pg_dump>` restores a sanitised production dump first.

## upgrade

```bash
pnpm harness run --mode upgrade --a 16.2.0 --b 16.3.0-rc.1 --upgrade-seconds 45 --upgrade-rate 20
```

Both stacks up plus the `edge` proxy (compose profile `upgrade`). Both sides
are captured once (they must both work), then k6 runs through the edge for
the whole window; a third of the way in the edge switches new requests to b
(in-flight requests finish on a), two thirds in `reader-a` is stopped. Every
response carries `x-harness-upstream`, so a failure is attributed to a side.
Zero failed or 5xx requests, and at least one request served by b, or the
rehearsal fails.

On kind, the same rehearsal is a real `RollingUpdate`:
`pnpm harness kind rollout --a 16.2.0 --b 16.3.0-rc.1` (see `deploy/kind/README.md`).

## post-deploy

```bash
pnpm harness run --mode post-deploy \
  --recorded out/2026-09-17T14-00-00-release \
  --production reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev
```

No stacks. Side a is the candidate's capture from a release-mode run
(`<run>/b/capture.json`, filtered to the `reference` journeys); side b is
captured now against the live URLs with the same journeys — anonymous,
read-only traffic against the published reference course. Metrics, logs and
persistence are not compared (production's are not the harness's to read).
A difference means production is not behaving as the tested candidate did:
the workflow opens a rollback issue with `report.md`.

The same command on a 15-minute schedule is the synthetic monitor
(the schedule in `.github/workflows/post-deploy.yml`).

## Re-comparing

```bash
pnpm harness compare --dir out/<run> --mode release --claims new-claims.yaml --noise out/<noise run>
```

Normalise, compare, match and gate again on captures already on disk — to try
a new claims file, a new mask, or a new engine without re-running the stacks.
