# 09 Extending

This chapter is for the person who changes the harness: adds something it compares, something it ignores, something it must catch, or something it drives. The harness gates releases, so it is held to the discipline it enforces: one owning test tier per failure class, a signal per tier that proves the tier can fail, and ratchets. The map is in [TESTING.md](../../TESTING.md).

- [The three tests rule](#the-three-tests-rule)
- [Adding an artefact](#adding-an-artefact)
- [Adding a mask](#adding-a-mask)
- [Adding a mutant](#adding-a-mutant)
- [Adding a journey](#adding-a-journey)
- [Adding a stub backend](#adding-a-stub-backend)
- [Adding a command or a flag](#adding-a-command-or-a-flag)
- [Versioning and the contract](#versioning-and-the-contract)
- [Running the unit suite](#running-the-unit-suite)
- [Trying an engine or a claim without Docker](#trying-an-engine-or-a-claim-without-docker)

## The three tests rule

A new engine or rule does not merge without:

1. **The A/A test.** Identical captures in, nothing out. An engine that invents a difference is a harness that fails on nothing.
2. **A planted change it catches.** A capture with the fault, and an assertion that the engine reports it. An engine with no planted-change test can silently stop working.
3. **A change it must not flag.** Something that looks like a difference but is not (a shrunk image, a message gone on b, a tightened posture). Without it the engine will drift toward flagging everything.

Anything that would run `docker`, `cosign`, `bash` or `kubectl` takes its process runner as a parameter (`Exec`, in `src/images.ts`); tests pass a fake and assert on the exact commands, so the flows are covered without Docker. Follow the same pattern.

## Adding an artefact

An artefact is a kind of thing captured and compared. Adding one is a contract minor change (a new artefact name; consumers must tolerate names they do not know) and a harness version bump.

1. **Name it** in `ARTEFACTS` in `src/types.ts`. Claims, masks and mutants validate against this list.
2. **Collect it.** For a per-page artefact, extend `PageCapture` and the browser collector (`src/collectors/browser.ts`); for a per-side one, extend `SideCapture` and `captureSide` (`src/collectors/index.ts`). For something read from the images, follow `src/image-static/`; for containers, `src/runtime/`. A collector that cannot run must say so, in the one convention of `src/not-collected.ts`: add the artefact to `COLLECTED_ARTEFACTS`, build the text and the `<subject>/not-collected` hunk with its helpers, and let its severity follow the one rule (informational unless the artefact is required; `runtime` and `startup` are required by default, others through `HARNESS_REQUIRE_ARTEFACTS`). **Never silent.**
3. **Compare it.** Write the engine (`src/compare/`) and register it: the shared engines in `ENGINES` (`src/compare/engines.ts`), the others in `EXTRA_ENGINES` (`src/compare/extra.ts`), `RUNTIME_ENGINES` (`src/compare/runtime.ts`) or beside `imageStatic` in `compareCaptures` (`src/compare/index.ts`). Give each hunk a stable scope a claim can name, the artefact name, `fail` or `info` severity, a one-line `summary` and, if useful, a `detail`.
4. **Test it** with the three tests above (`tests/compare.test.ts`, `tests/extra-engines.test.ts` show the pattern; `tests/support/captures.ts` builds captures). If the engine reads a file or a process, inject the runner.
5. **Put it in the schema and the docs.** `docs/contract/report.schema.json` (the `artefact` enum), `docs/contract.md` (the artefact lists, and the number spelt out in "one of the N artefact names above": `tests/contract.test.ts` checks it), `claims/README.md` (the scope table), and this guide's artefact tables. A field added to `report.json` must be in the schema, which is `additionalProperties: false`.
6. **Tell the monorepo.** The monorepo's `pnpm check:release-claims` keeps its own copy of the artefact list (`scripts/checks/release-claims.ts`); a name missing there means claims for your artefact are rejected before the harness sees them. Its `release/README.md` lists them too.
7. **Bump** the harness version in `package.json` (a new artefact changes what the harness compares), the contract version in `src/version.ts` (`CONTRACT_VERSION`), and add the entry to the changelog in `docs/contract.md`. Keep the contract files in step (`cli.json`, `workflows.json` carry the contract version).
8. **A mask or threshold, if the artefact needs one, goes in its own pull request** ([below](#adding-a-mask)).
9. **Run the mutants.** A new engine can change what an existing mutant is attributed to. Add a mutant if the artefact catches a regression class none catches today.

## Adding a mask

A mask is a blind spot you chose. The steps exist to make choosing one a review.

1. **Ask first whether it is a mask at all.** If a real regression could ever show up in the same field, do not mask it: make the app deterministic, or narrow the mask so the regression shows. If the harness caused the difference (clock, ordering, capture timing), fix the harness. The decision tree is in [docs/noise-burndown.md](../noise-burndown.md#mask-or-determinism-fix).
2. **Prove it on captures.** Copy `normalise/masks.yaml`, add the entry, and re-judge a downloaded noise run:

   ```console
   pnpm harness compare --dir out/<time>-noise --mode noise --masks path/to/candidate-masks.yaml
   ```

   The mask's count in `masksApplied` must be above zero and on exactly what you meant; every other mask's count must not move.
3. **Write the entry.** The schema (`src/normalise/masks.ts`): an `id` in kebab case, an `artefact` (one name or a list), **exactly one** of `header` (drops that response header), `pattern` (a regular expression applied to `dom`, `console`, `network` or `headers`, with an optional `replace` that may keep `$1`, `$2`), `series` (a regular expression over `/metrics` series names) or `key` (a log key), an optional `modes` list, and a **reason of at least 20 characters** that says what noise it hides and why that noise cannot be a regression. `drop: true` (network pattern masks only) removes matching requests from the comparison. Example, valid against the schema:

   ```yaml
     - id: reader-build-stamp
       artefact: dom
       pattern: "build [0-9a-f]{7}"
       replace: "build {{hash}}"
       reason: >-
         The footer prints the build's short git sha, which differs on every build and which no release can intend.
         Temporary: removed when the monorepo serves it from one known endpoint.
   ```

   Narrowest possible: keep the surrounding text. A temporary mask says so and names the item that removes the need.
4. **Its own pull request.** `harness guard masks --base <ref>` fails a change that adds or loosens a mask and also changes anything except `normalise/masks.yaml`, `docs/noise-burndown.md`, `docs/masks.md`, `tests/normalise.test.ts`, `tests/masks*.test.ts`, `tests/fixtures/masks/**` and the version bump. A threshold (`screenshot`, `metrics`, `logs`, `timing`, `startup`) counts as a mask. `normalise/masks.yaml` is owned by the maintainers through CODEOWNERS.
5. **Bump the version and re-run the mutants.** A mask is an engine change (`harness guard engine`). The mutants proving the harness still catches its ten planted faults is the price of narrowing what it looks at.
6. **Watch it.** A mask listed under *Silent this run* in every report for a week is deleted, in a pull request that may travel with anything. Past about forty masks, fix determinism at the source.

## Adding a mutant

A mutant is a candidate image with one planted regression that the harness must catch and attribute. Add one when a regression class escapes, or a new artefact needs a proof.

1. **Plant the fault.** For an HTTP-edge fault, add a `case` to `mutants/wrap.mjs`, which starts the real server on an internal port and proxies port 3000 to it, applying exactly one fault chosen by the `MUTANT` environment variable (a header dropped, a route answering 500, HTML rewritten, a delay). For a fault in what the image *is*, add a `kind` to `MUTANT_KINDS` in `src/mutant-build.ts` and build it there (see `base-swap` and `planted-package`, and `mutants/Dockerfile.planted-package`).
2. **Register it** in `mutants/mutants.yaml`: `name` (kebab case), `plants` (a sentence), `expect` (the artefacts the FAIL must be attributed to), `kind` (`edge` by default, `planted-package`, `base-swap`), and `runs` if it needs more than one (only the timing mutant does, and it needs five).
3. **Run** `pnpm harness local mutants` (or `harness mutants --base <tag>`) and confirm the new mutant is caught *and attributed*, and that the other nine still are. It takes about fifteen minutes and needs syft.
4. **Bump the version** (`mutants/**` is engine code) and update the count and tables in `mutants/README.md`, `TESTING.md`, the README and this guide.

## Adding a journey

Journeys are few by design; six exist today. The harness's power is breadth of capture per page, not the number of pages. **Add a journey only when a real regression escaped that a journey would have caught.** Write down which regression.

1. **Define it** in `traffic/journeys/` (`journeys.ts` holds the fixture and auth journeys, `reference.ts` the reference-course one): a `Journey` with a `name`, a `set` (`fixture`, `auth` or `reference`), `anonymous` (true when it never signs in: any persistence write during it is then a finding), a `target` (`reader` or `readerAuth`), and `run(page, urls, onPage)`.
2. **Drive the UI as a person would, with roles and accessible names only.** A journey that cannot find something by role has found an accessibility problem; it is not a reason to use CSS. Be parameterised by the base URL and nothing else. After every page settles, call `onPage("<app>:<page>")`; that key is the scope claims use, so choose it once and keep it.
3. **Add it to the `journeys` array** so it runs. `harness journeys` lists it; `--set` and `--journey` select it.
4. **Give it fixtures** if it needs them: `fixtures/course-server/course` holds the pinned course; the identity and persistence stubs are in `fixtures/`.
5. **Test it** where a journey can be tested without a browser (its registration, its set and name), and run it as an A/A (`--set <set> --journey <name>`) until it is clean, then in release mode against the mutants.
6. **Bump the version** (`traffic/**` is engine code) and re-run the mutants. A new journey changes the hunks for the same two images.

## Adding a stub backend

The harness reaches what a side persists and publishes through seams, so a new backend does not touch a rule.

- **Persistence.** `src/persistence/recorder.ts` defines `PersistenceBackend { name, recorder(address) }` and `registerPersistenceBackend`. A recorder resets and returns the normalised writes (`{ kind, method, table, rows }`) a side tried to make. The first backend is the Supabase-REST stub (`src/persistence/supabase-rest.ts`, `fixtures/persistence/stub.mjs`). Select one with `HARNESS_PERSISTENCE_BACKEND`; an unknown name is an error, not a fallback. `tests/persistence-seam.test.ts` drives the same collector, rule and comparison from an in-memory second backend (`tests/support/fake-postgres-wire.ts`); do the same for yours.
- **Migration.** `src/migration/backend.ts` is the seam of the migration rehearsal; the first backend is a throwaway Postgres in Docker (`src/migration/supabase-postgres.ts`). `tests/migration-seam.test.ts` holds the seam.
- **Bus.** `src/bus/transport.ts` (`busCollector`, `HARNESS_BUS=<transport>:<address>`) and [docs/bus.md](../bus.md). Disabled until a bus exists, and loud about it.
- **Fixture stubs** (course server, identity, persistence, edge, clock) are code the harness ships and are tested like any other: `tests/fixtures.test.ts` starts each in-process on an ephemeral port and drives it with `fetch`.

The anonymous-write rule and the counting comparison are shared (`src/compare/ledger.ts`); a backend must not need its own.

## Adding a command or a flag

Every flag and command is in three places that a test holds together: `src/cli.ts` (the `parseArgs` options and the usage), `docs/contract/cli.json` (with `stable` and `since`), and `docs/contract.md` (the stable ones, in the CLI table). `tests/contract.test.ts` fails when they disagree, when a workflow uses a command or flag `cli.json` does not declare, and when the contract omits a stable one. A stable flag is a promise: adding one is a minor change; removing or renaming one is a major one. The copies of workflows handed to the monorepo (`docs/monorepo/`) may call only stable commands.

A `harness local` task is a *plan* (a list of `harness` commands) built in `src/local/tasks.ts`; `tests/local-parity.test.ts` reads every `pnpm harness ...` line of the workflows and holds it to the plan of the matching task, so a workflow step and its local wrapper cannot drift. Change both together, and no workflow may run `src/ci/*.ts` directly: they call `harness guard` and `harness noise`.

## Versioning and the contract

Three numbers: the **harness version** (`package.json`), the **contract version** (`CONTRACT_VERSION` in `src/version.ts`, semver, independent) and **`schemaVersion`** (the contract's major). A contract major is a harness major.

| Change | Bump |
| --- | --- |
| removing or renaming a `report.json` or `noise-status.json` field; changing an exit code's meaning or the verdicts a mode can return; loosening or tightening the A/A rule's default; a valid claims file becoming invalid or matching differently; removing or renaming a stable command, flag, payload field, variable or artifact; the harness starting to write to pull requests | contract **major** (and `schemaVersion`) |
| a new optional report field; a new artefact name; a new mode, command, stable flag, optional payload field, event type, variable with a default, artifact; a new optional claims key; any change to non-stable commands and flags | contract **minor** |
| wording of reasons, summaries and reports; documentation; fixes that make the code match the contract; the workflows' default `runs` | contract **patch** |

Independently of the contract, **any pull request that changes what the harness captures, compares, judges or gates on bumps the harness version and re-runs the mutants** (`harness guard engine`; the paths are in [chapter 5](05-noise-and-self-test.md#an-engine-change-needs-a-version-bump-and-the-mutants)). Two reports are comparable only when their `harness.version` is the same. Releases are git tags `v<harness version>` on `main`, cut by a maintainer.

When you change the contract, change the docs with it: `docs/contract.md` is "derived from the code", and `tests/contract.test.ts` fails when the two drift. The contract files under `docs/contract/` and `src/version.ts` are owned by the maintainers through CODEOWNERS.

## Running the unit suite

```console
pnpm typecheck && pnpm lint && pnpm test
```

`pnpm test` is `vitest run` over `tests/*.test.ts`: engines, the claim matcher, the gate, the rehearsal rules, the report, the fixture stubs, the local commands, the doctor on fake machines, the contract. **It never touches Docker or the network.** On this checkout it ran 59 files and 905 tests in about fourteen seconds. `pnpm test:watch` reruns on change; `pnpm exec vitest run tests/gate.test.ts` runs one file. A count written in prose (the number of host ports, journeys, mutants or apps) is held to the file it counts by `tests/docs-counts.test.ts` and `tests/journey-count.test.ts`, so a docs sentence cannot drift when you add a port or a journey. There are no retries anywhere (`retry: 0` in `vitest.config.ts`): the harness exists to make flakiness visible.

What the unit suite cannot prove is that the assumptions about real tools hold: `node` on the `PATH` inside every app image, `/proc/self/mountinfo`, the health status format, the Windows paths in `scripts/*.sh`. The first `harness run --mode noise` on a machine with Docker is that proof, and it must be clean before the harness gates on those artefacts; `harness doctor` and the first `harness local nightly` are the checks for the machine.

The real-Docker tiers, by cost:

| Tier | Command | When |
| --- | --- | --- |
| smoke: two stacks boot, one journey A/A | `pnpm harness run --mode noise --a <tag> --b <tag> --set fixture --journey anonymous-student-reads-course` | every pull request (CI) |
| rehearsal fixtures: migration must pass on `b-good`, fail on `b-bad` with four violations | `pnpm harness run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-good` (and `b-bad`) | when the expand/contract rule changes |
| upgrade's negative fixture: the `route-500` mutant rolled in through the edge must fail with failures attributed to `b` | `pnpm harness run --mode upgrade --a local --b tutors-harness/mutant-route-500:latest` | when upgrade judgement changes |
| mutants | `pnpm harness local mutants` | weekly, and on any engine change |
| nightly A/A | `pnpm harness local nightly` | nightly |

## Trying an engine or a claim without Docker

Everything after capture is a pure function of the two captures on disk, so you can exercise an engine, a mask or a claims file in seconds. `tests/support/captures.ts` builds a small deterministic capture (`capture("a")`), and `clone` copies one so you can change a side. Save this as `make-run.mts` at the repository root:

```ts
// A run directory with two captures and five planted differences, made without Docker.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { capture, clone } from "./tests/support/captures.ts";

const dir = process.argv[2] ?? "out/demo-release";
const a = capture("a");
const b = clone(a);
b.side = "b";
const page = b.journeys[0]!.pages[0]!;
page.headers["content-security-policy"] = "default-src 'self'"; // a header added
page.aria = page.aria.replace('link "Topic 1"', 'link "Topic 1 (4 min read)"'); // text changed
page.console = [{ level: "error", text: "Failed to load resource: 404 /assets/logo.svg" }]; // a new console error
page.focus = ['a "Skip to content"', 'a "Topic 1"']; // a focus stop lost
b.metrics.after.reader!.series.tutors_course_loads_total = 9; // a counter moved differently
for (const [side, c] of [["a", a], ["b", b]] as const) {
  mkdirSync(join(dir, side), { recursive: true });
  writeFileSync(join(dir, side, "capture.json"), JSON.stringify(c, null, 2));
}
console.log(`wrote ${dir}/a/capture.json and ${dir}/b/capture.json`);
```

Then judge it, with a claims file of your own:

```console
node --import tsx make-run.mts out/demo-release
pnpm harness compare --dir out/demo-release --mode release --claims my-claims.yaml --noise skip
```

You get `verdict: FAIL` with the differences no claim covers, and `report.md`, `report.html` and `report.json` in the directory (the example in [chapter 3](03-reading-a-report.md#reportmd-the-pull-request-comment) was made the same way, with image provenance added to the captures, three claims and a clean A/A). Change a claim, run `compare` again, watch the verdict move. `--masks` tries another mask file; the same command is how you would re-judge the artifact of a real run. Delete the file and the `out/` directory when you are done; they are not part of the repository.
