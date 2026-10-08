# Course capture: a live course as local files

`harness course` (since 1.29.0, not stable) copies a published Tutors course to disk as the
reader sees it. The point is to have a **known working course** as local files: the fixture
course is a scaffolder default with two topics, and a real course, such as a whole Higher
Diploma, has hundreds of labs, talks, images and PDFs. Once a course is on disk and pinned by
sha256, a run can serve it to both sides of an A/B and benchmark against it as hard as it likes,
without touching Netlify or depending on the course not changing.

```console
$ pnpm harness course capture --course https://tutors.dev/course/wit-hdip-comp-sci-2024
$ pnpm harness course verify --dir .harness/courses/wit-hdip-comp-sci-2024
$ pnpm harness course serve --dir .harness/courses/wit-hdip-comp-sci-2024 --port 8080
```

The three commands are self-contained (`src/course/`: Node built-ins and `fetch`, nothing else
from the harness), so they can be lifted into another tool unchanged.

## What `capture` reads

`--course` takes a reader URL (`https://tutors.dev/course/<id>`, any page under it), a reader
path (`/course/<id>`), a course host (`https://<id>.netlify.app`, `http://localhost:8080`) or the
bare id. It resolves it as the reader does (`determineCourseUrl` in the monorepo): a bare id is
`https://<id>.netlify.app`, an id with a dot is its own host, and `localhost` or a private
address is `http://`.

1. **`tutors.json`** from the course host. That is the whole course tree, with every learning
   object, lab step and note in it. It must be JSON with `type: "course"`; it is written exactly as
   the host sent it, never re-serialised, so its sha256 is the published file's.
2. **Every file it names on the course host.** The generator writes an address in three ways
   and the capture follows all three (`src/course/assets.ts`):
   - `https://{{COURSEURL}}/...`, in `img`, `pdf`, `excalidraw` or any other field;
   - an archive: `route: /archive/{{COURSEURL}}/<folder>` plus `archiveFile`;
   - markdown in a lab step, a note, a notebook cell or a summary naming `img/...`, `./img/...`,
     `archives/...` or `archive/...`, relative to its learning object's folder (a lab step is
     relative to its lab), as the reader's markdown `filter` resolves them.
   Nothing on another host is fetched (YouTube, GitHub, Slack, other sites). A path that would
   leave the course root (`../../..`) is dropped.
3. **Linked courses, to `--depth`** (default 1; 0 is the course alone). A `web` learning object
   whose route is a Tutors course (`/course/<id>`, `https://tutors.dev/course/<id>` or
   `https://<id>.netlify.app`) is captured the same way. A portfolio such as
   `wit-hdip-comp-sci-2024` is mostly links to its module courses, so depth 1 is what makes the
   capture a course you can read. Each course is captured once, however many times it is linked.

**Only what is public.** Every request is an anonymous `GET`. A host that answers 401 or 403 is
recorded as `not-public` and nothing is guessed; 404 is `not-found`; an HTML page where JSON
should be (a sign-in wall) is `not-a-course`. The capture never signs in and takes no
credentials. A 5xx or 429 is retried twice with backoff; a 4xx is the answer.

## What it writes

`--out` defaults to `HARNESS_HOME/courses/<id>` (`.harness/` in the checkout, gitignored):

```
<out>/
  courses.json                        the index: every course reached, its depth, status and counts
  wit-hdip-comp-sci-2024/             the course as its host serves it
    tutors.json
    course.png
    unit-1/web-2-mobile-app-dev/web.png
    course-capture.json               what was captured, from where, and each file's sha256
  setu-hdip-comp-sci-2024-mobile/     a linked course (depth 1), the same way
    ...
```

`course-capture.json` (schema `tutors-course-capture/1`) records the course (`id`, `origin`, the
reader URL, its title), `capturedAt`, the harness version, `tutorsJson` and `files` (path, bytes,
sha256, content type), `missing` (named in `tutors.json` but not served, with the status),
`skipped` (by `--skip-ext` or `--max-file-mb`), the learning objects per `types`, and the
`links` it found. `courses.json` (schema `tutors-course-capture-index/1`) has one entry per course:
`captured`, `not-public`, `not-found`, `unreachable` or `not-a-course`.

A course folder is refused if it is already there and not empty, unless `--force`, which replaces
that folder (only that folder).

| Flag | Default | Meaning |
| --- | --- | --- |
| `--course` | (required) | the course, as above |
| `--out` | `HARNESS_HOME/courses/<id>` | where the capture goes |
| `--depth` | `1` | levels of linked courses to follow |
| `--concurrency` | `8` | files fetched at once, per course |
| `--max-file-mb` | none | a larger file is recorded as skipped, not written |
| `--skip-ext` | none | extensions recorded as skipped, not fetched: `mp4,mov,zip` |
| `--dry-run` | | read only `tutors.json` (of each course reached) and write nothing: what a capture would fetch |
| `--force` | | replace a course folder that is already there |
| `--strict` | | exit 1 when any file is missing or any linked course could not be captured |
| `--json` | | print `courses.json` (with `out`) instead of the summary |

Exit `0` when the course was captured (a missing file or an unreadable linked course is in the
record, not an error, unless `--strict`); `1` when the course itself could not be read; `2` for
usage.

