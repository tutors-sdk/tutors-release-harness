import type { EngineConfig } from "../normalise/masks.ts";
import { runsAsRoot } from "../image-static/manifest.ts";
import { splitPackageKey } from "../image-static/sbom.ts";
import { IMAGE_APPS, type Collected, type ImageApp, type ImageManifest, type SbomData, type VulnData } from "../image-static/types.ts";
import type { Artefact, Hunk, SideCapture } from "../types.ts";
import { notCollectedHunk } from "../not-collected.ts";
import { hunkId } from "./pages.ts";

type Engine = (a: SideCapture, b: SideCapture, ctx: { config: EngineConfig }) => Hunk[];

/**
 * Static image artefacts: what the two sides' images ARE, compared without
 * running them. Three artefacts, three claim vocabularies:
 *
 *   image-manifest  <app>/<field>            base, user, ports/<port>, entrypoint, cmd, layers, size, platform, label/<key>
 *   sbom            <app>/<package name>     one hunk per package added, removed or bumped
 *   vulns           <app>/<CVE id>           new on b fails; fixed on a is informational; <app>/db when the scans used different databases
 *
 * A side that has no `imageStatic` at all (an external side, a migration run, a
 * capture older than contract 1.2.0) is not compared. A side that has it but
 * could not collect a piece of it is NOT skipped: that is a `<app>/not-collected`
 * hunk (src/not-collected.ts), informational unless the artefact is required
 * (HARNESS_REQUIRE_ARTEFACTS, or its alias HARNESS_REQUIRE_STATIC=1), so it is
 * never silently green.
 */

/** A size change smaller than this fraction, or than this many bytes, is not a finding. */
export const SIZE_TOLERANCE = { fraction: 0.1, bytes: 5 * 1024 * 1024 } as const;

/** Labels that legitimately differ on every build: what is in the report header already. */
const VOLATILE_LABELS = new Set(["org.opencontainers.image.revision", "org.opencontainers.image.created", "org.opencontainers.image.version"]);
const BASE_LABELS = new Set(["org.opencontainers.image.base.name", "org.opencontainers.image.base.digest"]);

const short = (d: string | undefined) => (d ? d.replace(/^sha256:/, "").slice(0, 12) : "none");
const fmtBytes = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;
const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);

function h(artefact: Artefact, scope: string, severity: Hunk["severity"], summary: string, detail?: string): Hunk {
  return { id: hunkId(artefact, scope), artefact, scope, severity, summary, ...(detail ? { detail } : {}) };
}

// ---- image-manifest --------------------------------------------------------------------------

