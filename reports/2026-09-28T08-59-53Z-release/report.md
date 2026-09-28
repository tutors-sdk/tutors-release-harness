## Release gate: sha-185e87f beside 16.2.2

**Gate: FAIL**

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

<!-- glance:start -->
### The reviewer's glance (gemba: go to the artefact and look)

7 places to look, ranked by novelty × exposure. Mark each one: `harness glance mark --run reports/2026-09-28T08-59-53Z-release --item <n> --mark verified|disputed|escalated --by <name> [--note text]` (verified: looked, and agrees with the claim; disputed: becomes a new claim or a hold; escalated: becomes a 5 Whys).

1. **Hotspot, first contribution**: PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte: "feat(ui): rebuild Tutors with the Paper design system"
   [PR](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) · [diff](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-3805a328d2572205ef2f52b7b2b8eb8164c3c1dc10b3c867d195122994548757)
   _novelty 1.00 (no history yet) × exposure 1.00 (unmapped (packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte is outside apps/, and a package's reach into the journeys is not mapped): counted as all 6 journeys, so what cannot be placed is not ranked below what can) = 1.00_ · mark: not marked yet
2. **Fixed on b**: reader-auth:sign-in: 2 axe violations fixed on b, unclaimed; a fix nobody claimed can be a behaviour change
   [hunk](report.html#hunk-axe:reader-auth:sign-in:158)
   every hunk: [1](report.html#hunk-axe:reader-auth:sign-in:158) [2](report.html#hunk-axe:reader-auth:sign-in:159)
   color-contrast (serious) \| document-title (serious)
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: student-signs-in) = 0.17_ · mark: not marked yet
3. **Fixed on b**: reference:course: 1 axe violation fixed on b, unclaimed; a fix nobody claimed can be a behaviour change
   [hunk](report.html#hunk-axe:reference:course:160)
   nested-interactive (serious)
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: reference-course-reads) = 0.17_ · mark: not marked yet
4. **Fixed on b**: reference:note: 1 axe violation fixed on b, unclaimed; a fix nobody claimed can be a behaviour change
   [hunk](report.html#hunk-axe:reference:note:162)
   button-name (critical)
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: reference-course-reads) = 0.17_ · mark: not marked yet
5. **Fixed on b**: reference:topic: 1 axe violation fixed on b, unclaimed; a fix nobody claimed can be a behaviour change
   [hunk](report.html#hunk-axe:reference:topic:161)
   nested-interactive (serious)
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: reference-course-reads) = 0.17_ · mark: not marked yet
6. **Fixed on b**: catalogue:home: 2 console errors fixed on b, unclaimed; but 2 new console errors on the same page: fixed, or only changed?
   [hunk](report.html#hunk-console:catalogue:home:140)
   every hunk: [1](report.html#hunk-console:catalogue:home:140) [2](report.html#hunk-console:catalogue:home:141)
   error: {"app":"tutors-catalogue","environment":"production","error":"Cannot read properti… \| error: {"app":"tutors-catalogue","environment":"production","error":"Cannot read properti…
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: catalogue-loads) = 0.17_ · mark: not marked yet
7. **Fixed on b**: reader-auth:course: 2 console errors fixed on b, unclaimed; a fix nobody claimed can be a behaviour change
   [hunk](report.html#hunk-console:reader-auth:course:142)
   every hunk: [1](report.html#hunk-console:reader-auth:course:142) [2](report.html#hunk-console:reader-auth:course:143)
   error: {"app":"tutors-reader","environment":"production","reason":"Cannot read properties… \| error: Cannot read properties of undefined (reading 'increment')
   _novelty 1.00 (no history yet) × exposure 0.17 (1 of 6 journeys: student-signs-in) = 0.17_ · mark: not marked yet

**Gate FAIL: the glance does not decide go; it is kept for the 5 Whys.**

Not checked (no input, so nothing is claimed about them): mask added: no earlier release on the scoreboard to compare the masks with (no scoreboard yet at /home/runner/work/tutors-release-harness/tutors-release-harness/harness/.harness/scoreboard/releases.jsonl).

_The ranking is in confidence.json (glance, glanceBasis) so it can be reviewed too; marks go to glance-marks.jsonl and never change the Gate or an exit code._
<!-- glance:end -->

5 of 8 dimensions measured (weight 70 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** | **breached** | −20 unclaimed: dom /: reader:home: semantic DOM differs (+47 −26 lines at line 4); −20 unclaimed: dom /: reader:home: semantic DOM differs (+6 −7 lines at line 36); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+32 −34 lines at line 4); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+6 −7 lines at line 47); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+45 −44 lines at line 4) (and 888 more like it, not counted again: report.html#differences); −15 stale claim axe reader-auth:sign-in: matched nothing (sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious)); −15 stale claim axe reference:course: matched nothing (navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313); −15 stale claim axe reference:topic: matched nothing (navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313); −15 stale claim axe reference:note: matched nothing (code block copy buttons are named "Copy code" (button-name, critical) fixed by #313) |
| Noise health | 15 | **85** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **50** |  | −50 the upgrade rehearsal FAILED: 772 finding(s) during the rollout |
| Test signal | 15 | not measured |  | needs the monorepo's CI and Stryker mutation scores and the weekly harness mutants: pass --test-signal <json> |
| Requirements traceability | 10 | not measured |  | needs the changelog, the EARS files and the claims side by side: pass --traceability <json> |
| Change risk | 15 | **20** | **breached** | floor PR #276 was merged with no approving review; −10 PR #276 changed 4 production lines in apps/catalogue with 0 test lines (0.00); 4 production lines in apps/live with 0 test lines (0.00); 4 production lines in apps/reader with 0 test lines (0.00); 4 production lines in apps/time with 0 test lines (0.00): below 0.2; floor PR #279 was merged with no approving review; floor PR #278 was merged with no approving review; floor PR #282 was merged with no approving review; floor PR #283 was merged with no approving review; floor PR #281 was merged with no approving review; floor PR #280 was merged with no approving review; floor PR #143 was merged with no approving review; floor commit 96e9e4d "Create images.yml" reached main without a pull request, so nobody reviewed it; floor PR #284 was merged with no approving review; floor PR #286 was merged with no approving review; floor PR #274 was merged with no approving review; floor PR #275 was merged with no approving review; floor PR #273 was merged with no approving review; floor PR #270 was merged with no approving review; floor PR #272 was merged with no approving review; floor PR #269 was merged with no approving review; −10 PR #269 changed 8 production lines in apps/reader with 0 test lines (0.00); 12 production lines in packages/jsr/model with 0 test lines (0.00): below 0.2; floor PR #271 was merged with no approving review; floor PR #277 was merged with no approving review; floor PR #293 was merged with no approving review; floor PR #302 was merged with no approving review; floor PR #295 was merged with no approving review; floor PR #303 was merged with no approving review; floor PR #297 was merged with no approving review; floor PR #299 was merged with no approving review; floor PR #287 was merged with no approving review; floor PR #301 was merged with no approving review; floor PR #306 was merged with no approving review; floor PR #305 was merged with no approving review; floor PR #298 was merged with no approving review; floor PR #296 was merged with no approving review; floor PR #300 was merged with no approving review; floor PR #307 was merged with no approving review; floor PR #308 was merged with no approving review; floor PR #309 was merged with no approving review; floor PR #310 was merged with no approving review; floor PR #135 was merged with no approving review; floor PR #312 was merged with no approving review; floor PR #313 was merged with no approving review; −10 PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases); −5 reader churn 2539 lines, above 2× its median of 98 over the last 6 releases; PR #313 is the largest part (2422 lines); floor PR #316 was merged with no approving review; −10 PR #316 changed 167 production lines in packages/svelte/ui-components with 25 test lines (0.15): below 0.2; floor PR #317 was merged with no approving review; floor PR #318 was merged with no approving review; floor commit 8582ef2 "Rationalised the connect, course home and course tools menus" reached main without a pull request, so nobody reviewed it; floor PR #330 was merged with no approving review; −10 PR #330, a first contribution, changed 100 production lines in packages/svelte/ui-navigators with 11 test lines (0.11): below 0.2; floor PR #333 was merged with no approving review; floor PR #335 was merged with no approving review; floor PR #334 was merged with no approving review; floor PR #337 was merged with no approving review; floor PR #336 was merged with no approving review; floor PR #340 was merged with no approving review; floor PR #349 was merged with no approving review; floor PR #350 was merged with no approving review; floor PR #351 was merged with no approving review; floor PR #353 was merged with no approving review; floor PR #352 was merged with no approving review; floor PR #354 was merged with no approving review; floor PR #355 was merged with no approving review; floor PR #363 was merged with no approving review; floor PR #331 was merged with no approving review; −10 PR #331, a first contribution, changed 1678 production lines in apps/time with 319 test lines (0.19): below 0.2; −5 catalogue churn 117 lines, above 2× its median of 3 over the last 6 releases; PR #331 is the largest part (72 lines); −5 live churn 207 lines, above 2× its median of 2.5 over the last 6 releases; PR #331 is the largest part (164 lines); −5 time churn 2003 lines, above 2× its median of 9.5 over the last 6 releases; PR #331 is the largest part (1757 lines); floor PR #364 was merged with no approving review |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 20 (100 − 80), v16.2.2..185e87f12d34e0e6d7a16714c29aa08bde629639: 60 of 60 changes (58 PRs, 2 direct commits) carry a finding; floor breached (caps the RCS at 74).**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#331](https://github.com/tutors-sdk/tutors-mono-repo/pull/331) | Bring time, catalogue and live onto the Paper design system and the reader's UX patterns | 3693 | 93 | 0 | 0.10 | **no** | yes (a fact) | **−25** | floor [PR #331 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/331); −10 [PR #331, a first contribution, changed 1678 production lines in apps/time with 319 test lines (0.19): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb); −5 [catalogue churn 117 lines, above 2× its median of 3 over the last 6 releases; PR #331 is the largest part (72 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-5ac631d07ba17484175dc6ba0ad0d55f257e801d4b1f2a88eb7941f90275f4a6); −5 [live churn 207 lines, above 2× its median of 2.5 over the last 6 releases; PR #331 is the largest part (164 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-d4f3beaa5f469d6d50fb9ca5300f2bb3ca5041d9716f0df65022760488fc9199); −5 [time churn 2003 lines, above 2× its median of 9.5 over the last 6 releases; PR #331 is the largest part (1757 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/331/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb) |
| [#313](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) | feat(ui): rebuild Tutors with the Paper design system | 11781 | 253 | 1 | 0.65 | **no** | yes (a fact) | **−15** | floor [PR #313 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/313); −10 [PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-3805a328d2572205ef2f52b7b2b8eb8164c3c1dc10b3c867d195122994548757); −5 [reader churn 2539 lines, above 2× its median of 98 over the last 6 releases; PR #313 is the largest part (2422 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-6e0d83696317a7dd434a0f962ec82a7debb04a718f3885992316f95ec9b82733) |
| [#276](https://github.com/tutors-sdk/tutors-mono-repo/pull/276) | fix(infra): consolidate .env to the repository root | 49 | 12 | 0 | 0.00 | **no** |  | **−10** | floor [PR #276 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/276); −10 [PR #276 changed 4 production lines in apps/catalogue with 0 test lines (0.00); 4 production lines in apps/live with 0 test lines (0.00); 4 production lines in apps/reader with 0 test lines (0.00); 4 production lines in apps/time with 0 test lines (0.00): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/276/files#diff-f59256a303b4024e8a8528f50c846374d823ee3e46c478100acfb0cb61cc4baf) |
| [#269](https://github.com/tutors-sdk/tutors-mono-repo/pull/269) | ci: make the three type-check steps blocking | 42 | 11 | 0 | 0.00 | **no** |  | **−10** | floor [PR #269 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/269); −10 [PR #269 changed 8 production lines in apps/reader with 0 test lines (0.00); 12 production lines in packages/jsr/model with 0 test lines (0.00): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/269/files#diff-eb38d340e5f8cf75f24da0f7604a5cfc8c2ad77ed33e1672c354a63f9322fe2c) |
| [#316](https://github.com/tutors-sdk/tutors-mono-repo/pull/316) | fix(whiteboard): load the scene, follow dark mode, match the Paper UI (supersedes #304) | 318 | 7 | 0 | 0.15 | **no** |  | **−10** | floor [PR #316 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/316); −10 [PR #316 changed 167 production lines in packages/svelte/ui-components with 25 test lines (0.15): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/316/files#diff-df9fd1dd4556d3b501ea96a8bfc85aeae703e79866841d36fa27aab651c128d6) |
| [#330](https://github.com/tutors-sdk/tutors-mono-repo/pull/330) | tutors-sdk/codex/course-shell-mobile-header | 197 | 20 | 0 | 0.37 | **no** | yes (a fact) | **−10** | floor [PR #330 was merged with no approving review](https://github.com/tutors-sdk/tutors-mono-repo/pull/330); −10 [PR #330, a first contribution, changed 100 production lines in packages/svelte/ui-navigators with 11 test lines (0.11): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/330/files#diff-d9959693589250e82da1747e0d059c0b1d7215ba4f64d1c3f3e9d73e3321ed90) |
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

- churn: reader 2539 (median 98) ABOVE 2×, catalogue 117 (median 3) ABOVE 2×, live 207 (median 2.5) ABOVE 2×, time 2003 (median 9.5) ABOVE 2×
- hotspots: 1 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte
- ownership: no file with 3+ authors
- orphans: diffs not measured (CHANGELOG.md at 185e87f12d34e0e6d7a16714c29aa08bde629639 has no "### v185e87f12d34e0e6d7a16714c29aa08bde629639" entries under a product section, and no --changelog (pnpm release:changelog --json) was given); entries not measured (CHANGELOG.md at 185e87f12d34e0e6d7a16714c29aa08bde629639 has no "### v185e87f12d34e0e6d7a16714c29aa08bde629639" entries under a product section)
- tests: apps/catalogue 54.45, apps/live 25.57, apps/reader 3.28, apps/time 2.14, packages/jsr/create 28.80, packages/jsr/gen 3.84, packages/jsr/model 11.22, packages/jsr/time 10.65, packages/jsr/tutors 72.00, packages/jsr/tutors-lite 72.00, packages/svelte/community 28.67, packages/svelte/connect 25.50, packages/svelte/course 25.36, packages/svelte/runes 109.42, packages/svelte/themes 5.98, packages/svelte/ui-components 1.94, packages/svelte/ui-navigators 2.10, packages/svelte/ui-primitives 6.64, packages/svelte/utils 2.41
- reviews: 0 approved, 58 not; 2 commit(s) straight to main: 96e9e4d, 8582ef2
- dependencies: no major bump; 2 new direct dependencies (@amiceli/vitest-cucumber, jheat.js)

Not measured: orphan diffs (a diff with no changelog entry) (CHANGELOG.md at 185e87f12d34e0e6d7a16714c29aa08bde629639 has no "### v185e87f12d34e0e6d7a16714c29aa08bde629639" entries under a product section, and no --changelog (pnpm release:changelog --json) was given); orphan entries (a changelog entry with no diff) (CHANGELOG.md at 185e87f12d34e0e6d7a16714c29aa08bde629639 has no "### v185e87f12d34e0e6d7a16714c29aa08bde629639" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-09-28T08:59:53.429Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.2` | `quay.io/tutors-sdk/tutors-reader:sha-185e87f` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` | `quay.io/tutors-sdk/tutors-catalogue:sha-185e87f` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.2` | `quay.io/tutors-sdk/tutors-live:sha-185e87f` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.2` | `quay.io/tutors-sdk/tutors-time:sha-185e87f` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` | `sha256:970a356acfdffffe80d318f5476b51ef71ffd174b551e4dbc672deeef22bf623` · rev `185e87f12d34` · version `sha-185e87f` |
| catalogue image | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` | `sha256:ef345ed63a1882abebfade6f28ef06bf8e1e99876957b76efe8d464faa6d82df` · rev `185e87f12d34` · version `sha-185e87f` |
| live image | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` | `sha256:aec7d6db4af50545b559d44920089e4a16e3779d3a72febd859663bdc7eb0cda` · rev `185e87f12d34` · version `sha-185e87f` |
| time image | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` | `sha256:eefab5df8ffb855853b3df328ec5ffc7dede69ef34e36203b45360601e64f6e4` · rev `185e87f12d34` · version `sha-185e87f` |

- 893 unclaimed diff(s)
- 4 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean at 2026-09-28T08:49:05.584Z

### Unclaimed differences (893)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+47 −26 lines at line 4) |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+6 −7 lines at line 36) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+32 −34 lines at line 4) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+6 −7 lines at line 47) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+45 −44 lines at line 4) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+6 −7 lines at line 59) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+45 −35 lines at line 2) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+17 −14 lines at line 62) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+45 −35 lines at line 2) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+19 −14 lines at line 54) |
| `dom` | `reader:search` | reader:search: semantic DOM differs (+83 −12 lines at line 4) |
| `dom` | `reader:search` | reader:search: semantic DOM differs (+6 −7 lines at line 24) |
| `dom` | `reader:search-results` | reader:search-results: semantic DOM differs (+53 −19 lines at line 4) |
| `dom` | `reader:search-results` | reader:search-results: semantic DOM differs (+6 −7 lines at line 31) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+26 −8 lines at line 4) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+6 −7 lines at line 17) |
| `dom` | `live:home` | live:home: semantic DOM differs (+25 −8 lines at line 4) |
| `dom` | `live:home` | live:home: semantic DOM differs (+6 −7 lines at line 22) |
| `dom` | `reader-auth:sign-in` | reader-auth:sign-in: semantic DOM differs (+25 −26 lines at line 1) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+39 −36 lines at line 4) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+6 −7 lines at line 49) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+52 −46 lines at line 4) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+6 −7 lines at line 61) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+79 −88 lines at line 4) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+6 −7 lines at line 118) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+46 −59 lines at line 4) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+55 −45 lines at line 74) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+6 −7 lines at line 143) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+61 −60 lines at line 2) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+17 −42 lines at line 85) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+44 −45 lines at line 2) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+1 −1 lines at line 63) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+14 −42 lines at line 152) |
| `screenshot` | `reader:home` | reader:home: 6.72% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:course` | reader:course: 8.38% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:topic` | reader:topic: 14.67% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:lab-step` | reader:lab-step: 12.63% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:lab-step-2` | reader:lab-step-2: 11.61% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:search` | reader:search: 8.79% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:search-results` | reader:search-results: 5.63% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `catalogue:home` | catalogue:home: 2.63% of pixels differ in 1280×776 at (0, 24) (threshold 0.10%) |
| `screenshot` | `live:home` | live:home: 2.88% of pixels differ in 1280×776 at (0, 24) (threshold 0.10%) |
| `screenshot` | `reader-auth:sign-in` | reader-auth:sign-in: 10.80% of pixels differ in 996×776 at (142, 24) (threshold 0.10%) |
| `screenshot` | `reader-auth:course` | reader-auth:course: 7.90% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader-auth:topic` | reader-auth:topic: 14.69% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:course` | reference:course: 15.01% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:topic` | reference:topic: 20.80% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:lab` | reference:lab: 16.59% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:note` | reference:note: 32.70% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 29× on b |
| `network` | `GET /logo.svg` | reader:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 38× on b |
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
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:search: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 38× on b |
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
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader-auth:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 38× on b |
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
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 34× on a, 39× on b |
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
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:note: GET /_app/immutable/chunks/{{hash}}.js requested 31× on a, 35× on b |
| `network` | `GET {{course}}/course.png` | reference:note: new request on b: GET {{course}}/course.png |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reference:note: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `headers` | `reader:home/link` | reader:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/4.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/23.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/23.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/4.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/23.{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader:course/link` | reader:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `catalogue:home/link` | catalogue:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/2.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `live:home/link` | live:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/2.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader-auth:sign-in/link` | reader-auth:sign-in: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SigninWithGithub.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/6.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/6.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader-auth:course/link` | reader-auth:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reference:course/link` | reference:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reference:note/link` | reference:note: header link changed: <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Context.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
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
| `sbom` | `reader/@isaacs/cliui` | reader: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `reader/@isaacs/fs-minipass` | reader: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `reader/@isaacs/string-locale-compare` | reader: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `reader/@npmcli/agent` | reader: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `reader/@npmcli/arborist` | reader: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `reader/@npmcli/config` | reader: package removed: @npmcli/config@9.0.0 |
| `sbom` | `reader/@npmcli/fs` | reader: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `reader/@npmcli/git` | reader: package removed: @npmcli/git@6.0.3 |
| `sbom` | `reader/@npmcli/installed-package-contents` | reader: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `reader/@npmcli/map-workspaces` | reader: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `reader/@npmcli/metavuln-calculator` | reader: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `reader/@npmcli/name-from-folder` | reader: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `reader/@npmcli/node-gyp` | reader: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `reader/@npmcli/package-json` | reader: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `reader/@npmcli/promise-spawn` | reader: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `reader/@npmcli/query` | reader: package removed: @npmcli/query@4.0.1 |
| `sbom` | `reader/@npmcli/redact` | reader: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `reader/@npmcli/run-script` | reader: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `reader/@pkgjs/parseargs` | reader: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `reader/@sigstore/bundle` | reader: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `reader/@sigstore/core` | reader: package removed: @sigstore/core@2.0.0 |
| `sbom` | `reader/@sigstore/protobuf-specs` | reader: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `reader/@sigstore/sign` | reader: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `reader/@sigstore/tuf` | reader: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `reader/@sigstore/verify` | reader: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `reader/@tufjs/canonical-json` | reader: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `reader/@tufjs/models` | reader: package removed: @tufjs/models@3.0.1 |
| `sbom` | `reader/abbrev` | reader: package removed: abbrev@3.0.1 |
| `sbom` | `reader/agent-base` | reader: package removed: agent-base@7.1.4 |
| `sbom` | `reader/ansi-regex` | reader: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `reader/ansi-styles` | reader: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `reader/aproba` | reader: package removed: aproba@2.1.0 |
| `sbom` | `reader/archy` | reader: package removed: archy@1.0.0 |
| `sbom` | `reader/balanced-match` | reader: package removed: balanced-match@1.0.2 |
| `sbom` | `reader/bin-links` | reader: package removed: bin-links@5.0.0 |
| `sbom` | `reader/binary-extensions` | reader: package removed: binary-extensions@2.3.0 |
| `sbom` | `reader/brace-expansion` | reader: package removed: brace-expansion@2.0.2 |
| `sbom` | `reader/cacache` | reader: package removed: cacache@19.0.1 |
| `sbom` | `reader/chalk` | reader: package removed: chalk@5.6.2 |
| `sbom` | `reader/chownr` | reader: package removed: chownr@3.0.0 |
| `sbom` | `reader/ci-info` | reader: package removed: ci-info@4.4.0 |
| `sbom` | `reader/cidr-regex` | reader: package removed: cidr-regex@4.1.3 |
| `sbom` | `reader/cli-columns` | reader: package removed: cli-columns@4.0.0 |
| `sbom` | `reader/cmd-shim` | reader: package removed: cmd-shim@7.0.0 |
| `sbom` | `reader/color-convert` | reader: package removed: color-convert@2.0.1 |
| `sbom` | `reader/color-name` | reader: package removed: color-name@1.1.4 |
| `sbom` | `reader/common-ancestor-path` | reader: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `reader/corepack` | reader: package removed: corepack@0.34.6 |
| `sbom` | `reader/cross-spawn` | reader: package removed: cross-spawn@7.0.6 |
| `sbom` | `reader/cssesc` | reader: package removed: cssesc@3.0.0 |
| `sbom` | `reader/debug` | reader: package removed: debug@4.4.3 |
| `sbom` | `reader/diff` | reader: package removed: diff@5.2.2 |
| `sbom` | `reader/eastasianwidth` | reader: package removed: eastasianwidth@0.2.0 |
| `sbom` | `reader/emoji-regex` | reader: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `reader/encoding` | reader: package removed: encoding@0.1.13 |
| `sbom` | `reader/env-paths` | reader: package removed: env-paths@2.2.1 |
| `sbom` | `reader/err-code` | reader: package removed: err-code@2.0.3 |
| `sbom` | `reader/exponential-backoff` | reader: package removed: exponential-backoff@3.1.3 |
| `sbom` | `reader/fastest-levenshtein` | reader: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `reader/fdir` | reader: package removed: fdir@6.5.0 |
| `sbom` | `reader/foreground-child` | reader: package removed: foreground-child@3.3.1 |
| `sbom` | `reader/fs-minipass` | reader: package removed: fs-minipass@3.0.3 |
| `sbom` | `reader/glob` | reader: package removed: glob@10.5.0 |
| `sbom` | `reader/graceful-fs` | reader: package removed: graceful-fs@4.2.11 |
| `sbom` | `reader/hosted-git-info` | reader: package removed: hosted-git-info@8.1.0 |
| `sbom` | `reader/http-cache-semantics` | reader: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `reader/http-proxy-agent` | reader: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `reader/https-proxy-agent` | reader: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `reader/iconv-lite` | reader: package removed: iconv-lite@0.6.3 |
| `sbom` | `reader/ignore-walk` | reader: package removed: ignore-walk@7.0.0 |
| `sbom` | `reader/imurmurhash` | reader: package removed: imurmurhash@0.1.4 |
| `sbom` | `reader/ini` | reader: package removed: ini@5.0.0 |
| `sbom` | `reader/init-package-json` | reader: package removed: init-package-json@7.0.2 |
| `sbom` | `reader/ip-address` | reader: package removed: ip-address@10.1.0 |
| `sbom` | `reader/ip-regex` | reader: package removed: ip-regex@5.0.0 |
| `sbom` | `reader/is-cidr` | reader: package removed: is-cidr@5.1.1 |
| `sbom` | `reader/is-fullwidth-code-point` | reader: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `reader/isexe` | reader: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `reader/jackspeak` | reader: package removed: jackspeak@3.4.3 |
| `sbom` | `reader/json-parse-even-better-errors` | reader: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `reader/json-stringify-nice` | reader: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `reader/jsonparse` | reader: package removed: jsonparse@1.3.1 |
| `sbom` | `reader/just-diff` | reader: package removed: just-diff@6.0.2 |
| `sbom` | `reader/just-diff-apply` | reader: package removed: just-diff-apply@5.5.0 |
| `sbom` | `reader/libnpmaccess` | reader: package removed: libnpmaccess@9.0.0 |
| `sbom` | `reader/libnpmdiff` | reader: package removed: libnpmdiff@7.0.5 |
| `sbom` | `reader/libnpmexec` | reader: package removed: libnpmexec@9.0.5 |
| `sbom` | `reader/libnpmfund` | reader: package removed: libnpmfund@6.0.5 |
| `sbom` | `reader/libnpmhook` | reader: package removed: libnpmhook@11.0.0 |
| `sbom` | `reader/libnpmorg` | reader: package removed: libnpmorg@7.0.0 |
| `sbom` | `reader/libnpmpack` | reader: package removed: libnpmpack@8.0.5 |
| `sbom` | `reader/libnpmpublish` | reader: package removed: libnpmpublish@10.0.2 |
| `sbom` | `reader/libnpmsearch` | reader: package removed: libnpmsearch@8.0.0 |
| `sbom` | `reader/libnpmteam` | reader: package removed: libnpmteam@7.0.0 |
| `sbom` | `reader/libnpmversion` | reader: package removed: libnpmversion@7.0.0 |
| `sbom` | `reader/lru-cache` | reader: package removed: lru-cache@10.4.3 |
| `sbom` | `reader/make-fetch-happen` | reader: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `reader/minimatch` | reader: package removed: minimatch@9.0.9 |
| `sbom` | `reader/minipass` | reader: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `reader/minipass-collect` | reader: package removed: minipass-collect@2.0.1 |
| `sbom` | `reader/minipass-fetch` | reader: package removed: minipass-fetch@4.0.1 |
| `sbom` | `reader/minipass-flush` | reader: package removed: minipass-flush@1.0.5 |
| `sbom` | `reader/minipass-pipeline` | reader: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `reader/minipass-sized` | reader: package removed: minipass-sized@1.0.3 |
| `sbom` | `reader/minizlib` | reader: package removed: minizlib@3.1.0 |
| `sbom` | `reader/ms` | reader: package removed: ms@2.1.3 |
| `sbom` | `reader/mute-stream` | reader: package removed: mute-stream@2.0.0 |
| `sbom` | `reader/negotiator` | reader: package removed: negotiator@1.0.0 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `reader/node-gyp` | reader: package removed: node-gyp@11.5.0 |
| `sbom` | `reader/nopt` | reader: package removed: nopt@8.1.0 |
| `sbom` | `reader/normalize-package-data` | reader: package removed: normalize-package-data@7.0.1 |
| `sbom` | `reader/npm` | reader: package removed: npm@10.9.8 |
| `sbom` | `reader/npm-audit-report` | reader: package removed: npm-audit-report@6.0.0 |
| `sbom` | `reader/npm-bundled` | reader: package removed: npm-bundled@4.0.0 |
| `sbom` | `reader/npm-install-checks` | reader: package removed: npm-install-checks@7.1.2 |
| `sbom` | `reader/npm-normalize-package-bin` | reader: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `reader/npm-package-arg` | reader: package removed: npm-package-arg@12.0.2 |
| `sbom` | `reader/npm-packlist` | reader: package removed: npm-packlist@9.0.0 |
| `sbom` | `reader/npm-pick-manifest` | reader: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `reader/npm-profile` | reader: package removed: npm-profile@11.0.1 |
| `sbom` | `reader/npm-registry-fetch` | reader: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `reader/npm-user-validate` | reader: package removed: npm-user-validate@3.0.0 |
| `sbom` | `reader/p-map` | reader: package removed: p-map@7.0.4 |
| `sbom` | `reader/package-json-from-dist` | reader: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `reader/pacote` | reader: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `reader/parse-conflict-json` | reader: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `reader/path-key` | reader: package removed: path-key@3.1.1 |
| `sbom` | `reader/path-scurry` | reader: package removed: path-scurry@1.11.1 |
| `sbom` | `reader/picomatch` | reader: package removed: picomatch@4.0.3 |
| `sbom` | `reader/postcss-selector-parser` | reader: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `reader/proc-log` | reader: package removed: proc-log@5.0.0 |
| `sbom` | `reader/proggy` | reader: package removed: proggy@3.0.0 |
| `sbom` | `reader/promise-all-reject-late` | reader: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `reader/promise-call-limit` | reader: package removed: promise-call-limit@3.0.2 |
| `sbom` | `reader/promise-retry` | reader: package removed: promise-retry@2.0.1 |
| `sbom` | `reader/promzard` | reader: package removed: promzard@2.0.0 |
| `sbom` | `reader/qrcode-terminal` | reader: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `reader/read` | reader: package removed: read@4.1.0 |
| `sbom` | `reader/read-cmd-shim` | reader: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `reader/read-package-json-fast` | reader: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `reader/retry` | reader: package removed: retry@0.12.0 |
| `sbom` | `reader/safer-buffer` | reader: package removed: safer-buffer@2.1.2 |
| `sbom` | `reader/semver` | reader: package removed: semver@7.7.4 |
| `sbom` | `reader/shebang-command` | reader: package removed: shebang-command@2.0.0 |
| `sbom` | `reader/shebang-regex` | reader: package removed: shebang-regex@3.0.0 |
| `sbom` | `reader/signal-exit` | reader: package removed: signal-exit@4.1.0 |
| `sbom` | `reader/sigstore` | reader: package removed: sigstore@3.1.0 |
| `sbom` | `reader/smart-buffer` | reader: package removed: smart-buffer@4.2.0 |
| `sbom` | `reader/socks` | reader: package removed: socks@2.8.7 |
| `sbom` | `reader/socks-proxy-agent` | reader: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `reader/spdx-correct` | reader: package removed: spdx-correct@3.2.0 |
| `sbom` | `reader/spdx-exceptions` | reader: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `reader/spdx-expression-parse` | reader: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `reader/spdx-license-ids` | reader: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `reader/ssri` | reader: package removed: ssri@12.0.0 |
| `sbom` | `reader/string-width` | reader: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `reader/strip-ansi` | reader: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `reader/supports-color` | reader: package removed: supports-color@9.4.0 |
| `sbom` | `reader/tar` | reader: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `reader/text-table` | reader: package removed: text-table@0.2.0 |
| `sbom` | `reader/tiny-relative-date` | reader: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `reader/tinyglobby` | reader: package removed: tinyglobby@0.2.15 |
| `sbom` | `reader/treeverse` | reader: package removed: treeverse@3.0.0 |
| `sbom` | `reader/tuf-js` | reader: package removed: tuf-js@3.1.0 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `reader/unique-filename` | reader: package removed: unique-filename@4.0.0 |
| `sbom` | `reader/unique-slug` | reader: package removed: unique-slug@5.0.0 |
| `sbom` | `reader/util-deprecate` | reader: package removed: util-deprecate@1.0.2 |
| `sbom` | `reader/validate-npm-package-license` | reader: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `reader/validate-npm-package-name` | reader: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `reader/walk-up-path` | reader: package removed: walk-up-path@3.0.1 |
| `sbom` | `reader/which` | reader: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `reader/wrap-ansi` | reader: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `reader/write-file-atomic` | reader: package removed: write-file-atomic@6.0.0 |
| `sbom` | `reader/yallist` | reader: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `reader/yarn` | reader: package removed: yarn@1.22.22 |
| `image-manifest` | `catalogue/layers` | catalogue: 9 layer(s) on a, 10 on b |
| `image-manifest` | `catalogue/label/org.opencontainers.image.vendor` | catalogue: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `catalogue/@isaacs/cliui` | catalogue: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `catalogue/@isaacs/fs-minipass` | catalogue: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `catalogue/@isaacs/string-locale-compare` | catalogue: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `catalogue/@npmcli/agent` | catalogue: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `catalogue/@npmcli/arborist` | catalogue: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `catalogue/@npmcli/config` | catalogue: package removed: @npmcli/config@9.0.0 |
| `sbom` | `catalogue/@npmcli/fs` | catalogue: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `catalogue/@npmcli/git` | catalogue: package removed: @npmcli/git@6.0.3 |
| `sbom` | `catalogue/@npmcli/installed-package-contents` | catalogue: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `catalogue/@npmcli/map-workspaces` | catalogue: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `catalogue/@npmcli/metavuln-calculator` | catalogue: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `catalogue/@npmcli/name-from-folder` | catalogue: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `catalogue/@npmcli/node-gyp` | catalogue: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `catalogue/@npmcli/package-json` | catalogue: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `catalogue/@npmcli/promise-spawn` | catalogue: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `catalogue/@npmcli/query` | catalogue: package removed: @npmcli/query@4.0.1 |
| `sbom` | `catalogue/@npmcli/redact` | catalogue: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `catalogue/@npmcli/run-script` | catalogue: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `catalogue/@pkgjs/parseargs` | catalogue: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `catalogue/@sigstore/bundle` | catalogue: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `catalogue/@sigstore/core` | catalogue: package removed: @sigstore/core@2.0.0 |
| `sbom` | `catalogue/@sigstore/protobuf-specs` | catalogue: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `catalogue/@sigstore/sign` | catalogue: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `catalogue/@sigstore/tuf` | catalogue: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `catalogue/@sigstore/verify` | catalogue: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `catalogue/@tufjs/canonical-json` | catalogue: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `catalogue/@tufjs/models` | catalogue: package removed: @tufjs/models@3.0.1 |
| `sbom` | `catalogue/abbrev` | catalogue: package removed: abbrev@3.0.1 |
| `sbom` | `catalogue/agent-base` | catalogue: package removed: agent-base@7.1.4 |
| `sbom` | `catalogue/ansi-regex` | catalogue: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `catalogue/ansi-styles` | catalogue: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `catalogue/aproba` | catalogue: package removed: aproba@2.1.0 |
| `sbom` | `catalogue/archy` | catalogue: package removed: archy@1.0.0 |
| `sbom` | `catalogue/balanced-match` | catalogue: package removed: balanced-match@1.0.2 |
| `sbom` | `catalogue/bin-links` | catalogue: package removed: bin-links@5.0.0 |
| `sbom` | `catalogue/binary-extensions` | catalogue: package removed: binary-extensions@2.3.0 |
| `sbom` | `catalogue/brace-expansion` | catalogue: package removed: brace-expansion@2.0.2 |
| `sbom` | `catalogue/cacache` | catalogue: package removed: cacache@19.0.1 |
| `sbom` | `catalogue/chalk` | catalogue: package removed: chalk@5.6.2 |
| `sbom` | `catalogue/chownr` | catalogue: package removed: chownr@3.0.0 |
| `sbom` | `catalogue/ci-info` | catalogue: package removed: ci-info@4.4.0 |
| `sbom` | `catalogue/cidr-regex` | catalogue: package removed: cidr-regex@4.1.3 |
| `sbom` | `catalogue/cli-columns` | catalogue: package removed: cli-columns@4.0.0 |
| `sbom` | `catalogue/cmd-shim` | catalogue: package removed: cmd-shim@7.0.0 |
| `sbom` | `catalogue/color-convert` | catalogue: package removed: color-convert@2.0.1 |
| `sbom` | `catalogue/color-name` | catalogue: package removed: color-name@1.1.4 |
| `sbom` | `catalogue/common-ancestor-path` | catalogue: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `catalogue/corepack` | catalogue: package removed: corepack@0.34.6 |
| `sbom` | `catalogue/cross-spawn` | catalogue: package removed: cross-spawn@7.0.6 |
| `sbom` | `catalogue/cssesc` | catalogue: package removed: cssesc@3.0.0 |
| `sbom` | `catalogue/debug` | catalogue: package removed: debug@4.4.3 |
| `sbom` | `catalogue/diff` | catalogue: package removed: diff@5.2.2 |
| `sbom` | `catalogue/eastasianwidth` | catalogue: package removed: eastasianwidth@0.2.0 |
| `sbom` | `catalogue/emoji-regex` | catalogue: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `catalogue/encoding` | catalogue: package removed: encoding@0.1.13 |
| `sbom` | `catalogue/env-paths` | catalogue: package removed: env-paths@2.2.1 |
| `sbom` | `catalogue/err-code` | catalogue: package removed: err-code@2.0.3 |
| `sbom` | `catalogue/exponential-backoff` | catalogue: package removed: exponential-backoff@3.1.3 |
| `sbom` | `catalogue/fastest-levenshtein` | catalogue: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `catalogue/fdir` | catalogue: package removed: fdir@6.5.0 |
| `sbom` | `catalogue/foreground-child` | catalogue: package removed: foreground-child@3.3.1 |
| `sbom` | `catalogue/fs-minipass` | catalogue: package removed: fs-minipass@3.0.3 |
| `sbom` | `catalogue/glob` | catalogue: package removed: glob@10.5.0 |
| `sbom` | `catalogue/graceful-fs` | catalogue: package removed: graceful-fs@4.2.11 |
| `sbom` | `catalogue/hosted-git-info` | catalogue: package removed: hosted-git-info@8.1.0 |
| `sbom` | `catalogue/http-cache-semantics` | catalogue: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `catalogue/http-proxy-agent` | catalogue: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `catalogue/https-proxy-agent` | catalogue: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `catalogue/iconv-lite` | catalogue: package removed: iconv-lite@0.6.3 |
| `sbom` | `catalogue/ignore-walk` | catalogue: package removed: ignore-walk@7.0.0 |
| `sbom` | `catalogue/imurmurhash` | catalogue: package removed: imurmurhash@0.1.4 |
| `sbom` | `catalogue/ini` | catalogue: package removed: ini@5.0.0 |
| `sbom` | `catalogue/init-package-json` | catalogue: package removed: init-package-json@7.0.2 |
| `sbom` | `catalogue/ip-address` | catalogue: package removed: ip-address@10.1.0 |
| `sbom` | `catalogue/ip-regex` | catalogue: package removed: ip-regex@5.0.0 |
| `sbom` | `catalogue/is-cidr` | catalogue: package removed: is-cidr@5.1.1 |
| `sbom` | `catalogue/is-fullwidth-code-point` | catalogue: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `catalogue/isexe` | catalogue: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `catalogue/jackspeak` | catalogue: package removed: jackspeak@3.4.3 |
| `sbom` | `catalogue/json-parse-even-better-errors` | catalogue: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `catalogue/json-stringify-nice` | catalogue: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `catalogue/jsonparse` | catalogue: package removed: jsonparse@1.3.1 |
| `sbom` | `catalogue/just-diff` | catalogue: package removed: just-diff@6.0.2 |
| `sbom` | `catalogue/just-diff-apply` | catalogue: package removed: just-diff-apply@5.5.0 |
| `sbom` | `catalogue/libnpmaccess` | catalogue: package removed: libnpmaccess@9.0.0 |
| `sbom` | `catalogue/libnpmdiff` | catalogue: package removed: libnpmdiff@7.0.5 |
| `sbom` | `catalogue/libnpmexec` | catalogue: package removed: libnpmexec@9.0.5 |
| `sbom` | `catalogue/libnpmfund` | catalogue: package removed: libnpmfund@6.0.5 |
| `sbom` | `catalogue/libnpmhook` | catalogue: package removed: libnpmhook@11.0.0 |
| `sbom` | `catalogue/libnpmorg` | catalogue: package removed: libnpmorg@7.0.0 |
| `sbom` | `catalogue/libnpmpack` | catalogue: package removed: libnpmpack@8.0.5 |
| `sbom` | `catalogue/libnpmpublish` | catalogue: package removed: libnpmpublish@10.0.2 |
| `sbom` | `catalogue/libnpmsearch` | catalogue: package removed: libnpmsearch@8.0.0 |
| `sbom` | `catalogue/libnpmteam` | catalogue: package removed: libnpmteam@7.0.0 |
| `sbom` | `catalogue/libnpmversion` | catalogue: package removed: libnpmversion@7.0.0 |
| `sbom` | `catalogue/lru-cache` | catalogue: package removed: lru-cache@10.4.3 |
| `sbom` | `catalogue/make-fetch-happen` | catalogue: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `catalogue/minimatch` | catalogue: package removed: minimatch@9.0.9 |
| `sbom` | `catalogue/minipass` | catalogue: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `catalogue/minipass-collect` | catalogue: package removed: minipass-collect@2.0.1 |
| `sbom` | `catalogue/minipass-fetch` | catalogue: package removed: minipass-fetch@4.0.1 |
| `sbom` | `catalogue/minipass-flush` | catalogue: package removed: minipass-flush@1.0.5 |
| `sbom` | `catalogue/minipass-pipeline` | catalogue: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `catalogue/minipass-sized` | catalogue: package removed: minipass-sized@1.0.3 |
| `sbom` | `catalogue/minizlib` | catalogue: package removed: minizlib@3.1.0 |
| `sbom` | `catalogue/ms` | catalogue: package removed: ms@2.1.3 |
| `sbom` | `catalogue/mute-stream` | catalogue: package removed: mute-stream@2.0.0 |
| `sbom` | `catalogue/negotiator` | catalogue: package removed: negotiator@1.0.0 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `catalogue/node-gyp` | catalogue: package removed: node-gyp@11.5.0 |
| `sbom` | `catalogue/nopt` | catalogue: package removed: nopt@8.1.0 |
| `sbom` | `catalogue/normalize-package-data` | catalogue: package removed: normalize-package-data@7.0.1 |
| `sbom` | `catalogue/npm` | catalogue: package removed: npm@10.9.8 |
| `sbom` | `catalogue/npm-audit-report` | catalogue: package removed: npm-audit-report@6.0.0 |
| `sbom` | `catalogue/npm-bundled` | catalogue: package removed: npm-bundled@4.0.0 |
| `sbom` | `catalogue/npm-install-checks` | catalogue: package removed: npm-install-checks@7.1.2 |
| `sbom` | `catalogue/npm-normalize-package-bin` | catalogue: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `catalogue/npm-package-arg` | catalogue: package removed: npm-package-arg@12.0.2 |
| `sbom` | `catalogue/npm-packlist` | catalogue: package removed: npm-packlist@9.0.0 |
| `sbom` | `catalogue/npm-pick-manifest` | catalogue: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `catalogue/npm-profile` | catalogue: package removed: npm-profile@11.0.1 |
| `sbom` | `catalogue/npm-registry-fetch` | catalogue: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `catalogue/npm-user-validate` | catalogue: package removed: npm-user-validate@3.0.0 |
| `sbom` | `catalogue/p-map` | catalogue: package removed: p-map@7.0.4 |
| `sbom` | `catalogue/package-json-from-dist` | catalogue: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `catalogue/pacote` | catalogue: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `catalogue/parse-conflict-json` | catalogue: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `catalogue/path-key` | catalogue: package removed: path-key@3.1.1 |
| `sbom` | `catalogue/path-scurry` | catalogue: package removed: path-scurry@1.11.1 |
| `sbom` | `catalogue/picomatch` | catalogue: package removed: picomatch@4.0.3 |
| `sbom` | `catalogue/postcss-selector-parser` | catalogue: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `catalogue/proc-log` | catalogue: package removed: proc-log@5.0.0 |
| `sbom` | `catalogue/proggy` | catalogue: package removed: proggy@3.0.0 |
| `sbom` | `catalogue/promise-all-reject-late` | catalogue: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `catalogue/promise-call-limit` | catalogue: package removed: promise-call-limit@3.0.2 |
| `sbom` | `catalogue/promise-retry` | catalogue: package removed: promise-retry@2.0.1 |
| `sbom` | `catalogue/promzard` | catalogue: package removed: promzard@2.0.0 |
| `sbom` | `catalogue/qrcode-terminal` | catalogue: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `catalogue/read` | catalogue: package removed: read@4.1.0 |
| `sbom` | `catalogue/read-cmd-shim` | catalogue: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `catalogue/read-package-json-fast` | catalogue: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `catalogue/retry` | catalogue: package removed: retry@0.12.0 |
| `sbom` | `catalogue/safer-buffer` | catalogue: package removed: safer-buffer@2.1.2 |
| `sbom` | `catalogue/semver` | catalogue: package removed: semver@7.7.4 |
| `sbom` | `catalogue/shebang-command` | catalogue: package removed: shebang-command@2.0.0 |
| `sbom` | `catalogue/shebang-regex` | catalogue: package removed: shebang-regex@3.0.0 |
| `sbom` | `catalogue/signal-exit` | catalogue: package removed: signal-exit@4.1.0 |
| `sbom` | `catalogue/sigstore` | catalogue: package removed: sigstore@3.1.0 |
| `sbom` | `catalogue/smart-buffer` | catalogue: package removed: smart-buffer@4.2.0 |
| `sbom` | `catalogue/socks` | catalogue: package removed: socks@2.8.7 |
| `sbom` | `catalogue/socks-proxy-agent` | catalogue: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `catalogue/spdx-correct` | catalogue: package removed: spdx-correct@3.2.0 |
| `sbom` | `catalogue/spdx-exceptions` | catalogue: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `catalogue/spdx-expression-parse` | catalogue: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `catalogue/spdx-license-ids` | catalogue: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `catalogue/ssri` | catalogue: package removed: ssri@12.0.0 |
| `sbom` | `catalogue/string-width` | catalogue: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `catalogue/strip-ansi` | catalogue: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `catalogue/supports-color` | catalogue: package removed: supports-color@9.4.0 |
| `sbom` | `catalogue/tar` | catalogue: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `catalogue/text-table` | catalogue: package removed: text-table@0.2.0 |
| `sbom` | `catalogue/tiny-relative-date` | catalogue: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `catalogue/tinyglobby` | catalogue: package removed: tinyglobby@0.2.15 |
| `sbom` | `catalogue/treeverse` | catalogue: package removed: treeverse@3.0.0 |
| `sbom` | `catalogue/tuf-js` | catalogue: package removed: tuf-js@3.1.0 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `catalogue/unique-filename` | catalogue: package removed: unique-filename@4.0.0 |
| `sbom` | `catalogue/unique-slug` | catalogue: package removed: unique-slug@5.0.0 |
| `sbom` | `catalogue/util-deprecate` | catalogue: package removed: util-deprecate@1.0.2 |
| `sbom` | `catalogue/validate-npm-package-license` | catalogue: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `catalogue/validate-npm-package-name` | catalogue: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `catalogue/walk-up-path` | catalogue: package removed: walk-up-path@3.0.1 |
| `sbom` | `catalogue/which` | catalogue: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `catalogue/wrap-ansi` | catalogue: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `catalogue/write-file-atomic` | catalogue: package removed: write-file-atomic@6.0.0 |
| `sbom` | `catalogue/yallist` | catalogue: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `catalogue/yarn` | catalogue: package removed: yarn@1.22.22 |
| `image-manifest` | `live/layers` | live: 9 layer(s) on a, 10 on b |
| `image-manifest` | `live/label/org.opencontainers.image.vendor` | live: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `live/@isaacs/cliui` | live: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `live/@isaacs/fs-minipass` | live: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `live/@isaacs/string-locale-compare` | live: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `live/@npmcli/agent` | live: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `live/@npmcli/arborist` | live: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `live/@npmcli/config` | live: package removed: @npmcli/config@9.0.0 |
| `sbom` | `live/@npmcli/fs` | live: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `live/@npmcli/git` | live: package removed: @npmcli/git@6.0.3 |
| `sbom` | `live/@npmcli/installed-package-contents` | live: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `live/@npmcli/map-workspaces` | live: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `live/@npmcli/metavuln-calculator` | live: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `live/@npmcli/name-from-folder` | live: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `live/@npmcli/node-gyp` | live: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `live/@npmcli/package-json` | live: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `live/@npmcli/promise-spawn` | live: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `live/@npmcli/query` | live: package removed: @npmcli/query@4.0.1 |
| `sbom` | `live/@npmcli/redact` | live: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `live/@npmcli/run-script` | live: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `live/@pkgjs/parseargs` | live: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `live/@sigstore/bundle` | live: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `live/@sigstore/core` | live: package removed: @sigstore/core@2.0.0 |
| `sbom` | `live/@sigstore/protobuf-specs` | live: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `live/@sigstore/sign` | live: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `live/@sigstore/tuf` | live: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `live/@sigstore/verify` | live: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `live/@tufjs/canonical-json` | live: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `live/@tufjs/models` | live: package removed: @tufjs/models@3.0.1 |
| `sbom` | `live/abbrev` | live: package removed: abbrev@3.0.1 |
| `sbom` | `live/agent-base` | live: package removed: agent-base@7.1.4 |
| `sbom` | `live/ansi-regex` | live: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `live/ansi-styles` | live: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `live/aproba` | live: package removed: aproba@2.1.0 |
| `sbom` | `live/archy` | live: package removed: archy@1.0.0 |
| `sbom` | `live/balanced-match` | live: package removed: balanced-match@1.0.2 |
| `sbom` | `live/bin-links` | live: package removed: bin-links@5.0.0 |
| `sbom` | `live/binary-extensions` | live: package removed: binary-extensions@2.3.0 |
| `sbom` | `live/brace-expansion` | live: package removed: brace-expansion@2.0.2 |
| `sbom` | `live/cacache` | live: package removed: cacache@19.0.1 |
| `sbom` | `live/chalk` | live: package removed: chalk@5.6.2 |
| `sbom` | `live/chownr` | live: package removed: chownr@3.0.0 |
| `sbom` | `live/ci-info` | live: package removed: ci-info@4.4.0 |
| `sbom` | `live/cidr-regex` | live: package removed: cidr-regex@4.1.3 |
| `sbom` | `live/cli-columns` | live: package removed: cli-columns@4.0.0 |
| `sbom` | `live/cmd-shim` | live: package removed: cmd-shim@7.0.0 |
| `sbom` | `live/color-convert` | live: package removed: color-convert@2.0.1 |
| `sbom` | `live/color-name` | live: package removed: color-name@1.1.4 |
| `sbom` | `live/common-ancestor-path` | live: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `live/corepack` | live: package removed: corepack@0.34.6 |
| `sbom` | `live/cross-spawn` | live: package removed: cross-spawn@7.0.6 |
| `sbom` | `live/cssesc` | live: package removed: cssesc@3.0.0 |
| `sbom` | `live/debug` | live: package removed: debug@4.4.3 |
| `sbom` | `live/diff` | live: package removed: diff@5.2.2 |
| `sbom` | `live/eastasianwidth` | live: package removed: eastasianwidth@0.2.0 |
| `sbom` | `live/emoji-regex` | live: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `live/encoding` | live: package removed: encoding@0.1.13 |
| `sbom` | `live/env-paths` | live: package removed: env-paths@2.2.1 |
| `sbom` | `live/err-code` | live: package removed: err-code@2.0.3 |
| `sbom` | `live/exponential-backoff` | live: package removed: exponential-backoff@3.1.3 |
| `sbom` | `live/fastest-levenshtein` | live: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `live/fdir` | live: package removed: fdir@6.5.0 |
| `sbom` | `live/foreground-child` | live: package removed: foreground-child@3.3.1 |
| `sbom` | `live/fs-minipass` | live: package removed: fs-minipass@3.0.3 |
| `sbom` | `live/glob` | live: package removed: glob@10.5.0 |
| `sbom` | `live/graceful-fs` | live: package removed: graceful-fs@4.2.11 |
| `sbom` | `live/hosted-git-info` | live: package removed: hosted-git-info@8.1.0 |
| `sbom` | `live/http-cache-semantics` | live: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `live/http-proxy-agent` | live: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `live/https-proxy-agent` | live: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `live/iconv-lite` | live: package removed: iconv-lite@0.6.3 |
| `sbom` | `live/ignore-walk` | live: package removed: ignore-walk@7.0.0 |
| `sbom` | `live/imurmurhash` | live: package removed: imurmurhash@0.1.4 |
| `sbom` | `live/ini` | live: package removed: ini@5.0.0 |
| `sbom` | `live/init-package-json` | live: package removed: init-package-json@7.0.2 |
| `sbom` | `live/ip-address` | live: package removed: ip-address@10.1.0 |
| `sbom` | `live/ip-regex` | live: package removed: ip-regex@5.0.0 |
| `sbom` | `live/is-cidr` | live: package removed: is-cidr@5.1.1 |
| `sbom` | `live/is-fullwidth-code-point` | live: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `live/isexe` | live: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `live/jackspeak` | live: package removed: jackspeak@3.4.3 |
| `sbom` | `live/json-parse-even-better-errors` | live: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `live/json-stringify-nice` | live: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `live/jsonparse` | live: package removed: jsonparse@1.3.1 |
| `sbom` | `live/just-diff` | live: package removed: just-diff@6.0.2 |
| `sbom` | `live/just-diff-apply` | live: package removed: just-diff-apply@5.5.0 |
| `sbom` | `live/libnpmaccess` | live: package removed: libnpmaccess@9.0.0 |
| `sbom` | `live/libnpmdiff` | live: package removed: libnpmdiff@7.0.5 |
| `sbom` | `live/libnpmexec` | live: package removed: libnpmexec@9.0.5 |
| `sbom` | `live/libnpmfund` | live: package removed: libnpmfund@6.0.5 |
| `sbom` | `live/libnpmhook` | live: package removed: libnpmhook@11.0.0 |
| `sbom` | `live/libnpmorg` | live: package removed: libnpmorg@7.0.0 |
| `sbom` | `live/libnpmpack` | live: package removed: libnpmpack@8.0.5 |
| `sbom` | `live/libnpmpublish` | live: package removed: libnpmpublish@10.0.2 |
| `sbom` | `live/libnpmsearch` | live: package removed: libnpmsearch@8.0.0 |
| `sbom` | `live/libnpmteam` | live: package removed: libnpmteam@7.0.0 |
| `sbom` | `live/libnpmversion` | live: package removed: libnpmversion@7.0.0 |
| `sbom` | `live/lru-cache` | live: package removed: lru-cache@10.4.3 |
| `sbom` | `live/make-fetch-happen` | live: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `live/minimatch` | live: package removed: minimatch@9.0.9 |
| `sbom` | `live/minipass` | live: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `live/minipass-collect` | live: package removed: minipass-collect@2.0.1 |
| `sbom` | `live/minipass-fetch` | live: package removed: minipass-fetch@4.0.1 |
| `sbom` | `live/minipass-flush` | live: package removed: minipass-flush@1.0.5 |
| `sbom` | `live/minipass-pipeline` | live: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `live/minipass-sized` | live: package removed: minipass-sized@1.0.3 |
| `sbom` | `live/minizlib` | live: package removed: minizlib@3.1.0 |
| `sbom` | `live/ms` | live: package removed: ms@2.1.3 |
| `sbom` | `live/mute-stream` | live: package removed: mute-stream@2.0.0 |
| `sbom` | `live/negotiator` | live: package removed: negotiator@1.0.0 |
| `sbom` | `live/node` | live: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `live/node-gyp` | live: package removed: node-gyp@11.5.0 |
| `sbom` | `live/nopt` | live: package removed: nopt@8.1.0 |
| `sbom` | `live/normalize-package-data` | live: package removed: normalize-package-data@7.0.1 |
| `sbom` | `live/npm` | live: package removed: npm@10.9.8 |
| `sbom` | `live/npm-audit-report` | live: package removed: npm-audit-report@6.0.0 |
| `sbom` | `live/npm-bundled` | live: package removed: npm-bundled@4.0.0 |
| `sbom` | `live/npm-install-checks` | live: package removed: npm-install-checks@7.1.2 |
| `sbom` | `live/npm-normalize-package-bin` | live: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `live/npm-package-arg` | live: package removed: npm-package-arg@12.0.2 |
| `sbom` | `live/npm-packlist` | live: package removed: npm-packlist@9.0.0 |
| `sbom` | `live/npm-pick-manifest` | live: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `live/npm-profile` | live: package removed: npm-profile@11.0.1 |
| `sbom` | `live/npm-registry-fetch` | live: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `live/npm-user-validate` | live: package removed: npm-user-validate@3.0.0 |
| `sbom` | `live/p-map` | live: package removed: p-map@7.0.4 |
| `sbom` | `live/package-json-from-dist` | live: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `live/pacote` | live: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `live/parse-conflict-json` | live: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `live/path-key` | live: package removed: path-key@3.1.1 |
| `sbom` | `live/path-scurry` | live: package removed: path-scurry@1.11.1 |
| `sbom` | `live/picomatch` | live: package removed: picomatch@4.0.3 |
| `sbom` | `live/postcss-selector-parser` | live: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `live/proc-log` | live: package removed: proc-log@5.0.0 |
| `sbom` | `live/proggy` | live: package removed: proggy@3.0.0 |
| `sbom` | `live/promise-all-reject-late` | live: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `live/promise-call-limit` | live: package removed: promise-call-limit@3.0.2 |
| `sbom` | `live/promise-retry` | live: package removed: promise-retry@2.0.1 |
| `sbom` | `live/promzard` | live: package removed: promzard@2.0.0 |
| `sbom` | `live/qrcode-terminal` | live: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `live/read` | live: package removed: read@4.1.0 |
| `sbom` | `live/read-cmd-shim` | live: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `live/read-package-json-fast` | live: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `live/retry` | live: package removed: retry@0.12.0 |
| `sbom` | `live/safer-buffer` | live: package removed: safer-buffer@2.1.2 |
| `sbom` | `live/semver` | live: package removed: semver@7.7.4 |
| `sbom` | `live/shebang-command` | live: package removed: shebang-command@2.0.0 |
| `sbom` | `live/shebang-regex` | live: package removed: shebang-regex@3.0.0 |
| `sbom` | `live/signal-exit` | live: package removed: signal-exit@4.1.0 |
| `sbom` | `live/sigstore` | live: package removed: sigstore@3.1.0 |
| `sbom` | `live/smart-buffer` | live: package removed: smart-buffer@4.2.0 |
| `sbom` | `live/socks` | live: package removed: socks@2.8.7 |
| `sbom` | `live/socks-proxy-agent` | live: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `live/spdx-correct` | live: package removed: spdx-correct@3.2.0 |
| `sbom` | `live/spdx-exceptions` | live: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `live/spdx-expression-parse` | live: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `live/spdx-license-ids` | live: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `live/ssri` | live: package removed: ssri@12.0.0 |
| `sbom` | `live/string-width` | live: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `live/strip-ansi` | live: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `live/supports-color` | live: package removed: supports-color@9.4.0 |
| `sbom` | `live/tar` | live: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `live/text-table` | live: package removed: text-table@0.2.0 |
| `sbom` | `live/tiny-relative-date` | live: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `live/tinyglobby` | live: package removed: tinyglobby@0.2.15 |
| `sbom` | `live/treeverse` | live: package removed: treeverse@3.0.0 |
| `sbom` | `live/tuf-js` | live: package removed: tuf-js@3.1.0 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `live/unique-filename` | live: package removed: unique-filename@4.0.0 |
| `sbom` | `live/unique-slug` | live: package removed: unique-slug@5.0.0 |
| `sbom` | `live/util-deprecate` | live: package removed: util-deprecate@1.0.2 |
| `sbom` | `live/validate-npm-package-license` | live: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `live/validate-npm-package-name` | live: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `live/walk-up-path` | live: package removed: walk-up-path@3.0.1 |
| `sbom` | `live/which` | live: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `live/wrap-ansi` | live: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `live/write-file-atomic` | live: package removed: write-file-atomic@6.0.0 |
| `sbom` | `live/yallist` | live: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `live/yarn` | live: package removed: yarn@1.22.22 |
| `image-manifest` | `time/layers` | time: 9 layer(s) on a, 10 on b |
| `image-manifest` | `time/label/org.opencontainers.image.vendor` | time: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `time/@isaacs/cliui` | time: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `time/@isaacs/fs-minipass` | time: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `time/@isaacs/string-locale-compare` | time: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `time/@npmcli/agent` | time: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `time/@npmcli/arborist` | time: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `time/@npmcli/config` | time: package removed: @npmcli/config@9.0.0 |
| `sbom` | `time/@npmcli/fs` | time: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `time/@npmcli/git` | time: package removed: @npmcli/git@6.0.3 |
| `sbom` | `time/@npmcli/installed-package-contents` | time: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `time/@npmcli/map-workspaces` | time: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `time/@npmcli/metavuln-calculator` | time: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `time/@npmcli/name-from-folder` | time: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `time/@npmcli/node-gyp` | time: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `time/@npmcli/package-json` | time: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `time/@npmcli/promise-spawn` | time: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `time/@npmcli/query` | time: package removed: @npmcli/query@4.0.1 |
| `sbom` | `time/@npmcli/redact` | time: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `time/@npmcli/run-script` | time: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `time/@pkgjs/parseargs` | time: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `time/@sigstore/bundle` | time: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `time/@sigstore/core` | time: package removed: @sigstore/core@2.0.0 |
| `sbom` | `time/@sigstore/protobuf-specs` | time: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `time/@sigstore/sign` | time: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `time/@sigstore/tuf` | time: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `time/@sigstore/verify` | time: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `time/@tufjs/canonical-json` | time: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `time/@tufjs/models` | time: package removed: @tufjs/models@3.0.1 |
| `sbom` | `time/abbrev` | time: package removed: abbrev@3.0.1 |
| `sbom` | `time/agent-base` | time: package removed: agent-base@7.1.4 |
| `sbom` | `time/ansi-regex` | time: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `time/ansi-styles` | time: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `time/aproba` | time: package removed: aproba@2.1.0 |
| `sbom` | `time/archy` | time: package removed: archy@1.0.0 |
| `sbom` | `time/balanced-match` | time: package removed: balanced-match@1.0.2 |
| `sbom` | `time/bin-links` | time: package removed: bin-links@5.0.0 |
| `sbom` | `time/binary-extensions` | time: package removed: binary-extensions@2.3.0 |
| `sbom` | `time/brace-expansion` | time: package removed: brace-expansion@2.0.2 |
| `sbom` | `time/cacache` | time: package removed: cacache@19.0.1 |
| `sbom` | `time/chalk` | time: package removed: chalk@5.6.2 |
| `sbom` | `time/chownr` | time: package removed: chownr@3.0.0 |
| `sbom` | `time/ci-info` | time: package removed: ci-info@4.4.0 |
| `sbom` | `time/cidr-regex` | time: package removed: cidr-regex@4.1.3 |
| `sbom` | `time/cli-columns` | time: package removed: cli-columns@4.0.0 |
| `sbom` | `time/cmd-shim` | time: package removed: cmd-shim@7.0.0 |
| `sbom` | `time/color-convert` | time: package removed: color-convert@2.0.1 |
| `sbom` | `time/color-name` | time: package removed: color-name@1.1.4 |
| `sbom` | `time/common-ancestor-path` | time: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `time/corepack` | time: package removed: corepack@0.34.6 |
| `sbom` | `time/cross-spawn` | time: package removed: cross-spawn@7.0.6 |
| `sbom` | `time/cssesc` | time: package removed: cssesc@3.0.0 |
| `sbom` | `time/debug` | time: package removed: debug@4.4.3 |
| `sbom` | `time/diff` | time: package removed: diff@5.2.2 |
| `sbom` | `time/eastasianwidth` | time: package removed: eastasianwidth@0.2.0 |
| `sbom` | `time/emoji-regex` | time: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `time/encoding` | time: package removed: encoding@0.1.13 |
| `sbom` | `time/env-paths` | time: package removed: env-paths@2.2.1 |
| `sbom` | `time/err-code` | time: package removed: err-code@2.0.3 |
| `sbom` | `time/exponential-backoff` | time: package removed: exponential-backoff@3.1.3 |
| `sbom` | `time/fastest-levenshtein` | time: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `time/fdir` | time: package removed: fdir@6.5.0 |
| `sbom` | `time/foreground-child` | time: package removed: foreground-child@3.3.1 |
| `sbom` | `time/fs-minipass` | time: package removed: fs-minipass@3.0.3 |
| `sbom` | `time/glob` | time: package removed: glob@10.5.0 |
| `sbom` | `time/graceful-fs` | time: package removed: graceful-fs@4.2.11 |
| `sbom` | `time/hosted-git-info` | time: package removed: hosted-git-info@8.1.0 |
| `sbom` | `time/http-cache-semantics` | time: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `time/http-proxy-agent` | time: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `time/https-proxy-agent` | time: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `time/iconv-lite` | time: package removed: iconv-lite@0.6.3 |
| `sbom` | `time/ignore-walk` | time: package removed: ignore-walk@7.0.0 |
| `sbom` | `time/imurmurhash` | time: package removed: imurmurhash@0.1.4 |
| `sbom` | `time/ini` | time: package removed: ini@5.0.0 |
| `sbom` | `time/init-package-json` | time: package removed: init-package-json@7.0.2 |
| `sbom` | `time/ip-address` | time: package removed: ip-address@10.1.0 |
| `sbom` | `time/ip-regex` | time: package removed: ip-regex@5.0.0 |
| `sbom` | `time/is-cidr` | time: package removed: is-cidr@5.1.1 |
| `sbom` | `time/is-fullwidth-code-point` | time: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `time/isexe` | time: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `time/jackspeak` | time: package removed: jackspeak@3.4.3 |
| `sbom` | `time/json-parse-even-better-errors` | time: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `time/json-stringify-nice` | time: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `time/jsonparse` | time: package removed: jsonparse@1.3.1 |
| `sbom` | `time/just-diff` | time: package removed: just-diff@6.0.2 |
| `sbom` | `time/just-diff-apply` | time: package removed: just-diff-apply@5.5.0 |
| `sbom` | `time/libnpmaccess` | time: package removed: libnpmaccess@9.0.0 |
| `sbom` | `time/libnpmdiff` | time: package removed: libnpmdiff@7.0.5 |
| `sbom` | `time/libnpmexec` | time: package removed: libnpmexec@9.0.5 |
| `sbom` | `time/libnpmfund` | time: package removed: libnpmfund@6.0.5 |
| `sbom` | `time/libnpmhook` | time: package removed: libnpmhook@11.0.0 |
| `sbom` | `time/libnpmorg` | time: package removed: libnpmorg@7.0.0 |
| `sbom` | `time/libnpmpack` | time: package removed: libnpmpack@8.0.5 |
| `sbom` | `time/libnpmpublish` | time: package removed: libnpmpublish@10.0.2 |
| `sbom` | `time/libnpmsearch` | time: package removed: libnpmsearch@8.0.0 |
| `sbom` | `time/libnpmteam` | time: package removed: libnpmteam@7.0.0 |
| `sbom` | `time/libnpmversion` | time: package removed: libnpmversion@7.0.0 |
| `sbom` | `time/lru-cache` | time: package removed: lru-cache@10.4.3 |
| `sbom` | `time/make-fetch-happen` | time: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `time/minimatch` | time: package removed: minimatch@9.0.9 |
| `sbom` | `time/minipass` | time: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `time/minipass-collect` | time: package removed: minipass-collect@2.0.1 |
| `sbom` | `time/minipass-fetch` | time: package removed: minipass-fetch@4.0.1 |
| `sbom` | `time/minipass-flush` | time: package removed: minipass-flush@1.0.5 |
| `sbom` | `time/minipass-pipeline` | time: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `time/minipass-sized` | time: package removed: minipass-sized@1.0.3 |
| `sbom` | `time/minizlib` | time: package removed: minizlib@3.1.0 |
| `sbom` | `time/ms` | time: package removed: ms@2.1.3 |
| `sbom` | `time/mute-stream` | time: package removed: mute-stream@2.0.0 |
| `sbom` | `time/negotiator` | time: package removed: negotiator@1.0.0 |
| `sbom` | `time/node` | time: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `time/node-gyp` | time: package removed: node-gyp@11.5.0 |
| `sbom` | `time/nopt` | time: package removed: nopt@8.1.0 |
| `sbom` | `time/normalize-package-data` | time: package removed: normalize-package-data@7.0.1 |
| `sbom` | `time/npm` | time: package removed: npm@10.9.8 |
| `sbom` | `time/npm-audit-report` | time: package removed: npm-audit-report@6.0.0 |
| `sbom` | `time/npm-bundled` | time: package removed: npm-bundled@4.0.0 |
| `sbom` | `time/npm-install-checks` | time: package removed: npm-install-checks@7.1.2 |
| `sbom` | `time/npm-normalize-package-bin` | time: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `time/npm-package-arg` | time: package removed: npm-package-arg@12.0.2 |
| `sbom` | `time/npm-packlist` | time: package removed: npm-packlist@9.0.0 |
| `sbom` | `time/npm-pick-manifest` | time: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `time/npm-profile` | time: package removed: npm-profile@11.0.1 |
| `sbom` | `time/npm-registry-fetch` | time: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `time/npm-user-validate` | time: package removed: npm-user-validate@3.0.0 |
| `sbom` | `time/p-map` | time: package removed: p-map@7.0.4 |
| `sbom` | `time/package-json-from-dist` | time: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `time/pacote` | time: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `time/parse-conflict-json` | time: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `time/path-key` | time: package removed: path-key@3.1.1 |
| `sbom` | `time/path-scurry` | time: package removed: path-scurry@1.11.1 |
| `sbom` | `time/picomatch` | time: package removed: picomatch@4.0.3 |
| `sbom` | `time/postcss-selector-parser` | time: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `time/proc-log` | time: package removed: proc-log@5.0.0 |
| `sbom` | `time/proggy` | time: package removed: proggy@3.0.0 |
| `sbom` | `time/promise-all-reject-late` | time: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `time/promise-call-limit` | time: package removed: promise-call-limit@3.0.2 |
| `sbom` | `time/promise-retry` | time: package removed: promise-retry@2.0.1 |
| `sbom` | `time/promzard` | time: package removed: promzard@2.0.0 |
| `sbom` | `time/qrcode-terminal` | time: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `time/read` | time: package removed: read@4.1.0 |
| `sbom` | `time/read-cmd-shim` | time: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `time/read-package-json-fast` | time: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `time/retry` | time: package removed: retry@0.12.0 |
| `sbom` | `time/safer-buffer` | time: package removed: safer-buffer@2.1.2 |
| `sbom` | `time/semver` | time: package removed: semver@7.7.4 |
| `sbom` | `time/shebang-command` | time: package removed: shebang-command@2.0.0 |
| `sbom` | `time/shebang-regex` | time: package removed: shebang-regex@3.0.0 |
| `sbom` | `time/signal-exit` | time: package removed: signal-exit@4.1.0 |
| `sbom` | `time/sigstore` | time: package removed: sigstore@3.1.0 |
| `sbom` | `time/smart-buffer` | time: package removed: smart-buffer@4.2.0 |
| `sbom` | `time/socks` | time: package removed: socks@2.8.7 |
| `sbom` | `time/socks-proxy-agent` | time: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `time/spdx-correct` | time: package removed: spdx-correct@3.2.0 |
| `sbom` | `time/spdx-exceptions` | time: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `time/spdx-expression-parse` | time: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `time/spdx-license-ids` | time: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `time/ssri` | time: package removed: ssri@12.0.0 |
| `sbom` | `time/string-width` | time: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `time/strip-ansi` | time: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `time/supports-color` | time: package removed: supports-color@9.4.0 |
| `sbom` | `time/tar` | time: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `time/text-table` | time: package removed: text-table@0.2.0 |
| `sbom` | `time/tiny-relative-date` | time: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `time/tinyglobby` | time: package removed: tinyglobby@0.2.15 |
| `sbom` | `time/treeverse` | time: package removed: treeverse@3.0.0 |
| `sbom` | `time/tuf-js` | time: package removed: tuf-js@3.1.0 |
| `sbom` | `time/tzdata` | time: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `time/unique-filename` | time: package removed: unique-filename@4.0.0 |
| `sbom` | `time/unique-slug` | time: package removed: unique-slug@5.0.0 |
| `sbom` | `time/util-deprecate` | time: package removed: util-deprecate@1.0.2 |
| `sbom` | `time/validate-npm-package-license` | time: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `time/validate-npm-package-name` | time: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `time/walk-up-path` | time: package removed: walk-up-path@3.0.1 |
| `sbom` | `time/which` | time: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `time/wrap-ansi` | time: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `time/write-file-atomic` | time: package removed: write-file-atomic@6.0.0 |
| `sbom` | `time/yallist` | time: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `time/yarn` | time: package removed: yarn@1.22.22 |

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
+    - link "Tutors":
+      - /url: /
+      - img "Tutors"
+      - text: tutors
+    - link "My courses":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: /
+    - link "Catalogue ↗":
+      - /url: https://catalogue.tutors.dev
+    - link "Live ↗":
+      - /url: https://live.tutors.dev
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
-    - /url: https://catalogue.tutors.dev
-  - link "Live":
-    - /url
… (1229 more characters in report.json)
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
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
+  - navigation "Breadcru
… (1084 more characters in report.json)
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
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
-    - link "All notes in the course"
… (1859 more characters in report.json)
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - link "← Topic 1":
+      - /url: /topic/localhost:8080/unit-1/topic-01
+    - heading "Lab 1" [level=2]
+    - paragraph: Steps · 1 / 6
+    - list "Steps":
   
