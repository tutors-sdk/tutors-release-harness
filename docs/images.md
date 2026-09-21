# Where the A and B images come from

The harness compares **images**, never checkouts. Side **a** is what runs in
production; side **b** is the candidate. Both are three images — `reader`,
`catalogue`, `live` — and a verdict is only worth something if those are the
images that ship. So the harness cares where they came from, checks what it
can, and writes the answer at the top of every report.

The monorepo publishes to **Quay.io**: `quay.io/tutors-sdk/tutors-<app>`,
signed with cosign and carrying an SBOM (section 3). `harness images ensure`
gets each image by the first of these that works, and the workflows call it
before every run:

| # | Source | When | Recorded as |
| --- | --- | --- | --- |
| 1 | Already local | you built it, or an earlier `ensure` pulled it | `local (unverified)`, or what the earlier `ensure` recorded |
| 2 | Registry pull, **signature verified** | the reference names a registry and the tag or digest is there | `pulled+verified` |
| 3 | Build from a git ref | a bare tag the registry does not have | `built-from-ref <ref>@<sha>` — loud, see section 5 |
| — | Mutant | the harness's own negative fixtures, built by `harness mutants` FROM the base reader image | `local (unverified)` |

```bash
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'
pnpm harness images ensure --a 16.2.0 --b 16.3.0-rc.1
#   16.2.0:
#     pulling quay.io/tutors-sdk/tutors-reader:16.2.0
#     verified quay.io/tutors-sdk/tutors-reader@sha256:4f1c… signed by ^https://github.com/tutors-sdk/tutors-mono-repo/…
#     reader: quay.io/tutors-sdk/tutors-reader:16.2.0 — pulled+verified · sha256:4f1c… · revision 1a2b3c4d5e6f · version 16.2.0
```

