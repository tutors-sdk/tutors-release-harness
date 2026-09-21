# What the monorepo needs to do

Three small additions to `tutors-sdk/tutors-mono-repo` make the harness fully
automatic. Each file here is ready to copy.

| File | Purpose | Trigger |
| --- | --- | --- |
| `publish-images.yml` | build (amd64 + arm64), push to Quay.io, cosign-sign and SBOM-attest the four images. **In the monorepo the real file is `.github/workflows/image-build.yml`** (its PR #143); this is a reference copy of the contract | push to `main`, `v*` tags |
| `release-dispatch.yml` | tag the release candidate (`v16.3.0-rc.N`, next free N), have `image-build.yml` build it and wait until the registry serves the images, then dispatch the harness with production tag, candidate tag, claims URL, migration refs and, since 1.3.0, the digest of every image. **Again the monorepo's file is the source of truth**; this is a reference copy | push to `release/**` |
| `release/claims.yaml` | the release's claims (see `../../claims/README.md`) | written by the release author |

The monorepo also checks `release/claims.yaml` on the push and on the release PR
(`pnpm check:release-claims`, `release-claims.yml`), so a bad file fails in
minutes instead of in the harness run. That check mirrors
`src/claims/schema.ts`, and the harness's parse is the authority: both must
accept the same artefact names (the nineteen in [the contract](../contract.md)),
accept the optional `version: 1`, and ignore unknown keys. A mirror that is
stricter rejects a file the harness would take; one that is looser lets
through a file that stops the run with exit 2.

## Since 1.3.0: send digests, and say what was deployed

Both are optional; a dispatch without them behaves exactly as in 1.2.0.

**`release-candidate`** gains `production_digests` and `candidate_digests`:
objects `app -> "sha256:<64 hex>"` (`reader`, `catalogue`, `live`). Send the
digest of the manifest the tag points at, as `docker buildx imagetools inspect
<image> --format '{{.Manifest.Digest}}'` prints it (that is the digest cosign
signed). The harness then pulls and verifies by digest, and exits `2`, "cannot
judge", when a tag has moved to another digest by the time it looks. The
reference copy of `release-dispatch.yml` reads them in its `images` job.

```json
{ "event_type": "release-candidate",
  "client_payload": {
    "production": "16.2.0", "candidate": "16.3.0-rc.4", "claims_url": "https://raw.githubusercontent.com/tutors-sdk/tutors-mono-repo/<sha>/release/claims.yaml",
    "runs": 3, "migrations_a": "v16.2.0", "migrations_b": "<sha>",
    "production_digests": { "reader": "sha256:<64 hex>", "catalogue": "sha256:<64 hex>", "live": "sha256:<64 hex>" },
    "candidate_digests":  { "reader": "sha256:<64 hex>", "catalogue": "sha256:<64 hex>", "live": "sha256:<64 hex>" } } }
```

**`deployed`** (sent by the deploy job) gains `production`, the tag that was
deployed (`16.3.0`), and `digests`, the images that run:

```json
{ "event_type": "deployed",
  "client_payload": { "production": "16.3.0", "digests": { "reader": "sha256:<64 hex>", "catalogue": "sha256:<64 hex>", "live": "sha256:<64 hex>" } } }
```

The harness compares them with what release mode judged, which it kept on its
`release-records` branch (`releases/<release>.json`, the newest candidate of
release `16.3.0` that could ship), and **warns** when they differ, when there is
no record, or when no digests were sent: the report and the step summary say
`DEPLOYED IMAGES DIFFER` or `DEPLOYED IMAGES NOT CONFIRMED`. That check can only
pass if the deployed image *is* the judged one: **promote the candidate's image
to the release tag** (`docker buildx imagetools create -t <image>:16.3.0
<image>:16.3.0-rc.4`, which keeps the digest) rather than rebuilding it from the
release tag, which produces a different digest and a warning on every release.

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
[the contract](../contract.md). Pin the harness by tag (`v1.2.0`).

On the harness side, set the repository variables:

| Variable | Value |
| --- | --- |
| `HARNESS_IMAGE_PREFIX` | `quay.io/tutors-sdk/tutors-{app}` — already the workflows' default; set it only to point somewhere else (a fork's namespace, or `tutors` to force local builds) |
| `HARNESS_COSIGN_IDENTITY` | only if the signing workflow is not `tutors-sdk/tutors-mono-repo/.github/workflows/image-build.yml` (the workflows pass it through; empty means the default) |
| `HARNESS_PRODUCTION_TAG` | the deployed version, e.g. `16.2.0`; the deploy job updates it |
| `HARNESS_PRODUCTION_URLS` | `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev` |