… (1618 more characters in report.json)
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
+  - navigation "Steps":
+    - link "Next → Step 1":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - link "← Topic 1":
+      - /url: /topic/localhost:8080/unit-1/topic-01
+    - heading "Lab 1" [level=2]
+    - paragraph: Steps · 2 / 6
+    - list "Steps":
   
… (1619 more characters in report.json)
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
+  - navigation "Steps":
+    - link "← Previous Lab 1":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Setup
+    - link "Next → Step 2":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-02
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
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
-- contentinfo "Site footer":
+  - button "All types" [pressed]
+  - button "topic"
+  - button "talk"
+  - button "lab"
+  - button "note"
+  - group: Resources
… (1965 more characters in report.json)
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
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
-    - 
… (1252 more characters in report.json)
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
-- contentinfo "Site footer":
+    - link "Tutors":
+      - /url: https://tutors.dev/
+      - img "Tutors"
+      - text: tutors
+    - link "Catalogue":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: https://tutors.dev/
+    - link "Catalogue":
+      - /url: /
+    - link "Live ↗":
+      - /url: https://live.tutors.dev
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
   - img "Tutors"
   - link "Tutors v:{{version}}":
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
+    - link "Tutors":
+      - /url: https://tutors.dev/
+      - img "Tutors"
+      - text: tutors
+    - link "Live":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: https://tutors.dev/
+    - link "Catalogue ↗":
+      - /url: https://catalogue.tutors.dev
+    - link "Live":
+      - /url: /
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
-- contentinfo "Site footer":
+  - tabpanel "Students (0)":
+    - paragraph: No students are sharing activity right now.
   - img "Tutors"
   - link "Tutors v:{{version}}":
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
+    - button "Open course info"
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Profile menu":
+      - img "Harness Student"
+- complementary "Course navigation":
+  - navigation "Course navigation":
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
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
-         
… (1381 more characters in report.json)
```

… and 46 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Claim hygiene

4 claim(s) cover 0 failing hunk(s): 0 hunk(s) per claim, at most 0 under one claim (flagged above 10).

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 291 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 287 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.35 ms | 2.18 ms |
| b | 601 | 0 | 0 | 1.4 ms | 2.03 ms |

<details><summary>Informational (93)</summary>

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
- `console` reference:course: console message gone on b
- `console` reference:lab: console message gone on b
- `console` reference:note: console message gone on b
- `axe` reader-auth:sign-in: axe violation fixed on b: color-contrast (serious)
- `axe` reader-auth:sign-in: axe violation fixed on b: document-title (serious)
- `axe` reference:course: axe violation fixed on b: nested-interactive (serious)
- `axe` reference:topic: axe violation fixed on b: nested-interactive (serious)
- `axe` reference:note: axe violation fixed on b: button-name (critical)
- `timing` journey catalogue-loads median 1422ms → 1771ms but not significant (p=0.676)
- `vulns` reader: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` live: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` live: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` time: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` time: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<details><summary>Stale claims (4)</summary>

- `axe` `reader-auth:sign-in` — Rule 0216: The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. — sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious)
- `axe` `reference:course` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313
- `axe` `reference:topic` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313
- `axe` `reference:note` — Rule 0036: The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. — code block copy buttons are named "Copy code" (button-name, critical) fixed by #313

</details>

<sub>harness 1.13.2 (184e2e582382, contract 1.13.1) · 2026-09-28T08:59:53.429Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1142, persistence-stub-requests×315, hashed-assets×6160, footer-tutors-version×279, transport-length×80, transport-connection×80, transport-keepalive×80</sub>


</details>
