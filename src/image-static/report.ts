import type { SideCapture } from "../types.ts";
import { IMAGE_APPS, type AppImageStatic, type Collected, type ImageArtefactKind, type ImageArtefactStatus, type SideImageArtefacts, type SideImageStatic } from "./types.ts";

const MB = 1024 * 1024;

function status<T>(value: Collected<T>, summarise: (data: T) => string): ImageArtefactStatus {
  return value.ok ? { collected: true, ...(value.source ? { source: value.source } : {}), summary: summarise(value.data) } : { collected: false, reason: value.reason };
}

function describeApp(s: AppImageStatic): Record<ImageArtefactKind, ImageArtefactStatus> {
  return {
    manifest: status(s.manifest, (m) => `${m.layers} layers, ${(m.size / MB).toFixed(1)} MB, USER ${m.user || "unset"}, ports ${m.ports.join(", ") || "none"}`),
    sbom: status(s.sbom, (d) => `${Object.keys(d.packages).length} distinct package(s)`),
    vulns: status(s.vulns, (d) => `${Object.keys(d.findings).length} advisories${d.scanner.db ? `, db ${d.scanner.db}` : ""}`)
  };
}

/** The report's view of a side's static artefacts: what was collected, and for what was not, why. */
export function describeImageStatic(side: SideImageStatic): SideImageArtefacts {
  return Object.fromEntries(IMAGE_APPS.map((app) => [app, describeApp(side[app])])) as SideImageArtefacts;
}

export function imageArtefactsSection(a: SideCapture, b: SideCapture) {
  if (!a.imageStatic && !b.imageStatic) return undefined;
  return { ...(a.imageStatic ? { a: describeImageStatic(a.imageStatic) } : {}), ...(b.imageStatic ? { b: describeImageStatic(b.imageStatic) } : {}) };
}

/**
 * One line per static artefact that could not be collected, for the report's
 * reasons list, which every renderer shows at the top. Loud on purpose: a
 * release that passed without an SBOM diff must say so where the verdict is.
 */
export function imageStaticReasons(a: SideCapture, b: SideCapture): string[] {
  // Apps that failed for the same reason on the same side are one line.
  const groups: { kind: string; side: string; reason: string; apps: string[] }[] = [];
  for (const [side, capture] of [["a", a], ["b", b]] as const) {
    if (!capture.imageStatic) continue;
    for (const app of IMAGE_APPS) {
      const s = capture.imageStatic[app];
      for (const [kind, value] of [["manifest", s.manifest], ["sbom", s.sbom], ["vulns", s.vulns]] as const) {
        if (value.ok) continue;
        const group = groups.find((g) => g.kind === kind && g.side === side && g.reason === value.reason);
        if (group) group.apps.push(app);
        else groups.push({ kind, side, reason: value.reason, apps: [app] });
      }
    }
  }
  return groups.map((g) => `NOT COLLECTED: ${g.kind} of ${g.apps.join(", ")} on side ${g.side}: ${g.reason}. It was not compared.`);
}
