#!/usr/bin/env bash
# Build the three app images from a monorepo git ref and tag them for the harness.
#
#   scripts/build-images.sh <git-ref> [tag] [repo-url]
#   scripts/build-images.sh v16.2.0            # -> tutors/reader:v16.2.0, tutors/catalogue:v16.2.0, tutors/live:v16.2.0
#   scripts/build-images.sh release/16.3.0 rc  # -> tutors/<app>:rc
#   scripts/build-images.sh --print-images <tag>   # only print the three image names, then exit
#
# HARNESS_IMAGE_PREFIX names the images exactly as src/image-ref.ts does: a bare
# prefix (tutors -> tutors/reader:TAG) or a template containing {app}
# (quay.io/tutors-sdk/tutors-{app} -> quay.io/tutors-sdk/tutors-reader:TAG).
# tests/image-ref.test.ts holds image_repo() below to imageRepo()'s answers.
#
# This is the fallback for when the registry does not hold the tag you need.
# The harness itself only ever sees images; building them here keeps the
# comparison honest — the harness compares an image, not a checkout. But an
# image built here is NOT the image that ships: it is unsigned, and every
# report that used it says "built-from-ref" in its header.
set -euo pipefail

prefix="${HARNESS_IMAGE_PREFIX:-tutors}"
placeholder='{app}'

# The shell mirror of imageRepo() in src/image-ref.ts.
image_repo() {
  case "$prefix" in
    *"$placeholder"*) printf '%s' "${prefix//"$placeholder"/$1}" ;;
    *) printf '%s/%s' "${prefix%/}" "$1" ;;
  esac
}

if [ "${1:-}" = "--print-images" ]; then
  tag="${2:?tag required}"
  for app in reader catalogue live; do echo "$app=$(image_repo "$app"):$tag"; done
  exit 0
fi

ref="${1:?git ref (tag, branch or sha) required}"
tag="${2:-$ref}"
repo="${3:-${TUTORS_REPO:-https://github.com/tutors-sdk/tutors-mono-repo.git}}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "cloning $repo @ $ref"
git clone --quiet --depth 1 --branch "$ref" "$repo" "$work/src" 2>/dev/null || {
  # A bare sha cannot be cloned by --branch; fetch it explicitly.
  git init --quiet "$work/src"
  git -C "$work/src" remote add origin "$repo"
  git -C "$work/src" fetch --quiet --depth 1 origin "$ref"
  git -C "$work/src" checkout --quiet FETCH_HEAD
}
sha="$(git -C "$work/src" rev-parse HEAD)"

for app in reader catalogue live; do
  image="$(image_repo "$app"):$tag"
  echo "building $image ($sha)"
  # The labels are what the report reads back: which commit this image is.
  docker build --quiet \
    --build-arg "APP_NAME=$app" \
    --build-arg "GIT_SHA=$sha" \
    --build-arg "BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --label "org.opencontainers.image.revision=$sha" \
    --label "org.opencontainers.image.version=$tag" \
    -t "$image" "$work/src" >/dev/null
done
echo "built $(image_repo reader), $(image_repo catalogue), $(image_repo live) at :$tag from $ref ($sha) — a LOCAL BUILD, not the published image"
