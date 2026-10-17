# Fixture course server

A static server for the pinned courses both sides read. Today it serves one
course, `course/`, generated from the Tutors scaffolder's default course by the
monorepo's tier G fixture build (`pnpm e2e:stack:fixture` in
`tutors-sdk/tutors-mono-repo`, then copy `tests/e2e-stack/work/course` here).
The course is committed, not built, so the harness has no dependency on the
monorepo's source: it compares images, and images only.

The journeys in `traffic/journeys/fixture.ts` describe this course (titles,
paths, step ids, a search term). Change the course and that file together.

## Adding a course to the corpus

Put its generated output (the folder containing `tutors.json`) under a new
directory here and publish it on its own port in `compose.harness.yaml`. The
reader treats `localhost:<port>` as an `http://` course id, so the id of a
course served here is its host and port.

Rules for anything served from here:

- No `Date`, `ETag` or `Last-Modified` headers (see `serve.mjs`): the fixture
  must not be a source of noise.
- Pin by commit when the course comes from a public repository, and record the
  commit in this README.

## The Rule journeys' course (since 1.44.0)

`rules-course/` is the course the Rule journeys read when they carry `@course-rules`
(`traffic/journeys/features`). The same server publishes it on port 8081
(`RULES_COURSE_PORT`), so its course id is `localhost:8081`. It is built by
[`rules-course-build/build.ts`](rules-course-build/build.ts) with the monorepo's
scaffolder and generator, from tutors-mono-repo `83d4ccf` (the generator is the
same at `126a1c7`, the commit it was run from). `scripts/build-rules-course.sh
<monorepo checkout>` rebuilds it in a Deno container. It holds what the fixture
course does not:

- `auth: 1` and `private: 1`, and an `enrollment.yaml` whose whitelist names only
  `harness-enrolled` (the identity stub's `enrolled` role) and whose educators name
  `harness-lecturer`, so the stub's `student` is turned away (Rule 0586).
- A quiz (`quiz-01`, two questions), a notebook (`notebook-01`, one markdown and one
  code cell) and the scaffolder's talk, lab and note in Topic 1.
- Since 1.45.0 a second topic, Topic 2 (the scaffolder's talk, lab and note), which the
  content lock journey (Rule 0588) locks, so the course page still has a topic to show.
- A `calendar.yaml` on fixed dates around the harness clock (`HARNESS_NOW`,
  2026-09-16): week 2 is the current week, week 3 holds the one assessment.
- `llm: 2`, so the course links its page for LLMs and its `llms/` downloads are served.
