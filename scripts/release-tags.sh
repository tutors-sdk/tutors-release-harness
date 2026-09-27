#!/usr/bin/env bash
# Release tags: v<version> on the first commit of main (first-parent history) whose package.json carries that version.
# A version is released when it lands on main, so the tag marks the commit that brought it; a tag that exists is never
# moved or re-made, and a version that never reached main gets none. Run by .github/workflows/tags.yml.
#
#   scripts/release-tags.sh [--dry-run] [<ref>]     (default ref: HEAD)
#
# Prints "v<version> <sha>" for each tag it makes (or would make). Pushing is left to the caller's REMOTE and AUTH:
# with REMOTE set, each new tag is pushed there; AUTH, when set, is the http extraheader for that push.
#
# GitHub refuses a workflow token's push of a tag whose commit carries workflow files that differ from the default
# branch's (it would need the `workflows` permission, which a workflow token cannot hold). Then, with GITHUB_API_REPO
# ("owner/repo") and GH_TOKEN set, the tag is created as a lightweight ref through the REST API instead. A tag that
# still cannot be created is named on stderr and the rest carry on; the exit status is 1 when the newest version on
# `ref` is among them, since that is the release this run exists for, and 0 otherwise.
set -euo pipefail

dry=false
if [ "${1:-}" = "--dry-run" ]; then dry=true; shift; fi
ref="${1:-HEAD}"
semver='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$'

declare -A seen=()
failed=()
newest=""

push_tag() {
  if [ -n "${AUTH:-}" ]; then git -c "http.https://github.com/.extraheader=${AUTH}" push -q "$REMOTE" "refs/tags/$1"; else git push -q "$REMOTE" "refs/tags/$1"; fi
}

api_tag() {
  [ -n "${GITHUB_API_REPO:-}" ] && [ -n "${GH_TOKEN:-}" ] || return 1
  gh api -X POST "repos/${GITHUB_API_REPO}/git/refs" -f "ref=refs/tags/$1" -f "sha=$2" > /dev/null
}
while read -r sha; do
  version="$(git show "${sha}:package.json" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s).version??""))}catch{}})')"
  [[ "$version" =~ $semver ]] || continue
  [ -z "${seen[$version]:-}" ] || continue
  seen[$version]=1
  tag="v${version}"
  newest="$tag"
  if git rev-parse -q --verify "refs/tags/${tag}" > /dev/null; then continue; fi
  echo "${tag} ${sha}"
  if [ "$dry" = true ]; then continue; fi
  git tag -a "$tag" "$sha" -m "Harness ${version}"
  if [ -n "${REMOTE:-}" ] && ! push_tag "$tag" && ! api_tag "$tag" "$sha"; then
    git tag -d "$tag" > /dev/null
    echo "not tagged: ${tag} ${sha}" >&2
    failed+=("$tag")
  fi
done < <(git rev-list --first-parent --reverse "$ref")

for tag in "${failed[@]}"; do
  if [ "$tag" = "$newest" ]; then echo "the newest version, ${newest}, could not be tagged" >&2; exit 1; fi
done
exit 0