export function diffManifest(app: ImageApp, a: ImageManifest, b: ImageManifest): Hunk[] {
  const hunks: Hunk[] = [];
  const A = "image-manifest" as const;

  // The base. The build's own record of it, when there is one; the lowest layer always.
  const baseChanged = (a.baseDigest ?? "") !== (b.baseDigest ?? "");
  const bottomChanged = a.bottomLayer !== b.bottomLayer;
  if (baseChanged || bottomChanged) {
    const parts: string[] = [];
    if (baseChanged) parts.push(`base digest ${a.baseDigest ? short(a.baseDigest) : "unrecorded"} → ${b.baseDigest ? short(b.baseDigest) : "unrecorded"}${a.baseName || b.baseName ? ` (${a.baseName ?? "?"} → ${b.baseName ?? "?"})` : ""}`);
    if (bottomChanged) parts.push(`lowest layer ${short(a.bottomLayer)} → ${short(b.bottomLayer)}`);
    hunks.push(h(A, `${app}/base`, "fail", `${app}: built FROM a different base image (${parts.join("; ")})`, `base.digest label: a=${a.baseDigest ?? "unrecorded"} b=${b.baseDigest ?? "unrecorded"}\nlowest layer:      a=${a.bottomLayer} b=${b.bottomLayer}`));
  }

  if (`${a.os}/${a.arch}` !== `${b.os}/${b.arch}`) hunks.push(h(A, `${app}/platform`, "fail", `${app}: platform ${a.os}/${a.arch} on a, ${b.os}/${b.arch} on b`));

  if (a.user !== b.user) {
    const wasRoot = runsAsRoot(a.user);
    const nowRoot = runsAsRoot(b.user);
    const show = (u: string) => (u === "" ? "unset (root)" : u);
    if (nowRoot && !wasRoot) hunks.push(h(A, `${app}/user`, "fail", `${app}: now runs as root (USER ${show(b.user)}; was ${show(a.user)})`));
    else if (wasRoot && !nowRoot) hunks.push(h(A, `${app}/user`, "info", `${app}: no longer runs as root (USER ${show(b.user)}; was ${show(a.user)})`));
    else hunks.push(h(A, `${app}/user`, "fail", `${app}: USER ${show(a.user)} → ${show(b.user)}`));
  }

  for (const port of b.ports.filter((p) => !a.ports.includes(p))) hunks.push(h(A, `${app}/ports/${port}`, "fail", `${app}: new exposed port ${port}`));
  for (const port of a.ports.filter((p) => !b.ports.includes(p))) hunks.push(h(A, `${app}/ports/${port}`, "fail", `${app}: no longer exposes port ${port}`));

  if (!same(a.entrypoint, b.entrypoint)) hunks.push(h(A, `${app}/entrypoint`, "fail", `${app}: ENTRYPOINT ${JSON.stringify(a.entrypoint)} → ${JSON.stringify(b.entrypoint)}`));
  if (!same(a.cmd, b.cmd)) hunks.push(h(A, `${app}/cmd`, "fail", `${app}: CMD ${JSON.stringify(a.cmd)} → ${JSON.stringify(b.cmd)}`));

  if (a.layers !== b.layers) hunks.push(h(A, `${app}/layers`, "fail", `${app}: ${a.layers} layer(s) on a, ${b.layers} on b`));

  const delta = b.size - a.size;
  if (Math.abs(delta) >= SIZE_TOLERANCE.bytes && a.size > 0 && Math.abs(delta) / a.size >= SIZE_TOLERANCE.fraction) {
    const pct = `${delta > 0 ? "+" : "−"}${((Math.abs(delta) / a.size) * 100).toFixed(0)}%`;
    hunks.push(h(A, `${app}/size`, delta > 0 ? "fail" : "info", `${app}: image size ${fmtBytes(a.size)} → ${fmtBytes(b.size)} (${pct})`));
  }

  for (const key of [...new Set([...Object.keys(a.labels), ...Object.keys(b.labels)])].sort()) {
    if (VOLATILE_LABELS.has(key) || BASE_LABELS.has(key) || a.labels[key] === b.labels[key]) continue;
    const from = a.labels[key];
    const to = b.labels[key];
    hunks.push(h(A, `${app}/label/${key}`, "fail", from === undefined ? `${app}: label ${key} added (${to})` : to === undefined ? `${app}: label ${key} removed (was ${from})` : `${app}: label ${key} "${from}" → "${to}"`));
  }
  return hunks;
}

// ---- sbom ------------------------------------------------------------------------------------

/** Every package added, removed or bumped, as a set diff over `name@version`. */
export function diffSbom(app: ImageApp, a: SbomData, b: SbomData): Hunk[] {
  const byName = (packages: Record<string, number>) => {
    const map = new Map<string, Set<string>>();
    for (const key of Object.keys(packages)) {
      const { name, version } = splitPackageKey(key);
      (map.get(name) ?? map.set(name, new Set()).get(name)!).add(version);
    }
    return map;
  };
  const pa = byName(a.packages);
  const pb = byName(b.packages);
  const hunks: Hunk[] = [];
  for (const name of [...new Set([...pa.keys(), ...pb.keys()])].sort()) {
    const va = [...(pa.get(name) ?? [])].sort();
    const vb = [...(pb.get(name) ?? [])].sort();
    if (same(va, vb)) continue;
    const scope = `${app}/${name}`;
    if (!va.length) hunks.push(h("sbom", scope, "fail", `${app}: package added: ${name}@${vb.join(", ")}`));
    else if (!vb.length) hunks.push(h("sbom", scope, "fail", `${app}: package removed: ${name}@${va.join(", ")}`));
    else hunks.push(h("sbom", scope, "fail", `${app}: package bumped: ${name} ${va.join(", ")} → ${vb.join(", ")}`));
  }
  return hunks;
}

