#!/usr/bin/env bash
# Build the three app images from a monorepo git ref and tag them for the harness.
#
#   scripts/build-images.sh <git-ref> [tag] [repo-url]
#   scripts/build-images.sh v16.2.0            # -> tutors/reader:v16.2.0, tutors/catalogue:v16.2.0, tutors/live:v16.2.0
#   scripts/build-images.sh release/16.3.0 rc  # -> tutors/<app>:rc
#
# This is the fallback for when the registry does not hold the tag you need
# (or there is no registry yet). The harness itself only ever sees images;
# building them here keeps the comparison honest — the harness compares what
# would ship, not a checkout.
set -euo pipefail

ref="${1:?git ref (tag, branch or sha) required}"
tag="${2:-$ref}"
repo="${3:-${TUTORS_REPO:-https://github.com/tutors-sdk/tutors-mono-repo.git}}"
prefix="${HARNESS_IMAGE_PREFIX:-tutors}"

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
  image="$prefix/$app:$tag"
  echo "building $image ($sha)"
  docker build --quiet \
    --build-arg "APP_NAME=$app" \
    --build-arg "GIT_SHA=$sha" \
    --build-arg "BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    -t "$image" "$work/src" >/dev/null
done
echo "built $prefix/{reader,catalogue,live}:$tag from $ref ($sha)"
