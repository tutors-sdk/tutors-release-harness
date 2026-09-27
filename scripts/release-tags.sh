#!/usr/bin/env bash
# Release tags: v<version> on the first commit of main (first-parent history) whose package.json carries that version.
# A version is released when it lands on main, so the tag marks the commit that brought it; a tag that exists is never
# moved or re-made, and a version that never reached main gets none. Run by .github/workflows/tags.yml.
#
#   scripts/release-tags.sh [--dry-run] [<ref>]     (default ref: HEAD)
#
# Prints "v<version> <sha>" for each tag it makes (or would make). Pushing is left to the caller's REMOTE and AUTH:
# with REMOTE set, each new tag is pushed there; AUTH, when set, is the http extraheader for that push.
set -euo pipefail

dry=false
if [ "${1:-}" = "--dry-run" ]; then dry=true; shift; fi
ref="${1:-HEAD}"
semver='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$'

declare -A seen=()
while read -r sha; do
  version="$(git show "${sha}:package.json" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s).version??""))}catch{}})')"
  [[ "$version" =~ $semver ]] || continue
  [ -z "${seen[$version]:-}" ] || continue
  seen[$version]=1
  tag="v${version}"
  if git rev-parse -q --verify "refs/tags/${tag}" > /dev/null; then continue; fi
  echo "${tag} ${sha}"
  if [ "$dry" = true ]; then continue; fi
  git tag -a "$tag" "$sha" -m "Harness ${version}"
  if [ -n "${REMOTE:-}" ]; then
    if [ -n "${AUTH:-}" ]; then git -c "http.https://github.com/.extraheader=${AUTH}" push -q "$REMOTE" "refs/tags/${tag}"; else git push -q "$REMOTE" "refs/tags/${tag}"; fi
  fi
done < <(git rev-list --first-parent --reverse "$ref")
