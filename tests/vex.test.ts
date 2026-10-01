/**
 * OpenVEX (since 1.23.0): the release's openvex.json is checked before anything starts (exit 2 when the harness cannot
 * use it), handed to grype or trivy as `--vex` on both sides, and what the scanner set aside under it is recorded on the
 * scan and shown in the image artefacts. A statement is never read by the harness to decide anything itself.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { InputFileError } from "../src/claims/input-error.ts";
import { describeImageStatic } from "../src/image-static/report.ts";
import { VEX_JUSTIFICATIONS, loadOpenVex, openVexProblems } from "../src/image-static/vex.ts";
import { collectVulns, parseScannerOutput } from "../src/image-static/vulns.ts";
import type { Exec } from "../src/images.ts";
import { staticSide, vulns } from "./support/image-static.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = () => mkdtempSync(join(tmpdir(), "harness-vex-"));

const doc = (statements: unknown[], over: Record<string, unknown> = {}) =>
  JSON.stringify({ "@context": "https://openvex.dev/ns/v0.2.0", "@id": "https://tutors.dev/vex/release", author: "tutors release", timestamp: "2026-10-01T00:00:00Z", version: 1, statements, ...over });
const notAffected = (over: Record<string, unknown> = {}) => ({ vulnerability: { name: "CVE-2026-0001" }, products: [{ "@id": "pkg:npm/tar@7.4.3" }], status: "not_affected", justification: "vulnerable_code_not_in_execute_path", ...over });
const problems = (text: string) => openVexProblems(text).map((p) => `${p.where}${p.field ? `, ${p.field}` : ""}: ${p.message}`);

describe("the OpenVEX document is checked as the monorepo's own check does", () => {
  it("an empty document, and statements with each status written properly, are valid", () => {
    expect(openVexProblems(doc([]))).toEqual([]);
    expect(openVexProblems(doc([notAffected(), { ...notAffected(), status: "fixed", justification: undefined }, { ...notAffected(), status: "under_investigation" }, { ...notAffected(), status: "affected", action_statement: "upgrade tar in 16.3.1" }]))).toEqual([]);
    for (const justification of VEX_JUSTIFICATIONS) expect(openVexProblems(doc([notAffected({ justification })]))).toEqual([]);
  });

  it("not_affected needs a standard justification: an impact statement alone, or a made-up one, is not enough", () => {
    expect(problems(doc([notAffected({ justification: undefined, impact_statement: "we do not use it" })]))).toEqual([expect.stringContaining("statement 1 of 1, justification: not_affected needs one of the standard justifications")]);
    expect(problems(doc([notAffected({ justification: "trust_me" })]))).toEqual([expect.stringContaining('not_affected needs one of the standard justifications, not "trust_me"')]);
  });

  it("affected needs an action statement; a status outside the four is refused", () => {
    expect(problems(doc([notAffected({ status: "affected", justification: undefined })]))).toEqual(["statement 1 of 1, action_statement: affected needs an action_statement: what is being done about it"]);
    expect(problems(doc([notAffected({ status: "maybe" })]))).toEqual([expect.stringContaining('status: must be one of not_affected, affected, fixed, under_investigation, not "maybe"')]);
  });

  it("a product is a package URL, because the harness scans SBOMs; an advisory id is required", () => {
    const got = problems(doc([notAffected({ products: [{ "@id": "ghcr.io/tutors-sdk/reader@sha256:abc" }], vulnerability: {} })]));
    expect(got).toEqual([expect.stringContaining("vulnerability.name: is required"), expect.stringContaining("products.0.@id: must be a package URL")]);
    expect(problems(doc([notAffected({ products: [] })]))).toEqual(["statement 1 of 1, products: must name at least one product"]);
  });

  it("the document's own fields, and text that is not an OpenVEX document at all", () => {
    expect(problems(doc([], { "@context": "https://cyclonedx.org", version: 0, author: "" }))).toEqual([
      expect.stringContaining("@context: must be the OpenVEX context"),
      "the document, author: is required",
      "the document, version: must be a whole number from 1"
    ]);
    expect(problems(doc([], { statements: undefined }))).toEqual(["the document, statements: must be a list (it may be empty)"]);
    expect(problems("{")).toEqual([expect.stringContaining("the file: is not JSON")]);
    expect(problems("[]")).toEqual(["the file: is not a JSON object"]);
  });

  it("loading says what it found, with the file's digest; a bad or missing file is an input error (exit 2)", () => {
    const dir = tmp();
    const good = join(dir, "openvex.json");
    writeFileSync(good, doc([notAffected(), notAffected({ status: "under_investigation", justification: undefined })]));
    expect(loadOpenVex(good)).toEqual({ source: "openvex.json", sha256: expect.stringMatching(/^[0-9a-f]{64}$/), statements: 2, excepts: 1 });
    const bad = join(dir, "bad.json");
    writeFileSync(bad, doc([notAffected({ justification: undefined })]));
    expect(() => loadOpenVex(bad)).toThrow(InputFileError);
    expect(() => loadOpenVex(bad)).toThrow(/bad\.json is not a valid OpenVEX document: 1 problem/);
    expect(() => loadOpenVex(join(dir, "none.json"))).toThrow(InputFileError);
  });
});

describe("the scanner is given the file, and what it set aside is recorded", () => {
  const vexFile = { path: "/r/openvex.json", info: { source: "openvex.json", sha256: "a".repeat(64), statements: 1, excepts: 1 } };
  const output = JSON.stringify({
    matches: [{ vulnerability: { id: "CVE-2026-0002", severity: "High", fix: { versions: ["2.0.0"] } }, artifact: { name: "x", version: "1.0.0" } }],
    ignoredMatches: [
      { vulnerability: { id: "CVE-2026-0001" }, appliedIgnoreRules: [{ namespace: "vex", "vex-status": "not_affected", "vex-justification": "vulnerable_code_not_in_execute_path" }] },
      { vulnerability: { id: "CVE-2026-0009" }, appliedIgnoreRules: [{ "fix-state": "wont-fix" }] }
    ],
    descriptor: { name: "grype", version: "0.119.0" }
  });
  const scan = (cmd: string, vex?: typeof vexFile) => {
    const calls: string[][] = [];
    const exec: Exec = (c, args) => {
      calls.push([c, ...args]);
      return { status: 0, stdout: output, stderr: "" };
    };
    const got = collectVulns({ exec, files: { write: (name) => `/tmp/${name}` }, vulnCmd: cmd, ...(vex ? { vex } : {}) }, "reader", "{}", undefined);
    return { got, calls };
  };

  it("grype and trivy get --vex <file>; the advisories set aside by a VEX status are recorded, others are not", () => {
    const { got, calls } = scan("grype sbom:{sbom} -o json", vexFile);
    expect(calls[0]!.slice(-2)).toEqual(["--vex", "/r/openvex.json"]);
    expect(got).toMatchObject({ ok: true, data: { findings: { "CVE-2026-0002": expect.anything() }, vex: { source: "openvex.json", statements: 1, excepts: 1, excepted: ["CVE-2026-0001"] } } });
    expect(scan("/usr/local/bin/trivy sbom {sbom} -f json", vexFile).calls[0]!.slice(-2)).toEqual(["--vex", "/r/openvex.json"]);
  });

  it("without a file, or with a scanner that takes none, the command is unchanged and the scan carries no vex", () => {
    const none = scan("grype sbom:{sbom} -o json");
    expect(none.calls[0]).not.toContain("--vex");
    expect(none.got.ok && none.got.data.vex).toBeUndefined();
    const other = scan("my-scanner {sbom}", vexFile);
    expect(other.calls[0]).not.toContain("--vex");
    expect(other.got.ok && other.got.data.vex).toBeUndefined();
  });

  it("parsing grype output never leaks the set-aside list into a scan without a file", () => {
    const parsed = parseScannerOutput(output);
    expect(parsed.ok && parsed.data.vex).toBeUndefined();
  });

  it("the image artefacts say what the file set aside, or that it set aside nothing", () => {
    const side = staticSide({ vulns: { ...vulns({}), vex: { ...vexFile.info, excepted: ["CVE-2026-0001"] } } });
    expect(describeImageStatic(side).reader.vulns).toMatchObject({ summary: expect.stringContaining("OpenVEX openvex.json (1 statement(s)): 1 set aside, CVE-2026-0001") });
    const empty = staticSide({ vulns: { ...vulns({}), vex: { ...vexFile.info, statements: 0, excepts: 0, excepted: [] } } });
    expect(describeImageStatic(empty).reader.vulns).toMatchObject({ summary: expect.stringContaining("none set aside") });
    expect(describeImageStatic(staticSide()).reader.vulns).toMatchObject({ summary: expect.not.stringContaining("OpenVEX") });
  });
});

describe("through the real process", () => {
  it("an invalid --vex is exit 2 with the file's problems, before any stack starts", () => {
    const dir = tmp();
    const bad = join(dir, "openvex.json");
    writeFileSync(bad, doc([notAffected({ justification: "trust_me" })]));
    const r = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), "run", "--mode", "release", "--a", "16.2.0", "--b", "16.3.0", "--noise", "none", "--out", join(dir, "out"), "--vex", bad], { cwd: ROOT, encoding: "utf8" });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("is not a valid OpenVEX document: 1 problem");
    expect(r.stderr).toContain("statement 1 of 1, justification: not_affected needs one of the standard justifications");
    expect(r.stderr).not.toContain("    at ");
  });
});
