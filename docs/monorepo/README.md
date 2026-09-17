# What the monorepo needs to do

Three small additions to `tutors-sdk/tutors-mono-repo` make the harness fully
automatic. Each file here is ready to copy.

| File | Purpose | Trigger |
| --- | --- | --- |
| `publish-images.yml` | build, push, sign and attest the four images to GHCR | push to `main`, `v*` tags |
| `release-dispatch.yml` | tag the release candidate (`v16.3.0-rc.N`) and dispatch the harness with production tag, candidate tag, claims URL and migration refs | push to `release/**` |
| `release/claims.yaml` | the release's claims (see `../../claims/README.md`) | written by the release author |

And one repository secret in the monorepo: `HARNESS_TOKEN`, a fine-grained
PAT with `actions: write` on this repository, for `repository_dispatch`.

On the harness side, set the repository variables:

| Variable | Value |
| --- | --- |
| `HARNESS_IMAGE_PREFIX` | `ghcr.io/tutors-sdk/tutors` |
| `HARNESS_PRODUCTION_TAG` | the deployed version, e.g. `16.2.0`; the deploy job updates it |
| `HARNESS_PRODUCTION_URLS` | `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev` |

Then the sequence for a release is:

1. Release branch pushed → candidate tagged and built → harness **release**
   mode (A/B with claims, 3 runs, k6), **migration** mode (production ref vs
   candidate sha), **upgrade** mode (edge rollout under load). The PR comment
   is in the workflow summary and the report is an artifact.
2. Tag / deploy → the monorepo updates `HARNESS_PRODUCTION_TAG` and dispatches
   `post-deploy`: the harness runs the reference-course journeys against
   production and compares with the recorded candidate run; a new difference
   opens a rollback issue with the report attached.
3. Every 15 minutes → the synthetic workflow repeats the post-deploy
   comparison against the last recorded run.
4. Nightly → A/A on the production tag (the harness's right to gate).
5. Weekly → the eight mutants.

If images are not published yet, everything still works: `harness images ensure`
builds from the git ref (`v<tag>`, `<tag>`, `release/<tag>`) when the pull fails.
