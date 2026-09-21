import type { EngineConfig } from "../normalise/masks.ts";
import type { ContainerPosture, Hunk, NotCollected, RuntimeCapture, SideCapture, StartupCapture, StartupSample } from "../types.ts";
import { mannWhitney, smallestAttainableP } from "./stats.ts";
import { notCollectedHunk } from "../not-collected.ts";
import { hunkId } from "./pages.ts";

/**
 * The two container-runtime engines (contract 1.2.0):
 *
 *   runtime  exact match of what each app's container is: declared and measured
 *            identity, capabilities, filesystem, security options, requests and
 *            limits. Any difference is a hunk; a change that only tightens the
 *            posture is informational. Two absolute rules ride along, as the
 *            anonymous-write rule does for persistence: running as root, and
 *            writing outside /tmp (a read-only filesystem error in the logs).
 *   startup  the time from the start command to the first healthy `/` and to
 *            the orchestrator's ready verdict, over N restarts, compared with
 *            the same Mann-Whitney test as timing.
 *
 * Neither ever passes silently: an artefact that could not be collected is a
 * `<subject>/not-collected` hunk (src/not-collected.ts: one convention for every
 * artefact). Both are required by default, so it fails (claimable, with a reason,
 * like any other difference) unless an operator switched the artefact off, in
 * which case it is informational and still shown.
 * A capture with no such field at all was recorded before contract 1.2.0, or
 * belongs to a live deployment the harness cannot inspect: nothing to compare.
 */

type Engine = (a: SideCapture, b: SideCapture, ctx: { config: EngineConfig }) => Hunk[];
type Sev = Hunk["severity"];

const hunk = (artefact: "runtime" | "startup", scope: string, severity: Sev, summary: string, detail?: string): Hunk => ({ id: hunkId(artefact, scope), artefact, scope, severity, summary, ...(detail ? { detail } : {}) });

const legacy: NotCollected = { collected: false, reason: "the capture was recorded by a harness older than contract 1.2.0" };

/** What a side's artefact is, for the comparison: absent on both sides means there is nothing to say. */
function pair<T extends { collected: boolean }>(a: T | NotCollected | undefined, b: T | NotCollected | undefined): [T | NotCollected, T | NotCollected] | undefined {
  if (!a && !b) return undefined;
  return [a ?? legacy, b ?? legacy];
}

/** Hunks for a whole artefact that one side (or both) could not produce. Returns true when a comparison is possible. */
function wholeGap(artefact: "runtime" | "startup", a: { collected: boolean } | NotCollected, b: { collected: boolean } | NotCollected, out: Hunk[]): boolean {
  let ok = true;
  for (const [side, capture] of [["a", a], ["b", b]] as const) {
    if (capture.collected) continue;
    const n = capture as NotCollected;
    ok = false;
    out.push(notCollectedHunk({ artefact, scopeSubject: artefact, what: artefact === "runtime" ? "container runtime posture" : "startup time", side, reason: n.reason, ...(n.disabled ? { disabled: true } : {}) }));
  }
  return ok;
}

const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);
const show = (v: unknown): string => (Array.isArray(v) ? (v.length ? v.join(",") : "none") : v === null || v === undefined || v === "" ? "unset" : String(v));
const subset = (small: string[], big: string[]) => small.every((x) => big.includes(x));

// ---- runtime ------------------------------------------------------------------------------

interface Field {
  scope: string;
  label: string;
  get: (c: ContainerPosture) => unknown;
  /** True when b's value is strictly safer than a's: reported, never gates. */
  tighter?: (a: unknown, b: unknown) => boolean;
  /** A message when this value is unacceptable in itself, whichever side it is on. */
  floor?: (v: unknown) => string | undefined;
}

