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

The file may start with `version: 1` (optional; any other value is refused).
The format is part of [the contract](../docs/contract.md#claims-file).

## Fields

| field | meaning |
| --- | --- |
| `artefact` | `dom`, `screenshot`, `network`, `console`, `headers`, `axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `migration`, `upgrade`, `image-manifest`, `sbom`, `vulns`, or `*` |
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
| image-manifest | `<app>/<field>`: `base`, `platform`, `user`, `ports/<port>`, `entrypoint`, `cmd`, `layers`, `size`, `label/<key>` | — |
| sbom | `<app>/<package name>`, one hunk per package added, removed or bumped | — |
| vulns | `<app>/<advisory id>`, e.g. `reader/CVE-2026-1234` | — |

The image artefacts (contract 1.2.0) are compared from the images, not the
running apps. Claim them as precisely as anything else:

```yaml
claims:
  - artefact: sbom
    scope: "reader/@sveltejs/kit"
    reason: "chore(deps): bump @sveltejs/kit 2.20 -> 2.21 (#1042)"
  - artefact: image-manifest
    scope: "*/base"
    reason: "chore(docker): node 22.11 -> 22.12 base image (#1050)"
  - artefact: vulns
    scope: "reader/CVE-2026-1234"
    reason: "accepted: not reachable from the reader, tracked in #1061"
```

A bumped package is one hunk (`name a-version → b-version`), so one claim
covers it. A change that touches many packages (a framework bump) is many
hunks: a glob such as `*/@sveltejs/*` claims them together. A `not-collected`
hunk (`<app>/not-collected`) means an SBOM, manifest or scan could not be read
from an image; fix that rather than claiming it.

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
