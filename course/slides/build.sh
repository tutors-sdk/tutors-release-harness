#!/usr/bin/env bash
# Builds the course's slide PDFs and cover image from the Marp sources in this folder.
# Run from anywhere: course/slides/build.sh. Needs Node and a Chromium (CHROME_PATH if not found).
set -euo pipefail
cd "$(dirname "$0")"
marp=(${MARP:-npx --yes @marp-team/marp-cli@4.5.1} --theme-set harness.css)
for deck in 1-theory:topic-01-theory/talk-1-theory 2-containers:topic-02-containers/talk-2-containers \
            3-a-b:topic-03-a-b/talk-3-a-b 4-approach:topic-04-approach/talk-4-approach 5-a3:topic-05-a3/talk-5-a3; do
  src="${deck%%:*}"; dest="../${deck#*:}"
  "${marp[@]}" --pdf "$src.md" -o "$dest/$src.pdf"
done
"${marp[@]}" --image png cover.md -o ../course.png
