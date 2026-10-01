import { runsAsRoot } from "../image-static/manifest.ts";
import { IMAGE_APPS, type AppImageStatic, type BuildProvenanceData, type ImageApp, type ImageManifest, type VulnData } from "../image-static/types.ts";
import type { Artefact, Hunk, SideCapture } from "../types.ts";
import { hunkId } from "./pages.ts";

/**
 * The absolute policy family (since 1.22.0): checks on the candidate alone. A diff can only say the candidate is no
 * worse than production; these say what b must be, whatever a is. Each result is a hunk, beside the diff and under the
 * same Gate, claimable the same way (artefact and scope), and each check has a level (src/compare/levels.ts): all three
 * ship **informing**, so a finding is reported and never gates.
 *
 *   image-hardening   <app>/user, <app>/healthcheck, <app>/env/<NAME>, <app>/history/<NAME>
 *                     b's image config, as the manifest engine collects it: runs as root, declares no HEALTHCHECK, or
 *                     carries something secret-shaped in its environment or its layer history (src/image-static/secrets.ts)
 *   build-provenance  <app>/slsa, <app>/builder
 *                     the SLSA provenance cosign verified on b's digest, under the publishing workflow's identity: none,
 *                     or one whose builder is not the monorepo's image-build.yml
 *   vuln-ceiling      <app>/<advisory id>
 *                     the grype scan already run on b: any critical or high advisory with a fix available, whether or not
 *                     production has it too
 *
 * Every app also gets an informational `<app>/summary` hunk saying what was checked, or `<app>/not-evaluated` saying why
 * it could not be, so a quiet check reads differently from one that did not run. Each finding says whether production
 * has it too (`a` evaluated the same way): a fault on both sides is visible, which no diff can show. Only b is judged.
 */
export const POLICY_FAMILY = ["image-hardening", "build-provenance", "vuln-ceiling"] as const satisfies readonly Artefact[];
export type PolicyCheck = (typeof POLICY_FAMILY)[number];

/** What a check found on one image: the findings (scope suffix, words), what was checked, or why it could not be. */
type Outcome = { findings: { key: string; text: string }[]; checked: string } | { notEvaluated: string };

/** A builder or workflow that is the monorepo's publishing workflow. */
export const PUBLISHING_WORKFLOW = /\.github\/workflows\/image-build\.ya?ml/;
const SEVERE = /^(critical|high)$/i;

// ---- the three checks, over one image -----------------------------------------------------------------

export function hardening(m: ImageManifest): Outcome {
  if (m.healthcheck === undefined || m.secretEnv === undefined) return { notEvaluated: "the capture was recorded before 1.22.0 and has no healthcheck or environment" };
  const findings: { key: string; text: string }[] = [];
  if (runsAsRoot(m.user)) findings.push({ key: "user", text: `runs as root (USER ${m.user === "" ? "unset" : m.user})` });
  if (m.healthcheck === null) findings.push({ key: "healthcheck", text: "declares no HEALTHCHECK" });
  for (const f of m.secretEnv) findings.push({ key: `env/${f.name}`, text: `environment variable ${f.name} looks like a secret: ${f.why}` });
  for (const f of m.secretHistory ?? []) findings.push({ key: `history/${f.name}`, text: `layer history entry ${f.entry ?? "?"} holds ${f.name}, which looks like a secret: ${f.why}` });
  const history = m.secretHistory === null || m.secretHistory === undefined ? "layer history not read" : `${m.secretHistory.length} in the layer history`;
  return { findings, checked: `USER ${m.user === "" ? "unset" : m.user}, ${m.healthcheck === null ? "no HEALTHCHECK" : `HEALTHCHECK ${m.healthcheck}`}, ${m.secretEnv.length} secret-looking environment variable(s), ${history}` };
}

