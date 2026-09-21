import type { Exec } from "../images.ts";
import { failureReason, fillCommand, type TempFiles } from "./command.ts";
import type { Collected, VulnData, VulnFinding } from "./types.ts";

/**
 * The scanner is a command, not a dependency. `{sbom}` is replaced by the path
 * of the image's SPDX SBOM, and the command must print grype's or trivy's JSON
 * on stdout. The default is grype with its database pinned (below); trivy is
 * `trivy sbom --format json --skip-db-update --offline-scan {sbom}`.
 */
export const DEFAULT_VULN_CMD = "grype sbom:{sbom} -o json";

export interface VulnDeps {
  exec: Exec;
  files: TempFiles;
  vulnCmd: string;
  /** Directory holding a pre-fetched scanner database, exported as GRYPE_DB_CACHE_DIR and TRIVY_CACHE_DIR. */
  dbDir?: string;
}

/**
 * Pinning: the scanner may never update its database during a run, or a CVE
 * published between the two sides' scans would look like a change in the
 * release. These variables switch updates off for grype and trivy; the
 * database itself is fetched and versioned by whoever owns the runner
 * (docs/images.md, "Vulnerability scan").
 */
export function scannerEnv(dbDir: string | undefined): NodeJS.ProcessEnv {
  return {
    GRYPE_DB_AUTO_UPDATE: "false",
    GRYPE_CHECK_FOR_APP_UPDATE: "false",
    TRIVY_SKIP_DB_UPDATE: "true",
    TRIVY_SKIP_JAVA_DB_UPDATE: "true",
    TRIVY_OFFLINE_SCAN: "true",
    TRIVY_NO_PROGRESS: "true",
    ...(dbDir ? { GRYPE_DB_CACHE_DIR: dbDir, TRIVY_CACHE_DIR: dbDir } : {})
  };
}

const SCANNER_HINT = "https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy";

const pkg = (name: string | undefined, version: string | undefined) => `${name ?? "?"}@${version ?? "?"}`;

function add(findings: Record<string, VulnFinding>, id: string, severity: string, packageKey: string, fixedIn: string | undefined) {
  const f = (findings[id] ??= { severity, packages: [] });
  if (!f.packages.includes(packageKey)) f.packages.push(packageKey);
  if (fixedIn && !f.fixedIn) f.fixedIn = fixedIn;
}

interface GrypeOutput {
  matches?: { vulnerability?: { id?: string; severity?: string; fix?: { versions?: string[] } }; artifact?: { name?: string; version?: string } }[];
  descriptor?: { name?: string; version?: string; db?: { built?: string; schemaVersion?: number; status?: { built?: string; schemaVersion?: number } } };
}
interface TrivyOutput {
  Results?: { Vulnerabilities?: { VulnerabilityID?: string; Severity?: string; PkgName?: string; InstalledVersion?: string; FixedVersion?: string }[] | null }[] | null;
}

/** Read grype's or trivy's JSON. Anything else is refused: an unrecognised output must not read as "no vulnerabilities". */
export function parseScannerOutput(text: string): Collected<VulnData> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: "the scanner did not print JSON" };
  }
  const findings: Record<string, VulnFinding> = {};
  const o = raw as GrypeOutput & TrivyOutput;
  if (Array.isArray(o.matches)) {
    for (const m of o.matches) if (m.vulnerability?.id) add(findings, m.vulnerability.id, m.vulnerability.severity ?? "Unknown", pkg(m.artifact?.name, m.artifact?.version), m.vulnerability.fix?.versions?.join(", ") || undefined);
    const d = o.descriptor;
    const db = d?.db?.status ?? d?.db;
    return {
      ok: true,
      source: `${d?.name ?? "grype"}${d?.version ? ` ${d.version}` : ""}`,
      data: { scanner: { name: d?.name ?? "grype", ...(d?.version ? { version: d.version } : {}), ...(db?.built ? { db: `built ${db.built}${db.schemaVersion ? ` schema ${db.schemaVersion}` : ""}` } : {}) }, findings }
    };
  }
  if (Array.isArray(o.Results) || (o.Results === undefined && "SchemaVersion" in (raw as object))) {
    for (const r of o.Results ?? []) for (const v of r.Vulnerabilities ?? []) if (v.VulnerabilityID) add(findings, v.VulnerabilityID, v.Severity ?? "UNKNOWN", pkg(v.PkgName, v.InstalledVersion), v.FixedVersion || undefined);
    return { ok: true, source: "trivy", data: { scanner: { name: "trivy" }, findings } };
  }
  return { ok: false, reason: "the scanner's JSON is neither grype's (matches[]) nor trivy's (Results[])" };
}

/** Scan an image's SBOM. The SBOM is a precondition: no SBOM, no scan, and the reason says so. */
export function collectVulns(deps: VulnDeps, app: string, sbomText: string | undefined, sbomReason: string | undefined): Collected<VulnData> {
  if (!sbomText) return { ok: false, reason: `nothing to scan: ${sbomReason ?? "no SBOM"}` };
  let argv: string[];
  try {
    const path = deps.files.write(`${app}.spdx.json`, sbomText);
    argv = fillCommand(deps.vulnCmd, { sbom: path });
  } catch (e) {
    return { ok: false, reason: `HARNESS_VULN_CMD: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (!argv.length) return { ok: false, reason: "HARNESS_VULN_CMD is empty" };
  const result = deps.exec(argv[0]!, argv.slice(1), { env: scannerEnv(deps.dbDir) });
  if (result.error || result.status !== 0) return { ok: false, reason: failureReason(argv[0]!, result, SCANNER_HINT) };
  const parsed = parseScannerOutput(result.stdout);
  return parsed.ok ? parsed : { ok: false, reason: `${argv[0]}: ${parsed.reason}` };
}
