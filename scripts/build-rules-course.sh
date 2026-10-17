#!/usr/bin/env bash
# Rebuild the Rule journeys' course (fixtures/course-server/rules-course) with a monorepo checkout's own scaffolder
# and generator, in a Deno container, as the monorepo builds its fixture course.
#
#   scripts/build-rules-course.sh <monorepo checkout>
#
# The output is committed: run this only when the course must change, then change traffic/journeys/features and
# fixtures/course-server/README.md with it, and record the monorepo commit there.
# A running compose stack serves the rebuilt course: it mounts fixtures/course-server, not the course's folder.
set -euo pipefail
mono="$(cd "${1:?usage: scripts/build-rules-course.sh <monorepo checkout>}" && pwd)"
root="$(cd "$(dirname "$0")/.." && pwd)"
ca=()
# Behind a TLS-intercepting proxy, hand Deno the proxy's CA.
if [ -n "${DENO_CERT:-}" ]; then ca=(-e DENO_CERT=/ca.crt -v "$DENO_CERT:/ca.crt:ro"); fi
docker run --rm --network host --user "$(id -u):$(id -g)" -e DENO_DIR=/tmp/deno \
  -e HTTPS_PROXY -e HTTP_PROXY -e NO_PROXY "${ca[@]}" \
  -v "$mono:/mono:ro" -v "$root:/harness" -w /mono denoland/deno:2.5.6 \
  run -A --no-lock --node-modules-dir=none --config /mono/deno.json \
  /harness/fixtures/course-server/rules-course-build/build.ts /mono /harness/fixtures/course-server/rules-course
echo "built from $(git -C "$mono" rev-parse HEAD)"
