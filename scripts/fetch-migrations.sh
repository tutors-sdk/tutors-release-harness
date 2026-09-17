#!/usr/bin/env bash
# Fetch supabase/migrations from a monorepo ref into a directory, and nothing else.
#
#   scripts/fetch-migrations.sh <git-ref|dir:path> <out-dir> [repo-url]
set -euo pipefail

ref="${1:?git ref or dir:<path> required}"
out="${2:?output directory required}"
repo="${3:-${TUTORS_REPO:-https://github.com/tutors-sdk/tutors-mono-repo.git}}"

mkdir -p "$out"
if [[ "$ref" == dir:* ]]; then
  src="${ref#dir:}"
  cp "$src"/*.sql "$out"/ 2>/dev/null || true
  echo "copied $(ls "$out" | wc -l | tr -d ' ') migration(s) from $src"
  exit 0
fi

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
git init --quiet "$work"
git -C "$work" remote add origin "$repo"
git -C "$work" config core.sparseCheckout true
echo "supabase/migrations/" > "$work/.git/info/sparse-checkout"
git -C "$work" fetch --quiet --depth 1 origin "$ref"
git -C "$work" checkout --quiet FETCH_HEAD
cp "$work"/supabase/migrations/*.sql "$out"/ 2>/dev/null || true
echo "fetched $(ls "$out" | wc -l | tr -d ' ') migration(s) from $ref ($(git -C "$work" rev-parse --short HEAD))"