const FIELDS: Field[] = [
  { scope: "user", label: "configured user", get: (c) => c.user },
  { scope: "run-as-non-root", label: "runAsNonRoot", get: (c) => c.runAsNonRoot, tighter: (a, b) => a !== true && b === true },
  { scope: "privileged", label: "privileged", get: (c) => c.privileged, tighter: (a, b) => a === true && b === false },
  { scope: "read-only-rootfs", label: "read-only root filesystem (declared)", get: (c) => c.readOnlyRootfs, tighter: (a, b) => a === false && b === true },
  { scope: "cap-add", label: "capabilities added", get: (c) => c.capAdd, tighter: (a, b) => subset(b as string[], a as string[]) && (b as string[]).length < (a as string[]).length },
  { scope: "cap-drop", label: "capabilities dropped", get: (c) => c.capDrop, tighter: (a, b) => subset(a as string[], b as string[]) && (b as string[]).length > (a as string[]).length },
  { scope: "security-opt", label: "security options", get: (c) => c.securityOpt },
  { scope: "writable-paths", label: "writable mounts", get: (c) => c.writablePaths },
  { scope: "memory-request", label: "memory request (bytes)", get: (c) => c.resources.memoryRequest },
  { scope: "memory-limit", label: "memory limit (bytes)", get: (c) => c.resources.memoryLimit },
  { scope: "cpu-request", label: "cpu request (millicores)", get: (c) => c.resources.cpuRequest },
  { scope: "cpu-limit", label: "cpu limit (millicores)", get: (c) => c.resources.cpuLimit },
  { scope: "pids-limit", label: "pids limit", get: (c) => c.resources.pidsLimit },
  { scope: "uid", label: "effective UID", get: (c) => c.effective.uid, tighter: (a, b) => a === 0 && b !== 0, floor: (v) => (v === 0 ? "runs as root (UID 0)" : undefined) },
  { scope: "gid", label: "effective GID", get: (c) => c.effective.gid },
  { scope: "cap-effective", label: "effective capabilities", get: (c) => c.effective.capEff, tighter: (a, b) => subset(b as string[], a as string[]) && (b as string[]).length < (a as string[]).length },
  { scope: "cap-bounding", label: "bounding capabilities", get: (c) => c.effective.capBnd, tighter: (a, b) => subset(b as string[], a as string[]) && (b as string[]).length < (a as string[]).length },
  { scope: "no-new-privileges", label: "no-new-privileges", get: (c) => c.effective.noNewPrivs, tighter: (a, b) => a === false && b === true },
  { scope: "seccomp", label: "seccomp mode", get: (c) => c.effective.seccomp },
  { scope: "rootfs-mounted-ro", label: "root filesystem mounted read-only", get: (c) => c.effective.rootfsReadOnly, tighter: (a, b) => a === false && b === true, floor: (v) => (v === false ? "has a writable root filesystem" : undefined) },
  { scope: "tmp-writable", label: "/tmp writable", get: (c) => c.effective.tmpWritable, tighter: (a, b) => a === false && b === true, floor: (v) => (v === false ? "cannot write to /tmp" : undefined) },
  { scope: "cwd-writable", label: "the app's working directory writable", get: (c) => c.effective.cwdWritable, tighter: (a, b) => a === true && b === false }
];

function compareContainer(app: string, ca: ContainerPosture, cb: ContainerPosture, out: Hunk[]) {
  for (const f of FIELDS) {
    const va = f.get(ca);
    const vb = f.get(cb);
    const scope = `${app}/${f.scope}`;
    if (same(va, vb)) {
      const bad = f.floor?.(va);
      if (bad) out.push(hunk("runtime", scope, "info", `${app} ${bad} on both sides: a product finding, not a release diff`));
      continue;
    }
    const tighter = f.tighter?.(va, vb) === true;
    const worse = f.floor?.(vb);
    out.push(hunk("runtime", scope, tighter ? "info" : "fail", `${app}: ${f.label} ${show(va)} on a, ${show(vb)} on b${tighter ? " (tightened)" : ""}${worse ? `; b ${worse}` : ""}`));
  }

  // Writing outside /tmp: with the root filesystem read-only, the only trace is the error the app logs.
  const ea = ca.readOnlyViolations > 0;
  const eb = cb.readOnlyViolations > 0;
  const scope = `${app}/writes-outside-tmp`;
  if (ea && eb) out.push(hunk("runtime", scope, "info", `${app} hit a read-only filesystem on both sides (${ca.readOnlyViolations} on a, ${cb.readOnlyViolations} on b): a product finding, not a release diff`));
  else if (eb) out.push(hunk("runtime", scope, "fail", `${app}: ${cb.readOnlyViolations} read-only filesystem error(s) in b's logs, none on a: the app now writes outside /tmp`));
  else if (ea) out.push(hunk("runtime", scope, "info", `${app}: ${ca.readOnlyViolations} read-only filesystem error(s) in a's logs, none on b (fixed)`));
}

