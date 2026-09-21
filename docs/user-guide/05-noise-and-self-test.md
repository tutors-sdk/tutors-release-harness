# 05 Noise and self-test

A harness that fails releases must first show that it does not fail on nothing, and that it does fail on something. This chapter covers the two runs that establish that (the A/A run and the mutant self-test), the store and ratchet that remember the first, and the guards that stop the harness being weakened. It is for the person who runs the harness.

- [The A/A run](#the-aa-run)
- [The noise store](#the-noise-store)
- [The ratchet and the streak](#the-ratchet-and-the-streak)
- [Degraded nights](#degraded-nights)
- [The mutant self-test](#the-mutant-self-test)
- [Guards](#guards)
- [The burn-down playbook](#the-burn-down-playbook)

## The A/A run

An A/A run compares the production tag with **itself**: two stacks from the same images, the same traffic. There is no true regression in it, so **every hunk is noise**: something the app or the harness does differently between two identical boots, or something the harness compares that it should not. The run's result decides whether the harness may fail a release.

```console
pnpm harness local nightly            # pull and verify, A/A with load, record the night
pnpm harness run --mode noise --a 16.2.0 --b 16.2.0 --runs 5 --load 20x30s --require-verified   # the middle step alone
```

The nightly does what the workflow does: three steps ([chapter 2](02-running-locally.md#nightly-aa-harness-local-nightly)) and an exit code that is the worst of them. A clean A/A ends:

```text
verdict: PASS
  - A/A is clean: the harness may gate releases
```

A dirty one is `WARN`: `A/A produced N diff(s): the normaliser needs a mask for each, or the stack is not deterministic; the harness is advisory until this is 0`. The run's `noise-status.json` records `{ "clean": false, "hunks": N }`.

The two questions to ask of a night, in order:

1. **Is the evidence verified?** A night that used a cached image, a local build or an unverified pull is *degraded* and says nothing about production ([below](#degraded-nights)). Find out why; do not chase its hunks.
2. **Is it dirty?** Then each hunk is either a mask or a determinism fix. The full decision tree, the likely sources (timing spread, fonts, `/metrics` process series, log timestamps, `Date`, `ETag`, `Last-Modified`) and what the monorepo owes are in [docs/noise-burndown.md](../noise-burndown.md).

To iterate without Docker, use the captures on disk: everything after capture is a pure function of them.

```console
pnpm harness compare --dir out/<timestamp>-noise --mode noise --masks path/to/candidate-masks.yaml
```

Then look at `masksApplied` in the new `report.json`: the mask you wrote must fire (count above zero) on exactly what you meant, and the other masks' counts must not move.

## The noise store

`<HARNESS_HOME>/noise/` is the `noise` branch of the workflows as a directory. Three files, written by `harness noise record`:

| File | What |
| --- | --- |
| `noise-status.json` | the **latest** night, clean or not, never an older clean one; a copy of the run's status |
| `noise-history.json` | one entry per night (time, tag, count, degraded reasons, harness version, image digests, mask counts, run URL); the most recent 400 are kept |
| `noise-summary.md` | tonight's summary: count, ratchet, streak, evidence, masks, the last nights |

The store keeps the *latest* night on purpose. If it held "the latest clean one", a good night last Tuesday would keep licensing FAILs after a bad night last night.

### `harness noise record`

```console
pnpm harness noise record --status <noise run dir | noise-status.json> [--report f] [--tag T] [--store dir] [--run-url u] [--summary f] [--masks f]
```

Appends a night and rewrites the three files. `--status` is required; the report is taken from the same directory unless `--report` names it; `--store` defaults to `<HARNESS_HOME>/noise`; `--summary` appends the summary to a file (in CI, the job summary). Exit `0`, `1` when the ratchet is broken (the files are still written), `2` for a usage error or no status. `harness local nightly` calls it for you.

### `harness noise status`

```console
pnpm harness noise status [--store dir] [--noise-max-age-days 7] [--require] [--json]
```

Does the latest status license a FAIL? It prints why or why not, and exits `0`, or `1` with `--require` when it does not. Real output on a machine that has never recorded a night:

```text
warning: no noise status at <HARNESS_HOME>\noise\noise-status.json: release runs will only warn until a nightly A/A records one
```

and with a clean, verified, fresh status:

```text
noise status: A/A of 2026-09-21T11:24:39.000Z is clean, verified and fresh (0 h old): release runs may FAIL
```

The other reasons it can give: `the last A/A run (<time>) had 3 diff(s); release runs will only warn`, `the last A/A run (<time>) was degraded and does not count: reader: cached; release runs will only warn`, and `the last clean A/A run (<time>) is older than 7 day(s)`. With `--json` the same is data: `{ store, file, present, usable, status?, licensesFail, why, ageHours? }`. Use `--require` in a script that must not go on without the right to fail.

### `harness noise history`

```console
pnpm harness noise history [--store dir] [--last n] [--json]
```

Prints the summary of the ratchet, the clean streak and the last nights (default 14). With nothing recorded yet it says so and exits 0.

### How release mode uses the store

Release and post-deploy mode, run without `--noise`, take the latest status from the store and log which file they used. The lookup order is exactly: an explicit `--noise <file|dir>` as given (used even if it is worse than the store's), `--noise skip` (waiver), `--noise none` (do not look), otherwise the store, otherwise no status. A missing status still only warns. Whatever comes back goes to the same gate, so the seven-day, clean and verified rule is applied in one place.

## The ratchet and the streak

Each night's result is a count of failing hunks and a flag for whether the evidence was verified. Two things are derived from the history.

**The ratchet.** The lowest count seen on *verified* evidence. Once the count reaches 0 it must stay there. The night is **broken** when the count had reached 0 on verified evidence before, and tonight is verified and not 0. `harness noise record` then exits 1 and the summary says `RATCHET BROKEN`; the files are still written, so the status that says so still gets published.

**The streak.** The number of consecutive most recent nights that were clean (zero hunks) *and* verified, with no gap of more than 36 hours between one and the next. The target is **seven**: the exit criterion of the burn-down is seven consecutive clean nightly A/As on the production tag, from Quay, on verified images, plus ten of ten mutants caught, plus a release run that produces a FAIL (not a WARN) on an unclaimed change.

What moves the numbers, from a real store:

| Tonight | Effect |
| --- | --- |
| clean, verified | count 0, streak + 1 (if the last night was within 36 hours) |
| dirty (3 hunks), verified, after a clean night | `RATCHET BROKEN`, exit 1, streak 0 |
| clean but **degraded** | streak 0, does not count against the ratchet either; the count is not comparable |
| clean, verified, the night after a broken or degraded one | clears the ratchet (it is only ever judged against tonight) and the streak restarts at 1 |
| clean, verified, but more than 36 hours after the last night | streak restarts at 1: a laptop that sleeps through a night breaks "consecutive" |

Real summaries (tonight's status a dirty one after a clean one, then a degraded one):

```text
## Nightly noise (A/A) — RATCHET BROKEN
| noise count tonight | **3** (+3 on the last verified night) |
| ratchet (lowest verified count) | 0 — reached 0: it must stay there |
| clean streak | 0 of 7 consecutive nights |

## Nightly noise (A/A) — DEGRADED
| evidence | **DEGRADED, does not count:** reader: cached |
A degraded night neither extends the clean streak nor counts against the ratchet, and release runs will only warn until a verified clean night is published.
```

The masks line of the summary counts the masks and the ones that were silent tonight, and warns past about 40.

## Degraded nights

A status is **degraded** when a `noise` run made with `--require-verified` did not run only pulled-and-verified images. `harness local nightly` and the nightly workflow always pass the flag. The reasons go in `noise-status.json` as `degraded: [...]`. The causes:

- an image restored from the image cache because the registry could not be reached (`cached`);
- an image built here from the monorepo ref (`built-from-ref`);
- an image already local, never pulled in this run (`local`);
- an image pulled with `--allow-unsigned` (`pulled-unverified`);
- image provenance that was not recorded.

The gate refuses a degraded status, so release runs only warn until a verified clean night is recorded. A degraded night is not a failure of the harness: it is the harness declining to count evidence it cannot vouch for.

## The mutant self-test

A harness that cannot catch its own planted faults has no business gating a release. `harness mutants --base <tag>` builds **ten mutants** from the base reader image (so a mutant is production plus exactly one fault), runs an A/A on the base, then runs release mode against each mutant. It passes only when every mutant produces a FAIL whose unclaimed hunks include an artefact the mutant was expected to trip.

```console
pnpm harness local mutants           # pull and verify the base images, then the self-test
```

| Mutant | What it plants | Must be attributed to | Runs |
| --- | --- | --- | --- |
| `dropped-header` | the `X-Content-Type-Options` header is no longer sent | `headers` | 1 |
| `route-500` | every `/course/*` document request answers 500 | `network` or `dom` | 1 |
| `console-error` | a `console.error` on every server-rendered page | `console` | 1 |
| `dom-note` | an extra landmark at the end of every page body | `dom` | 1 |
| `missing-alt` | an image with no alternative text on every page | `axe` | 1 |
| `slow-ssr` | 400 ms added to every HTML response | `timing` | 5 |
| `anon-write` | every page records a learning event for anonymous readers | `persistence` | 1 |
| `focus-order` | navigator links leave the tab order | `focus` | 1 |
| `base-swap` | the candidate is built FROM a different base image (the production filesystem over another distribution) | `image-manifest` | 1 |
| `added-package` | the candidate carries one package the production image does not | `sbom` | 1 |

Eight are planted at the HTTP edge by a wrapper (`mutants/wrap.mjs`); two (`base-swap`, `added-package`) change what the image *is* and are caught by the image artefacts. `slow-ssr` needs five runs because the timing test cannot reach significance with fewer than four ([chapter 3](03-reading-a-report.md#timing-and-statistics)). `base-swap` swaps onto `ubuntu:24.04`; `HARNESS_MUTANT_ALT_BASE` names another base.

**What "attribution" means.** A mutant is *caught* when the release-mode verdict is FAIL. It is *attributed* when the artefacts of its unclaimed hunks include one of the artefacts it was expected to trip. Both must be true. Catching `dropped-header` because a different, unrelated hunk failed is not a catch: the harness would be failing for the wrong reason, and would miss the fault when the noise went away.

**The flow and its output.** The self-test runs an A/A on the base first, with the fixture and auth journey sets only (no `reference`), one run, startup sampling off. If that A/A is not `PASS`, it stops with `A/A is not clean (N diff(s)); the mutant self-test cannot be trusted` and exit 1: a harness whose A/A is not clean cannot fail anything. Then, for each mutant, it builds the image, runs release mode with the A/A's status as the noise, and prints a table:

```text
mutant           caught  attributed  unclaimed artefacts
dropped-header   yes     yes         headers
...
10 of 10 mutants caught and attributed.
```

Anything that escaped is listed with its report, and the run ends `N of 10 mutants escaped; the harness must not gate releases until this is 0 of 10.` Exit `0` only when all ten are caught and attributed, else `1`.

**Practicalities.**

- Needs Docker, Chromium, cosign for the base images, and **syft** on `PATH` (`harness doctor --for mutants`): the two image-level mutants are built locally and have no cosign attestation, so `mutants` generates SBOMs with `HARNESS_SBOM_SOURCE=generate` on both sides. Without syft, `added-package` escapes, and the run says why.
- It takes about fifteen minutes.
- Mutant runs never leave a release record.
- Mutants run under the image name `tutors-harness/mutant-<name>:latest`.

**When to re-run it.** Weekly (the `weekly-mutants.yml` workflow, and `harness local mutants` on your own schedule), and on any change to what the harness compares or gates on. **Engine changes require it** because two reports are comparable only when the same harness judged them, and because the only proof that a changed engine, mask, journey, gate or mutant still catches the planted faults is running them. The `engine` guard below makes this a rule that CI enforces: a pull request that touches engine code needs a version bump and a passing mutants run.

## Guards

Two checks run on every pull request to this repository. `harness guard` runs the very same code against a local git ref, so you can check before you push.

```console
pnpm harness guard masks  --base <ref>
pnpm harness guard engine --base <ref>
pnpm harness guard all    --base <ref>
```

The base is `--base <ref>`, else `HARNESS_BASE_REF`, else `origin/main`, else `main`. The guards compare `<base>...HEAD`, so they see what your branch has *committed* since it left the base; uncommitted work is not compared, and the command says so when the tree is dirty. Exit `0` ok, `1` a violation, `2` when the ref does not exist (or has no common ancestor with `HEAD`, which for a shallow clone is `git fetch --unshallow`).

### Masks land in their own pull request

A change that **adds or loosens** anything in `normalise/masks.yaml` (a new mask, a changed mask, a changed engine threshold) may change nothing else, apart from the mask's notes, its tests and the version bump. The point is that the reviewer of a change should never also review the blind spot that hides it. Removing a mask only tightens the harness, so it may travel with anything.

What such a PR may also touch: `normalise/masks.yaml`, `docs/noise-burndown.md`, `docs/masks.md`, `tests/normalise.test.ts`, `tests/masks*.test.ts`, `tests/fixtures/masks/**`, and `package.json` if only the version changed.

A pass:

```text
guard masks against feat/contract-1.3.0
masks: 18 -> 18 (added 0, changed 0, removed 0, thresholds changed 0)
no mask added or loosened: ok
```

A violation (a real run, with a mask and a change to `src/gate.ts` in one commit):

```text
guard masks against docs/user-guide
masks: 18 -> 19 (added 1, changed 0, removed 0, thresholds changed 0)
::error title=Masks land in their own PR::normalise/masks.yaml added demo-mask, and this PR also changes: src/gate.ts. Masks land in their own PR (with only their notes, tests and the version bump), so the reviewer of the change never also reviews the blind spot that hides it; see docs/noise-burndown.md.
```

exit 1. The guard also warns, and never fails, past 40 masks.

### An engine change needs a version bump and the mutants

A change to what the harness captures, compares, judges or gates on needs a **version bump** in `package.json` (any semver increase over the base) and a **mutants re-run** that passes. The paths that count as engine code:

| Area | Paths |
| --- | --- |
| what is compared and how it is judged | `src/compare/**`, `src/gate.ts`, `src/claims/**`, `src/normalise/**`, `normalise/**` |
| what is captured | `src/collectors/**`, `src/runtime/**`, `src/image-static/**`, `src/persistence/**`, `src/migration/**`, `src/bus/**`, `src/clock-probe.ts` |
| how a run is put together, and which images and stacks are judged | `src/run.ts`, `src/modes/**`, `src/noise.ts`, `src/stack.ts`, `src/substrate/**`, `src/images.ts`, `src/image-ref.ts`, `src/image-cache.ts`, `compose.harness.yaml`, `deploy/**`, `fixtures/**`, `scripts/**` |
| what is driven through the stacks | `traffic/**` |
| the harness's own negative fixtures | `mutants/**`, `src/mutants.ts`, `src/mutant-build.ts` |
| a dependency bump | `pnpm-lock.yaml` |

Everything else directly under `src/` or at the repository root is listed as non-engine with a reason (the CI guards themselves, report rendering, the CLI parser, the override recorder, types, the version file, tests, docs), and a unit test fails when a new top-level entry is in neither list, so the list cannot quietly rot.

Real output (comparing against an older base, with a version bump in place):

```text
guard engine against 95eb541
engine, mask, journey, gate or mutant change:
  mutants/Dockerfile.planted-package
  ...
  src/gate.ts
version 1.1.0 -> 1.3.0; the mutants must pass on this PR
```

and with no bump:

```text
engine, mask, journey, gate or mutant change:
  normalise/masks.yaml
  src/gate.ts
package.json version is 1.3.0 (base: 1.3.0). A change to what the harness compares or gates on needs a version bump; see TESTING.md.
```

exit 1. With no engine change: `no engine, mask, journey, gate or mutant change: mutants re-run and version bump not required`. In CI the check named **Mutants re-run (required)** always reports (pass when nothing relevant changed), so it is the one to require on `main`; the guard itself can only check the version bump, and the mutants run is the second half of the rule.

## The burn-down playbook

Getting from a first dirty A/A to seven clean, verified nights is a job for a person, and it is written up in [docs/noise-burndown.md](../noise-burndown.md): what is already built, what to set up in the repository, how to read a noisy A/A group by artefact, the mask-or-fix decision tree, the likely noise sources and what each fix costs, what the monorepo owes the effort, and what to do if the count plateaus. It is not duplicated here. Its short form:

1. Is the night degraded? Stop; fix the evidence.
2. Is the ratchet broken? Something changed (the production tag, the runner, a mask removed, the harness version); diff the history's digests and versions.
3. Group the hunks by artefact, and ask of each: is it reproducible, and could a real regression ever show up in this same field?
4. Never retry. Never mask a field a regression could hide in. Fix the harness if the harness caused it; fix the app if the app did (a temporary mask names the monorepo item that removes the need); otherwise the narrowest mask with a reason a reviewer will weigh.
5. Land each mask in its own pull request, with a version bump and a passing mutants run.
