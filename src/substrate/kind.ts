import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { judgeUpgrade, summariseUpgrade } from "../modes/upgrade.ts";
import { APPS, dockerRef, kindImageName } from "../image-ref.ts";
import { kindCluster, orExit, refuseLegacyCluster } from "../project.ts";
import { ROOT, docker } from "../stack.ts";
import type { SideName, SideSpec } from "../types.ts";

/**
 * The kind substrate (runway phase H6): the two sides as two namespaces in a
 * local cluster with OpenShift-shaped policy — Pod Security Admission
 * `restricted` enforced on both — instead of compose. The journeys, ports and
 * collectors are unchanged; only how the stacks come up differs.
 *
 * What runs in the cluster: the three anonymous apps per side, from the same
 * manifest shape as the monorepo's deploy/k8s base (probes, security context,
 * resources). What stays on the host: the fixture course server, because the
 * browser fetches the course directly and the apps never do. The signed-in
 * reader and its stubs are compose-only for now (see deploy/kind/README.md).
 */

/**
 * This checkout's kind cluster (src/project.ts): `tutors-harness-<8 hex of the checkout's path>`; HARNESS_KIND_CLUSTER,
 * then HARNESS_PROJECT, win. A cluster called plain `tutors-harness` is the machine owner's (the name every checkout used
 * before 1.3.0) and is never created in, loaded into or deleted: see `refuseLegacyCluster`.
 */
export const CLUSTER = orExit(() => kindCluster().name);
const KIND_CONFIG = resolve(ROOT, "deploy", "kind", "kind-config.yaml");

/**
 * Host port -> node port: 4100 -> 30100. The kind config maps them one to one.
 * The host ports are the compose stack's plus 1000 so a cluster left running
 * never holds the ports compose needs.
 */
const NODE_PORT: Record<SideName, Record<(typeof APPS)[number], { host: number; node: number }>> = {
  a: { reader: { host: 4100, node: 30100 }, catalogue: { host: 4101, node: 30101 }, live: { host: 4102, node: 30102 } },
  b: { reader: { host: 4200, node: 30200 }, catalogue: { host: 4201, node: 30201 }, live: { host: 4202, node: 30202 } }
};

/** Point a side at the kind cluster's host ports; the signed-in reader and stubs are compose-only. */
export function kindSide(spec: SideSpec): SideSpec {
  const p = NODE_PORT[spec.name];
  return { ...spec, urls: { reader: `http://localhost:${p.reader.host}`, catalogue: `http://localhost:${p.catalogue.host}`, live: `http://localhost:${p.live.host}`, courseId: spec.urls.courseId } };
}

function sh(cmd: string, args: string[], opts: { input?: string; quiet?: boolean } = {}): string {
  const result = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", ...(opts.input !== undefined ? { input: opts.input } : {}), stdio: ["pipe", "pipe", opts.quiet ? "pipe" : "inherit"], env: { ...process.env, MSYS_NO_PATHCONV: "1" }, maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${cmd} ${args.slice(0, 3).join(" ")} exited ${result.status}${opts.quiet ? `\n${result.stderr}` : ""}`);
  return result.stdout ?? "";
}
const kubectl = (args: string[], opts: { input?: string; quiet?: boolean } = {}) => sh("kubectl", ["--context", `kind-${CLUSTER}`, ...args], opts);

export function namespaceFor(side: SideName): string {
  return `harness-${side}`;
}

