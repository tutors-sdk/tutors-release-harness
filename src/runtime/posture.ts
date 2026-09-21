import type { ContainerPosture, NotCollected, RuntimeCapture, Substrate } from "../types.ts";
import { reasonOf } from "./tool.ts";

/**
 * Container runtime posture (contract 1.2.0). Two halves per container:
 *
 *   declared   what the orchestrator was told: `docker inspect` under compose,
 *              the pod spec under kind — user, capabilities, read-only root
 *              filesystem, security options, writable mounts, requests/limits;
 *   measured   what a process inside the container actually sees: UID/GID,
 *              effective and bounding capabilities, no-new-privileges, seccomp,
 *              whether the root filesystem is mounted `ro`, whether /tmp is
 *              writable, and how many EROFS errors the app logged.
 *
 * Declared drift catches a harness stack that stopped being identical to
 * production's shape; measured drift catches an image that changed underneath
 * the same declaration (a new USER, a VOLUME, a file capability). Both are
 * compared exactly, and an app that writes outside /tmp shows up as read-only
 * filesystem errors, because both stacks run with a read-only root and a
 * tmpfs /tmp (compose.harness.yaml, deploy/kind manifests).
 *
 * Everything here is pure or takes a `PostureTarget`; the process runner is
 * injected (src/runtime/targets.ts), so unit tests never touch Docker.
 */

export type Declared = Omit<ContainerPosture, "effective" | "readOnlyViolations">;
export type Effective = ContainerPosture["effective"];

/** Where a container's facts come from. One implementation per substrate (src/runtime/targets.ts). */
export interface PostureTarget {
  substrate: Substrate;
  /** The apps to inspect on this side. */
  apps: string[];
  /** Parsed declared posture; throws ToolError when the container cannot be found or inspected. */
  declared(app: string): Declared;
  /** Run `argv` inside the app's container; returns stdout. Throws ToolError. */
  execIn(app: string, argv: string[]): string;
  /** The app's log output so far (stdout and stderr). Throws ToolError. */
  logs(app: string): string;
}

// ---- pure parsers ------------------------------------------------------------------

const sorted = (xs: Iterable<string>) => [...new Set(xs)].sort();

/** `192Mi`, `384M`, `1Gi`, `1e3`, `1.5` → bytes (memory) or a plain number; null for unset. */
export function parseQuantity(q: string | number | undefined | null): number | null {
  if (q === undefined || q === null || q === "") return null;
  if (typeof q === "number") return q;
  const m = /^([0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?)(Ki|Mi|Gi|Ti|Pi|Ei|n|u|m|k|M|G|T|P|E)?$/i.exec(q.trim());
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2] ?? "";
  const factor: Record<string, number> = { Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4, Pi: 1024 ** 5, Ei: 1024 ** 6, n: 1e-9, u: 1e-6, m: 1e-3, k: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18 };
  return Math.round(n * (factor[unit] ?? 1) * 1e6) / 1e6;
}

/** CPU quantity to millicores: `100m` → 100, `1` → 1000, `0.5` → 500. */
export function cpuMillis(q: string | number | undefined | null): number | null {
  const n = parseQuantity(q);
  return n === null ? null : Math.round(n * 1000);
}

const positive = (n: unknown): number | null => (typeof n === "number" && n > 0 ? n : null);
const asStrings = (xs: unknown): string[] => (Array.isArray(xs) ? xs.filter((x): x is string => typeof x === "string") : []);

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {});

/** `docker inspect <container>` (the array it prints, or its one element) → the declared half. */
export function declaredFromDockerInspect(raw: unknown): Declared {
  const inspected = obj(Array.isArray(raw) ? raw[0] : raw);
  const config = obj(inspected.Config);
  const host = obj(inspected.HostConfig);
  const mounts = Array.isArray(inspected.Mounts) ? (inspected.Mounts as Json[]) : [];
  const writable = [...mounts.filter((m) => m.RW === true).map((m) => String(m.Destination)), ...Object.keys(obj(host.Tmpfs))];
  const cpuFromQuota = positive(host.CpuQuota) && positive(host.CpuPeriod) ? Math.round((host.CpuQuota as number / (host.CpuPeriod as number)) * 1000) : null;
  const nano = positive(host.NanoCpus);
  return {
    user: String(config.User ?? ""),
    runAsNonRoot: null,
    privileged: host.Privileged === true,
    readOnlyRootfs: host.ReadonlyRootfs === true,
    capAdd: sorted(asStrings(host.CapAdd).map((c) => c.toUpperCase().replace(/^CAP_/, ""))),
    capDrop: sorted(asStrings(host.CapDrop).map((c) => c.toUpperCase().replace(/^CAP_/, ""))),
    securityOpt: sorted(asStrings(host.SecurityOpt)),
    writablePaths: sorted(writable),
    resources: {
      memoryRequest: positive(host.MemoryReservation),
      memoryLimit: positive(host.Memory),
      cpuRequest: null,
      cpuLimit: nano ? Math.round(nano / 1e6) : cpuFromQuota,
      pidsLimit: positive(host.PidsLimit)
    }
  };
}

