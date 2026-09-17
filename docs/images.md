# Where the A and B images come from

The harness compares **images**, never checkouts. Side **a** is what runs in
production; side **b** is the candidate. Both are three images — `reader`,
`catalogue`, `live` — under one tag, and the harness does not care who built
them as long as they exist locally by the time `docker compose up` runs.

There are four ways an image gets there. `harness images ensure` tries them
in order and the workflows call it before every run, so in the common case
nobody thinks about this at all.

| Source | When | Command |
| --- | --- | --- |
| Already local | you built or pulled it earlier | nothing |
| Registry pull | the monorepo publishes images (see below) | `docker pull $HARNESS_IMAGE_PREFIX/reader:16.2.0` |
| Build from a git ref | no registry, or the tag is not there yet | `scripts/build-images.sh v16.2.0` |
| Mutant | the harness's own negative fixtures | `harness mutants` builds them |

```bash
pnpm harness images ensure --a 16.2.0 --b 16.3.0-rc.1
#   16.2.0: pulling tutors/reader:16.2.0 … not found → building from v16.2.0, then 16.2.0, then release/16.2.0
#   16.3.0-rc.1: …
```

## 1. Naming

A **bare tag** on `--a`/`--b` expands to `<prefix>/<app>:<tag>` for the three
apps. The prefix is `HARNESS_IMAGE_PREFIX` (default `tutors`, which matches
what `docker compose up --build` in the monorepo produces as `tutors/<app>:local`).
With a registry, set it once — as a repository variable in CI and in your
shell locally:

```bash
export HARNESS_IMAGE_PREFIX=ghcr.io/tutors-sdk/tutors     # -> ghcr.io/tutors-sdk/tutors/reader:16.2.0
```

Other forms `--a` accepts, for the less common cases:

| Form | Meaning |
| --- | --- |
| `tutors/reader:16.2.0` | that image for the reader; catalogue and live take the prefix with the same tag |
| `reader=IMG,catalogue=IMG,live=IMG` | every image spelled out (mutant runs use this) |
| `main`, `release/16.3.0`, a sha (migration mode only) | a git ref of the monorepo to fetch migrations from |
| `dir:path` (migration mode only) | a local directory of `.sql` files |

## 2. The production tag

**The tag that is deployed is the tag to pass as `--a`.** Do not compare
against `main` when you mean production. The monorepo's kustomize overlays
carry the deployed version (`deploy/k8s/overlays/<app>/kustomization.yaml`,
`images[].newTag`) — that value is the production tag, and the release
workflow records it in the report.

Set it as the repository variable `HARNESS_PRODUCTION_TAG` in this repo;
the nightly noise run and the weekly mutants use it. Update it when a release
is deployed (the monorepo's deploy workflow can do this with
`gh variable set HARNESS_PRODUCTION_TAG --repo tutors-sdk/tutors-release-harness`).

## 3. Publishing images from the monorepo (recommended)

The monorepo builds its images in CI already but does not push them. The
workflow in [`monorepo/publish-images.yml`](monorepo/publish-images.yml) is
ready to drop into `tutors-sdk/tutors-mono-repo/.github/workflows/`. It:

- builds `reader`, `catalogue`, `live` (and `time`) from the root `Dockerfile`
  on every push to `main` and every `v*` tag;
- pushes to `ghcr.io/tutors-sdk/tutors/<app>` tagged with the short sha on
  `main` and with the version (`16.2.0`) and `latest` on a tag;
- signs each image with cosign (keyless) and attaches an SBOM, which the
  runway's release tier verifies at deploy.

With that in place the harness never builds anything: `--a 16.2.0 --b 16.3.0-rc.1`
pulls both. Release candidates get a tag too (`v16.3.0-rc.1` on the release
branch) so the candidate is a real, immutable image and not a checkout —
[`monorepo/release-dispatch.yml`](monorepo/release-dispatch.yml) tags the
candidate when a `release/**` branch is pushed and dispatches the harness.

## 4. Building from a git ref (fallback)

`scripts/build-images.sh <ref> [tag]` clones the monorepo at `<ref>` into a
temporary directory and runs its own `Dockerfile` three times with
`--build-arg APP_NAME=<app>`, tagging `<prefix>/<app>:<tag>` (tag defaults to
the ref). It labels the images with the git sha it built from
(`org.opencontainers.image.revision`), so a report can always be traced back.

```bash
scripts/build-images.sh v16.2.0                 # tutors/{reader,catalogue,live}:v16.2.0
scripts/build-images.sh release/16.3.0 rc       # tutors/{reader,catalogue,live}:rc
TUTORS_REPO=git@github.com:me/fork.git scripts/build-images.sh my-branch
```

`harness images ensure` calls this when a pull fails, trying `v<tag>`,
`<tag>` and `release/<tag>` as refs; pass `--ref-a`/`--ref-b` to name the ref
explicitly. Building takes a few minutes per app the first time and seconds
afterwards thanks to BuildKit's cache.

The monorepo today has no `v16.x` git tags (its milestones are tagged, its
releases are branches merged to `main`), which is why the fallback tries the
`release/<version>` branch too. Tagging releases — the publish workflow does
it — makes every production version reproducible by tag.

## 5. Local development

In the monorepo, `docker compose up --build --no-start` produces
`tutors/<app>:local`. That is enough for everything here:

```bash
pnpm harness run --mode noise --a local --b local
pnpm harness mutants --base local
```

To compare your working tree against production: build the tree as `local`,
ensure production's tag, then `--a 16.2.0 --b local`.

## 6. What the harness records about the images

Every report lists the exact image references for both sides. `capture.json`
carries them too, so a capture can be re-compared later (`harness compare`)
against a different candidate with the same recorded a. When a registry is in
use, prefer digests in the production overlay and pass `@sha256:…` references
to the harness for a comparison that cannot drift under you.
