# What the monorepo needs to do

Three small additions to `tutors-sdk/tutors-mono-repo` make the harness fully
automatic. Each file here is ready to copy.

| File | Purpose | Trigger |
| --- | --- | --- |
| `publish-images.yml` | build (amd64 + arm64), push to Quay.io, cosign-sign and SBOM-attest the four images. **In the monorepo the real file is `.github/workflows/image-build.yml`** (its PR #143); this is a reference copy of the contract | push to `main`, `v*` tags |
| `release-dispatch.yml` | tag the release candidate (`v16.3.0-rc.N`) and dispatch the harness with production tag, candidate tag, claims URL and migration refs | push to `release/**` |
| `release/claims.yaml` | the release's claims (see `../../claims/README.md`) | written by the release author |

Repository secrets in the monorepo:

| Secret | Value |
| --- | --- |
| `QUAY_USERNAME`, `QUAY_PASSWORD` | a Quay **robot account** (`tutors-sdk+<name>`) with write access to `tutors-reader`, `tutors-catalogue`, `tutors-live`, `tutors-time` — never a person's login |
| `HARNESS_TOKEN` | a fine-grained PAT with `contents: write` on this repository — what GitHub requires for `repository_dispatch` |

The four Quay repositories are public: the harness pulls anonymously and
needs no registry credentials of its own.

What the harness relies on from that workflow — change any of these and the
harness must change with it:

- **Names**: `quay.io/tutors-sdk/tutors-<app>` (Quay has no nested paths).
- **Tags**: `X.Y.Z`, `X.Y` and `latest` on a `v*` tag, `X.Y.Z-rc.N` on a
  prerelease tag (which never moves `latest`), `main` on a push to `main`,
  `sha-<short>` on every build. Give the harness `X.Y.Z` (or a digest): `X.Y`,
  `latest` and `main` move. The release dispatch sends bare tags (`16.2.0`,
  `16.3.0-rc.1`), which expand through `HARNESS_IMAGE_PREFIX`.
- **Signature**: cosign keyless, by digest, from the workflow file
  `.github/workflows/image-build.yml`. The harness refuses a pulled image whose
  certificate identity does not match
  `^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@`
  with issuer `https://token.actions.githubusercontent.com`. Renaming the
  workflow file changes the identity: set `HARNESS_COSIGN_IDENTITY` here to match.
- **SBOM**: an SPDX attestation (`cosign attest --type spdxjson`).
- **Labels**: `org.opencontainers.image.revision`, `.version`, `.created`,
  `.source` — read into every report.

What the harness accepts, writes and promises — event types, payload fields,
`report.json`, exit codes, what it will never do to a PR — is in
[the contract](../contract.md). Pin the harness by tag (`v1.1.0`).

On the harness side, set the repository variables:

| Variable | Value |
| --- | --- |
| `HARNESS_IMAGE_PREFIX` | `quay.io/tutors-sdk/tutors-{app}` — already the workflows' default; set it only to point somewhere else (a fork's namespace, or `tutors` to force local builds) |
| `HARNESS_COSIGN_IDENTITY` | only if the signing workflow is not `tutors-sdk/tutors-mono-repo/.github/workflows/image-build.yml` (the workflows pass it through; empty means the default) |
| `HARNESS_PRODUCTION_TAG` | the deployed version, e.g. `16.2.0`; the deploy job updates it |
| `HARNESS_PRODUCTION_URLS` | `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev` |

Then the sequence for a release is:

1. Release branch pushed → candidate tagged and built → harness **release**
   mode (A/B with claims, 3 runs, k6), **migration** mode (production ref vs
   candidate sha), **upgrade** mode (edge rollout under load). The PR comment
   is in the workflow summary and the report is an artifact.
2. Tag / deploy → the monorepo updates `HARNESS_PRODUCTION_TAG` and dispatches
   `deployed`: the harness runs the reference-course journeys against
   production and compares with the recorded candidate run; a new difference
   opens a rollback issue with the report attached.
3. Every 15 minutes → the synthetic workflow repeats the post-deploy
   comparison against the last recorded run.
4. Nightly → A/A on the production tag (the harness's right to gate).
5. Weekly → the eight mutants.

If images are not published yet, everything still works: `harness images ensure`
builds from the git ref (`v<tag>`, `<tag>`, `release/<tag>`) when the pull fails —
and every report from such a run says `built-from-ref <ref>@<sha>` in its header
and in its reasons, because a local build is not the image that ships.