export function provenance(p: BuildProvenanceData, digest: string | undefined): Outcome {
  const on = digest ? ` on ${digest.replace(/^sha256:/, "").slice(0, 12)}` : "";
  if (!p.statements.length) return { findings: [{ key: "slsa", text: `carries no SLSA provenance verified under the publishing identity${on}` }], checked: "" };
  const good = p.statements.find((s) => PUBLISHING_WORKFLOW.test(s.builder ?? "") || PUBLISHING_WORKFLOW.test(s.workflow ?? ""));
  if (!good) {
    const by = p.statements.map((s) => s.workflow ?? s.builder ?? "an unnamed builder").join(", ");
    return { findings: [{ key: "builder", text: `SLSA provenance names ${by}, not image-build.yml` }], checked: "" };
  }
  return { findings: [], checked: `SLSA provenance ${good.predicateType.replace("https://slsa.dev/provenance/", "")} by ${good.workflow ?? good.builder}` };
}

export function ceiling(v: VulnData): Outcome {
  const findings = Object.keys(v.findings)
    .sort()
    .flatMap((id) => {
      const f = v.findings[id]!;
      return SEVERE.test(f.severity) && f.fixedIn ? [{ key: id, text: `${id} (${f.severity}) in ${f.packages.join(", ")} has a fix: ${f.fixedIn}` }] : [];
    });
  const severe = Object.values(v.findings).filter((f) => SEVERE.test(f.severity)).length;
  return { findings, checked: `${Object.keys(v.findings).length} advisories scanned, ${severe} critical or high, none with a fix available` };
}

// ---- the engine ----------------------------------------------------------------------------------------

function outcome(check: PolicyCheck, s: AppImageStatic | undefined, side: SideCapture, app: ImageApp): Outcome {
  if (!s) return { notEvaluated: "nothing was collected for this app" };
  switch (check) {
    case "image-hardening":
      return s.manifest.ok ? hardening(s.manifest.data) : { notEvaluated: `no image config: ${s.manifest.reason}` };
    case "build-provenance":
      if (!s.buildProvenance) return { notEvaluated: "the capture was recorded before 1.22.0 and has no provenance" };
      return s.buildProvenance.ok ? provenance(s.buildProvenance.data, side.provenance?.images[app]?.digest) : { notEvaluated: s.buildProvenance.reason };
    case "vuln-ceiling":
      return s.vulns.ok ? ceiling(s.vulns.data) : { notEvaluated: `no vulnerability scan: ${s.vulns.reason}` };
  }
}

const hunk = (artefact: PolicyCheck, scope: string, severity: Hunk["severity"], summary: string): Hunk => ({ id: hunkId(artefact, scope), artefact, scope, severity, summary });

/** Every policy check on every app of b. a is read only to say whether production has the same finding. */
export const policy = (a: SideCapture, b: SideCapture): Hunk[] => {
  if (!b.imageStatic) return [];
  const hunks: Hunk[] = [];
  for (const check of POLICY_FAMILY) {
    for (const app of IMAGE_APPS) {
      const sb = b.imageStatic[app];
      // A capture recorded before `time` joined the stack (contract 1.3.0) has no time app to judge.
      if (!sb && app === "time") continue;
      const got = outcome(check, sb, b, app);
      if ("notEvaluated" in got) {
        hunks.push(hunk(check, `${app}/not-evaluated`, "info", `${app}: ${check} could not be evaluated on b: ${got.notEvaluated}`));
        continue;
      }
      const sa = a.imageStatic?.[app];
      const onA = sa ? outcome(check, sa, a, app) : undefined;
      const aKeys = onA && "findings" in onA ? new Set(onA.findings.map((f) => f.key)) : undefined;
      for (const f of got.findings) {
        const where = aKeys === undefined ? "" : aKeys.has(f.key) ? " (production too)" : " (new on b)";
        hunks.push(hunk(check, `${app}/${f.key}`, "fail", `${app}: ${f.text}${where}`));
      }
      if (!got.findings.length) hunks.push(hunk(check, `${app}/summary`, "info", `${app}: ${check} holds on b: ${got.checked}`));
    }
  }
  return hunks;
};