## `verify` and `serve`

`harness course verify --dir <capture | course folder>` checks every file a
`course-capture.json` lists for its size and sha256: exit `0` when the capture is what was
captured, `1` when anything drifted (each file is named). It reads nothing from the network.
Run it before a benchmark that relies on the capture being what it was.

`harness course serve --dir <capture | course folder> [--port 8080]` serves one course folder
(given a capture, its root course) with `fixtures/course-server/serve.mjs`, the server the
harness's own fixture course runs on: any origin allowed, no `Date`, `ETag` or `Last-Modified`
header, so the server is not a source of noise. The reader reads it as the course id
`localhost:<port>`, because routes in `tutors.json` hold `{{COURSEURL}}` and the reader fills it
in with whatever host it was given.

## Does it load: `check`

`harness course check --dir <capture | course folder> [--reader http://localhost:3100] [--sample 20] [--port 8190]`
(since 1.30.0) shows a captured course loads, in two layers:

- **Files (HTTP).** The course is served on `--port` (8190, clear of the stack's ports) by the fixture course server, as course id
  `localhost:<port>`, and every file `course-capture.json` lists must come back with its sha256.
- **Pages (a browser), with `--reader`.** Every reader page renders in the browser (`ssr = false`
  across the reader), so a GET of `/course/<id>` answers the same shell whether or not the course
  works; plain HTTP cannot show a course loading. The check opens a fixed sample of the course's
  pages in Chromium (the course page, the first page of each type, then pages spread evenly;
  `--sample 0` is every page) and each must show its title within 30 seconds. Failed requests to
  the course host, page errors and the time to the title are recorded per page.

Since 1.32.0, two more layers, both with `--reader`:

- **What a student meets.** Each page that loads is read again once its images have had a moment: the
  visible text, the headings, course images that did not load, links to pages of the course that do not
  exist, and serious or critical accessibility violations (axe).
- **Journeys** (`--journeys`, default 2). The course page, the topic, a lab and its steps (at most 8), each
  reached by clicking its link on the page before, as a student would. A page with no link to the next is
  recorded as `no link` and opened by address so the journey can go on.

It writes `course-check.json` beside the capture (`--out` moves it) and exits `1` when a file or a page
failed. Any reader will do: side a of `harness stack up` is `http://localhost:3100`.

## Main against production

A live course fails some pages on production too, so "did every page load" is not a release question.
"Would releasing main make anything worse for a student" is:

```console
pnpm harness course compare --a checks/a --b checks/b --out compare.json
```

`--a` and `--b` are folders holding `course-check.json` (one, or one per course): production's checks and
main's. Each course is compared page by page and journey by journey, and every page worse on main is listed
with why. Exit `1` means something is worse on main; what fails on both is reported by `check`, not here.
The `corpus` job runs it after checking both sides, and it decides the job's colour.

## The corpus

`fixtures/course-corpus/courses.yaml` is the curated list: **at most five** live courses, each with the
reason it is there, and the `standard`, the course a check or a benchmark uses when it is given none
(wit-hdip-comp-sci-2024 for now).

```console
$ pnpm harness course capture --corpus fixtures/course-corpus/courses.yaml
$ pnpm harness course check --corpus fixtures/course-corpus/courses.yaml --reader http://localhost:3100
```

Each corpus course is captured alone (linked courses are not followed), so the corpus is exactly the
courses the file names, into `HARNESS_HOME/courses/corpus/` (`--out`). A portfolio such as the standard is
mostly links, so a module course belongs in the corpus as its own entry. Add a course with a reason;
replace one before adding a sixth.

## Into an A/B

The route to a run is the one [fixtures/course-server/README.md](../fixtures/course-server/README.md)
describes for adding a course to the corpus: copy a captured course folder under
`fixtures/course-server/`, publish it on its own port in `compose.harness.yaml`, record where it
came from (`course-capture.json` already holds the origin, the time and every sha256), and write
journeys for it. That is a fixture change, so it bumps the harness version and goes through the
mutants like any other. Nothing in the gate reads a capture today; this command only makes one.

Two things a capture does not carry: the links of a portfolio still point at the live
`tutors.dev/course/<id>` (the captured `tutors.json` is byte for byte what was published), so a
journey that follows one leaves the stack; and what a course shows only to a signed-in student is
not in `tutors.json` and so not captured.

## Live check

`.github/workflows/course-capture.yml` captures `wit-hdip-comp-sci-2024` on GitHub's runners
(on demand, weekly, and on a pull request that changes `src/course/` or the corpus), verifies it, and keeps
`courses.json` and each `course-capture.json` as an artifact. Its `corpus` job (since 1.30.0) captures
the corpus, boots the stack and checks every corpus course loads. Since 1.31.0 it runs nightly, boots production
on side a and main on side b (as Main to RC resolves them), checks the corpus in both readers, and the
[A3](https://tutors-sdk.github.io/tutors-release-harness/a3.html#courses) shows the two side by side as
**Real courses**: a course that loads on production but breaks on main is named there. It is what proves the command against a
real course; the unit tests (`tests/course-capture.test.ts`) use a fake web and the committed
fixture course over real HTTP.
