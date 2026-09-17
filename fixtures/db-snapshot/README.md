# Database snapshot fixture (planned, phase H4)

A sanitised production snapshot — real shape, synthetic identities — restored
into a database per side before the journeys run, and row-diffed by table
afterwards. Two things come out of it:

- **Persistence diff.** After the same traffic, the two sides must have written
  the same rows (after masking generated ids and timestamps). A difference is
  a `persistence` hunk that a claim must name.
- **Anonymous writes.** During anonymous journeys the expected write count is
  zero on both sides. Any write at all is a finding regardless of whether the
  sides agree, because the anonymous model is a promise, not a diff.

Migration mode (`harness run --mode migration`) also uses this snapshot: run
production's migrations, then the candidate's, then roll back, asserting the
expand/contract rule mechanically (no column the *deployed* app version reads
may be dropped or renamed).

Not built yet: the apps currently persist through Supabase, and the snapshot
job belongs with the move off it (runway tier I). This directory holds the
contract so the collector has a place to land.
