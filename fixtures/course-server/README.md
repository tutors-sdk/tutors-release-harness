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
