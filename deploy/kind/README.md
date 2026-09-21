# kind substrate (phase H6)

The two sides as two namespaces — `harness-a`, `harness-b` — in a local kind
cluster with Pod Security Admission `restricted` enforced, instead of two
compose stacks. Everything above the substrate (journeys, collectors, masks,
engines, claims, gate, report) is identical; only `stackUp`/`stackDown` change.

```bash
pnpm harness run --mode noise --a local --b local --substrate kind --set fixture
pnpm harness kind rollout --a 16.2.0 --b 16.3.0-rc.1      # rolling update of harness-a/reader under k6 load
pnpm harness kind down                                     # delete the namespaces; the cluster stays
kind delete cluster --name <cluster>                       # remove this checkout's cluster (harness doctor --for kind prints its name)
```

Needs `kind` and `kubectl` on the PATH and Docker. The first `up` creates the
cluster from `kind-config.yaml` (NodePorts published on host ports 4100–4102
and 4200–4202, the compose ports plus 1000, so a cluster left running never
blocks the compose stack) and
loads the images with `kind load docker-image`; later runs reuse it.

Images are named exactly as on compose (`HARNESS_IMAGE_PREFIX`, prefix or
`{app}` template — [docs/images.md](../../docs/images.md)) and are under the
same rule: they must be present locally, and a registry image must have a
verified cosign signature, before `kind up` loads anything; run
`pnpm harness images ensure` first. The pods use `imagePullPolicy: IfNotPresent`
and the cluster never pulls from Quay itself. `kind load` carries tags, not
digests, so a digest-pinned image (`repo@sha256:…`) is given a local tag
derived from its digest (`repo:16.2.0-sha256-0123456789ab`) and the manifests
use that name.

## What runs where

| Component | compose | kind |
| --- | --- | --- |
| reader, catalogue, live per side | containers, hardened | Deployments under `restricted` PSA, same probes/security context/resources as the monorepo's `deploy/k8s/base` |
| fixture course server | container | a Node process on the host (the browser fetches the course; the apps never do) |
| container posture and startup time (`runtime`, `startup` artefacts) | `docker inspect`, `exec`, `logs`; stop and start | the pod spec, `kubectl exec` and `logs`; scale to zero and back |
| signed-in reader, identity and persistence stubs | containers | not yet (the `auth` set is skipped on kind) |
| edge proxy for `upgrade` mode | container | not needed: `kind rollout` uses a real RollingUpdate |

## Why restricted PSA stands in for the restricted SCC

OpenShift's restricted SCC requires a non-root, arbitrary UID, no privilege
escalation, all capabilities dropped and a runtime-default seccomp profile;
`restricted` PSA requires the same set. The monorepo's images run as UID 1001
with GID 0 for exactly this reason, and the manifests here carry the same
`securityContext` as its kustomize base, so a release that passes here would
pass admission there. What this does not rehearse: Routes, the OpenShift
router's headers, and the arbitrary-UID *assignment* (kind runs the image's
own UID). The monorepo's conformance tier covers `kubeconform`/`conftest` on
the real overlays.

## Rollout rehearsal

`harness kind rollout` brings both namespaces up, runs k6 against
`harness-a/reader` through its NodePort, and a third of the way in does
`kubectl set image deployment/reader app=<b image>` with `maxUnavailable: 0`,
`maxSurge: 1`, then `rollout status`. Any failed or 5xx request during the
window fails the rehearsal. The result lands in `out/<ts>-kind-rollout/rollout.json`.

## The cluster's name

The cluster is `tutors-harness-<8 hex>`, the hex being the first eight characters of
the SHA-256 of this checkout's real path (lowercased on Windows), so two checkouts or
git worktrees on one machine get two clusters and never adopt each other's.
`HARNESS_KIND_CLUSTER` (then `HARNESS_PROJECT`) overrides it. A cluster called plain
`tutors-harness` is what every checkout used before 1.3.0 and is treated as yours:
`harness kind up` and `down` refuse that name, and `harness doctor --for kind` reports
it as "legacy cluster, not touched". Note that every cluster made from
`kind-config.yaml` maps the same host ports (4100–4202), so two clusters cannot run at
once; delete the one you are not using.