function postureLine(c: ContainerPosture): string {
  const e = c.effective;
  return `uid ${e.uid}:${e.gid}, caps ${show(e.capEff)}, root fs ${e.rootfsReadOnly ? "ro" : "rw"}, /tmp ${e.tmpWritable ? "rw" : "ro"}, ${e.noNewPrivs ? "no-new-privileges" : "may gain privileges"}, seccomp ${e.seccomp}`;
}

export const runtime: Engine = (a, b) => {
  const hunks: Hunk[] = [];
  if (a.external || b.external) return hunks;
  const both = pair<RuntimeCapture>(a.runtime, b.runtime);
  if (!both) return hunks;
  const [ra, rb] = both;
  if (!wholeGap("runtime", ra, rb, hunks)) return hunks;
  const xa = (ra as RuntimeCapture).containers;
  const xb = (rb as RuntimeCapture).containers;

  const compared: string[] = [];
  for (const app of [...new Set([...Object.keys(xa), ...Object.keys(xb)])].sort()) {
    const ca = xa[app];
    const cb = xb[app];
    const gap = [["a", ca], ["b", cb]] as const;
    let ok = true;
    for (const [side, c] of gap) {
      if (c && "effective" in c) continue;
      ok = false;
      hunks.push(notCollectedHunk({ artefact: "runtime", scopeSubject: app, what: "container posture", subject: app, side, reason: c ? (c as NotCollected).reason : "no such container on this side" }));
    }
    if (!ok) continue;
    compareContainer(app, ca as ContainerPosture, cb as ContainerPosture, hunks);
    compared.push(app);
  }
  if (compared.length) {
    const detail = compared.map((app) => `${app}: a — ${postureLine(xa[app] as ContainerPosture)}\n${" ".repeat(app.length + 2)}b — ${postureLine(xb[app] as ContainerPosture)}`).join("\n");
    hunks.push(hunk("runtime", "runtime/summary", "info", `container posture collected for ${compared.join(", ")} on both sides (${(ra as RuntimeCapture).substrate})`, detail));
  }
  return hunks;
};

// ---- startup ---------------------------------------------------------------------------------

const median = (xs: number[]) => {
  const s = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
};
const numbers = (xs: (number | null)[]) => xs.filter((x): x is number => x !== null);
const modal = (xs: (number | null)[]) => {
  const counts = new Map<number, number>();
  for (const x of xs) if (x !== null) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts.entries()].sort((p, q) => q[1] - p[1] || p[0] - q[0])[0]?.[0];
};
const failed = (s: StartupSample) => s.rootMs === null || s.readyMs === null;

