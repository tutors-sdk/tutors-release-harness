## Release gate: sha-d3d7227 beside 17.0.0

**Gate: FAIL**

#### New since the last forecast

The first kept forecast beside `17.0.0`: nothing earlier to compare with.

#### Causes and the PRs behind them

4 causes, 4 with a PR named. Each is matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| network: GET {{asset}} requested #× on a, #× on b | 2 | [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct), [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) (1 file) and 3 more |
| network: new request on b: POST /api/live/activity | 2 | [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct), [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) (1 file) and 3 more |
| persistence: RPC realtime_claim_live_publish — # row(s) on a, # on b | 1 | [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct), [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) (1 file) and 3 more |
| timing: journey student-signs-in slower on b | 1 | [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (4 files), [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct) and 3 more |

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

#### Claims owed (4)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 6, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # network: GET {{asset}} requested #× on a, #× on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /_app/immutable/chunks/\\{\\{hash\\}\\}.js"
    rule: "????"
    reason: "GET {{asset}} requested #× on a, #× on b: 2 differences (reader; 2 pages; 1 name); likely #478, #481, #476"
  # network: new request on b: POST /api/live/activity: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "POST /api/live/activity"
    rule: "????"
    reason: "new request on b: POST /api/live/activity: 2 differences (reader; 2 pages); likely #478, #481, #476"
  # persistence: RPC realtime_claim_live_publish — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "student-signs-in/realtime_claim_live_publish"
    rule: "????"
    reason: "RPC realtime_claim_live_publish — # row(s) on a, # on b: 1 difference; likely #478, #481, #476"
  # timing: journey student-signs-in slower on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "timing"
    scope: "student-signs-in"
    rule: "????"
    reason: "journey student-signs-in slower on b: 1 difference (1 name); likely #483, #478, #481"
```

5 of 8 dimensions measured (weight 70 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** | **breached** | −20 unclaimed: network /course/localhost:8080: reader-auth:course: new request on b: POST /api/live/activity; −20 unclaimed: network /topic/localhost:8080/unit-1/topic-01: reader-auth:topic: new request on b: POST /api/live/activity; −20 unclaimed: network /course/reference-course: reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 43× on a, 44× on b; −20 unclaimed: network /note/reference-course/topic-07-reference/note-1: reference:note: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b; −20 unclaimed: timing student-signs-in: journey student-signs-in slower on b: median 4280ms → 22701ms (+430%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 58%) (and 1 more like it, not counted again: report.html#differences); −15 stale claim axe reader-auth:sign-in: matched nothing (sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious)); −15 stale claim axe reference:course: matched nothing (navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313); −15 stale claim axe reference:topic: matched nothing (navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313); −15 stale claim axe reference:note: matched nothing (code block copy buttons are named "Copy code" (button-name, critical) fixed by #313); −15 stale claim sbom */{@isaacs/cliui,@isaacs/fs-minipass,@isaacs/string-locale-compare,@npmcli/agent,@npmcli/arborist,@npmcli/config,@npmcli/fs,@npmcli/git,@npmcli/installed-package-contents,@npmcli/map-workspaces,@npmcli/metavuln-calculator,@npmcli/name-from-folder,@npmcli/node-gyp,@npmcli/package-json,@npmcli/promise-spawn,@npmcli/query,@npmcli/redact,@npmcli/run-script,@pkgjs/parseargs,@sigstore/bundle,@sigstore/core,@sigstore/protobuf-specs,@sigstore/sign,@sigstore/tuf,@sigstore/verify,@tufjs/canonical-json,@tufjs/models,abbrev,agent-base,ansi-regex,ansi-styles,aproba,archy,balanced-match,bin-links,binary-extensions,brace-expansion,cacache,chalk,chownr,ci-info,cidr-regex,cli-columns,cmd-shim,color-convert,color-name,common-ancestor-path,corepack,cross-spawn,cssesc,debug,diff,eastasianwidth,emoji-regex,encoding,env-paths,err-code,exponential-backoff,fastest-levenshtein,fdir,foreground-child,fs-minipass,glob,graceful-fs,hosted-git-info,http-cache-semantics,http-proxy-agent,https-proxy-agent,iconv-lite,ignore-walk,imurmurhash,ini,init-package-json,ip-address,ip-regex,is-cidr,is-fullwidth-code-point,isexe,jackspeak,json-parse-even-better-errors,json-stringify-nice,jsonparse,just-diff,just-diff-apply,libnpmaccess,libnpmdiff,libnpmexec,libnpmfund,libnpmhook,libnpmorg,libnpmpack,libnpmpublish,libnpmsearch,libnpmteam,libnpmversion,lru-cache,make-fetch-happen,minimatch,minipass,minipass-collect,minipass-fetch,minipass-flush,minipass-pipeline,minipass-sized,minizlib,ms,mute-stream,negotiator,node-gyp,nopt,normalize-package-data,npm,npm-audit-report,npm-bundled,npm-install-checks,npm-normalize-package-bin,npm-package-arg,npm-packlist,npm-pick-manifest,npm-profile,npm-registry-fetch,npm-user-validate,p-map,package-json-from-dist,pacote,parse-conflict-json,path-key,path-scurry,picomatch,postcss-selector-parser,proc-log,proggy,promise-all-reject-late,promise-call-limit,promise-retry,promzard,qrcode-terminal,read,read-cmd-shim,read-package-json-fast,retry,safer-buffer,semver,shebang-command,shebang-regex,signal-exit,sigstore,smart-buffer,socks,socks-proxy-agent,spdx-correct,spdx-exceptions,spdx-expression-parse,spdx-license-ids,ssri,string-width,strip-ansi,supports-color,text-table,tiny-relative-date,tinyglobby,treeverse,tuf-js,unique-filename,unique-slug,util-deprecate,validate-npm-package-license,validate-npm-package-name,walk-up-path,which,wrap-ansi,write-file-atomic,yallist,yarn}: matched nothing (runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature); −15 stale claim persistence */record_page_view: matched nothing (a page view is recorded against the learning object and the day's calendar in one request (#475)); −10 stale claim persistence */{learning_records,calendar,get_count_learning_records}: matched nothing (the per-table page-view requests are replaced by record_page_view (#475)) (and 36 more like it, not counted again) |
| Noise health | 15 | **85** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | not measured |  | quality.json has no mutation scores for 7c4028a (the monorepo's Nightly wrote no Stryker report) and no harness mutants |
| Requirements traceability | 10 | not measured |  | needs the changelog, the EARS files and the claims side by side: pass --traceability <json>; changes.json already reports 7 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry), a floor breach once it is measured |
| Change risk | 15 | **27** |  | −10 PR #476 changed Reader, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it; −10 PR #487 changed Reader, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 27 (100 − 73), v17.0.0..d3d72277634afc7370a4432eb3fdd64d57e5bf9a: 7 of 8 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under vd3d72277634afc7370a4432eb3fdd64d57e5bf9a names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| 1 more | no deductions: #485 | 79 | 3 |  |  |  |  | 0 |  |

- churn: reader 111 (median 101.5), catalogue 0 (median 7.5), live 0 (median 3.5), time 0 (median 14)
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts
- ownership: no file with 3+ authors
- orphans: 7 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at d3d72277634afc7370a4432eb3fdd64d57e5bf9a has no "### vd3d72277634afc7370a4432eb3fdd64d57e5bf9a" entries under a product section)
- tests: apps/reader 59.38, packages/jsr/realtime 2.32, packages/jsr/time 3.30, packages/svelte/community 4.02, packages/svelte/connect 650.00, packages/svelte/realtime-supabase 19.12
- reviews: 8 approved, 0 not
- dependencies: no major bump; 1 new direct dependency (@supabase/supabase-js)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at d3d72277634afc7370a4432eb3fdd64d57e5bf9a has no "### vd3d72277634afc7370a4432eb3fdd64d57e5bf9a" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-15T18:04:41.578Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-d3d7227` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-d3d7227` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-d3d7227` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-d3d7227` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:bc7ca09526ac59b2f936dd27a68ad7a9527cb8dc3be17ca41f8ec8c79c4c7abd` · rev `d3d72277634a` · version `sha-d3d7227` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:fbae335184067b5763c61c60b419c8a7293903f7a8eff6f85c0acf93b279bcf5` · rev `d3d72277634a` · version `sha-d3d7227` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:95666ae77a2816d74629566810ebcbeae8a3d7647140e449083fd8fac78a52bb` · rev `d3d72277634a` · version `sha-d3d7227` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:accb1ea9807d95df261cbd5244ecfd98a419903011d00d84f49eaccccd026236` · rev `d3d72277634a` · version `sha-d3d7227` |

- 6 unclaimed diff(s)
- 43 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean at 2026-10-15T17:50:33.391Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): clean. Reported, never gates.
- 24 of 24 claim(s) with a lifetime have expired; they still cover 0 failing difference(s), which would be unclaimed once claim lifetimes block (2.0). Informing: the verdict is unchanged.
  - `dom` `reader:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `screenshot` `reader:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `axe` `reader:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `dom` `live:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `screenshot` `live:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `axe` `live:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `dom` `catalogue:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `screenshot` `catalogue:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `axe` `catalogue:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `dom` `time:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `screenshot` `time:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `axe` `time:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `logs` `reader:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `logs` `live:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `logs` `catalogue:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `logs` `time:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `metrics` `reader:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `metrics` `live:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `metrics` `catalogue:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `metrics` `time:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `asset-graph` `reader:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `asset-graph` `live:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `asset-graph` `catalogue:*`: until 17.0.0, and production is already 17.0.0 (covers 0)
  - `asset-graph` `time:*`: until 17.0.0, and production is already 17.0.0 (covers 0)

### 6 unclaimed differences, 4 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `network` GET {{asset}} requested #× on a, #× on b (1 route: `GET /_app/immutable/chunks/{{hash}}.js`) | 2 | reader | 2: `reference:course`, `reference:note` | reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 43× on a, 44× on b |
| `network` new request on b: POST /api/live/activity | 2 | reader | 2: `reader-auth:course`, `reader-auth:topic` | reader-auth:course: new request on b: POST /api/live/activity |
| `persistence` RPC realtime_claim_live_publish — # row(s) on a, # on b | 1 | — | — | student-signs-in: RPC realtime_claim_live_publish — 0 row(s) on a, 2 on b |
| `timing` journey student-signs-in slower on b (1 name: `median 4280ms → 22701ms (+430%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 58%)`) | 1 | — | — | journey student-signs-in slower on b: median 4280ms → 22701ms (+430%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 58%) |

### Unclaimed differences (6)

| artefact | scope | what changed |
|---|---|---|
| `network` | `POST /api/live/activity` | reader-auth:course: new request on b: POST /api/live/activity |
| `network` | `POST /api/live/activity` | reader-auth:topic: new request on b: POST /api/live/activity |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 43× on a, 44× on b |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:note: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b |
| `timing` | `student-signs-in` | journey student-signs-in slower on b: median 4280ms → 22701ms (+430%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 58%) |
| `persistence` | `student-signs-in/realtime_claim_live_publish` | student-signs-in: RPC realtime_claim_live_publish — 0 row(s) on a, 2 on b |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (14; 14 unclaimed): reported, never gates

19 of 27 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on bc7ca09526ac (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on fbae33518406 (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 95666ae77a28 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on accb1ea9807d (production too) | no date set | unclaimed |
| `timing-tolerance` | `student-signs-in` | journey student-signs-in slower on b beyond the 10% tolerance: 4280ms → 22701ms (+430%, p=0.012, n=5/5 runs; smallest detectable about 58%); timing fails it too (its floor is 20%) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 62 → 62 immutable requests (JS 50 → 50, CSS 12 → 12), 564 KB → 565 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 542 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 96 → 96 immutable requests (JS 83 → 83, CSS 13 → 13), 1.0 MB → 1.0 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Claim hygiene

43 claim(s) cover 0 failing hunk(s): 0 hunk(s) per claim, at most 0 under one claim (flagged above 10).

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 308.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.19 ms | 1.95 ms |
| b | 600 | 0 | 0 | 1.3 ms | 1.9 ms |

<details><summary>Informational (36)</summary>

- `dom` journey "anonymous-student-reads-course" failed on a but completed on b (fixed)
- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.33 / b 0 per reader page (broadcasts a 4 / b 0, socket data frames a 0 / b 0, over 3 page view(s))
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on bc7ca09526ac (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on fbae33518406 (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 95666ae77a28 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on accb1ea9807d (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `timing-tolerance` journey student-signs-in slower on b beyond the 10% tolerance: 4280ms → 22701ms (+430%, p=0.012, n=5/5 runs; smallest detectable about 58%); timing fails it too (its floor is 20%)
- `asset-graph` reader: the asset graph changed: 62 → 62 immutable requests (JS 50 → 50, CSS 12 → 12), 564 KB → 565 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 542 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 96 → 96 immutable requests (JS 83 → 83, CSS 13 → 13), 1.0 MB → 1.0 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 600 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 600 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time
- `slo` reader-latency-tail: 100.0% of 62 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 600 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds

</details>

<details><summary>Stale claims (43)</summary>

- `axe` `reader-auth:sign-in` — Rule 0216: The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. — sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious)
- `axe` `reference:course` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313
- `axe` `reference:topic` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313
- `axe` `reference:note` — Rule 0036: The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. — code block copy buttons are named "Copy code" (button-name, critical) fixed by #313
- `sbom` `*/{@isaacs/cliui,@isaacs/fs-minipass,@isaacs/string-locale-compare,@npmcli/agent,@npmcli/arborist,@npmcli/config,@npmcli/fs,@npmcli/git,@npmcli/installed-package-contents,@npmcli/map-workspaces,@npmcli/metavuln-calculator,@npmcli/name-from-folder,@npmcli/node-gyp,@npmcli/package-json,@npmcli/promise-spawn,@npmcli/query,@npmcli/redact,@npmcli/run-script,@pkgjs/parseargs,@sigstore/bundle,@sigstore/core,@sigstore/protobuf-specs,@sigstore/sign,@sigstore/tuf,@sigstore/verify,@tufjs/canonical-json,@tufjs/models,abbrev,agent-base,ansi-regex,ansi-styles,aproba,archy,balanced-match,bin-links,binary-extensions,brace-expansion,cacache,chalk,chownr,ci-info,cidr-regex,cli-columns,cmd-shim,color-convert,color-name,common-ancestor-path,corepack,cross-spawn,cssesc,debug,diff,eastasianwidth,emoji-regex,encoding,env-paths,err-code,exponential-backoff,fastest-levenshtein,fdir,foreground-child,fs-minipass,glob,graceful-fs,hosted-git-info,http-cache-semantics,http-proxy-agent,https-proxy-agent,iconv-lite,ignore-walk,imurmurhash,ini,init-package-json,ip-address,ip-regex,is-cidr,is-fullwidth-code-point,isexe,jackspeak,json-parse-even-better-errors,json-stringify-nice,jsonparse,just-diff,just-diff-apply,libnpmaccess,libnpmdiff,libnpmexec,libnpmfund,libnpmhook,libnpmorg,libnpmpack,libnpmpublish,libnpmsearch,libnpmteam,libnpmversion,lru-cache,make-fetch-happen,minimatch,minipass,minipass-collect,minipass-fetch,minipass-flush,minipass-pipeline,minipass-sized,minizlib,ms,mute-stream,negotiator,node-gyp,nopt,normalize-package-data,npm,npm-audit-report,npm-bundled,npm-install-checks,npm-normalize-package-bin,npm-package-arg,npm-packlist,npm-pick-manifest,npm-profile,npm-registry-fetch,npm-user-validate,p-map,package-json-from-dist,pacote,parse-conflict-json,path-key,path-scurry,picomatch,postcss-selector-parser,proc-log,proggy,promise-all-reject-late,promise-call-limit,promise-retry,promzard,qrcode-terminal,read,read-cmd-shim,read-package-json-fast,retry,safer-buffer,semver,shebang-command,shebang-regex,signal-exit,sigstore,smart-buffer,socks,socks-proxy-agent,spdx-correct,spdx-exceptions,spdx-expression-parse,spdx-license-ids,ssri,string-width,strip-ansi,supports-color,text-table,tiny-relative-date,tinyglobby,treeverse,tuf-js,unique-filename,unique-slug,util-deprecate,validate-npm-package-license,validate-npm-package-name,walk-up-path,which,wrap-ansi,write-file-atomic,yallist,yarn}` — Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature
- `persistence` `*/record_page_view` — Rule 0303: When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. — a page view is recorded against the learning object and the day's calendar in one request (#475)
- `persistence` `*/{learning_records,calendar,get_count_learning_records}` — Rule 0303: When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. — the per-table page-view requests are replaced by record_page_view (#475)
- `persistence` `*/record_heartbeat` — Rule 0304: While a course page is visible, the reader shall record each 30 seconds of activity in one database request. — each 30 seconds of activity on a visible course page is one request (#475)
- `persistence` `*/increment_calendar` — Rule 0304: While a course page is visible, the reader shall record each 30 seconds of activity in one database request. — the calendar's time-active increment is replaced by record_heartbeat (#475)
- `dom` `reader:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313)
- `screenshot` `reader:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313)
- `axe` `reader:*` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — CHANGELOG 17.0.0 Reader: course pages carry no critical or serious WCAG 2.1 AA violations after the Paper rebuild (#313, #338, #364, #420)
- `dom` `live:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331)
- `screenshot` `live:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331)
- `axe` `live:*` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331)
- `dom` `catalogue:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Catalogue: the catalogue is brought onto the Paper design system (#313, #331)
- `screenshot` `catalogue:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Catalogue: the catalogue is brought onto the Paper design system (#313, #331)
- `axe` `catalogue:*` — Rule 0173: The catalogue shall give each link in its header an accessible name that no other link in the header has. — CHANGELOG 17.0.0 Catalogue: every link in the catalogue header has an accessible name no other header link shares (#338)
- `dom` `time:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Time: Time is brought onto the Paper design system (#313, #331)
- `screenshot` `time:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Time: Time is brought onto the Paper design system (#313, #331)
- `axe` `time:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Time: Time is brought onto the Paper design system (#313, #331)
- `network` `*/api/auth/*` — Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the GitHub OAuth callback URL has moved to /api/auth/callback/github (#417, #461, #463)
- `network` `*/auth/*` — Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the Auth.js routes under /auth are gone with the move to Better Auth (#463)
- `headers` `reader:*` — Rule 0259: When the reader starts a session, the reader shall set the session cookie as HttpOnly, Secure and SameSite=Lax. — CHANGELOG 17.0.0 Reader: the session cookie is Better Auth's, set HttpOnly, Secure and SameSite=Lax (#417, #461)
- `dom` `reader-auth:sign-in` — Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: sign-in runs on Better Auth (#417, #461, #463)
- `network` `reader:*` — Rule 0317: When a sharing student enters a course, the reader shall load the course online list from stored activity without joining a course Realtime channel. — CHANGELOG 17.0.0 Reader: readers no longer join a course Realtime channel; the online list is read from stored activity (#414, #429, #474)
- `bus` `reader:*` — Rule 0271: If a learning event is published for a course the student is not reading, then the reader shall not receive it. — CHANGELOG 17.0.0 Reader: the reader no longer subscribes to tutors-all-course-access and course activity channels (#414, #429, #474)
- `bus` `live:*` — Rule 0272: When a student opens a learning object, the reader shall report one learning event for it. — CHANGELOG 17.0.0 Live: Live's landing page is the only subscriber to tutors-all-course-access (#414, #429, #474)
- `migration` `*/idx_tutors_connect_latest_course_recent` — Rule 0317: When a sharing student enters a course, the reader shall load the course online list from stored activity without joining a course Realtime channel. — CHANGELOG 17.0.0 Infrastructure: 20261013_tutors_connect_latest_recent_index.sql indexes (course_id, received_at DESC) for the online list (#474)
- `migration` `*/record_page_view` — Rule 0303: When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. — CHANGELOG 17.0.0 Infrastructure: 20261014_record_page_view_and_heartbeat.sql adds record_page_view (#475)
- `migration` `*/record_heartbeat` — Rule 0304: While a course page is visible, the reader shall record each 30 seconds of activity in one database request. — CHANGELOG 17.0.0 Infrastructure: 20261014_record_page_view_and_heartbeat.sql adds record_heartbeat (#475)
- `logs` `reader:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape, and variable data kept out of log messages (#283, #297)
- `logs` `live:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283)
- `logs` `catalogue:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283)
- `logs` `time:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283)
- `metrics` `reader:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `metrics` `live:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `metrics` `catalogue:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `metrics` `time:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `asset-graph` `reader:*` — CHANGELOG 17.0.0 Reader: the reader runs on SvelteKit 3 (#466)
- `asset-graph` `live:*` — CHANGELOG 17.0.0 Live: Live runs on SvelteKit 3 (#466)
- `asset-graph` `catalogue:*` — CHANGELOG 17.0.0 Catalogue: the catalogue runs on SvelteKit 3 (#466)
- `asset-graph` `time:*` — CHANGELOG 17.0.0 Time: Time runs on SvelteKit 3 (#466)

</details>

<sub>harness 1.37.3 (2fc966f3a1d9, contract 1.37.0) · 2026-10-15T18:04:41.578Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×90, request-id×90, etag×90, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1509, persistence-stub-requests×140, oauth-callback-state×10, media-range-status×45, chromium-compute-pressure-policy×1, hashed-assets×4903, footer-tutors-version×330, transport-length×90, transport-connection×90, transport-keepalive×90</sub>


</details>
