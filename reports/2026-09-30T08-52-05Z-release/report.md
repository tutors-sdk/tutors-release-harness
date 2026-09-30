## Release gate: sha-865d02f beside 16.2.2

**Gate: FAIL**

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

<!-- glance:start -->
### The reviewer's glance (gemba: go to the artefact and look)

5 places to look, ranked by novelty × exposure. Mark each one: `harness glance mark --run reports/2026-09-30T08-52-05Z-release --item <n> --mark verified|disputed|escalated --by <name> [--note text]` (verified: looked, and agrees with the claim; disputed: becomes a new claim or a hold; escalated: becomes a 5 Whys).

1. **Hotspot, first contribution**: PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte: "feat(ui): rebuild Tutors with the Paper design system"
   [PR](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) · [diff](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-3805a328d2572205ef2f52b7b2b8eb8164c3c1dc10b3c867d195122994548757)
   _novelty 1.00 (no history yet) × exposure 1.00 (unmapped (packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte is outside apps/, and a package's reach into the journeys is not mapped): counted as all 6 journeys, so what cannot be placed is not ranked below what can) = 1.00_ · mark: not marked yet
2. **Fixed on b**: catalogue:home: 2 console errors fixed on b, undecided; but 2 new console errors on the same page: fixed, or only changed?
   [hunk](report.html#hunk-console:catalogue:home:141)
   every hunk: [1](report.html#hunk-console:catalogue:home:141) [2](report.html#hunk-console:catalogue:home:142)
   error: {"app":"tutors-catalogue","environment":"production","error":"Cannot read properti… \| error: {"app":"tutors-catalogue","environment":"production","error":"Cannot read properti…
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: catalogue-loads) = 0.17_ · mark: not marked yet
3. **Fixed on b**: reader-auth:course: 2 console errors fixed on b, undecided; a fix is a decision: claim it to say why, and this item switches off
   [hunk](report.html#hunk-console:reader-auth:course:143)
   every hunk: [1](report.html#hunk-console:reader-auth:course:143) [2](report.html#hunk-console:reader-auth:course:144)
   error: {"app":"tutors-reader","environment":"production","reason":"Cannot read properties… \| error: Cannot read properties of undefined (reading 'increment')
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: student-signs-in) = 0.17_ · mark: not marked yet
4. **Fixed on b**: reader-auth:topic: 3 console errors fixed on b, undecided; a fix is a decision: claim it to say why, and this item switches off
   [hunk](report.html#hunk-console:reader-auth:topic:146)
   every hunk: [1](report.html#hunk-console:reader-auth:topic:146) [2](report.html#hunk-console:reader-auth:topic:147) [3](report.html#hunk-console:reader-auth:topic:148)
   error: {"app":"tutors-reader","environment":"production","reason":"Cannot read properties… \| error: {"app":"tutors-reader","environment":"production","reason":"Cannot read properties… \| error: Cannot read properties of undefined (reading 'increment')
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: student-signs-in) = 0.17_ · mark: not marked yet
5. **Duration moved**: catalogue-loads: median duration 1475 ms → 1856 ms (+26%), not significant ((p=0.144))
   [hunk](report.html#hunk-timing:catalogue-loads:180)
   duration a: 1331, 1372, 1475, 1518, 2139 ms · b: 1506, 1660, 1856, 1860, 2210 ms
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: catalogue-loads) = 0.17_ · mark: not marked yet

**Gate FAIL: the glance does not decide go; it is kept for the 5 Whys.**

Not checked (no input, so nothing is claimed about them): mask added: no earlier release on the scoreboard to compare the masks with (no scoreboard yet at /home/runner/work/tutors-release-harness/tutors-release-harness/harness/.harness/scoreboard/releases.jsonl).

_The ranking is in confidence.json (glance, glanceBasis) so it can be reviewed too; marks go to glance-marks.jsonl and never change the Gate or an exit code._
<!-- glance:end -->

5 of 8 dimensions measured (weight 70 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** |  | −20 unclaimed: dom /: reader:home: semantic DOM differs (+51 −25 lines at line 4); −20 unclaimed: dom /: reader:home: semantic DOM differs (+6 −7 lines at line 36); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+32 −33 lines at line 4); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+6 −7 lines at line 47); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+45 −43 lines at line 4) (and 199 more like it, not counted again: report.html#differences); −5 claim sbom */{@isaacs/cliui,@isaacs/fs-minipass,@isaacs/string-locale-compare,@npmcli/agent,@npmcli/arborist,@npmcli/config,@npmcli/fs,@npmcli/git,@npmcli/installed-package-contents,@npmcli/map-workspaces,@npmcli/metavuln-calculator,@npmcli/name-from-folder,@npmcli/node-gyp,@npmcli/package-json,@npmcli/promise-spawn,@npmcli/query,@npmcli/redact,@npmcli/run-script,@pkgjs/parseargs,@sigstore/bundle,@sigstore/core,@sigstore/protobuf-specs,@sigstore/sign,@sigstore/tuf,@sigstore/verify,@tufjs/canonical-json,@tufjs/models,abbrev,agent-base,ansi-regex,ansi-styles,aproba,archy,balanced-match,bin-links,binary-extensions,brace-expansion,cacache,chalk,chownr,ci-info,cidr-regex,cli-columns,cmd-shim,color-convert,color-name,common-ancestor-path,corepack,cross-spawn,cssesc,debug,diff,eastasianwidth,emoji-regex,encoding,env-paths,err-code,exponential-backoff,fastest-levenshtein,fdir,foreground-child,fs-minipass,glob,graceful-fs,hosted-git-info,http-cache-semantics,http-proxy-agent,https-proxy-agent,iconv-lite,ignore-walk,imurmurhash,ini,init-package-json,ip-address,ip-regex,is-cidr,is-fullwidth-code-point,isexe,jackspeak,json-parse-even-better-errors,json-stringify-nice,jsonparse,just-diff,just-diff-apply,libnpmaccess,libnpmdiff,libnpmexec,libnpmfund,libnpmhook,libnpmorg,libnpmpack,libnpmpublish,libnpmsearch,libnpmteam,libnpmversion,lru-cache,make-fetch-happen,minimatch,minipass,minipass-collect,minipass-fetch,minipass-flush,minipass-pipeline,minipass-sized,minizlib,ms,mute-stream,negotiator,node-gyp,nopt,normalize-package-data,npm,npm-audit-report,npm-bundled,npm-install-checks,npm-normalize-package-bin,npm-package-arg,npm-packlist,npm-pick-manifest,npm-profile,npm-registry-fetch,npm-user-validate,p-map,package-json-from-dist,pacote,parse-conflict-json,path-key,path-scurry,picomatch,postcss-selector-parser,proc-log,proggy,promise-all-reject-late,promise-call-limit,promise-retry,promzard,qrcode-terminal,read,read-cmd-shim,read-package-json-fast,retry,safer-buffer,semver,shebang-command,shebang-regex,signal-exit,sigstore,smart-buffer,socks,socks-proxy-agent,spdx-correct,spdx-exceptions,spdx-expression-parse,spdx-license-ids,ssri,string-width,strip-ansi,supports-color,text-table,tiny-relative-date,tinyglobby,treeverse,tuf-js,unique-filename,unique-slug,util-deprecate,validate-npm-package-license,validate-npm-package-name,walk-up-path,which,wrap-ansi,write-file-atomic,yallist,yarn} covers 696 hunks at once (not narrow) |
| Noise health | 15 | **85** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **90** |  | −10 catalogue-loads: p=0.144, not above 0.20 |
| Rehearsals | 10 | **50** |  | −50 the upgrade rehearsal FAILED: 778 finding(s) during the rollout |
| Test signal | 15 | not measured |  | needs the monorepo's CI and Stryker mutation scores and the weekly harness mutants: pass --test-signal <json> |
| Requirements traceability | 10 | not measured |  | needs the changelog, the EARS files and the claims side by side: pass --traceability <json> |
| Change risk | 15 | **0** | **breached** | floor PR #276 was merged with no approving review; −10 PR #276 changed 4 production lines in apps/catalogue with 0 test lines (0.00); 4 production lines in apps/live with 0 test lines (0.00); 4 production lines in apps/reader with 0 test lines (0.00); 4 production lines in apps/time with 0 test lines (0.00): below 0.2; floor PR #279 was merged with no approving review; floor PR #278 was merged with no approving review; floor PR #282 was merged with no approving review; floor PR #283 was merged with no approving review; floor PR #281 was merged with no approving review; floor PR #280 was merged with no approving review; floor PR #143 was merged with no approving review; floor commit 96e9e4d "Create images.yml" reached main without a pull request, so nobody reviewed it; floor PR #284 was merged with no approving review; floor PR #286 was merged with no approving review; floor PR #274 was merged with no approving review; floor PR #275 was merged with no approving review; floor PR #273 was merged with no approving review; floor PR #270 was merged with no approving review; floor PR #272 was merged with no approving review; floor PR #269 was merged with no approving review; −10 PR #269 changed 8 production lines in apps/reader with 0 test lines (0.00); 12 production lines in packages/jsr/model with 0 test lines (0.00): below 0.2; floor PR #271 was merged with no approving review; floor PR #277 was merged with no approving review; floor PR #293 was merged with no approving review; floor PR #302 was merged with no approving review; floor PR #295 was merged with no approving review; floor PR #303 was merged with no approving review; floor PR #297 was merged with no approving review; floor PR #299 was merged with no approving review; floor PR #287 was merged with no approving review; floor PR #301 was merged with no approving review; floor PR #306 was merged with no approving review; floor PR #305 was merged with no approving review; floor PR #298 was merged with no approving review; floor PR #296 was merged with no approving review; floor PR #300 was merged with no approving review; floor PR #307 was merged with no approving review; floor PR #308 was merged with no approving review; floor PR #309 was merged with no approving review; floor PR #310 was merged with no approving review; floor PR #135 was merged with no approving review; floor PR #312 was merged with no approving review; floor PR #313 was merged with no approving review; −10 PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases); −5 reader churn 2690 lines, above 2× its median of 98 over the last 6 releases; PR #313 is the largest part (2422 lines); floor PR #316 was merged with no approving review; −10 PR #316 changed 167 production lines in packages/svelte/ui-components with 25 test lines (0.15): below 0.2; floor PR #317 was merged with no approving review; floor PR #318 was merged with no approving review; floor commit 8582ef2 "Rationalised the connect, course home and course tools menus" reached main without a pull request, so nobody reviewed it; floor PR #330 was merged with no approving review; −10 PR #330, a first contribution, changed 100 production lines in packages/svelte/ui-navigators with 11 test lines (0.11): below 0.2; floor PR #333 was merged with no approving review; floor PR #335 was merged with no approving review; floor PR #334 was merged with no approving review; floor PR #337 was merged with no approving review; floor PR #336 was merged with no approving review; floor PR #340 was merged with no approving review; floor PR #349 was merged with no approving review; floor PR #350 was merged with no approving review; floor PR #351 was merged with no approving review; floor PR #353 was merged with no approving review; floor PR #352 was merged with no approving review; floor PR #354 was merged with no approving review; floor PR #355 was merged with no approving review; floor PR #363 was merged with no approving review; floor PR #331 was merged with no approving review; −10 PR #331, a first contribution, changed 1678 production lines in apps/time with 319 test lines (0.19): below 0.2; −5 catalogue churn 163 lines, above 2× its median of 3 over the last 6 releases; PR #331 is the largest part (72 lines); −5 live churn 242 lines, above 2× its median of 2.5 over the last 6 releases; PR #331 is the largest part (164 lines); −5 time churn 2034 lines, above 2× its median of 9.5 over the last 6 releases; PR #331 is the largest part (1757 lines); floor PR #364 was merged with no approving review; floor PR #366 was merged with no approving review; floor PR #367 was merged with no approving review; floor PR #365 was merged with no approving review; floor PR #368 was merged with no approving review; −5 packages/svelte/ui-navigators/src/CourseNavigation.svelte had 3 authors this release (PR #313, commit 8582ef2, PR #330, PR #331, PR #365, PR #338, PR #373): no one holds the whole picture; −5 packages/svelte/utils/i18n/src/messages/de.ts had 3 authors this release (PR #313, commit 8582ef2, PR #330, PR #331, PR #338, PR #373): no one holds the whole picture (and 5 more files like it, not counted again); floor PR #339 was merged with no approving review; −10 PR #373 changed 405 production lines in packages/svelte/ui-navigators with 20 test lines (0.05): below 0.2; −5 packages/svelte/ui-navigators/src/MainNavigator.svelte had 3 authors this release (PR #313, PR #318, PR #330, PR #331, PR #365, PR #338, PR #373): no one holds the whole picture; floor PR #376 was merged with no approving review |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 105), v16.2.2..865d02f82cd64caaa3056209e17eec3bea66f070: 68 of 69 changes (67 PRs, 2 direct commits) carry a finding; floor breached (caps the RCS at 74).**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#331](https://github.com/tutors-sdk/tutors-mono-repo/pull/331) | Bring time, catalogue and live onto the Paper design system and the reader's UX patterns | 3693 | 93 | 0 | 0.10 | **no** | yes (a fact) | **−25** | floor [PR #331 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/331); −10 [PR #331, a first contribution, changed 1678 production lines in apps/time with 319 test lines (0.19): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb); −5 [catalogue churn 163 lines, above 2× its median of 3 over the last 6 releases; PR #331 is the largest part (72 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-5ac631d07ba17484175dc6ba0ad0d55f257e801d4b1f2a88eb7941f90275f4a6); −5 [live churn 242 lines, above 2× its median of 2.5 over the last 6 releases; PR #331 is the largest part (164 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-d4f3beaa5f469d6d50fb9ca5300f2bb3ca5041d9716f0df65022760488fc9199); −5 [time churn 2034 lines, above 2× its median of 9.5 over the last 6 releases; PR #331 is the largest part (1757 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb) |
| [#313](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) | feat(ui): rebuild Tutors with the Paper design system | 11781 | 253 | 1 | 0.65 | **no** | yes (a fact) | **−15** | floor [PR #313 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/313); −10 [PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-3805a328d2572205ef2f52b7b2b8eb8164c3c1dc10b3c867d195122994548757); −5 [reader churn 2690 lines, above 2× its median of 98 over the last 6 releases; PR #313 is the largest part (2422 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-6e0d83696317a7dd434a0f962ec82a7debb04a718f3885992316f95ec9b82733) |
| [#373](https://github.com/tutors-sdk/tutors-mono-repo/pull/373) | feat(reader): move Educator Control into the Learn section | 512 | 15 | 0 | 0.20 | yes |  | **−15** | −10 [PR #373 changed 405 production lines in packages/svelte/ui-navigators with 20 test lines (0.05): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/373/files#diff-e5cd767e23ce00ac6cdda49b14e8f9243d64c624138053b6c18d1c869d9e1047); −5 [packages/svelte/ui-navigators/src/MainNavigator.svelte had 3 authors this release (PR #313, PR #318, PR #330, PR #331, PR #365, PR #338, PR #373): no one holds the whole picture](https://github.com/tutors-sdk/tutors-mono-repo/pull/373/files#diff-d9959693589250e82da1747e0d059c0b1d7215ba4f64d1c3f3e9d73e3321ed90) |
| [#276](https://github.com/tutors-sdk/tutors-mono-repo/pull/276) | fix(infra): consolidate .env to the repository root | 49 | 12 | 0 | 0.00 | **no** |  | **−10** | floor [PR #276 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/276); −10 [PR #276 changed 4 production lines in apps/catalogue with 0 test lines (0.00); 4 production lines in apps/live with 0 test lines (0.00); 4 production lines in apps/reader with 0 test lines (0.00); 4 production lines in apps/time with 0 test lines (0.00): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/276/files#diff-f59256a303b4024e8a8528f50c846374d823ee3e46c478100acfb0cb61cc4baf) |
| [#269](https://github.com/tutors-sdk/tutors-mono-repo/pull/269) | ci: make the three type-check steps blocking | 42 | 11 | 0 | 0.00 | **no** |  | **−10** | floor [PR #269 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/269); −10 [PR #269 changed 8 production lines in apps/reader with 0 test lines (0.00); 12 production lines in packages/jsr/model with 0 test lines (0.00): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/269/files#diff-eb38d340e5f8cf75f24da0f7604a5cfc8c2ad77ed33e1672c354a63f9322fe2c) |
| [#316](https://github.com/tutors-sdk/tutors-mono-repo/pull/316) | fix(whiteboard): load the scene, follow dark mode, match the Paper UI (supersedes #304) | 318 | 7 | 0 | 0.15 | **no** |  | **−10** | floor [PR #316 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/316); −10 [PR #316 changed 167 production lines in packages/svelte/ui-components with 25 test lines (0.15): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/316/files#diff-df9fd1dd4556d3b501ea96a8bfc85aeae703e79866841d36fa27aab651c128d6) |
| [#330](https://github.com/tutors-sdk/tutors-mono-repo/pull/330) | tutors-sdk/codex/course-shell-mobile-header | 197 | 20 | 0 | 0.37 | **no** | yes (a fact) | **−10** | floor [PR #330 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/330); −10 [PR #330, a first contribution, changed 100 production lines in packages/svelte/ui-navigators with 11 test lines (0.11): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/330/files#diff-d9959693589250e82da1747e0d059c0b1d7215ba4f64d1c3f3e9d73e3321ed90) |
| [#338](https://github.com/tutors-sdk/tutors-mono-repo/pull/338) | Accessibility: distinct landmark and control names in the course shell | 144 | 15 | 0 | 2.89 | yes | yes (a fact) | **−10** | −5 [packages/svelte/ui-navigators/src/CourseNavigation.svelte had 3 authors this release (PR #313, commit 8582ef2, PR #330, PR #331, PR #365, PR #338, PR #373): no one holds the whole picture](https://github.com/tutors-sdk/tutors-mono-repo/pull/338/files#diff-c493f422dcf98712ea4f53146dd2a5a5751b1f1bc638ab23897c1904604ef3ff); −5 [packages/svelte/utils/i18n/src/messages/de.ts had 3 authors this release (PR #313, commit 8582ef2, PR #330, PR #331, PR #338, PR #373): no one holds the whole picture (and 5 more files like it, not counted again)](https://github.com/tutors-sdk/tutors-mono-repo/pull/338/files#diff-374eefc43222195af395a78d2e4c923fad10c4b9b1b1eeeebffa4a950fda5583) |
| [#279](https://github.com/tutors-sdk/tutors-mono-repo/pull/279) | feat(deploy): make the container spec files Quay-compatible | 144 | 9 | 0 | no production lines | **no** |  | **floor** | floor [PR #279 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/279) |
| [#278](https://github.com/tutors-sdk/tutors-mono-repo/pull/278) | test(reader): smoke the container with authentication enabled | 11 | 3 | 0 | no production lines | **no** |  | **floor** | floor [PR #278 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/278) |
| [#282](https://github.com/tutors-sdk/tutors-mono-repo/pull/282) | feat: deterministic responses for the release harness (HARNESS_NOW, /version, stable headers) | 541 | 43 | 0 | 0.77 | **no** |  | **floor** | floor [PR #282 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/282) |
| [#283](https://github.com/tutors-sdk/tutors-mono-repo/pull/283) | feat(observability): stable log and metrics shape for release-harness A/A runs (M18, M19) | 1236 | 24 | 0 | 0.95 | **no** |  | **floor** | floor [PR #283 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/283) |
| [#281](https://github.com/tutors-sdk/tutors-mono-repo/pull/281) | feat(k8s): Route and Ingress components with per-substrate variants | 506 | 17 | 0 | no production lines | **no** |  | **floor** | floor [PR #281 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/281) |
| [#280](https://github.com/tutors-sdk/tutors-mono-repo/pull/280) | ci(release): tag release candidates and dispatch the release harness | 560 | 10 | 0 | no production lines | **no** |  | **floor** | floor [PR #280 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/280) |
| [#143](https://github.com/tutors-sdk/tutors-mono-repo/pull/143) | feat(ci): container image build pipeline with Quay.io registry | 570 | 5 | 0 | no production lines | **no** |  | **floor** | floor [PR #143 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/143) |
| [96e9e4d](https://github.com/tutors-sdk/tutors-mono-repo/commit/96e9e4d48acdf7a8a7021b97827c3378b80c21aa) | Create images.yml | 64 | 1 | 0 | no production lines | no PR |  | **floor** | floor [commit 96e9e4d "Create images.yml" reached main without a pull request, so nobody reviewed it](https://github.com/tutors-sdk/tutors-mono-repo/commit/96e9e4d48acdf7a8a7021b97827c3378b80c21aa) |
| [#284](https://github.com/tutors-sdk/tutors-mono-repo/pull/284) | docs: add graphify knowledge-graph report of the monorepo | 1283 | 4 | 0 | no production lines | **no** |  | **floor** | floor [PR #284 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/284) |
| [#286](https://github.com/tutors-sdk/tutors-mono-repo/pull/286) | fix(community): count a first visit when the increments rpc returns no rows | 68 | 2 | 0 | 21.67 | **no** |  | **floor** | floor [PR #286 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/286) |
| [#274](https://github.com/tutors-sdk/tutors-mono-repo/pull/274) | fix(reader): a course that does not exist showed "500 Server Error" | 112 | 4 | 0 | 1.38 | **no** |  | **floor** | floor [PR #274 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/274) |
| [#275](https://github.com/tutors-sdk/tutors-mono-repo/pull/275) | ci: run the create scaffolder's Deno tests, and count deno test steps as runners | 92 | 9 | 0 | no production lines | **no** |  | **floor** | floor [PR #275 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/275) |
| [#273](https://github.com/tutors-sdk/tutors-mono-repo/pull/273) | fix(logger): a Supabase error's message never reached the log | 22 | 2 | 0 | 0.69 | **no** |  | **floor** | floor [PR #273 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/273) |
| [#270](https://github.com/tutors-sdk/tutors-mono-repo/pull/270) | fix(search): a hit in one-line content came back with no text | 21 | 3 | 0 | 9.50 | **no** |  | **floor** | floor [PR #270 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/270) |
| [#272](https://github.com/tutors-sdk/tutors-mono-repo/pull/272) | fix(model): a learning object with order: 0 sorted last instead of first | 28 | 2 | 0 | 1.80 | **no** |  | **floor** | floor [PR #272 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/272) |
| [#271](https://github.com/tutors-sdk/tutors-mono-repo/pull/271) | fix(search): wrong line, fence and language from the second match on | 83 | 3 | 0 | 3.15 | **no** |  | **floor** | floor [PR #271 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/271) |
| [#277](https://github.com/tutors-sdk/tutors-mono-repo/pull/277) | test(bdd): make the feature files executable, bound to product code | 5559 | 90 | 0 | no production lines | **no** |  | **floor** | floor [PR #277 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/277) |
| [#293](https://github.com/tutors-sdk/tutors-mono-repo/pull/293) | fix(course): distinguish a 404 from an unreachable host when loading a course | 78 | 4 | 0 | 0.86 | **no** |  | **floor** | floor [PR #293 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/293) |
| [#302](https://github.com/tutors-sdk/tutors-mono-repo/pull/302) | docs(quiz): state that quizzes are a formative self-check, not assessment | 23 | 1 | 0 | no production lines | **no** |  | **floor** | floor [PR #302 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/302) |
| [#295](https://github.com/tutors-sdk/tutors-mono-repo/pull/295) | test(reader): smoke the built server for ESM globals and 5xx on /auth | 273 | 7 | 0 | no production lines | **no** |  | **floor** | floor [PR #295 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/295) |
| [#303](https://github.com/tutors-sdk/tutors-mono-repo/pull/303) | feat(images): promote the judged rc image on a final tag instead of rebuilding | 1039 | 6 | 0 | no production lines | **no** |  | **floor** | floor [PR #303 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/303) |
| [#297](https://github.com/tutors-sdk/tutors-mono-repo/pull/297) | fix(logger): keep variable data out of log messages and guard it with a test | 185 | 13 | 0 | 2.68 | **no** |  | **floor** | floor [PR #297 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/297) |
| [#299](https://github.com/tutors-sdk/tutors-mono-repo/pull/299) | chore(ci): include the time app in the build check and the registry wait | 4 | 2 | 0 | no production lines | **no** |  | **floor** | floor [PR #299 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/299) |
| [#287](https://github.com/tutors-sdk/tutors-mono-repo/pull/287) | chore(infra): add ESLint no-console rule and standardise error catching | 636 | 42 | 0 | 2.59 | **no** |  | **floor** | floor [PR #287 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/287) |
| [#301](https://github.com/tutors-sdk/tutors-mono-repo/pull/301) | feat(testing): EARS Rule ids, audit gate and claims link (slice 1 of #214) | 2643 | 35 | 0 | no production lines | **no** |  | **floor** | floor [PR #301 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/301) |
| [#306](https://github.com/tutors-sdk/tutors-mono-repo/pull/306) | fix(lint): use process streams for script output (no-console) | 32 | 2 | 0 | no production lines | **no** |  | **floor** | floor [PR #306 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/306) |
| [#305](https://github.com/tutors-sdk/tutors-mono-repo/pull/305) | ci: remove images.yml, image-build.yml already publishes the images | 64 | 1 | 0 | no production lines | **no** |  | **floor** | floor [PR #305 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/305) |
| [#298](https://github.com/tutors-sdk/tutors-mono-repo/pull/298) | feat(deploy): pin overlays by digest and tell the release harness after a deploy | 940 | 17 | 0 | no production lines | **no** |  | **floor** | floor [PR #298 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/298) |
| [#296](https://github.com/tutors-sdk/tutors-mono-repo/pull/296) | fix(runtime): route the course calendar through the clock seam; keep the commit off /_app/version.json | 672 | 19 | 0 | 5.94 | **no** |  | **floor** | floor [PR #296 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/296) |
| [#300](https://github.com/tutors-sdk/tutors-mono-repo/pull/300) | feat(release): migration expand/contract checks and artefact-tagged changelog entries | 774 | 15 | 0 | no production lines | **no** |  | **floor** | floor [PR #300 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/300) |
| [#307](https://github.com/tutors-sdk/tutors-mono-repo/pull/307) | feat(release): pnpm release:harness builds the harness dispatch from a local checkout | 994 | 4 | 0 | no production lines | **no** |  | **floor** | floor [PR #307 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/307) |
| [#308](https://github.com/tutors-sdk/tutors-mono-repo/pull/308) | feat(release): publish rules.json and let a claim cite its Rule with a rule field | 491 | 10 | 0 | no production lines | **no** |  | **floor** | floor [PR #308 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/308) |
| [#309](https://github.com/tutors-sdk/tutors-mono-repo/pull/309) | fix(release): accept the harness's 19 claim artefacts and correct what an older harness does with rule: | 116 | 9 | 0 | no production lines | **no** |  | **floor** | floor [PR #309 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/309) |
| [#310](https://github.com/tutors-sdk/tutors-mono-repo/pull/310) | feat(release): send digests, rules_url and 5 runs to the harness (time digest on deploy) | 258 | 5 | 0 | no production lines | **no** |  | **floor** | floor [PR #310 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/310) |
| [#135](https://github.com/tutors-sdk/tutors-mono-repo/pull/135) | feat(observability): local Grafana stack for Tutors learning insights | 732 | 11 | 0 | no production lines | **no** |  | **floor** | floor [PR #135 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/135) |
| [#312](https://github.com/tutors-sdk/tutors-mono-repo/pull/312) | feat(release): post the harness verdict on the release PR (re-open of #311, which merged into #310's branch) | 1347 | 7 | 0 | no production lines | **no** |  | **floor** | floor [PR #312 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/312) |
| [#317](https://github.com/tutors-sdk/tutors-mono-repo/pull/317) | tutors-sdk/fix/enable-rls-public-tables | 55 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #317 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/317) |
| [#318](https://github.com/tutors-sdk/tutors-mono-repo/pull/318) | Make phones and tablets fit: two-up cards, scroll-away header, no keyboard hints on touch | 424 | 23 | 0 | 0.77 | **no** | yes (a fact) | **floor** | floor [PR #318 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/318) |
| [8582ef2](https://github.com/tutors-sdk/tutors-mono-repo/commit/8582ef2a6c4f45f5b16ca7cc7c1b90b6dfc1f3a8) | Rationalised the connect, course home and course tools menus | 275 | 16 | 0 | 0.69 | no PR |  | **floor** | floor [commit 8582ef2 "Rationalised the connect, course home and course tools menus" reached main without a pull request, so nobody reviewed it](https://github.com/tutors-sdk/tutors-mono-repo/commit/8582ef2a6c4f45f5b16ca7cc7c1b90b6dfc1f3a8) |
| [#333](https://github.com/tutors-sdk/tutors-mono-repo/pull/333) | test: honest coverage floors, mutation floors and a nightly mutation job (Rules 0110-0114) | 719 | 15 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #333 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/333) |
| [#335](https://github.com/tutors-sdk/tutors-mono-repo/pull/335) | test: mutation-test 12 modules at 93.6%, break at 90 (Rules 0113, 0115) | 1938 | 20 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #335 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/335) |
| [#334](https://github.com/tutors-sdk/tutors-mono-repo/pull/334) | Let the image backfill accept V16.2.1 and 16.2.1 | 48 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #334 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/334) |
| [#337](https://github.com/tutors-sdk/tutors-mono-repo/pull/337) | fix(load): drop the Node-only log line from the k6 reader traffic script | 1 | 1 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #337 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/337) |
| [#336](https://github.com/tutors-sdk/tutors-mono-repo/pull/336) | test: nightly mutation testing over every library module | 622 | 13 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #336 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/336) |
| [#340](https://github.com/tutors-sdk/tutors-mono-repo/pull/340) | docs(testing): describe both mutation runs and refresh stale figures | 66 | 5 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #340 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/340) |
| [#349](https://github.com/tutors-sdk/tutors-mono-repo/pull/349) | feat(release): generate the release changelog from merged PRs and their EARS Rules | 775 | 12 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #349 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/349) |
| [#350](https://github.com/tutors-sdk/tutors-mono-repo/pull/350) | Add "the data API" as an EARS system name | 9 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #350 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/350) |
| [#351](https://github.com/tutors-sdk/tutors-mono-repo/pull/351) | ci(image-build): sign and attest the digest before tagging it | 78 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #351 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/351) |
| [#353](https://github.com/tutors-sdk/tutors-mono-repo/pull/353) | fix(community): error reports flushed on page unload reach app_errors (console, network) | 81 | 3 | 0 | 10.57 | **no** | yes (a fact) | **floor** | floor [PR #353 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/353) |
| [#352](https://github.com/tutors-sdk/tutors-mono-repo/pull/352) | fix(deps): override devalue to >=5.9.1 for GHSA-9rgm-9g3h-6x36 | 15 | 2 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #352 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/352) |
| [#354](https://github.com/tutors-sdk/tutors-mono-repo/pull/354) | fix(build): name Netlify builds after their commit (network) | 47 | 5 | 0 | 0.96 | **no** | yes (a fact) | **floor** | floor [PR #354 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/354) |
| [#355](https://github.com/tutors-sdk/tutors-mono-repo/pull/355) | feat(release): pnpm release:candidate, release/deployed.json and the release SOP | 919 | 13 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #355 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/355) |
| [#363](https://github.com/tutors-sdk/tutors-mono-repo/pull/363) | docs(release): make the SOP match the harness as built | 24 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #363 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/363) |
| [#364](https://github.com/tutors-sdk/tutors-mono-repo/pull/364) | fix(reader): title the sign-in page and claim the Paper rebuild's accessibility fixes (axe) | 47 | 4 | 0 | 5.75 | **no** | yes (a fact) | **floor** | floor [PR #364 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/364) |
| [#366](https://github.com/tutors-sdk/tutors-mono-repo/pull/366) | docs(guides): guides/testing and guides/evolution, with an index | 5229 | 34 | 0 | no production lines | **no** |  | **floor** | floor [PR #366 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/366) |
| [#367](https://github.com/tutors-sdk/tutors-mono-repo/pull/367) | test(time): cover the Supabase and display lookups, restoring the coverage floor | 168 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #367 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/367) |
| [#365](https://github.com/tutors-sdk/tutors-mono-repo/pull/365) | feat(deploy): configure next deployment URLs at runtime | 371 | 33 | 0 | 0.55 | **no** | yes (a fact) | **floor** | floor [PR #365 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/365) |
| [#368](https://github.com/tutors-sdk/tutors-mono-repo/pull/368) | build(deps): combine open Dependabot updates (#356–#362, supersedes #294) | 453 | 12 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #368 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/368) |
| [#339](https://github.com/tutors-sdk/tutors-mono-repo/pull/339) | test(architecture): keep ui-primitives off the data and access packages | 17 | 4 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #339 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/339) |
| [#376](https://github.com/tutors-sdk/tutors-mono-repo/pull/376) | release: claim the package managers #143 removed from the runtime image (Rule 0220) | 78 | 3 | 0 | no production lines | **no** | yes (a fact) | **floor** | floor [PR #376 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/376) |
| 1 more | no deductions: #266 | 488 | 25 |  |  |  |  | 0 |  |

- churn: reader 2690 (median 98) ABOVE 2×, catalogue 163 (median 3) ABOVE 2×, live 242 (median 2.5) ABOVE 2×, time 2034 (median 9.5) ABOVE 2×
- hotspots: 1 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte
- ownership: packages/svelte/ui-navigators/src/CourseNavigation.svelte (3 authors), packages/svelte/ui-navigators/src/MainNavigator.svelte (3 authors), packages/svelte/utils/i18n/src/messages/de.ts (3 authors), packages/svelte/utils/i18n/src/messages/en.ts (3 authors), packages/svelte/utils/i18n/src/messages/es.ts (3 authors), packages/svelte/utils/i18n/src/messages/fr.ts (3 authors), packages/svelte/utils/i18n/src/messages/ga.ts (3 authors), packages/svelte/utils/i18n/src/messages/it.ts (3 authors)
- orphans: diffs not measured (CHANGELOG.md at 865d02f82cd64caaa3056209e17eec3bea66f070 has no "### v865d02f82cd64caaa3056209e17eec3bea66f070" entries under a product section, and no --changelog (pnpm release:changelog --json) was given); entries not measured (CHANGELOG.md at 865d02f82cd64caaa3056209e17eec3bea66f070 has no "### v865d02f82cd64caaa3056209e17eec3bea66f070" entries under a product section)
- tests: apps/catalogue 32.27, apps/live 19.29, apps/reader 3.17, apps/time 2.10, packages/jsr/create 28.80, packages/jsr/gen 3.84, packages/jsr/model 11.22, packages/jsr/time 10.65, packages/jsr/tutors 72.00, packages/jsr/tutors-lite 72.00, packages/svelte/app-config 0.22, packages/svelte/community 28.67, packages/svelte/connect 25.50, packages/svelte/course 25.36, packages/svelte/runes 109.42, packages/svelte/themes 5.98, packages/svelte/ui-components 1.97, packages/svelte/ui-navigators 1.74, packages/svelte/ui-primitives 6.57, packages/svelte/utils 2.40
- reviews: 3 approved, 64 not; 2 commit(s) straight to main: 96e9e4d, 8582ef2
- dependencies: no major bump; 11 new direct dependencies (@amiceli/vitest-cucumber, @sveltejs/adapter-auto, @sveltejs/adapter-node, @sveltejs/kit, @sveltejs/kit, …)

Not measured: orphan diffs (a diff with no changelog entry) (CHANGELOG.md at 865d02f82cd64caaa3056209e17eec3bea66f070 has no "### v865d02f82cd64caaa3056209e17eec3bea66f070" entries under a product section, and no --changelog (pnpm release:changelog --json) was given); orphan entries (a changelog entry with no diff) (CHANGELOG.md at 865d02f82cd64caaa3056209e17eec3bea66f070 has no "### v865d02f82cd64caaa3056209e17eec3bea66f070" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-09-30T08:52:05.718Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.2` | `quay.io/tutors-sdk/tutors-reader:sha-865d02f` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` | `quay.io/tutors-sdk/tutors-catalogue:sha-865d02f` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.2` | `quay.io/tutors-sdk/tutors-live:sha-865d02f` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.2` | `quay.io/tutors-sdk/tutors-time:sha-865d02f` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` | `sha256:d762443173876708d631b81ff70d8042eb1ef7572e69a2d5c7813bc030f80f88` · rev `865d02f82cd6` · version `sha-865d02f` |
| catalogue image | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` | `sha256:25318d08ba744eae4ed29e2da3a0ce22dcff03c9b650cb7dbcac9d521553476e` · rev `865d02f82cd6` · version `sha-865d02f` |
| live image | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` | `sha256:a74b94e7e5f8c1f4fb8a13ba4a04c5009865bd9d5fc1c9cc28ccc546e260056d` · rev `865d02f82cd6` · version `sha-865d02f` |
| time image | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` | `sha256:86951ef3ca3556b46a143fbbfc1969270204f8755e9f183c20e94ffccf40fc07` · rev `865d02f82cd6` · version `sha-865d02f` |

- 204 unclaimed diff(s)
- A/A consulted: clean at 2026-09-30T08:40:44.617Z

### Unclaimed differences (204)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+51 −25 lines at line 4) |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+6 −7 lines at line 36) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+32 −33 lines at line 4) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+6 −7 lines at line 47) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+45 −43 lines at line 4) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+6 −7 lines at line 59) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+45 −35 lines at line 2) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+18 −14 lines at line 62) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+45 −35 lines at line 2) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+20 −14 lines at line 54) |
| `dom` | `reader:search` | reader:search: semantic DOM differs (+83 −11 lines at line 4) |
| `dom` | `reader:search` | reader:search: semantic DOM differs (+6 −7 lines at line 24) |
| `dom` | `reader:search-results` | reader:search-results: semantic DOM differs (+53 −18 lines at line 4) |
| `dom` | `reader:search-results` | reader:search-results: semantic DOM differs (+6 −7 lines at line 31) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+28 −7 lines at line 4) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+6 −7 lines at line 17) |
| `dom` | `live:home` | live:home: semantic DOM differs (+27 −7 lines at line 4) |
| `dom` | `live:home` | live:home: semantic DOM differs (+6 −7 lines at line 22) |
| `dom` | `reader-auth:sign-in` | reader-auth:sign-in: semantic DOM differs (+25 −26 lines at line 1) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+39 −35 lines at line 4) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+6 −7 lines at line 49) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+52 −45 lines at line 4) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+6 −7 lines at line 61) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+79 −87 lines at line 4) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+6 −7 lines at line 118) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+46 −59 lines at line 4) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+55 −44 lines at line 74) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+6 −7 lines at line 143) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+61 −60 lines at line 2) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+18 −42 lines at line 85) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+44 −45 lines at line 2) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+1 −1 lines at line 63) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+15 −42 lines at line 152) |
| `screenshot` | `reader:home` | reader:home: 6.79% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:course` | reader:course: 8.40% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:topic` | reader:topic: 14.70% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:lab-step` | reader:lab-step: 12.63% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:lab-step-2` | reader:lab-step-2: 11.61% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:search` | reader:search: 8.82% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:search-results` | reader:search-results: 5.65% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `catalogue:home` | catalogue:home: 2.66% of pixels differ in 1280×776 at (0, 24) (threshold 0.10%) |
| `screenshot` | `live:home` | live:home: 2.91% of pixels differ in 1280×776 at (0, 24) (threshold 0.10%) |
| `screenshot` | `reader-auth:sign-in` | reader-auth:sign-in: 10.80% of pixels differ in 996×776 at (142, 24) (threshold 0.10%) |
| `screenshot` | `reader-auth:course` | reader-auth:course: 7.93% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader-auth:topic` | reader-auth:topic: 14.72% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:course` | reference:course: 15.04% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:topic` | reference:topic: 20.83% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:lab` | reference:lab: 16.59% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:note` | reference:note: 32.72% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 30× on b |
| `network` | `GET /logo.svg` | reader:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 39× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:lab-step: GET /_app/immutable/chunks/{{hash}}.js requested 2× on a, 1× on b |
| `network` | `GET /_app/immutable/assets/8.{{hash}}.css` | reader:lab-step: new request on b: GET /_app/immutable/assets/8.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reader:lab-step: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:search: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 39× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/14.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/14.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | catalogue:home: GET /_app/immutable/chunks/{{hash}}.js requested 6× on a, 7× on b |
| `network` | `GET /global.css` | catalogue:home: request no longer made on b: GET /global.css |
| `network` | `GET /logo.svg` | catalogue:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | catalogue:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/2.{{hash}}.css` | catalogue:home: new request on b: GET /_app/immutable/assets/2.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | catalogue:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | live:home: GET /_app/immutable/chunks/{{hash}}.js requested 9× on a, 10× on b |
| `network` | `GET /global.css` | live:home: request no longer made on b: GET /global.css |
| `network` | `GET /logo.svg` | live:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/2.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/2.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SigninWithGithub.{{hash}}.css` | reader-auth:sign-in: request no longer made on b: GET /_app/immutable/assets/SigninWithGithub.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader-auth:sign-in: GET /_app/immutable/chunks/{{hash}}.js requested 17× on a, 23× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader-auth:sign-in: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader-auth:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 39× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 34× on a, 40× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:lab: GET /_app/immutable/chunks/{{hash}}.js requested 2× on a, 1× on b |
| `network` | `GET /_app/immutable/assets/8.{{hash}}.css` | reference:lab: new request on b: GET /_app/immutable/assets/8.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reference:lab: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:note: GET /_app/immutable/chunks/{{hash}}.js requested 31× on a, 36× on b |
| `network` | `GET {{course}}/course.png` | reference:note: new request on b: GET {{course}}/course.png |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET {{course}}/topic-07-reference/note-1/img/video.mov` | reference:note: GET {{course}}/topic-07-reference/note-1/img/video.mov status changed: 200 → 206 |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `headers` | `reader:home/link` | reader:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/4.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/23.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/23.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/4.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/23.{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader:course/link` | reader:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `catalogue:home/link` | catalogue:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/2.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `live:home/link` | live:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/2.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader-auth:sign-in/link` | reader-auth:sign-in: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SigninWithGithub.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/6.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/6.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader-auth:course/link` | reader-auth:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reference:course/link` | reference:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reference:note/link` | reference:note: header link changed: <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Context.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `logs` | `reader/event` | reader: new log field on b: event |
| `logs` | `reader/loadError` | reader: new log field on b: loadError |
| `logs` | `reader/slow` | reader: new log field on b: slow |
| `logs` | `catalogue/event` | catalogue: new log field on b: event |
| `logs` | `catalogue/loadError` | catalogue: new log field on b: loadError |
| `logs` | `catalogue/slow` | catalogue: new log field on b: slow |
| `logs` | `live/event` | live: new log field on b: event |
| `logs` | `live/loadError` | live: new log field on b: loadError |
| `logs` | `live/slow` | live: new log field on b: slow |
| `logs` | `time/event` | time: new log field on b: event |
| `logs` | `time/loadError` | time: new log field on b: loadError |
| `logs` | `time/slow` | time: new log field on b: slow |
| `logs` | `reader-auth/event` | reader-auth: new log field on b: event |
| `logs` | `reader-auth/loadError` | reader-auth: new log field on b: loadError |
| `logs` | `reader-auth/slow` | reader-auth: new log field on b: slow |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (11 stops on a, 7 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 11 on b) |
| `focus` | `reader:lab-step` | reader:lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step-2` | reader:lab-step-2: keyboard order changed (6 stops on a, 11 on b) |
| `focus` | `reader:search` | reader:search: keyboard order changed (6 stops on a, 12 on b) |
| `focus` | `reader:search-results` | reader:search-results: keyboard order changed (6 stops on a, 12 on b) |
| `focus` | `catalogue:home` | catalogue:home: keyboard order changed (6 stops on a, 12 on b) |
| `focus` | `live:home` | live:home: keyboard order changed (5 stops on a, 5 on b) |
| `focus` | `reader-auth:course` | reader-auth:course: keyboard order changed (11 stops on a, 7 on b) |
| `focus` | `reader-auth:topic` | reader-auth:topic: keyboard order changed (12 stops on a, 11 on b) |
| `focus` | `reference:course` | reference:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:topic` | reference:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:lab` | reference:lab: keyboard order changed (12 stops on a, 10 on b) |
| `focus` | `reference:note` | reference:note: keyboard order changed (12 stops on a, 12 on b) |
| `persistence` | `student-signs-in/app_errors` | student-signs-in: POST app_errors — 20 row(s) on a, 0 on b |
| `persistence` | `student-signs-in/calendar` | student-signs-in: POST calendar — 0 row(s) on a, 5 on b |
| `persistence` | `student-signs-in/learning_records` | student-signs-in: POST learning_records — 0 row(s) on a, 5 on b |
| `image-manifest` | `reader/layers` | reader: 9 layer(s) on a, 10 on b |
| `image-manifest` | `reader/label/org.opencontainers.image.vendor` | reader: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `reader/tar` | reader: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `image-manifest` | `catalogue/layers` | catalogue: 9 layer(s) on a, 10 on b |
| `image-manifest` | `catalogue/label/org.opencontainers.image.vendor` | catalogue: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `catalogue/tar` | catalogue: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `image-manifest` | `live/layers` | live: 9 layer(s) on a, 10 on b |
| `image-manifest` | `live/label/org.opencontainers.image.vendor` | live: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `live/node` | live: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `live/tar` | live: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `image-manifest` | `time/layers` | time: 9 layer(s) on a, 10 on b |
| `image-manifest` | `time/label/org.opencontainers.image.vendor` | time: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `time/@supabase/auth-js` | time: package bumped: @supabase/auth-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/functions-js` | time: package bumped: @supabase/functions-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/postgrest-js` | time: package bumped: @supabase/postgrest-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/realtime-js` | time: package bumped: @supabase/realtime-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/storage-js` | time: package bumped: @supabase/storage-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/supabase-js` | time: package bumped: @supabase/supabase-js 2.116.0 → 2.117.2 |
| `sbom` | `time/node` | time: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `time/tar` | time: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `time/tzdata` | time: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |

<details><summary>Detail of 66 difference(s)</summary>

`dom` `reader:home`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - img "Tutors Open Source Project"
-      - heading "Tutors Open Source Project" [level=2]
-      - paragraph: Open Web Learning Components
-    - navigation:
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
+    - link "Tutors home":
+      - /url: /
+      - img "Tutors"
+      - text: tutors
+    - link "My courses":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: /
+    - link "Catalogue ↗":
+      - /url: https://catalogue.tutors.dev
+    - link "Live ↗":
+      - /url: https://live.tutors.dev
+    - link "Time ↗":
+      - /url: https://time.tutors.dev
+    - link "Create":
+      - /url: /create
+    - link "Docs":
+      - /url: /course/tutors-reference-manual
 - main:
-  - heading "Tutors:An Open Learning Web Toolkit" [level=1]
-  - paragraph:
-    - text: Open source components & services supporting the creation of learning experiences using web standards. Developed at
-    - link "SETU":
-      - /url: https://www.setu.ie
-    - text: ", Waterford, Ireland."
-  - link "Create":
-    - /url: /create
-  - link "Docs":
-    - /url: /course/tutors-reference-manual
-  - link "Source":
-    - /url: https://github.com/tutors-sdk/tutors-mono-repo
-  - link "Catalogue":
-    - /url: https://cata
… (1300 more characters in report.json)
```

`dom` `reader:home`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reader:course`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Runway Fixture Course" [level=2]
-    - paragraph: Tutors CI
-    - navigation:
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
+    - heading "Runway Fixture Course" [level=1]:
+      - link "Runway Fixture Course":
+        - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-      - /url: /wall/note/localhost:8080
-    - link "All labs in the course":
-      - /url: /wall/lab/localhost:8080
+  - navigation "Breadcrumbs":
+
… (1025 more characters in report.json)
```

`dom` `reader:course`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reader:topic`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Topic 1" [level=2]
-    - paragraph: Runway Fixture Course
-    - navigation:
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Unit 1":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Topic 1":
-            - /url: /topic/localhost:8080/unit-1/topic-01
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-    
… (1800 more characters in report.json)
```

`dom` `reader:topic`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reader:lab-step`

```
 - link "Skip to content":
   - /url: "#main-content"
-- banner
-- main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Unit 1":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Topic 1":
-            - /url: /topic/localhost:8080/unit-1/topic-01
-        - listitem:
-          - link "Lab 1":
-            - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-      - /url: /wall/note/localhost:8080
-    - link "All labs in the course":
-      - /url: /wall/lab/localhost:8080
-  - navigation "Lab steps":
-    - list:
+- banner:
+  - navigation "Main navigation":
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - link "← Topic 1":
+      - /url: /topic/localhost:8080/unit-1/topic-01
+    - heading "Lab 1" [level=2]
+    - paragraph: Steps · 1 / 6
+    - list "Steps":
       - listitem:
-        - link "Lab 1":
+        - l
… (1611 more characters in report.json)
```

`dom` `reader:lab-step`

```
         - /url: "#getting-started"
     - paragraph: Describe the initial setup steps here.
-  - heading "Topic 1" [level=3]
-  - figure
-  - button "Expand all"
-  - tree "Tree View":
-    - treeitem "Talk 1" [level=1]:
-      - link "Talk 1":
-        - /url: /talk/localhost:8080/unit-1/topic-01/talk-01
-    - 'treeitem "Show or hide contents: Lab 1 Lab 1" [level=1]':
-      - 'button "Show or hide contents: Lab 1"'
-      - link "Lab 1":
-        - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - treeitem "Note 1" [level=1]:
-      - link "Note 1":
-        - /url: /note/localhost:8080/unit-1/topic-01/note-01
+  - navigation "Previous and next step":
+    - link "Next → Step 1":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01
+- contentinfo "Site footer":
+  - img "Tutors"
+  - link "Tutors v:{{version}}":
+    - /url: https://tutors.dev
+    - paragraph: Tutors v:{{version}}
+  - paragraph:
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+  - link "South East Technological University":
+    - /url: https://setu.ie
+    - img "South East Technological University"
 - text: Runway Fixture Course
\ No newline at end of file
```

`dom` `reader:lab-step-2`

```
 - link "Skip to content":
   - /url: "#main-content"
-- banner
-- main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Unit 1":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Topic 1":
-            - /url: /topic/localhost:8080/unit-1/topic-01
-        - listitem:
-          - link "Lab 1":
-            - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-      - /url: /wall/note/localhost:8080
-    - link "All labs in the course":
-      - /url: /wall/lab/localhost:8080
-  - navigation "Lab steps":
-    - list:
+- banner:
+  - navigation "Main navigation":
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - link "← Topic 1":
+      - /url: /topic/localhost:8080/unit-1/topic-01
+    - heading "Lab 1" [level=2]
+    - paragraph: Steps · 2 / 6
+    - list "Steps":
       - listitem:
-        - link "Lab 1":
+        - l
… (1612 more characters in report.json)
```

`dom` `reader:lab-step-2`

```
         - /url: "#step-1"
     - paragraph: Write your lab instructions for step 1 of 5 here.
-  - heading "Topic 1" [level=3]
-  - figure
-  - button "Expand all"
-  - tree "Tree View":
-    - treeitem "Talk 1" [level=1]:
-      - link "Talk 1":
-        - /url: /talk/localhost:8080/unit-1/topic-01/talk-01
-    - 'treeitem "Show or hide contents: Lab 1 Lab 1" [level=1]':
-      - 'button "Show or hide contents: Lab 1"'
-      - link "Lab 1":
-        - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - treeitem "Note 1" [level=1]:
-      - link "Note 1":
-        - /url: /note/localhost:8080/unit-1/topic-01/note-01
+  - navigation "Previous and next step":
+    - link "← Previous Lab 1":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Setup
+    - link "Next → Step 2":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-02
+- contentinfo "Site footer":
+  - img "Tutors"
+  - link "Tutors v:{{version}}":
+    - /url: https://tutors.dev
+    - paragraph: Tutors v:{{version}}
+  - paragraph:
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+  - link "South East Technological University":
+    - /url: https://setu.ie
+    - img "South East Technological University"
 - text: Runway Fixture Course
\ No newline at end of file
```

`dom` `reader:search`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Runway Fixture Course" [level=2]
-    - paragraph: Tutors CI
-    - navigation:
-      - button "Search this course" [pressed]: Exit Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
 - main:
+  - navigation "Breadcrumbs":
+    - list:
+      - listitem:
+        - link "My courses":
+          - /url: /
+      - listitem: Runway Fixture Course
+  - paragraph: Resources
+  - heading "Find your next resource." [level=1]
+  - paragraph: Search course titles and available lesson text.
   - text: "Enter search term:"
+  - searchbox "Enter search term:"
   - button "Search"
-  - textbox "Enter search term:":
-    - /placeholder: ...
+  - button "All types" [pressed]
+  - button "topic"
+  - button "talk"
+  - button "lab"
+  - button "note"
+  - group: Resources
+  - status: 8 resources
+  - articl
… (1924 more characters in report.json)
```

`dom` `reader:search`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reader:search-results`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Runway Fixture Course" [level=2]
-    - paragraph: Tutors CI
-    - navigation:
-      - button "Search this course" [pressed]: Exit Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
 - main:
+  - navigation "Breadcrumbs":
+    - list:
+      - listitem:
+        - link "My courses":
+          - /url: /
+      - listitem: Runway Fixture Course
+  - paragraph: Resources
+  - heading "Find your next resource." [level=1]
+  - paragraph: Search course titles and available lesson text.
   - text: "Enter search term:"
+  - searchbox "Enter search term:": reference material
   - button "Search"
-  - textbox "Enter search term:":
-    - /placeholder: ...
-    - text: reference material
-  - paragraph: Add your reference material or supplementary notes here.
-  - link "Topic 1/ Note 1":
-    - /url: /
… (1211 more characters in report.json)
```

`dom` `reader:search-results`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `catalogue:home`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - img "Tutors Open Source Project"
-      - heading "Tutors Open Source Project" [level=2]
-      - paragraph: Open Web Learning Components
-    - navigation:
-      - button "Open Theme Menu": Layout
-- main: "Totals: modules-0:students-0"
+    - link "Tutors home":
+      - /url: https://tutors.dev/
+      - img "Tutors"
+      - text: tutors
+    - link "Catalogue":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: https://tutors.dev/
+    - link "Catalogue":
+      - /url: /
+    - link "Live ↗":
+      - /url: https://live.tutors.dev
+    - link "Time ↗":
+      - /url: https://time.tutors.dev
+    - link "Create":
+      - /url: https://tutors.dev/create
+    - link "Docs":
+      - /url: https://tutors.dev/course/tutors-reference-manual
+- main:
+  - paragraph: Catalogue
+  - heading "Tutors Catalogue" [level=1]
+  - paragraph: Courses published with Tutors, most visited first. 0 modules · 0 students
+  - heading "Most visited courses" [level=2]
+  - paragraph: No courses are available to display.
 - contentinfo "Site footer":
   - img "Tutors"
```

`dom` `catalogue:home`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `live:home`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - img "Tutors Open Source Project"
-      - heading "Tutors Open Source Project" [level=2]
-      - paragraph: Open Web Learning Components
-    - navigation:
-      - button "Open Theme Menu": Layout
+    - link "Tutors home":
+      - /url: https://tutors.dev/
+      - img "Tutors"
+      - text: tutors
+    - link "Live":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: https://tutors.dev/
+    - link "Catalogue ↗":
+      - /url: https://catalogue.tutors.dev
+    - link "Live":
+      - /url: /
+    - link "Time ↗":
+      - /url: https://time.tutors.dev
+    - link "Create":
+      - /url: https://tutors.dev/create
+    - link "Docs":
+      - /url: https://tutors.dev/course/tutors-reference-manual
 - main:
+  - paragraph: Live
+  - heading "Tutors Live" [level=1]
+  - paragraph: Course activity shared by connected learners.
   - tablist:
     - tab "Courses (0)"
     - tab "Students (0)" [selected]
     - tab "Groups"
-  - tabpanel "Students (0)"
+  - tabpanel "Students (0)":
+    - paragraph: No students are sharing activity right now.
 - contentinfo "Site footer":
   - img "Tutors"
```

`dom` `live:home`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reader-auth:sign-in`

```
-- banner: Tutors Sign In
-- contentinfo:
-  - button "Sign in with GitHub"
-- contentinfo:
-  - article:
-    - paragraph:
-      - text: You are about to be authenticated via your Github credentials to Tutors.
-      - strong: For most courses, you do not need to log in at all, so if you prefer you can go back to the course page and proceed through the course as for any public web site.
-    - paragraph: If you do sign up/log in, then you will need a github account first. Logging in will then make a simple convenient dashboard available of quick links to all recent Tutors courses you have accessed.
-    - paragraph: For some courses, Tutors will always require an account to gain access - and you will be landed here. Once logged in, Tutors may record how much time each view is active and send this to the TutorsTime data store. You can view this information via the Time feature on the profile menu. This data is available to you + the instructor of your course, but not to other students. No other data is gathered, nor is this data transmitted anywhere other than the TutorsTime data store.
-    - paragraph:
-      - text: The Live feature, available from the profile menu, may also use this data to display of panel of students currently online.
-      - strong: You can opt out of these features by disabling the Share Presence option from the profile menu.
-      - text: "To learn more about TutorsTime please consult:"
-    - list:
-      - listitem:
-        - link "Tutors Time 
… (2480 more characters in report.json)
```

`dom` `reader-auth:course`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Runway Fixture Course" [level=2]
-    - paragraph: Tutors CI
-    - navigation:
-      - 'button "Sentiment: neutral. Open menu to change."'
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Profile menu":
-        - img "Harness Student"
-      - button "Open course tree"
+    - heading "Runway Fixture Course" [level=1]:
+      - link "Runway Fixture Course":
+        - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Profile menu":
+      - img "Harness Student"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
+    - paragraph: Activity
+    - link "My time":
+      - /url: /time/localhost:8080
+    - link "Live now":
+      - /url: https://live.tutors.dev/localhost:8080
+    - button "View 0 Online"
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /u
… (1322 more characters in report.json)
```

… and 46 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Claimed differences (701)

| artefact | scope | claimed by |
|---|---|---|
| `axe` | `reader-auth:sign-in` | Rule 0216: The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. — sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious) |
| `axe` | `reader-auth:sign-in` | Rule 0216: The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. — sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious) |
| `axe` | `reference:course` | Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313 |
| `axe` | `reference:topic` | Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313 |
| `axe` | `reference:note` | Rule 0036: The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. — code block copy buttons are named "Copy code" (button-name, critical) fixed by #313 |
| `sbom` | `reader/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |

### Claim hygiene

5 claim(s) cover 696 failing hunk(s): 139.2 hunk(s) per claim, at most 696 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `sbom` | `*/{@isaacs/cliui,@isaacs/fs-minipass,@isaacs/string-locale-compare,@npmcli/agent,@npmcli/arborist,@npmcli/config,@npmcli/fs,@npmcli/git,@npmcli/installed-package-contents,@npmcli/map-workspaces,@npmcli/metavuln-calculator,@npmcli/name-from-folder,@npmcli/node-gyp,@npmcli/package-json,@npmcli/promise-spawn,@npmcli/query,@npmcli/redact,@npmcli/run-script,@pkgjs/parseargs,@sigstore/bundle,@sigstore/core,@sigstore/protobuf-specs,@sigstore/sign,@sigstore/tuf,@sigstore/verify,@tufjs/canonical-json,@tufjs/models,abbrev,agent-base,ansi-regex,ansi-styles,aproba,archy,balanced-match,bin-links,binary-extensions,brace-expansion,cacache,chalk,chownr,ci-info,cidr-regex,cli-columns,cmd-shim,color-convert,color-name,common-ancestor-path,corepack,cross-spawn,cssesc,debug,diff,eastasianwidth,emoji-regex,encoding,env-paths,err-code,exponential-backoff,fastest-levenshtein,fdir,foreground-child,fs-minipass,glob,graceful-fs,hosted-git-info,http-cache-semantics,http-proxy-agent,https-proxy-agent,iconv-lite,ignore-walk,imurmurhash,ini,init-package-json,ip-address,ip-regex,is-cidr,is-fullwidth-code-point,isexe,jackspeak,json-parse-even-better-errors,json-stringify-nice,jsonparse,just-diff,just-diff-apply,libnpmaccess,libnpmdiff,libnpmexec,libnpmfund,libnpmhook,libnpmorg,libnpmpack,libnpmpublish,libnpmsearch,libnpmteam,libnpmversion,lru-cache,make-fetch-happen,minimatch,minipass,minipass-collect,minipass-fetch,minipass-flush,minipass-pipeline,minipass-sized,minizlib,ms,mute-stream,negotiator,node-gyp,nopt,normalize-package-data,npm,npm-audit-report,npm-bundled,npm-install-checks,npm-normalize-package-bin,npm-package-arg,npm-packlist,npm-pick-manifest,npm-profile,npm-registry-fetch,npm-user-validate,p-map,package-json-from-dist,pacote,parse-conflict-json,path-key,path-scurry,picomatch,postcss-selector-parser,proc-log,proggy,promise-all-reject-late,promise-call-limit,promise-retry,promzard,qrcode-terminal,read,read-cmd-shim,read-package-json-fast,retry,safer-buffer,semver,shebang-command,shebang-regex,signal-exit,sigstore,smart-buffer,socks,socks-proxy-agent,spdx-correct,spdx-exceptions,spdx-expression-parse,spdx-license-ids,ssri,string-width,strip-ansi,supports-color,text-table,tiny-relative-date,tinyglobby,treeverse,tuf-js,unique-filename,unique-slug,util-deprecate,validate-npm-package-license,validate-npm-package-name,walk-up-path,which,wrap-ansi,write-file-atomic,yallist,yarn}` | 696 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 291 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 121 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 121 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 121 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 287 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 121 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.43 ms | 2.19 ms |
| b | 600 | 0 | 0 | 1.37 ms | 2.06 ms |

<details><summary>Informational (118)</summary>

- `console` reader:course: console message gone on b
- `console` reader:lab-step: console message gone on b
- `console` reader:search: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `console` reference:course: console message gone on b
- `console` reference:lab: console message gone on b
- `console` reference:note: console message gone on b
- `axe` reader-auth:sign-in: axe violation fixed on b: color-contrast (serious)
- `axe` reader-auth:sign-in: axe violation fixed on b: document-title (serious)
- `axe` reference:course: axe violation fixed on b: nested-interactive (serious)
- `axe` reference:topic: axe violation fixed on b: nested-interactive (serious)
- `axe` reference:note: axe violation fixed on b: button-name (critical)
- `timing` journey catalogue-loads median 1475ms → 1856ms but not significant (p=0.144)
- `vulns` reader: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` live: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` live: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` time: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` time: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.15.0 (c324525fdeca, contract 1.15.0) · 2026-09-30T08:52:05.718Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1147, persistence-stub-requests×315, hashed-assets×6215, footer-tutors-version×279, transport-length×80, transport-connection×80, transport-keepalive×80</sub>


</details>
