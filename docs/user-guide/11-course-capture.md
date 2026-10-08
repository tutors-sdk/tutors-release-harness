# 11 Course capture: a real course on your machine

`harness course` copies a live, public Tutors course to disk, checks that it is intact, serves it locally,
and shows it loading in a reader. Use it when you want to test or benchmark against a **real** course
instead of the two-topic fixture course, without depending on Netlify or on the course staying the same.

The full reference is [docs/course-capture.md](../course-capture.md). This page is the short version.

## Before you start

The setup is the same as the [Quickstart](README.md#quickstart-ten-minutes-to-a-first-local-run): Node 22+,
pnpm, and `pnpm install` in a checkout of this repository. `check` with a reader also needs Chromium
(`pnpm exec playwright install chromium`) and a running reader, for example side a of `pnpm harness stack up`.

You need no account or token. The capture makes only anonymous GETs, so it copies only what anyone could
already read. A course behind a sign-in is recorded as `not-public`, not copied.

## 1. Capture a course

```console
pnpm harness course capture --course https://tutors.dev/course/wit-hdip-comp-sci-2024
```

`--course` takes a reader URL, a course host (`https://<id>.netlify.app`) or the bare id. The capture reads
the course's `tutors.json` and every file it names on the course host (images, PDFs, archives), and follows
linked Tutors courses one level deep (`--depth 0` for the course alone). It ends with a summary line per
course.

The capture goes to `.harness/courses/<id>/` (`--out` to change it):

```
.harness/courses/wit-hdip-comp-sci-2024/
  courses.json                   one line per course reached: captured, not-public, not-found, ...
  wit-hdip-comp-sci-2024/
    tutors.json                  byte for byte as published
    course-capture.json          every file with its size and sha256
    ...                          the course's images, PDFs and archives
```

Useful flags:

| Flag | Use it to |
| --- | --- |
| `--dry-run` | see what would be fetched, writing nothing |
| `--skip-ext mp4,mov` | leave videos out (recorded as skipped) |
| `--max-file-mb 50` | leave large files out |
| `--force` | replace a course folder you captured before |
| `--strict` | exit 1 if any file or linked course is missing |

## 2. Verify it

```console
pnpm harness course verify --dir .harness/courses/wit-hdip-comp-sci-2024
```

This checks every file against the sha256 recorded at capture time, without using the network. Run it before
any test that relies on the capture being exactly what was captured. Exit `0` means unchanged.

## 3. Serve it

```console
pnpm harness course serve --dir .harness/courses/wit-hdip-comp-sci-2024 --port 8080
```

Point a reader at it as the course id `localhost:8080`, for example
`http://localhost:3100/course/localhost:8080`. The reader fills in the course address itself, so a
captured course works locally unchanged.

## 4. Check it loads

```console
pnpm harness course check --dir .harness/courses/wit-hdip-comp-sci-2024 --reader http://localhost:3100
```

Two checks, both needed:

- **Files:** the course is served (on port 8190) and every file comes back with its recorded sha256.
- **Pages:** a fixed sample of the course's pages (`--sample 20`; `0` for all) is opened in Chromium, and
  each must show its title within 30 seconds.

Why a browser? The reader draws every page in the browser, so a plain HTTP request to a course page
returns the same empty shell whether the course works or not. Only a browser shows a course loading.

Since 1.32.0 each page is also read as a student meets it (text, headings, broken images, broken links,
serious accessibility problems), and two student journeys are clicked through: course page, topic, lab,
then each step (`--journeys 0` to skip them).

Since 1.33.0 the course's `tutors.json` is also held to the schema the generator on main promises (the
mono-repo's published `tutors-json.schema.json`), with or without a reader. It is reported, never a fail:
courses written by older generators break the strict schema and still open in the reader.

The result is in `course-check.json` beside the capture: pages loaded, failed requests, page errors,
the time to each title and the schema reading. Exit `1` means something did not load.

## 5. Compare main with production

Check the same course in production's reader and in main's, into two folders, then:

```console
pnpm harness course compare --a checks/a --b checks/b
```

It lists every page and journey that is worse on main, with why, and exits `1` only then. That is the
release question: a live course fails some pages on production too.

## The course corpus

[`fixtures/course-corpus/courses.yaml`](../../fixtures/course-corpus/courses.yaml) is the shared, curated
list: **at most five** courses, each with the reason it is there, and one `standard` course (today
wit-hdip-comp-sci-2024). To capture and check them all:

```console
pnpm harness course capture --corpus fixtures/course-corpus/courses.yaml
pnpm harness course check --corpus fixtures/course-corpus/courses.yaml --reader http://localhost:3100
```

Each corpus course is captured alone (linked courses are not followed), so a module course goes into the
corpus as its own entry. To propose a course, open a pull request that adds an entry with a `why` of at
least a sentence. A sixth course must replace one: the file is refused with more than five.

```yaml
  - course: https://tutors.dev/course/<id>
    why: What this course covers that the others do not.
    skipExt: [mp4, mov]
```

## In CI

[`course-capture.yml`](../../.github/workflows/course-capture.yml) does all of this on GitHub's runners:
on demand (any course, any depth), every week, and on a pull request that touches `src/course/` or the
corpus. Its `corpus` job, after each Main to RC on main, checks every corpus course in production's reader and main's and compares them. The manifests and
checks are kept as the `course-capture` and `course-corpus-check` artifacts for 14 days.

## Good to know

- A captured portfolio still links to the live `tutors.dev`. Following a link from a local copy leaves your
  machine.
- What a course shows only to a signed-in student is not in `tutors.json`, so it is not captured.
- The `src/course/` code uses only Node built-ins and `fetch`, so it can be lifted into another tool as is.
