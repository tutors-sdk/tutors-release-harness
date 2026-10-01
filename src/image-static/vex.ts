import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { inputProblems, unreadable, type Problem } from "../claims/input-error.ts";

/**
 * Vulnerability exceptions as OpenVEX (since 1.23.0): the monorepo keeps `release/openvex.json` beside
 * `release/claims.yaml`, and the harness hands it to the grype it already pins (`--vex`), on both sides, so an advisory
 * the release says does not affect it is left out of `vulns` and of the vulnerability ceiling in a form other tools read.
 *
 * The harness checks the file before anything starts (exit 2, like a claims file), as the monorepo's own check does:
 *   - an OpenVEX document: `@context` https://openvex.dev/ns/v0.2.0 (or a later v0.x), `@id`, `author`, `timestamp`,
 *     `version`, and `statements[]`, which may be empty
 *   - each statement names a `vulnerability.name`, at least one product whose `@id` is a package URL (`pkg:`), and a
 *     `status` of not_affected, affected, fixed or under_investigation
 *   - `not_affected` needs one of the five standard justifications; an `impact_statement` alone is not enough
 *   - `affected` needs an `action_statement`
 *
 * A product is a package URL because the harness scans each image's SBOM, not the image: grype 0.119 matches a statement
 * whose product is the vulnerable package's purl (pkg:npm/tar@7.4.3), and cannot tell which image an SBOM describes.
 */
export const OPENVEX_CONTEXT = /^https:\/\/openvex\.dev\/ns\/v0\.\d+(\.\d+)?$/;
export const VEX_STATUSES = ["not_affected", "affected", "fixed", "under_investigation"] as const;
export const VEX_JUSTIFICATIONS = ["component_not_present", "vulnerable_code_not_present", "vulnerable_code_not_in_execute_path", "vulnerable_code_cannot_be_controlled_by_adversary", "inline_mitigations_already_exist"] as const;
/** Where the monorepo keeps it, beside release/claims.yaml. */
export const OPENVEX_FILE = "openvex.json";

/** What the run records about the OpenVEX file it scanned with. */
export interface VexInfo {
  /** The file's name as given, for people. */
  source: string;
  /** sha256 of the file's bytes: two sides scanned with one file carry the same. */
  sha256: string;
  statements: number;
  /** Statements that take an advisory out of the scan: not_affected and fixed. */
  excepts: number;
}

interface Statement {
  vulnerability?: { name?: unknown };
  products?: { "@id"?: unknown }[];
  status?: unknown;
  justification?: unknown;
  impact_statement?: unknown;
  action_statement?: unknown;
}

const isString = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** Every problem with an OpenVEX document's text; an empty list means the harness will scan with it. */
export function openVexProblems(text: string): Problem[] {
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(text) as Record<string, unknown>;
  } catch (e) {
    return [{ where: "the file", message: `is not JSON: ${e instanceof Error ? e.message : String(e)}` }];
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return [{ where: "the file", message: "is not a JSON object" }];
  const problems: Problem[] = [];
  if (!isString(doc["@context"]) || !OPENVEX_CONTEXT.test(doc["@context"])) problems.push({ where: "the document", field: "@context", message: `must be the OpenVEX context, https://openvex.dev/ns/v0.2.0, not ${JSON.stringify(doc["@context"])}` });
  for (const field of ["@id", "author", "timestamp"]) if (!isString(doc[field])) problems.push({ where: "the document", field, message: "is required" });
  if (!Number.isInteger(doc.version) || (doc.version as number) < 1) problems.push({ where: "the document", field: "version", message: "must be a whole number from 1" });
  if (!Array.isArray(doc.statements)) return [...problems, { where: "the document", field: "statements", message: "must be a list (it may be empty)" }];
  (doc.statements as Statement[]).forEach((s, i) => {
    const where = `statement ${i + 1} of ${(doc.statements as unknown[]).length}`;
    if (!s || typeof s !== "object") return problems.push({ where, message: "is not an object" });
    if (!isString(s.vulnerability?.name)) problems.push({ where, field: "vulnerability.name", message: "is required: the advisory id, e.g. CVE-2026-1234 or GHSA-xxxx-xxxx-xxxx" });
    if (!Array.isArray(s.products) || !s.products.length) problems.push({ where, field: "products", message: "must name at least one product" });
    else
      s.products.forEach((p, j) => {
        if (!isString(p?.["@id"]) || !p["@id"].startsWith("pkg:")) problems.push({ where, field: `products.${j}.@id`, message: `must be a package URL (pkg:npm/tar@7.4.3), not ${JSON.stringify(p?.["@id"])}`, hints: ["the harness scans each image's SBOM, and grype matches a statement by the vulnerable package's purl"] });
      });
    if (!VEX_STATUSES.includes(s.status as (typeof VEX_STATUSES)[number])) problems.push({ where, field: "status", message: `must be one of ${VEX_STATUSES.join(", ")}, not ${JSON.stringify(s.status)}` });
    if (s.status === "not_affected" && !VEX_JUSTIFICATIONS.includes(s.justification as (typeof VEX_JUSTIFICATIONS)[number]))
      problems.push({ where, field: "justification", message: `not_affected needs one of the standard justifications, not ${JSON.stringify(s.justification)}`, hints: [VEX_JUSTIFICATIONS.join(", ")] });
    if (s.status === "affected" && !isString(s.action_statement)) problems.push({ where, field: "action_statement", message: "affected needs an action_statement: what is being done about it" });
  });
  return problems;
}

/** Read and check an OpenVEX file; throws an InputFileError (exit 2, before any stack starts) when the harness cannot use it. */
export function loadOpenVex(path: string): VexInfo {
  let bytes: Buffer;
  try {
    bytes = readFileSync(path);
  } catch (e) {
    throw unreadable("OpenVEX document", path, e);
  }
  const text = bytes.toString("utf8");
  const problems = openVexProblems(text);
  if (problems.length) throw inputProblems("OpenVEX document", path, problems);
  const statements = (JSON.parse(text) as { statements: Statement[] }).statements;
  return { source: basename(path), sha256: createHash("sha256").update(bytes).digest("hex"), statements: statements.length, excepts: statements.filter((s) => s.status === "not_affected" || s.status === "fixed").length };
}