## First day on Quay

The order matters: the harness has nothing to judge until production's own
images exist, and production (`v16.2.2`) was tagged before `image-build.yml`
existed, so its tag push published nothing.

1. In Quay, create the public repositories `tutors-reader`,
   `tutors-catalogue`, `tutors-live` and `tutors-time` under `tutors-sdk`, and
   a robot account with write on all four. Store it in the monorepo as
   `QUAY_USERNAME` / `QUAY_PASSWORD`.
2. Merge the monorepo's `image-build.yml` (PR #143). The push to `main`
   publishes `:main` and `:sha-<short>`: the first proof the robot account,
   signing and SBOM attestation work.
3. Backfill production. Dispatching on the old tag cannot work (the tag has no
   copy of the workflow), so run it from `main` with the tag as input; it
   builds that tag's own Dockerfile and publishes `X.Y.Z`, `X.Y` and
   `sha-<short>`, never `latest`:

   ```bash
   gh workflow run image-build.yml --repo tutors-sdk/tutors-mono-repo --ref main -f release_tag=v16.2.2
   ```

   Its signature identity ends in `@refs/heads/main`, which the default
   `HARNESS_COSIGN_IDENTITY` accepts.
4. Check the round trip from a laptop before any workflow depends on it:

   ```bash
   cosign verify --certificate-identity-regexp '^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@' \
     --certificate-oidc-issuer https://token.actions.githubusercontent.com quay.io/tutors-sdk/tutors-reader:16.2.2
   pnpm harness images ensure --a 16.2.2 --b main    # pulled+verified on both sides, nothing built
   ```

5. Set `HARNESS_PRODUCTION_TAG=16.2.2` here and dispatch **Nightly noise** once
   by hand. Until the monorepo has a deploy job (plan items M11/M12), this
   variable is updated by hand after every release.
6. Add `HARNESS_TOKEN` to the monorepo. The next `release/**` push is the
   first end-to-end candidate.

Then the sequence for a release is:

1. Release branch pushed → candidate tagged and built → harness **release**
   mode (A/B with claims, 3 runs, k6), **migration** mode (production ref vs
   candidate sha), **upgrade** mode (edge rollout under load). The PR comment
   is in the workflow summary and the report is an artifact.
2. Tag / deploy → the monorepo updates `HARNESS_PRODUCTION_TAG` (by hand until
   it has a deploy job) and dispatches
   `deployed` (with `production` and `digests`, since 1.3.0): the harness runs
   the reference-course journeys against production and compares with the
   recorded candidate run; a new difference opens a rollback issue with the
   report attached, and images that are not the ones judged are a warning.
3. Every 15 minutes → the synthetic workflow repeats the post-deploy
   comparison against the last recorded run.
4. Nightly → A/A on the production tag (the harness's right to gate).
5. Weekly → the ten mutants.

If images are not published yet, everything still works: `harness images ensure`
builds from the git ref (`v<tag>`, `<tag>`, `release/<tag>`) when the pull fails —
and every report from such a run says `built-from-ref <ref>@<sha>` in its header
and in its reasons, because a local build is not the image that ships.