const WRITABLE_VOLUME_KINDS = new Set(["emptyDir", "hostPath", "persistentVolumeClaim", "ephemeral", "nfs"]);

/** A pod (from `kubectl get pod -o json`) and the name of its container → the declared half. */
export function declaredFromPod(rawPod: unknown, containerName = "app"): Declared {
  const pod = obj(rawPod);
  const spec = obj(pod.spec);
  const podCtx = obj(spec.securityContext);
  const containers = Array.isArray(spec.containers) ? (spec.containers as Json[]) : [];
  const container = containers.find((c) => c.name === containerName) ?? containers[0];
  if (!container) throw new Error("the pod has no containers");
  const ctx = obj(container.securityContext);
  const caps = obj(ctx.capabilities);
  const resources = obj(container.resources);
  const requests = obj(resources.requests);
  const limits = obj(resources.limits);
  const seccomp = obj(ctx.seccompProfile ?? podCtx.seccompProfile);
  const runAs = ctx.runAsUser ?? podCtx.runAsUser;
  const nonRoot = ctx.runAsNonRoot ?? podCtx.runAsNonRoot;

  const volumeKinds = new Map<string, string>();
  for (const v of Array.isArray(spec.volumes) ? (spec.volumes as Json[]) : []) {
    const kind = Object.keys(v).find((k) => k !== "name");
    if (kind) volumeKinds.set(String(v.name), kind);
  }
  const writable = (Array.isArray(container.volumeMounts) ? (container.volumeMounts as Json[]) : [])
    .filter((m) => m.readOnly !== true && WRITABLE_VOLUME_KINDS.has(volumeKinds.get(String(m.name)) ?? ""))
    .map((m) => String(m.mountPath));

  const securityOpt: string[] = [];
  if (ctx.allowPrivilegeEscalation === false) securityOpt.push("no-new-privileges:true");
  if (typeof seccomp.type === "string") securityOpt.push(`seccomp=${seccomp.type}${typeof seccomp.localhostProfile === "string" ? `:${seccomp.localhostProfile}` : ""}`);

  return {
    user: runAs === undefined || runAs === null ? "" : String(runAs),
    runAsNonRoot: typeof nonRoot === "boolean" ? nonRoot : null,
    privileged: ctx.privileged === true,
    readOnlyRootfs: ctx.readOnlyRootFilesystem === true,
    capAdd: sorted(asStrings(caps.add).map((c) => c.toUpperCase().replace(/^CAP_/, ""))),
    capDrop: sorted(asStrings(caps.drop).map((c) => c.toUpperCase().replace(/^CAP_/, ""))),
    securityOpt: sorted(securityOpt),
    writablePaths: sorted(writable),
    resources: {
      memoryRequest: parseQuantity(requests.memory as string | undefined),
      memoryLimit: parseQuantity(limits.memory as string | undefined),
      cpuRequest: cpuMillis(requests.cpu as string | undefined),
      cpuLimit: cpuMillis(limits.cpu as string | undefined),
      pidsLimit: null
    }
  };
}

const CAPS = [
  "CHOWN", "DAC_OVERRIDE", "DAC_READ_SEARCH", "FOWNER", "FSETID", "KILL", "SETGID", "SETUID", "SETPCAP", "LINUX_IMMUTABLE",
  "NET_BIND_SERVICE", "NET_BROADCAST", "NET_ADMIN", "NET_RAW", "IPC_LOCK", "IPC_OWNER", "SYS_MODULE", "SYS_RAWIO", "SYS_CHROOT", "SYS_PTRACE",
  "SYS_PACCT", "SYS_ADMIN", "SYS_BOOT", "SYS_NICE", "SYS_RESOURCE", "SYS_TIME", "SYS_TTY_CONFIG", "MKNOD", "LEASE", "AUDIT_WRITE",
  "AUDIT_CONTROL", "SETFCAP", "MAC_OVERRIDE", "MAC_ADMIN", "SYSLOG", "WAKE_ALARM", "BLOCK_SUSPEND", "AUDIT_READ", "PERFMON", "BPF", "CHECKPOINT_RESTORE"
];