export const startup: Engine = (a, b, ctx) => {
  const hunks: Hunk[] = [];
  if (a.external || b.external) return hunks;
  const both = pair<StartupCapture>(a.startup, b.startup);
  if (!both) return hunks;
  const [sa, sb] = both;
  if (!wholeGap("startup", sa, sb, hunks)) return hunks;
  const xa = (sa as StartupCapture).apps;
  const xb = (sb as StartupCapture).apps;
  const { minRuns, alpha, minEffect } = ctx.config.timing;
  const { minShiftMs } = ctx.config.startup;
  const timeoutS = (sb as StartupCapture).timeoutMs / 1000;

  const summary: string[] = [];
  for (const app of [...new Set([...Object.keys(xa), ...Object.keys(xb)])].sort()) {
    const ea = xa[app];
    const eb = xb[app];
    let ok = true;
    for (const [side, e] of [["a", ea], ["b", eb]] as const) {
      if (e && "samples" in e) continue;
      ok = false;
      hunks.push(notCollectedHunk({ artefact: "startup", scopeSubject: app, what: "startup time", subject: app, side, reason: e ? (e as NotCollected).reason : "no such app on this side" }));
    }
    if (!ok) continue;
    const samplesA = (ea as { samples: StartupSample[] }).samples;
    const samplesB = (eb as { samples: StartupSample[] }).samples;

    // Did it come up at all?
    const failA = samplesA.filter(failed).length;
    const failB = samplesB.filter(failed).length;
    const scope = `${app}/boot`;
    if (failB > failA) hunks.push(hunk("startup", scope, "fail", `${app}: b did not become healthy within ${timeoutS}s in ${failB} of ${samplesB.length} restart(s) (a: ${failA} of ${samplesA.length})`));
    else if (failB < failA) hunks.push(hunk("startup", scope, "info", `${app}: a did not become healthy in ${failA} of ${samplesA.length} restart(s), b in ${failB} (fixed)`));
    else if (failA > 0) hunks.push(hunk("startup", scope, "info", `${app} did not become healthy in ${failA} of ${samplesA.length} restart(s) on both sides: a product finding, not a release diff`));

    // What answered.
    const statusA = modal(samplesA.map((s) => s.rootStatus));
    const statusB = modal(samplesB.map((s) => s.rootStatus));
    if (statusA !== undefined && statusB !== undefined && statusA !== statusB) hunks.push(hunk("startup", `${app}/root-status`, "fail", `${app}: GET / answers ${statusA} on a and ${statusB} on b after a restart`));

    // How long it took.
    const lines: string[] = [];
    for (const [key, label, pick] of [["root", "first healthy /", (s: StartupSample) => s.rootMs], ["ready", "ready", (s: StartupSample) => s.readyMs]] as const) {
      const xs = numbers(samplesA.map(pick));
      const ys = numbers(samplesB.map(pick));
      if (!xs.length || !ys.length) continue;
      const ma = median(xs);
      const mb = median(ys);
      lines.push(`${label} ${Math.round(ma)} → ${Math.round(mb)} ms`);
      const effect = ma > 0 ? (mb - ma) / ma : 0;
      const at = `${app}/${key}`;
      if (mb < ma && -effect >= minEffect && ma - mb >= minShiftMs) {
        hunks.push(hunk("startup", at, "info", `${app}: ${label} faster on b: median ${Math.round(ma)} ms → ${Math.round(mb)} ms`));
        continue;
      }
      if (effect < minEffect || mb - ma < minShiftMs) continue;
      const slower = `${app}: ${label} slower on b: median ${Math.round(ma)} ms → ${Math.round(mb)} ms (+${(effect * 100).toFixed(0)}%)`;
      if (xs.length < minRuns || ys.length < minRuns) {
        hunks.push(hunk("startup", at, "info", `${slower}; ${Math.min(xs.length, ys.length)} sample(s), need ${minRuns} to judge. Raise --startup-restarts`));
        continue;
      }
      const floor = smallestAttainableP(xs.length, ys.length);
      if (floor >= alpha) {
        hunks.push(hunk("startup", at, "info", `${slower}; ${xs.length}/${ys.length} samples cannot reach alpha ${alpha} (best possible p=${floor.toFixed(3)}). Raise --startup-restarts`));
        continue;
      }
      const { p } = mannWhitney(xs, ys);
      hunks.push(hunk("startup", at, p < alpha ? "fail" : "info", p < alpha ? `${slower}, p=${p.toFixed(3)}, n=${xs.length}/${ys.length}` : `${slower} but not significant (p=${p.toFixed(3)}, n=${xs.length}/${ys.length})`));
    }
    if (lines.length) summary.push(`${app}: ${lines.join(", ")} (median, a → b, n=${samplesA.length}/${samplesB.length})`);
  }
  if (summary.length) hunks.push(hunk("startup", "startup/summary", "info", `startup time collected on both sides (${(sa as StartupCapture).substrate}, ${(sa as StartupCapture).restarts} restart(s) per app)`, summary.join("\n")));
  return hunks;
};

export const RUNTIME_ENGINES: Record<string, Engine> = { runtime, startup };
