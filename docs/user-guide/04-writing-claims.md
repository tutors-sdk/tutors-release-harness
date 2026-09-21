# 04 Writing claims

A claim is how a release says what it meant to change. This chapter is for the person who owns a release's `release/claims.yaml` in the monorepo. Read [chapter 3](03-reading-a-report.md) first if you have not yet seen a report.

- [The schema](#the-schema)
- [How a claim matches](#how-a-claim-matches)
- [Finding the scope](#finding-the-scope)
- [A cookbook](#a-cookbook)
- [Broad claims and hygiene](#broad-claims-and-hygiene)
- [From EARS Rules and changelog entries](#from-ears-rules-and-changelog-entries)
- [Rejections and fixes](#rejections-and-fixes)
- [Before you push](#before-you-push)

## The schema

```yaml
version: 1                       # optional; any other value is refused
claims:
  - artefact: headers                                   # an artefact name, or "*"
    scope: "reader:*/content-security-policy"           # a glob, non-empty
    reason: "fix(reader): #270 CSP allows the new host" # 8+ characters, not a rubber stamp
    approvedBy: "a-maintainer"                          # optional; required for a broad claim to count
  - artefact: dom                                       # since 1.3.0: a claim may name a Rule instead of a reason
    scope: "reader:lab-step*"
    rule: "0031"                                        # four digits, quoted; must be in the rules file
```

| Field | Rules |
| --- | --- |
| `artefact` | One of the nineteen artefact names (`dom`, `screenshot`, `network`, `console`, `headers`, `axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `bus`, `migration`, `upgrade`, `image-manifest`, `sbom`, `vulns`, `runtime`, `startup`), or `*`. |
| `scope` | A non-empty glob, matched with picomatch (dot files allowed, case-insensitive) against the hunk's scope or its path. Quote it: colons and spaces are YAML syntax. |
| `reason` | At least 8 characters, and it must not start with `see pr`, `approved`, `all`, `ok` or `misc` (a whole word, any case). It names the Rule or the changelog entry that intends the change. **Required unless the claim has a `rule`.** |
| `rule` | A Rule's four digits, **quoted** (`"0031"`; unquoted, YAML reads `0031` as the number 31 and the harness refuses it). It must be in the rules file given with `--rules` (in the dispatch, `rules_url`). With a `rule`, `reason` becomes optional free text, and the report shows `Rule 0031: <title>` (then your reason, if you gave one). |
| `approvedBy` | A person, never a bot. Required on a broad claim. |

Also true of the file:

- An empty file, or `claims: []`, means no claims: nothing observable should differ from production. That is the right file for a release of internal changes only.
- **Unknown keys are ignored** by the harness. A typo such as `approvedby` or `Reason` does not fail; it silently has no effect, and the claim may then be rejected for a missing reason or, for a broad claim, gate the run. The monorepo's pre-check (below) does reject unknown fields.
- An invalid file stops the run with exit `2`, before any stack starts and before any output directory is made.
- `reason: "Rule 0031: ..."` free-text claims keep working, with or without a rules file. The harness checks only that a `rule` *exists*; it never reads what the Rule says and never judges whether a change is what the Rule intends.

## How a claim matches

The matcher goes through the failing hunks in order and assigns each to **at most one claim: the first that matches, in file order.** A claim matches a hunk when:

1. the claim's `artefact` is `*` or equals the hunk's artefact; and
2. its `scope` glob matches the hunk's **scope**, or the hunk's **path** (the page's route), or the part of the scope **before the first `/`**.

Consequences worth knowing:

- Order matters. If a broad claim sits above a precise one, the broad claim takes the hunk and the precise one becomes stale.
- The last option (the part before the first `/`) makes `reader:lab-step` also cover `reader:lab-step/x-frame-options`, so a headers claim on a page key alone covers every header hunk of that page. It also means that **a scope that is just an app name covers every hunk of that app for that artefact.** A claim `artefact: sbom, scope: "reader"` covers every package change in the reader image, not one:

  ```yaml
  - artefact: sbom
    scope: "reader"        # covers reader/left-pad and reader/@sveltejs/kit alike: too broad, and not flagged as broad
  ```

  Name the package.

- `*` does not cross a `/`. `reader:*` matches `reader:course` and, through that same option, the header hunk `reader:course/x`. It does not match `reader-auth:course` (a different page key). `*:*/content-security-policy` matches the header on every app's pages.
- `**` matches across slashes. A scope of `*`, `**` or only stars is a broad claim.
- Matching ignores case. Quote scopes that contain colons or spaces.

## Finding the scope

Copy it from the report. The *Unclaimed differences* table (and the Differences table in the HTML) shows each hunk's scope; the path is under it in the HTML and in `report.json`. Scope formats:

| Artefact | Scope | Example |
| --- | --- | --- |
| `dom`, `screenshot`, `console`, `axe`, `focus`, `timing` | the page key | `reader:lab-step` |
| `headers` | `<page key>/<header name>` | `reader:course/content-security-policy` |
| `network` | `<METHOD> <route>` | `GET /api/presence` |
| `metrics` | `<app>/<series>` | `reader/tutors_lab_steps_total` |
| `logs` | `<app>/<key>`, `<app>/<level>`, `<app>/request-id`, `<app>/json` | `reader/traceId` |
| `persistence`, `bus` | `<journey>/<table or topic>` | `student-signs-in/progress` |
| `image-manifest` | `<app>/<field>` | `reader/base`, `reader/user`, `reader/ports/3000`, `reader/label/<key>` |
| `sbom` | `<app>/<package name>` | `reader/@sveltejs/kit` |
| `vulns` | `<app>/<advisory id>` | `reader/CVE-2026-1234` |
| `runtime` | `<app>/<field>` | `reader/uid`, `reader/writes-outside-tmp` |
| `startup` | `<app>/root`, `/ready`, `/boot`, `/root-status` | `reader/ready` |
| `migration` | `<table>`, `<table>.<column>`, an index, function or policy name, or `rollback` | `app_errors.user_agent` |
| `upgrade` | `rollout`, `load`, `b` | `rollout` |
| `timing` (load) | `load/http_req_duration`, `load/errors` | `load/http_req_duration` |

The page keys are in [chapter 1](01-concepts.md#journeys): `reader:home`, `reader:course`, `reader:topic`, `reader:lab-step`, `reader:lab-step-2`, `reader:search`, `reader:search-results`, `catalogue:home`, `live:home`, `reader-auth:sign-in`, `reader-auth:course`, `reader-auth:topic`, and `reference:course`, `reference:topic`, `reference:lab`, `reference:note`.

Claim as precisely as the change allows, and use the same reason on the hunks that belong together.

## A cookbook

Each recipe is a real situation, the hunks you will see, and the claim. The whole set below was parsed by the harness's own claims loader and matched against sample hunks; the notes say what each glob does and does not cover.

### 1. A copy change on one page

The course page intro was reworded. You will see a `dom` hunk (`reader:course: semantic DOM differs`) and, because the words moved pixels, a `screenshot` hunk (`0.42% of pixels differ`). They are two artefacts, so they need two claims:

```yaml
  - artefact: dom
    scope: "reader:course"
    reason: "CHANGELOG 16.4.0: course page intro reworded"
  - artefact: screenshot
    scope: "reader:course"
    reason: "CHANGELOG 16.4.0: course page intro reworded"
```

A changelog entry that ends `(dom, screenshot)` gives you both claims by hand ([below](#from-ears-rules-and-changelog-entries)).

### 2. The same change on every lab page

Lab step pages are `reader:lab-step` and `reader:lab-step-2`. A trailing `*` covers both. Here the claim cites the Rule that requires the change:

```yaml
  - artefact: dom
    scope: "reader:lab-step*"
    rule: "0031"
```

The report will read `Rule 0031: Lab steps show their estimated reading time`. This needs `--rules` (in CI, `rules_url`); without it the whole file is invalid.

### 3. A new response header

A new `Permissions-Policy` header is a hunk per page: `reader:course: header added on b: permissions-policy: ...`. One claim covers the reader's pages:

```yaml
  - artefact: headers
    scope: "reader:*/permissions-policy"
    reason: "CHANGELOG 16.4.0: Permissions-Policy added to the reader (headers)"
```

`reader:*` does not include `reader-auth:` pages. If the signed-in reader sends the header too, it will show up as its own hunks; extend the glob (`*:*/permissions-policy`) or add a second claim.

### 4. A CSP host

The Content-Security-Policy now allows a new video host. The header *changes* on every page of every app, so the hunks are many. One glob across apps covers them:

```yaml
  - artefact: headers
    scope: "*:*/content-security-policy"
    reason: "fix(reader): #270 CSP allows the new video host"
```

Expect the hygiene section to flag this claim as covering many hunks (more than ten). That is what the flag is for: it never gates, and a reason that says why the reach is deliberate is the right answer.

### 5. A network call changes

Presence is now polled every 15 seconds instead of 10. You will see `GET /api/presence requested 3x on a, 4x on b` or a status change; all have the same scope, so one claim covers them:

```yaml
  - artefact: network
    scope: "GET /api/presence"
    rule: "0044"
    reason: "polled every 15s, was 10s (#318)"
```

### 6. A console message you can explain

A new dev-mode notice for a feature flag. Claim a console message only when you can say why it exists; a new error is a bug.

```yaml
  - artefact: console
    scope: "reader:home"
    reason: "CHANGELOG 16.4.0: dev-mode notice for the new feature flag (console)"
```

### 7. A dependency bump in the SBOM

A package added, removed or bumped is one `sbom` hunk with scope `<app>/<package name>`. For one package, name it. For a framework bump that moves a family of packages, a glob claims them together:

```yaml
  - artefact: sbom
    scope: "reader/@sveltejs/*"
    reason: "chore(deps): SvelteKit 2.20 -> 2.21 (#1042)"
```

`reader/@sveltejs/*` matches `reader/@sveltejs/kit` and `reader/@sveltejs/adapter-node` but not `reader/left-pad`. Do not shorten the scope to `reader` (see [How a claim matches](#how-a-claim-matches)).

### 8. A base image bump

A different base shows as `image-manifest` hunks: the lowest layer differs (`<app>/base`), often the layer count too. The OS packages that changed appear as `sbom` hunks; claim those by package or family.

```yaml
  - artefact: image-manifest
    scope: "*/base"
    reason: "chore(docker): node 22.11 -> 22.12 base image (#1050)"
```

`*/base` covers every app. A change of `USER` (`reader/user`) is a different hunk, and a different question: it is not covered.

### 9. A vulnerability you accept

A vulnerability that is new on b fails. If you have decided to ship it, say why. One that is gone on b is information and needs no claim.

```yaml
  - artefact: vulns
    scope: "reader/CVE-2026-1234"
    reason: "accepted: not reachable from the reader, tracked in #1061"
```

A `<app>/db` hunk means the two sides were scanned with different databases: fix that rather than claiming it.

### 10. A contract migration

Dropping or narrowing a column that version a still reads is an `expand/contract` violation. If the drop is deliberate, claim it on the release that contains it:

```yaml
  - artefact: migration
    scope: "app_errors.user_agent"
    reason: "CHANGELOG 16.5.0: user_agent dropped; no release since 16.3.0 reads it"
```

The scope is the table and column (`app_errors.*` covers the table). Before writing one, confirm in the code, and against the previous release's tag, that no deployed version reads the column. The monorepo's `pnpm check:migrations` and the harness use the same claim.

### 11. A timing change you accept

The course page now does more work on the server, and is slower by design:

```yaml
  - artefact: timing
    scope: "reader:course"
    reason: "CHANGELOG 16.4.0: course page now renders progress server-side (timing)"
```

`reader:course` is the page's TTFB hunk. The journey's duration has its own scope (`anonymous-student-reads-course`) and the k6 comparison has `load/http_req_duration` and `load/errors`. A timing hunk only appears at all when there are enough runs to judge; see [Timing and statistics](03-reading-a-report.md#timing-and-statistics).

### 12. A new metrics series

A counter added to `/metrics` is `reader: new series on b: tutors_lab_steps_total`. A renamed counter is two hunks (one series missing, one new): claim both.

```yaml
  - artefact: metrics
    scope: "reader/tutors_lab_steps_total"
    reason: "feat(reader): #402 lab step counter"
```

### 13. A new log field

```yaml
  - artefact: logs
    scope: "reader/traceId"
    reason: "feat(reader): #388 trace id in every log line"
```

The `logs` engine compares shape and volume, never the text of a line. A level count that moved (`info-level lines: 28 on a, 60 on b`) is `reader/info`.

### 14. Posture and startup

A new declared volume changes the writable paths; a cache warm-up makes the app ready later:

```yaml
  - artefact: runtime
    scope: "reader/writable-paths"
    reason: "chore(docker): #1077 image now declares a cache volume"
  - artefact: startup
    scope: "reader/ready"
    reason: "feat(reader): #1080 warms the course cache at boot, ready 1.5 s later"
```

A change that only *tightens* posture (root to non-root) is information and needs nothing. Do not claim `runtime/not-collected` unless you can say why the collector could not run; fix it instead.

### 15. What a signed-in journey writes

The reader now saves progress when a topic is opened. The `persistence` hunk is `student-signs-in: POST progress — 0 row(s) on a, 1 on b`:

```yaml
  - artefact: persistence
    scope: "student-signs-in/progress"
    reason: "Rule 0052: progress is saved when a topic is opened"
```

This cannot cover an **anonymous** journey. A write on b during an anonymous journey is a failure by rule; claim it only if the release genuinely means to write for anonymous readers, and expect a reviewer to ask why.

### 16. Keyboard order

```yaml
  - artefact: focus
    scope: "reader:lab-step*"
    reason: "CHANGELOG 16.4.0: navigator moved before the article (focus)"
```

### 17. A sitewide change, owned by a person

A new colour theme moves every screenshot. Either write one claim per app (`reader:*`, `catalogue:*`, `live:*`), or take the broad route and put a name on it:

```yaml
  - artefact: screenshot
    scope: "**"
    reason: "CHANGELOG 16.4.0: new colour theme, every page"
    approvedBy: "leigh"
```

This claim is broad, so `approvedBy` is required, and the report flags it as `broad-with-approval` in the hygiene section. It covers `screenshot` only: the `dom` and `headers` hunks of the same release still need their own claims. Put broad claims below the precise ones: the first matching claim takes the hunk.

### 18. A release with nothing to claim

```yaml
claims: []
```

If the harness then finds a difference, the release changed something observable that nobody said it would.

## Broad claims and hygiene

A claim is **broad** when its `artefact` is `*`, or its `scope` is `*`, `**` or made only of stars. A broad claim without `approvedBy` is listed in the report and **fails** the run in release and post-deploy mode. The reason is simple: a broad claim is a rubber stamp unless a human owns it. `approvedBy` must be a person; the file is owned by the maintainers through CODEOWNERS in the monorepo, because a claim waives a failure.

**Claim hygiene** is the smell detector that runs on every release with claims. It reports claims in the file (stale ones included), the failing hunks they cover, hunks per claim, and flags:

- `covers-many-hunks`: a claim covering more failing hunks than the threshold (default 10; `--claim-max-hunks n` or `HARNESS_CLAIM_MAX_HUNKS`);
- `broad-with-approval`: a broad claim a human approved.

It never gates. Its use is to make a habit visible: routinely appearing flags, or one claim swallowing a dozen unrelated hunks, mean claims have become a checkbox. Rules of thumb:

- one claim per intended change per artefact, with the scope of that change;
- one Rule or changelog entry in each reason, so a reader can find the source of the intent;
- a claim that covers many hunks explains why in its reason;
- a stale claim is removed (the changelog was wrong, or the change did not happen);
- if you widen a scope until the run goes green, you have written a checkbox.

## From EARS Rules and changelog entries

The monorepo drafts claims from two sources. Both are the monorepo's; this section says what they produce. The details are in the monorepo's `release/README.md`, `CONTRIBUTING.md` and `guides/Release-Strategy.md`.

**Changelog entries name the artefacts they expect to move.** A changelog entry that changes something observable ends with the artefacts in a trailing parenthesis:

```markdown
- Nav bar: link contrast raised to 4.5:1 on the dark theme (axe, dom) (PR #301)
```

becomes one claim per artefact in the hint:

```yaml
claims:
  - artefact: axe
    scope: "reader:*"
    reason: "CHANGELOG 16.4.0: Nav bar: link contrast raised to 4.5:1 on the dark theme"
  - artefact: dom
    scope: "reader:*"
    reason: "CHANGELOG 16.4.0: Nav bar: link contrast raised to 4.5:1 on the dark theme"
```

The scope is the page key, route, `<METHOD> <route>` or `<app>/<series>` the entry names; narrow it as far as the entry allows. An entry with no artefact hint claims nothing: if the harness then finds a difference, the entry was incomplete, and that is the signal. The hint vocabulary the monorepo documents: `dom`, `screenshot`, `network`, `console`, `headers`, `axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `migration`.

**EARS Rules** are the numbered requirements under the monorepo's `tests/bdd/features`, each tagged `@rule-NNNN`. Three commands there work with them:

```console
# a rules.json for the Rules at a git ref (default HEAD), read from git, not the working tree
pnpm release:rules [--ref <git ref>] [--out <path>]

# stubs for the Rules that changed between production and the candidate
pnpm release:claims:draft --from <production tag> --to <candidate ref> [--rule]

# check the claims file, resolving Rules against the ones at a ref
pnpm check:release-claims [file] [--ref <git ref>]
```

`release:rules` writes the file the harness reads with `--rules`:

```json
{ "version": 1,
  "rules": {
    "0031": { "title": "When a student opens a lab step, the reader shall ...", "digest": "698c90a5..." } } }
```

One entry per Rule that carries exactly one `@rule-NNNN` tag, keys sorted, the same bytes on every machine. The `digest` covers the Rule's meaning, not its formatting; the harness never reads it. Publish the file for the candidate's commit (`pnpm release:rules --ref vX.Y.Z-rc.N --out rules.json`); the monorepo's dispatch sends its URL as `rules_url`.

`release:claims:draft` prints one stub per added or changed Rule. The `artefact` and `scope` are left as `TODO`, because only you know which page or route a Rule changes, and the draft is not valid until every `TODO` is replaced. With `--rule` the stub carries `rule: "0031"` (the field harness contract 1.3.0 reads); without it, `reason: "Rule 0031: <title>"`. A Rule can be observable in several artefacts: copy the stub once per artefact and scope. A removed Rule cannot be cited by id; if it changes what the release shows, cite the changelog entry.

Use `rule:` only against a harness that speaks contract 1.3.0. A 1.2.0 harness has no `rule` field: it ignores the key, so a claim that also has a `reason` still works, and a claim with only a `rule` is rejected for its missing `reason`. Keep to `reason: "Rule 0031: ..."` until you are sure.

## Rejections and fixes

A claims file is checked as a whole, and a bad one stops the run with exit `2` before anything starts. The harness prints the file name, then one line per problem (followed by a stack trace: read the first lines). These are real messages.

| Message | Cause | Fix |
| --- | --- | --- |
| `claims.0.artefact: Invalid input` | the artefact is not one of the nineteen names or `*` (a typo such as `header`, or `a11y`) | use an exact name from the [schema](#the-schema) |
| `claims.0.reason: a reason names a Rule or a changelog entry, not a rubber stamp` | the reason starts with `see pr`, `approved`, `all`, `ok` or `misc` | cite the Rule or the changelog entry |
| `claims.0.reason: a reason is at least 8 characters` | too short | say what changed and why |
| `claims.0.reason: a claim needs a reason (a Rule or a changelog entry), or a rule: "0031" that the rules file contains` | no `reason` and no `rule` | add a reason, or a `rule` and `--rules` |
| `claims.0.rule: rule is the Rule's four digits, quoted: rule: "0031" (unquoted, YAML reads 0031 as the number 31)` | `rule: 0031` without quotes | quote it |
| `claims.0.rule: rule is four digits, e.g. "0031"` | a `rule` that is not four digits | use the four-digit id |
| `claims.0.rule: rule "0999" is not in the rules file <path or URL>` | the Rule is not in `rules.json` | check the id; publish the rules file for this commit |
| `claims.0.rule: rule "0031" was named, but no rules file was given: pass --rules <path\|url> (in the release dispatch, rules_url), or give a reason instead` | a `rule` with no `--rules` | pass the rules file, or use a reason |
| `claims.0.scope: Too small: expected string to have >=1 characters` | empty scope | write one |
| `version: Invalid input: expected 1` | `version:` names something other than 1 | delete it or write `version: 1` |
| `<file> is not valid JSON` / `is not a valid rules file: version: Invalid input: expected 1` / `rules.31: "31" is not a rule id: a rule is named by four digits, e.g. "0031"` / `rules.0031.title: Invalid input: expected string, received undefined` | the rules file is malformed | regenerate it with `pnpm release:rules` |
| `cannot fetch the rules file <url>: HTTP 404` (or `fetch failed`) | `--rules` names a URL that cannot be read without credentials, is not published yet, or times out | publish it and check the URL; a private URL will not work |
| `ENOENT: no such file or directory, open '<file>'` | `--claims` or `--rules` names a file that is not there | fix the path |

Findings that are not file errors:

| You see | Cause | Fix |
| --- | --- | --- |
| `N broad claim(s) without approvedBy: claim precisely or have a human approve` | a broad claim with no `approvedBy`, or a typo in the key (`approvedby`) that the harness ignored | narrow the claim, or add `approvedBy` with a person's name |
| the hunk is still unclaimed and the claim is stale | the scope or artefact does not match. Compare the claim with the hunk's scope and path character for character: the app prefix, `:` versus `/`, `reader:` versus `reader-auth:`, the artefact | copy the scope from the report |
| the wrong claim covers a hunk | first match wins, in file order | reorder, or narrow the earlier claim |
| `N claim(s) matched nothing and should be removed from the changelog` | stale claims | remove them, or find out why the change did not happen |

## Before you push

**Run the monorepo's pre-check:**

```console
pnpm check:release-claims
```

It mirrors the harness's schema so a bad file fails on the pull request in minutes, not in the harness run. It differs from the harness in ways worth knowing (checked against the monorepo's `origin/main` at commit c14c3ee, 2026-09-21):

- It rejects **unknown fields and unknown top-level keys** (`approvedby`); the harness ignores them. This is the check that catches the typo.
- It rejects a **broad claim with no `approvedBy`** at once; the harness lets the run start and fails it.
- It checks that a cited Rule (in `rule:` or a reason beginning `Rule NNNN`) is defined by a feature under `tests/bdd/features`.
- Its artefact list has thirteen names: `dom`, `screenshot`, `network`, `console`, `headers`, `axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `migration`, `upgrade`. The harness accepts nineteen. **A claim for `bus`, `image-manifest`, `sbom`, `vulns`, `runtime` or `startup` passes the harness but the pre-check rejects it** with `artefact must be one of ... or "*"`. Until the two lists are brought together, those claims cannot be committed with a green pre-check; raise it with the monorepo owners.

**Try the claims on a finished run.** Download the `release-report` artifact of a release run (`gh run download <run id> -n release-report -D out`) and re-judge it locally without Docker:

```console
pnpm harness compare --dir out/<timestamp>-release --mode release --claims release/claims.yaml --rules rules.json --noise skip
```

You see the verdict and reasons at once and the rewritten `report.md` in that directory. `--noise skip` waives the A/A requirement (recorded in the report) so that you see what would fail. To reproduce the CI verdict you need the CI's noise status; the artifact does not carry it as a file, but its `report.json` records the `noise` it consulted.

**Or run the whole local gate with the monorepo's helper.** In the monorepo, `pnpm release:harness` prints the release-candidate dispatch payload built from your clone with git alone, and `pnpm release:harness --run` runs the harness's `local gate` with those values (the harness checkout must sit beside the monorepo or be named by `HARNESS_DIR`). See [chapter 6](06-ci-integration.md#the-monorepo-side).
