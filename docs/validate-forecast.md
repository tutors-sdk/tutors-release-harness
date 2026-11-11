# tutors validate in the harness

Since 1.63.0. `harness validate deploy` and `harness validate forecast`, run daily by
[validate-forecast.yml](../.github/workflows/validate-forecast.yml).

## Why the harness watches validate

The mono-repo's `tutors validate` (`@tutors/tutors-create`, rules in `@tutors/course-rules`) checks a lecturer's course
folder. Since mono-repo #591 the standard `netlify.toml` builds with

```toml
command = "deno run -A jsr:@tutors/tutors-create@^5.4.0 validate && deno run -A jsr:@tutors/tutors"
```

so validate no longer only advises: an error stops the course's Netlify deploy. That adds two ways a release can break
lecturers that no image the harness compares would show.

1. **The command cannot run.** Netlify resolves the `jsr:` specifiers when it builds. If JSR has no version in range, or
   the version it picks has no `validate` command, every course built from the template fails its deploy.
2. **A rule change stops courses deploying.** A rule that becomes stricter, or a new rule at error level, turns a course
   that deployed yesterday into one that does not.

## harness validate deploy

```
pnpm harness validate deploy --candidate ../tutors-mono-repo [--out deploy.json] [--json]
```

This reads the build command in the checkout's template (`packages/jsr/course-rules/src/templates.ts`). It asks
`jsr.io/@scope/name/meta.json` which version Deno would run for each `jsr:` specifier (the highest in range, never a
pre-release). For the specifier run as `validate`, it also asks `<version>_meta.json` whether that version exports
`./validate`. The command exits 1 when a course built from the template would fail its deploy.

On 11 Nov 2026 it failed. JSR's newest tutors-create is 5.3.0, which has no `validate`, and nothing is in `^5.4.0`. Until
5.4.0 (and `@tutors/course-rules`) are published, a course made from main's templates cannot deploy.

## harness validate forecast

```
pnpm harness validate forecast --candidate ../tutors-mono-repo [--production auto | jsr:...] [--dir work] [--out f] [--strict]
```

This runs two validators over every course in the validate corpus
([fixtures/validate-corpus/courses.yaml](../fixtures/validate-corpus/courses.yaml)), which lists real course sources,
each pinned by commit:

- **main**: `deno run -A --no-check --no-lock <checkout>/packages/jsr/create/main.ts validate <course> --format json`,
  run from source.
- **production**: what lecturers run today. With `--production auto` (the default), that is the template's tutors-create
  at the exact version JSR resolves it to now. If that can't run, the forecast shows main's findings alone.

Each difference (a finding is the same only when rule, severity, path and message all are) is counted under the rule
that made it, the way the release forecast counts causes rather than hunks. The forecast reports:

- which courses main's validate would stop deploying (any error);
- which of those deploy under production's validate (*newly stopped*);
- each rule's added and removed findings, and its new errors.

It writes `validate-forecast.json`, by default to `HARNESS_HOME/validate/`. It exits 1 when main's validate cannot run
on a course. With `--strict`, it also exits 1 when main newly stops a course or adds an error. The workflow does not pass
`--strict`: the forecast is advisory, like the course corpus.

### Fetching big courses cheaply

A module course is 0.5 to 1 GB, nearly all PDFs, Keynote decks and video. Each course is fetched as a partial clone that
skips blobs of 256 KB and over. The skipped text and images are then fetched in one request, and any other big file is
written as a sparse placeholder of 256 KB. Validate reads only text and the size of images, so it sees the course as a
full checkout would show it. The five courses come to about 400 MB on disk instead of 2.2 GB, and a forecast takes
about 20 seconds.

## The mono-repo side

The same five courses are in the mono-repo's `tests/validate-corpus/corpus.yaml`, checked in CI by
`pnpm check:validate-corpus` (Rules 0758-0762, mono-repo #594). That check fails a pull request whose rule change moves a
finding on a real course until the PR records it in the committed baseline, so the change is reviewed. The harness asks
the release question of main as it stands.

## On 11 Nov 2026

Main's validate, on the corpus:

| course | errors | findings | why |
| --- | --- | --- | --- |
| reference-course | 2 | 6 | V004: `talk.md` inside `book-c` labs |
| python | 0 | 1 | V011 warning |
| web-dev-2-2022 | 1 | 32 | V004: `solutions.md` in a book |
| mobile-app-dev-oth | 1 | 35 | V002: `-talk-00-andoid-anatomy-2` |
| agile-soft-dev-2013 | 4 | 21 | V002: `reference-*` code folders |

Under the standard netlify.toml, four of the five courses would not deploy as they are.
