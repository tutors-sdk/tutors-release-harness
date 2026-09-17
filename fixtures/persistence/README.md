# Persistence fixture

Each side gets its own Supabase-REST-shaped stub (`stub.mjs`): every read sees
an empty table, every write is recorded with its table and method, and the
harness reads the log after each journey. What a side *tried to persist* is
the `persistence` artefact.

Two rules come out of it:

- **Diff.** After the same journey the two sides must have written the same
  rows, by table and method. A difference is a `persistence` hunk
  (`<journey>/<table>`) that a claim must name.
- **Anonymous writes.** During an anonymous journey the expected write count
  is zero. A write on side b that side a did not make fails the run; a write
  on both sides is reported as a product finding (informational in the diff,
  loud in the report) because the anonymous model is a promise, not a diff.

The stub is reached from the browser as `http://persistence-<side>.harness.test:<port>`
(the harness's Chromium resolves `*.harness.test` to the host) and from the
containers through `extra_hosts` to the host gateway, so `PUBLIC_SUPABASE_URL`
is one value that works on both sides of the network boundary.

## Why a stub and not a database

The apps talk to Supabase through its REST API from the browser and, for the
readiness probe, from the server. A stub that speaks that API records intent
exactly, needs no schema, and cannot leak state between runs. The sanitised
production snapshot and the row diff by table (runway tier I) belong to
`migration` mode, which runs real Postgres against real migrations — see
`../migrations`.
