# Documentation

Start with the [user guide](user-guide/README.md): what the harness is, a ten-minute quickstart, and a chapter for each of the people who use it.

| Document | What it covers |
| --- | --- |
| [user-guide/](user-guide/README.md) | The guide for release authors, operators, CI integrators and harness developers: concepts, running locally, reading a report, writing claims, noise and the self-test, CI, reference, troubleshooting, extending, glossary |
| [contract.md](contract.md) | The integration contract: what the monorepo may build against (report, noise status, release record, rules, claims file, CLI, workflows, versions). Its machine-readable half is in [contract/](contract/) |
| [images.md](images.md) | Where the A and B images come from: Quay, cosign verification, digests, the image cache, the from-source fallback, the image artefacts |
| [modes.md](modes.md) | The six modes and what each produces |
| [local.md](local.md) | Running the harness on your own machine: the parity matrix with the workflows, state, scheduling, Windows notes |
| [noise-burndown.md](noise-burndown.md) | The playbook for taking the A/A from noisy to clean: reading a noisy A/A, mask or fix, likely noise sources, overrides |
| [bus.md](bus.md) | The bus collector (disabled until a bus exists) |
| [harness-now.md](harness-now.md) | The decision on `HARNESS_NOW` and time-derived stats |
| [monorepo/](monorepo/README.md) | What the monorepo needs to do, with reference copies of its two workflows |
| [releases/](releases/1.2.0.md) | Release notes of the harness |

Elsewhere: [claims/README.md](../claims/README.md) (the claims format), [mutants/README.md](../mutants/README.md) (the planted regressions), [deploy/kind/README.md](../deploy/kind/README.md) (the kind substrate) and [TESTING.md](../TESTING.md) (how the harness is tested).