/** The manifests for one side: a restricted namespace and one Deployment + NodePort Service per app. */
export function manifestsFor(side: SideName, spec: SideSpec, now: string): string {
  const ns = namespaceFor(side);
  const docs: string[] = [
    `apiVersion: v1
kind: Namespace
metadata:
  name: ${ns}
  labels:
    app.kubernetes.io/part-of: tutors-harness
    harness/side: "${side}"
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/warn: restricted`
  ];
  for (const app of APPS) {
    const ports = NODE_PORT[side][app];
    docs.push(`apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${app}
  namespace: ${ns}
  labels:
    app.kubernetes.io/name: tutors-${app}
    app.kubernetes.io/part-of: tutors-harness
spec:
  replicas: 1
  revisionHistoryLimit: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: tutors-${app}
  template:
    metadata:
      labels:
        app.kubernetes.io/name: tutors-${app}
        app.kubernetes.io/part-of: tutors-harness
    spec:
      automountServiceAccountToken: false
      terminationGracePeriodSeconds: 30
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          image: ${kindImageName(spec.images[app])}
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 3000
          env:
            - { name: ORIGIN, value: "http://localhost:${ports.host}" }
            - { name: PUBLIC_ANON_MODE, value: "TRUE" }
            - { name: LOG_LEVEL, value: "info" }
            - { name: HARNESS_NOW, value: "${now}" }
            - { name: PRIVATE_AUTH_SECRET, value: "harness-only-not-a-real-secret-000000000000" }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          volumeMounts:
            - name: tmp
              mountPath: /tmp
          startupProbe:
            httpGet: { path: /healthz/live, port: http }
            periodSeconds: 2
            failureThreshold: 30
          livenessProbe:
            httpGet: { path: /healthz/live, port: http }
            periodSeconds: 15
            timeoutSeconds: 2
          readinessProbe:
            httpGet: { path: /healthz/live, port: http }
            periodSeconds: 5
            timeoutSeconds: 3
          resources:
            requests: { cpu: 100m, memory: 192Mi }
            limits: { memory: 384Mi }
      volumes:
        - name: tmp
          emptyDir:
            sizeLimit: 64Mi
---
apiVersion: v1
kind: Service
metadata:
  name: ${app}
  namespace: ${ns}
spec:
  type: NodePort
  selector:
    app.kubernetes.io/name: tutors-${app}
  ports:
    - name: http
      port: 80
      targetPort: http
      nodePort: ${ports.node}`);
  }
  return docs.join("\n---\n") + "\n";
}

function clusterExists(): boolean {
  const out = spawnSync("kind", ["get", "clusters"], { encoding: "utf8" });
  return out.status === 0 && out.stdout.split(/\r?\n/).includes(CLUSTER);
}

let courseServer: ChildProcess | undefined;

function startCourseServer(log: (m: string) => void) {
  if (courseServer) return;
  const port = Number(process.env.COURSE_PORT ?? 8080);
  courseServer = spawn(process.execPath, [resolve(ROOT, "fixtures", "course-server", "serve.mjs"), resolve(ROOT, "fixtures", "course-server", "course"), String(port)], { stdio: "ignore" });
  log(`  fixture course server on the host, port ${port} (pid ${courseServer.pid})`);
}

function stopCourseServer() {
  courseServer?.kill();
  courseServer = undefined;
}

function waitHealthy(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const probe = spawnSync(process.execPath, ["-e", `fetch(${JSON.stringify(url)}).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))`], { encoding: "utf8" });
    if (probe.status === 0) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  throw new Error(`${url} did not become healthy within ${timeoutMs / 1000}s`);
}

/** Create the cluster if needed, load the images, apply both namespaces, wait for rollouts. */
export function kindUp(a: SideSpec, b: SideSpec, now: string, log: (m: string) => void): void {
  refuseLegacyCluster(CLUSTER);
  if (!clusterExists()) {
    log(`  creating kind cluster ${CLUSTER}`);
    sh("kind", ["create", "cluster", "--name", CLUSTER, "--config", KIND_CONFIG, "--wait", "120s"]);
  } else {
    log(`  kind cluster ${CLUSTER} already exists (this checkout's own: it was made by an earlier run here)`);
  }
  const images = [...new Set([...Object.values(a.images), ...Object.values(b.images)])];
  for (const image of images) {
    // `kind load` carries tags, not digests: a digest-pinned image gets a local tag derived from its digest.
    const name = kindImageName(image);
    if (name !== image) docker(["tag", dockerRef(image), name], { quiet: true });
    log(`  loading ${name} into the cluster`);
    sh("kind", ["load", "docker-image", name, "--name", CLUSTER], { quiet: true });
  }
  for (const [side, spec] of [["a", a], ["b", b]] as const) {
    kubectl(["apply", "-f", "-"], { input: manifestsFor(side, spec, now), quiet: true });
  }
  for (const [side] of [["a", a], ["b", b]] as const) {
    for (const app of APPS) kubectl(["-n", namespaceFor(side), "rollout", "status", `deployment/${app}`, "--timeout=180s"], { quiet: true });
  }
  startCourseServer(log);
  for (const side of ["a", "b"] as const) for (const app of APPS) waitHealthy(`http://localhost:${NODE_PORT[side][app].host}/healthz/live`, 60_000);
  log("  both namespaces are up under the restricted pod security standard");
}