/** `/proc/<pid>/status` capability mask (hex) → sorted capability names; bits this table does not know are `CAP_<n>`. */
export function capNames(hex: string): string[] {
  if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error(`not a capability mask: "${hex}"`);
  const mask = BigInt(`0x${hex}`);
  const names: string[] = [];
  for (let bit = 0; bit < 64; bit += 1) if ((mask >> BigInt(bit)) & 1n) names.push(CAPS[bit] ?? `CAP_${bit}`);
  return names.sort();
}

/**
 * The script run inside the container (`node -e`): node is what the apps run
 * on, so it is in every app image, and it can read /proc without a shell or
 * any tool the image may lack. It prints one JSON object and nothing else.
 */
export const PROBE_SCRIPT = [
  "const fs=require('fs');",
  "const rd=(p)=>{try{return fs.readFileSync(p,'utf8')}catch(e){return ''}};",
  "const w=(d)=>{try{const f=d+'/.harness-probe-'+process.pid;fs.writeFileSync(f,'x');fs.unlinkSync(f);return true}catch(e){return false}};",
  "const st=rd('/proc/self/status').split('\\n').filter((l)=>/^(Uid|Gid|CapEff|CapBnd|NoNewPrivs|Seccomp):/.test(l)).join('\\n');",
  "const root=rd('/proc/self/mountinfo').split('\\n').find((l)=>l.split(' ')[4]==='/')||'';",
  "process.stdout.write(JSON.stringify({status:st,root:root,tmp:w('/tmp'),cwd:w(process.cwd())}))"
].join("");

/** Parse what PROBE_SCRIPT printed. Throws when it is not what the script prints: a probe that cannot be read is not a pass. */
export function parseProbe(stdout: string): Effective {
  let raw: Json;
  try {
    raw = obj(JSON.parse(stdout.trim()));
  } catch {
    throw new Error(`the in-container probe printed something else: ${stdout.trim().slice(0, 120) || "(nothing)"}`);
  }
  const status = typeof raw.status === "string" ? raw.status : "";
  const field = (name: string): string[] => {
    const line = status.split("\n").find((l) => l.startsWith(`${name}:`));
    if (!line) throw new Error(`the in-container probe has no ${name} line: /proc/self/status was unreadable`);
    return line.slice(name.length + 1).trim().split(/\s+/);
  };
  const seccompCode = field("Seccomp")[0];
  const rootLine = typeof raw.root === "string" ? raw.root : "";
  if (!rootLine) throw new Error("the in-container probe found no root mount in /proc/self/mountinfo");
  const rootOptions = (rootLine.split(" ")[5] ?? "").split(",");
  return {
    uid: Number(field("Uid")[1]),
    gid: Number(field("Gid")[1]),
    capEff: capNames(field("CapEff")[0]!),
    capBnd: capNames(field("CapBnd")[0]!),
    noNewPrivs: field("NoNewPrivs")[0] === "1",
    seccomp: seccompCode === "0" ? "disabled" : seccompCode === "1" ? "strict" : seccompCode === "2" ? "filter" : "unknown",
    rootfsReadOnly: rootOptions.includes("ro"),
    tmpWritable: raw.tmp === true,
    cwdWritable: raw.cwd === true
  };
}

/** Log lines that say a write hit a read-only filesystem: the app tried to write outside /tmp. */
export function countReadOnlyViolations(logText: string): number {
  return logText.split(/\r?\n/).filter((l) => /\bEROFS\b|read-only file ?system/i.test(l)).length;
}

// ---- the collector --------------------------------------------------------------------

/**
 * Collect every app's posture on one side. A container that cannot be
 * inspected or probed becomes `{ collected: false, reason }` for that app
 * only: the rest is still compared, and the gap is a hunk (src/compare/runtime.ts).
 */
export function collectPosture(target: PostureTarget, log: (m: string) => void = () => {}): RuntimeCapture {
  const containers: RuntimeCapture["containers"] = {};
  for (const app of target.apps) {
    try {
      const declared = target.declared(app);
      const effective = parseProbe(target.execIn(app, ["node", "-e", PROBE_SCRIPT]));
      const readOnlyViolations = countReadOnlyViolations(target.logs(app));
      containers[app] = { ...declared, effective, readOnlyViolations };
    } catch (e) {
      const reason = reasonOf(e);
      log(`    runtime posture: ${app} not collected: ${reason}`);
      containers[app] = { collected: false, reason } satisfies NotCollected;
    }
  }
  return { collected: true, substrate: target.substrate, containers };
}