// ---- vulns -----------------------------------------------------------------------------------

/** A new advisory on b fails; one that a had and b lacks is noted. */
export function diffVulns(app: ImageApp, a: VulnData, b: VulnData): Hunk[] {
  const hunks: Hunk[] = [];
  if (a.scanner.db !== b.scanner.db || a.scanner.version !== b.scanner.version) {
    hunks.push(h("vulns", `${app}/db`, "fail", `${app}: the two sides were scanned with different scanners or databases (a: ${a.scanner.name} ${a.scanner.version ?? "?"}, ${a.scanner.db ?? "db unknown"}; b: ${b.scanner.name} ${b.scanner.version ?? "?"}, ${b.scanner.db ?? "db unknown"}), so a vulnerability diff is not meaningful`));
  }
  for (const id of Object.keys(b.findings).sort()) {
    if (a.findings[id]) continue;
    const f = b.findings[id]!;
    hunks.push(h("vulns", `${app}/${id}`, "fail", `${app}: new vulnerability on b: ${id} (${f.severity}) in ${f.packages.join(", ")}${f.fixedIn ? `; fixed in ${f.fixedIn}` : "; no fix known"}`));
  }
  for (const id of Object.keys(a.findings).sort()) {
    if (b.findings[id]) continue;
    hunks.push(h("vulns", `${app}/${id}`, "info", `${app}: ${id} (${a.findings[id]!.severity}) is present on a and gone on b (fixed)`));
  }
  return hunks;
}

// ---- the engine ----------------------------------------------------------------------------

const NOT_COLLECTED_ARTEFACT = { manifest: "image-manifest", sbom: "sbom", vulns: "vulns" } as const;

function notCollected(app: ImageApp, kind: keyof typeof NOT_COLLECTED_ARTEFACT, a: Collected<unknown>, b: Collected<unknown>): Hunk {
  const why = [!a.ok ? `a: ${a.reason}` : undefined, !b.ok ? `b: ${b.reason}` : undefined].filter(Boolean).join("\n");
  const side = !a.ok && !b.ok ? "both" : !a.ok ? "a" : "b";
  const reason = !a.ok && !b.ok ? (a.reason === b.reason ? a.reason : `a: ${a.reason}; b: ${b.reason}`) : !a.ok ? a.reason : !b.ok ? b.reason : "";
  return notCollectedHunk({ artefact: NOT_COLLECTED_ARTEFACT[kind], scopeSubject: app, what: kind, subject: app, side, reason, detail: why });
}

export const imageStatic: Engine = (a, b) => {
  if (!a.imageStatic || !b.imageStatic) return [];
  const hunks: Hunk[] = [];
  for (const app of IMAGE_APPS) {
    const sa = a.imageStatic[app];
    const sb = b.imageStatic[app];
    // A capture recorded before `time` joined the stack (contract 1.3.0) has nothing to compare it with.
    if (!sa || !sb) continue;
    if (sa.manifest.ok && sb.manifest.ok) hunks.push(...diffManifest(app, sa.manifest.data, sb.manifest.data));
    else hunks.push(notCollected(app, "manifest", sa.manifest, sb.manifest));
    if (sa.sbom.ok && sb.sbom.ok) hunks.push(...diffSbom(app, sa.sbom.data, sb.sbom.data));
    else hunks.push(notCollected(app, "sbom", sa.sbom, sb.sbom));
    if (sa.vulns.ok && sb.vulns.ok) hunks.push(...diffVulns(app, sa.vulns.data, sb.vulns.data));
    else hunks.push(notCollected(app, "vulns", sa.vulns, sb.vulns));
  }
  return hunks;
};
