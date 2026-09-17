# Claims

A claim is how a release says what it meant to change. The matcher assigns
every failing diff hunk to at most one claim; an unclaimed hunk fails the run;
a claim that matches nothing is reported as stale so the changelog stays
honest.

```yaml
claims:
  - artefact: dom
    scope: "/course/*/lab/*"
    reason: "Rule 0031: lab steps shall show estimated reading time"
  - artefact: screenshot
    scope: "reader:lab-step*"
    reason: "feat(ui-navigators): #262 collapsed state"
  - artefact: network
    scope: "GET /api/presence"
    reason: "Rule 0044: presence polled every 15s, was 10s"
  - artefact: headers
    scope: "reader:*/content-security-policy"
    reason: "fix(reader): #270 CSP allows the new video host"
```

## Fields

| field | meaning |
| --- | --- |
| `artefact` | `dom`, `screenshot`, `network`, `console`, `headers`, `axe`, `metrics`, `logs`, `timing`, or `*` |
| `scope` | a glob matched against the hunk's scope **or** its route (see below) |
| `reason` | the Rule id or changelog entry. "see PR" and "approved" are rejected by the schema |
| `approvedBy` | required for a broad claim; a person, never a bot |

## What a scope matches

| artefact | hunk scope | also matches |
| --- | --- | --- |
| dom, screenshot, console, axe, timing | the page key, e.g. `reader:lab-step` | the page's route, e.g. `/lab/localhost:8080/unit-1/topic-01/book-lab-01` |
| headers | `<page key>/<header name>` | the page's route; a claim on `reader:lab-step` alone also matches |
| network | `<METHOD> <route>`, e.g. `GET /course/localhost:8080` | the page's route |
| metrics | `<app>/<series>` | — |
| logs | `<app>/<field or level>` | — |
| dom (journey failed) | the journey name | — |

Globs are `picomatch` with `dot: true` and case folding. Quote scopes with
spaces or colons.

## Broad claims

`artefact: "*"`, `scope: "*"` or `scope: "**"` matches anything, which is a
rubber stamp unless a human owns it. The schema requires `approvedBy` on
these, and the release workflow can additionally require a label. The harness
should make it easy to claim precisely and awkward to claim everything.

## Where the file lives

In the monorepo's release PR, as `release/claims.yaml` or generated from
Conventional Commits and Rule ids; the release workflow passes it to the
harness with `--claims`. Not in this repository: the harness must not be
weakened by the PR it is judging.