/** Delete the namespaces (the cluster stays for the next run; `kind delete cluster` removes it). */
export function kindDown(log: (m: string) => void): void {
  refuseLegacyCluster(CLUSTER);
  stopCourseServer();
  if (!clusterExists()) return;
  for (const side of ["a", "b"] as const) kubectl(["delete", "namespace", namespaceFor(side), "--ignore-not-found", "--wait=false"], { quiet: true });
  log("  namespaces harness-a and harness-b deleted");
}

export interface RolloutOptions {
  rate: number;
  seconds: number;
  outDir: string;
  log: (m: string) => void;
}

/**
 * The rolling update proper: with side a up, roll its reader to b's image
 * under load (maxUnavailable 0, maxSurge 1) and require zero failed requests.
 * This is the rehearsal `upgrade` mode approximates with the edge proxy on
 * compose; here the kubelet does the switching.
 */
export async function kindRollout(a: SideSpec, b: SideSpec, now: string, opts: RolloutOptions): Promise<boolean> {
  kindUp(a, b, now, opts.log);
  const outDir = join(opts.outDir, `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-kind-rollout`);
  mkdirSync(outDir, { recursive: true });
  const name = `${CLUSTER}-k6-rollout`;
  docker(["rm", "-f", name], { quiet: true });
  docker(
    [
      "run", "-d", "--name", name, "--user", "0", "--add-host", "host.docker.internal:host-gateway",
      "-v", `${resolve(ROOT, "traffic", "load").replaceAll("\\", "/")}:/scripts:ro`,
      "-v", `${outDir.replaceAll("\\", "/")}:/out`,
      process.env.HARNESS_K6_IMAGE ?? "grafana/k6:latest", "run", "--quiet", "--no-color", "--out", "json=/out/k6.json",
      "-e", `BASE=http://host.docker.internal:${NODE_PORT.a.reader.host}`, "-e", `COURSE=${a.urls.courseId}`, "-e", `RATE=${opts.rate}`, "-e", `DURATION=${opts.seconds}s`,
      "/scripts/reader.js"
    ],
    { quiet: true }
  );
  opts.log(`  load against harness-a/reader for ${opts.seconds}s at ${opts.rate} req/s`);
  await new Promise((r) => setTimeout(r, (opts.seconds * 1000) / 3));
  const started = Date.now();
  opts.log(`  kubectl set image deployment/reader app=${kindImageName(b.images.reader)}`);
  kubectl(["-n", namespaceFor("a"), "set", "image", "deployment/reader", `app=${kindImageName(b.images.reader)}`], { quiet: true });
  kubectl(["-n", namespaceFor("a"), "rollout", "status", "deployment/reader", "--timeout=120s"], { quiet: true });
  opts.log(`  rollout complete in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  docker(["wait", name], { quiet: true });
  docker(["rm", "-f", name], { quiet: true });

  const result = { ...summariseUpgrade(readFileSync(join(outDir, "k6.json"), "utf8"), (opts.seconds * 1000) / 3, opts.seconds * 1000), substrate: "kind" as const };
  if (a.images.reader === b.images.reader) opts.log("  note: a and b run the same reader image, so the rollout changed nothing; use two tags to rehearse a real update");
  const hunks = judgeUpgrade(result);
  writeFileSync(join(outDir, "rollout.json"), JSON.stringify({ result, hunks }, null, 2));
  for (const h of hunks) opts.log(`  ${h.severity === "fail" ? "FAIL" : "ok"}: ${h.summary}`);
  opts.log(`  written ${join(outDir, "rollout.json")}`);
  return hunks.every((h) => h.severity !== "fail");
}