Exit codes of `images ensure` ([the contract](contract.md#verdicts-and-exit-codes)):
**0** every image is present and may be judged; **1** an image could not be
obtained — not in the registry and not buildable from a git ref (as before);
**2** an image may not be judged — a registry image that is unsigned, signed by
someone else, or uncheckable because cosign is not installed, or a spec that
makes no sense — with the reason printed. 2 wins when both happen. `harness
run` exits 2 with `cannot judge: …` for the same reasons, and for an image
that is not present locally.

## 1. Naming

A **bare tag** on `--a`/`--b` expands to one image per app. Where they live is
`HARNESS_IMAGE_PREFIX` (or `--image-prefix`), which takes two forms:

| Form | Example | `--a 16.2.0` gives |
| --- | --- | --- |
| a bare prefix: `<prefix>/<app>:<tag>` | `tutors` (the default) | `tutors/reader:16.2.0` |
| a template containing `{app}` | `quay.io/tutors-sdk/tutors-{app}` | `quay.io/tutors-sdk/tutors-reader:16.2.0` |

The default, `tutors`, matches what `docker compose build` in the monorepo
produces (`tutors/<app>:local`), so local work needs no configuration. The
template exists because Quay has no nested repositories: the app has to be
part of the repository name. The CI workflows default to the Quay template;
locally, export it when you want published images.

Everything that names an image goes through `src/image-ref.ts` — the compose
stack, the kind substrate, `images ensure`, the mutants' base image — and
`scripts/build-images.sh` has the one shell mirror of it, held to the same
answers by a unit test.

Other forms `--a` accepts:

| Form | Meaning |
| --- | --- |
| `quay.io/tutors-sdk/tutors-reader:16.2.0`, `tutors/reader:16.2.0` | that image for its app; the other two take the prefix and the same tag |
| `reader=REF,catalogue=REF,live=REF` | every image spelled out (mutant runs use this); each `REF` may be pinned by digest |
| `main`, `release/16.3.0`, a sha (migration mode only) | a git ref of the monorepo to fetch migrations from |
| `dir:path` (migration mode only) | a local directory of `.sql` files |

### Digests

A tag can be moved; a digest cannot. To compare against exactly what is
deployed, pin each image:

```bash
pnpm harness images ensure \
  --a "reader=quay.io/tutors-sdk/tutors-reader:16.2.0@sha256:…,catalogue=quay.io/tutors-sdk/tutors-catalogue@sha256:…,live=quay.io/tutors-sdk/tutors-live@sha256:…" \
  --b 16.3.0-rc.1
```

- A digest names one image and the three apps have three digests, so a digest
  only appears in a full reference. `--a 16.2.0@sha256:…` is refused with
  that explanation rather than guessed at.
- `repo:tag@sha256:…` and `repo@sha256:…` are both accepted. The tag is kept
  in the report for the reader; docker, compose and kubectl are given
  `repo@sha256:…`, so the digest alone decides what runs.
- One pinned image with a tag (`--a quay.io/tutors-sdk/tutors-reader:16.2.0@sha256:…`)
  pins that app; the other two take the prefix and the tag, unpinned.
- A pinned side cannot fall back to a build: there is no way to build a digest.
- On the kind substrate, `kind load docker-image` carries tags, not digests, so
  a pinned image is given a local tag derived from its digest
  (`…/tutors-reader:16.2.0-sha256-0123456789ab`) and the manifests use that.

Get the digests from the production overlay, from `docker buildx imagetools
inspect quay.io/tutors-sdk/tutors-reader:16.2.0`, or from an earlier report:
every report prints them.

## 2. Signature verification

A registry image is not judged until its signature has been checked:

```bash
cosign verify \
  --certificate-identity-regexp '^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  quay.io/tutors-sdk/tutors-reader@sha256:…
```

- **By digest.** After the pull, the harness reads the image's registry digest
  (`RepoDigests`, for the repository it was named by) and verifies that — never
  the tag, which could move between the pull and the check.
- **Against an identity.** "Signed by someone" is worthless; the certificate
  must have been issued to the monorepo's `image-build.yml` workflow by
  GitHub's OIDC issuer. Override with `HARNESS_COSIGN_IDENTITY` (a regular
  expression) and `HARNESS_COSIGN_ISSUER` — for a fork that publishes its own
  images, say.
- **At `run` as well.** `harness run` (and `stack up`, `kind up|rollout`)
  inspects every image before anything starts. A registry image with no
  verification on record for that exact local image id — pulled by hand, or
  retagged since — is verified then. An image that is not present at all is
  refused (exit 2): otherwise `docker compose up` would pull it silently and
  unverified. Run `images ensure` first.
- **What is not verified:** images that never came from a registry —
  `tutors/<app>:local`, mutants, anything built here. They are recorded as
  `local (unverified)` or `built-from-ref`, which is the truth about them.
  Names without a registry host (`tutors/reader:16.2.0`) are never pulled:
  Docker would resolve them to whoever owns that namespace on Docker Hub.
- The SBOM attestation can be checked by hand with
  `cosign verify-attestation --type spdxjson` and the same identity flags; the
  harness does not gate on it.

cosign **3 or newer** must be on `PATH` — the monorepo signs with cosign 3,
whose signatures an older cosign cannot read; when verification fails under an
older one, the refusal says so (the workflows install it with
`sigstore/cosign-installer@v4`; locally see
<https://docs.sigstore.dev/cosign/system_config/installation/>). Missing
cosign is a refusal, not a skip.

### The escape hatch

```bash
pnpm harness images ensure --a 16.2.0 --b pr-412 --allow-unsigned     # or HARNESS_ALLOW_UNSIGNED=1
pnpm harness run --mode any-two --a 16.2.0 --b pr-412 --allow-unsigned
```

For local investigation only — a fork's unsigned image, a registry mirror, a
machine without cosign. It is loud on the console, the images are recorded as
`pulled-unverified` with the reason verification failed, the report header
says so, and the verdict's reasons include "this run is not evidence for a
release". The CI workflows never pass it.

## 3. What the monorepo publishes

The monorepo's `.github/workflows/image-build.yml` (its PR #143; a reference
copy of the contract is in [`monorepo/publish-images.yml`](monorepo/publish-images.yml)):

- builds `reader`, `catalogue`, `live` (and `time`) from the root `Dockerfile`,
  multi-arch (`linux/amd64`, `linux/arm64`), on every push to `main` and every
  `v*` tag;
- pushes to `quay.io/tutors-sdk/tutors-<app>` with a Quay robot account
  (`QUAY_USERNAME` / `QUAY_PASSWORD`), tagged `sha-<short>` always, `main` on a push to
  `main`, `X.Y.Z`, `X.Y` and `latest` on a release tag, and `X.Y.Z-rc.N` on a
  prerelease tag — which never moves `latest` or `X.Y`;
- signs each image by digest with cosign (keyless) and attaches an SPDX SBOM
  attestation;
- labels each image with `org.opencontainers.image.revision`, `.version`,
  `.created` and `.source`.

With that in place the harness never builds anything: `--a 16.2.0 --b 16.3.0-rc.1`
pulls and verifies both. Release candidates get a tag too (`v16.3.0-rc.1` on
the release branch) so the candidate is a real, immutable, signed image and not
a checkout — [`monorepo/release-dispatch.yml`](monorepo/release-dispatch.yml)
tags the candidate when a `release/**` branch is pushed and dispatches the harness.

## 4. The production tag

**The tag that is deployed is the tag to pass as `--a`.** Do not compare
against `main` when you mean production. The monorepo's kustomize overlays
carry the deployed version (`deploy/k8s/overlays/<app>/kustomization.yaml`,
`images[].newTag`) — that value is the production tag, and the release
workflow records it in the report.

Set it as the repository variable `HARNESS_PRODUCTION_TAG` in this repo;
the nightly noise run and the weekly mutants use it. Update it when a release
is deployed (the monorepo's deploy workflow can do this with
`gh variable set HARNESS_PRODUCTION_TAG --repo tutors-sdk/tutors-release-harness`).

## 5. Building from a git ref (the loud fallback)

`scripts/build-images.sh <ref> [tag]` clones the monorepo at `<ref>` into a
temporary directory and runs its own `Dockerfile` three times with
`--build-arg APP_NAME=<app>`, naming the images by `HARNESS_IMAGE_PREFIX`
(prefix or template, as above; tag defaults to the ref) and labelling them with
the commit (`org.opencontainers.image.revision`) and the tag (`.version`).

```bash
scripts/build-images.sh v16.2.0                 # tutors/{reader,catalogue,live}:v16.2.0
scripts/build-images.sh release/16.3.0 rc       # tutors/{reader,catalogue,live}:rc
TUTORS_REPO=git@github.com:me/fork.git scripts/build-images.sh my-branch
scripts/build-images.sh --print-images 16.2.0   # just the names, no git, no docker
```

`harness images ensure` calls this when a bare tag cannot be pulled, trying
`v<tag>`, `<tag>` and `release/<tag>` as refs; pass `--ref-a`/`--ref-b` to name
the ref explicitly. The script tags all three apps, so a side is either wholly
pulled or wholly built, never a mixture under one tag.

The fallback is kept because a registry can lack a tag (an old release, a
branch nobody tagged) — but **a local build is not the image that ships**: a
different builder, a different base-image pull, no signature. So it is loud:
the console says `BUILDING FROM SOURCE`, the side is recorded as
`built-from-ref <ref>@<sha>`, the report header shows it, and the verdict's
reasons say the side "was built here … not pulled from the registry". A
release decision should rest on `pulled+verified` on both sides.

The monorepo tags its releases now (`v16.2.0`, `v16.2.2`, and a
`v<version>-rc.N` for each candidate), so `v<tag>` is normally the ref that
resolves. Older releases exist only as a retained `release/<version>` branch,
which is why the fallback still tries that too.

## 6. Local development

In the monorepo, `docker compose build` (or `up --build --no-start`) produces
`tutors/<app>:local`. With the default prefix that is enough for everything here:

```bash
pnpm harness run --mode noise --a local --b local
pnpm harness mutants --base local
```

To compare your working tree against production, mix the two namings — the
published production images, verified, beside your local build:

```bash
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'
pnpm harness images ensure --a 16.2.0 --b "reader=tutors/reader:local,catalogue=tutors/catalogue:local,live=tutors/live:local"
pnpm harness run --mode any-two --a 16.2.0 --b "reader=tutors/reader:local,catalogue=tutors/catalogue:local,live=tutors/live:local"
```

Mutants are built `FROM` the base reader image, whatever `--base` resolves to:
with the Quay template that is the pulled, verified production image, so a
mutant is production plus exactly one planted fault.

## 7. What the harness records about the images

`capture.json` (per side) and `report.json` carry, for every image: the
reference as given, the local image id, the registry **digest**, the
`org.opencontainers.image.revision`, `.version` and `.created` labels (read
from pulled images too), the **provenance** (`local` | `pulled+verified` |
`pulled-unverified` | `built-from-ref`), the identity a verified image was
checked against, why an unverified one failed, and for a built one the git ref
and commit. The HTML and Markdown reports show a provenance line per side and
digest, revision and version per image in the header, above the differences.

Between `images ensure` and the `run` that follows, this lives in
`.harness/image-provenance.json` (`HARNESS_PROVENANCE_FILE` to move it). An
entry counts only while the local image id is unchanged, so a stale record can
never vouch for different content.

Because captures carry their provenance, a capture can be re-compared later
(`harness compare`) or used as the recorded side of post-deploy mode and the
report still says what was actually run.
