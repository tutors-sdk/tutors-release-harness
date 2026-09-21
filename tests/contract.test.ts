/**
 * The contract in docs/contract.md and docs/contract/*.json is what the
 * monorepo builds against. These tests fail when the code drifts from it, in
 * either direction: a field the schema does not know, a schema field the code
 * no longer writes, a CLI flag or dispatch payload that is not written down.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv, type ValidateFunction } from "ajv";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { claimLabel, parseRules } from "../src/claims/rules.ts";
import { parseClaims } from "../src/claims/schema.ts";
import { exitCodeFor, gate } from "../src/gate.ts";
import { parseNoiseStatus } from "../src/noise.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { compareFromCaptures, defaultRunOptions } from "../src/run.ts";
import { defaultNoise, recordNight } from "../src/local/noise-store.ts";
import { noiseDir } from "../src/local/home.ts";
import { pinImages } from "../src/digests.ts";
import { composeProject, derivedName, harnessRoot, kindCluster } from "../src/project.ts";
import { findReleaseRecord, judgeDeployment, releaseRecordOf, writeReleaseRecord } from "../src/release-record.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { DEFAULT_COSIGN_IDENTITY, DEFAULT_COSIGN_ISSUER, EXIT_CANNOT_JUDGE, EXIT_UNAVAILABLE } from "../src/images.ts";
import { APPS, DEFAULT_IMAGE_PREFIX, QUAY_IMAGE_TEMPLATE, imagesFor } from "../src/image-ref.ts";
import { ARTEFACTS, MODES, PROVENANCES, SUBSTRATES, type CompareResult, type Mode, type RunReport, type SchemaCatalog } from "../src/types.ts";
import { CLAIMS_VERSION, CONTRACT_VERSION, HARNESS_VERSION, SCHEMA_VERSION, harnessInfo } from "../src/version.ts";
import { capture, clone } from "./support/captures.ts";

const ROOT = resolve(import.meta.dirname, "..");
const read = (...p: string[]) => readFileSync(resolve(ROOT, ...p), "utf8");
const json = (...p: string[]) => JSON.parse(read(...p));

const reportSchema = json("docs/contract/report.schema.json");
const noiseSchema = json("docs/contract/noise-status.schema.json");
const cli = json("docs/contract/cli.json") as {
  contractVersion: string;
  commands: { name: string; stable: boolean; subcommands?: string[]; unstableSubcommands?: string[] }[];
  flags: { name: string; type: "string" | "boolean"; multiple?: boolean; stable: boolean; values?: string[] }[];
  exitCodes: Record<string, string>;
};
const workflowsContract = json("docs/contract/workflows.json") as {
  contractVersion: string;
  repositoryDispatch: Record<string, { workflow: string; clientPayload: Record<string, { required?: boolean }> }>;
  repositoryVariables: Record<string, { default: string; usedBy: string[] }>;
  artifacts: Record<string, { workflow: string; retentionDays: number }>;
  forbiddenPermissions: string[];
  writePermissions: Record<string, Record<string, string[] | string>>;
  noiseBranch: { branch: string; writtenBy: string; files: string[]; readBy: string[] };
  dispatchInputs: Record<string, Record<string, string>>;
};
const contractMd = read("docs/contract.md");

const ajv = new Ajv({ allErrors: true, strict: true });
ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
const validateReport = ajv.compile(reportSchema);
const validateNoise = ajv.compile(noiseSchema);

/** How many places the schema names `time` (the sides, provenance images and image artefacts). */
const schemaTime = (schema: unknown): number => JSON.stringify(schema).split('"time":').length - 1;

function expectValid(validate: ValidateFunction, value: unknown) {
  validate(value);
  expect(validate.errors ?? []).toEqual([]);
}

type DeepRequired<T> = T extends (infer U)[] ? DeepRequired<U>[] : T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

const catalog: SchemaCatalog = { tables: { learner: { id: { type: "uuid", nullable: false, default: null } } }, indexes: ["learner_pkey"], functions: ["touch()"], policies: ["learner/own_rows"] };
const D = (n: number) => `sha256:${String(n).repeat(64)}`;
/** One image carrying every field ImageInfo allows (no real image carries them all at once; the schema must know each). */
const imageInfo = (app: string, n: number) => ({
  ref: `quay.io/tutors-sdk/tutors-${app}:16.2.0`,
  id: `sha256:${"a".repeat(64)}`,
  digest: D(n),
  revision: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
  version: "16.2.0",
  created: "2026-09-01T10:00:00Z",
  provenance: "pulled+verified" as const,
  verifiedIdentity: "^https://github.com/tutors-sdk/tutors-mono-repo/",
  unverifiedReason: "no valid signature",
  builtFrom: { ref: "v16.2.0", sha: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" },
  cachedAt: "2026-09-15T02:30:00.000Z"
});
const sideProvenance = { summary: "pulled+verified", allowedUnsigned: true as const, images: { reader: imageInfo("reader", 1), catalogue: imageInfo("catalogue", 2), live: imageInfo("live", 3), time: imageInfo("time", 4) } };
/** One static image artefact carrying every field the report allows (a real one carries either `reason` or `summary`, not both). */
const artefactStatus = { collected: true, source: "cosign attestation (signature verified)", reason: "no SBOM attestation", summary: "312 distinct package(s)" };
const appArtefacts = { manifest: artefactStatus, sbom: artefactStatus, vulns: artefactStatus };
const sideArtefacts = { reader: appArtefacts, catalogue: appArtefacts, live: appArtefacts, time: appArtefacts };
const load = { requests: 600, failed: 0, serverErrors: 0, p50: 12, p95: 40, rate: 20, duration: "30s" };

/**
 * Every field RunReport can carry, optional ones included. DeepRequired makes
 * `pnpm typecheck` fail here when a field is added to the types, and the
 * schema's additionalProperties: false makes the test fail until the schema
 * (and so the contract) says what the field is.
 */
const full: DeepRequired<RunReport> = {
  schemaVersion: SCHEMA_VERSION,
  harness: { version: "1.0.0", gitSha: "0123456789abcdef0123456789abcdef01234567", contractVersion: CONTRACT_VERSION },
  harnessVersion: "1.0.0",
  mode: "release",
  substrate: "compose",
  ranAt: "2026-09-16T09:10:00.000Z",
  now: "2026-09-16T09:05:00.000Z",
  runs: 3,
  sides: { a: { reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0", time: "tutors/time:16.2.0" }, b: { reader: "tutors/reader:rc", catalogue: "tutors/catalogue:rc", live: "tutors/live:rc", time: "tutors/time:rc" } },
  provenance: { a: sideProvenance, b: sideProvenance },
  verdict: "fail",
  reasons: ["1 unclaimed diff(s)"],
  noise: { schemaVersion: SCHEMA_VERSION, ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0, degraded: ["side a did not run pulled+verified images (cached)"] },
  compare: {
    hunks: [{ id: "1", artefact: "dom", scope: "reader:lab-step", path: "/lab/x", summary: "semantic DOM differs", detail: "+ x", severity: "fail" }],
    matches: [{ hunk: { id: "1", artefact: "dom", scope: "reader:lab-step", path: "/lab/x", summary: "semantic DOM differs", detail: "+ x", severity: "fail" }, claim: { artefact: "*", scope: "**", reason: "Rule 0031: Lab steps show estimated reading time", approvedBy: "a-maintainer", rule: "0031", ruleTitle: "Lab steps show estimated reading time" } }],
    unclaimed: [{ id: "2", artefact: "headers", scope: "reader:home/x-frame-options", path: "/", summary: "header dropped", detail: "-", severity: "fail" }],
    staleClaims: [{ artefact: "network", scope: "GET /gone", reason: "Rule 0002: Nothing here is cached", approvedBy: "a-maintainer", rule: "0002", ruleTitle: "Nothing here is cached" }],
    broadUnapproved: [{ artefact: "*", scope: "**", reason: "everything changed in this one", approvedBy: "", rule: "0003", ruleTitle: "Everything may change" }]
  },
  masksApplied: { "response-date": 4, etag: 0 },
  migration: { a: { ref: "v16.2.0", files: ["0001.sql"], catalog }, b: { ref: "release/16.3.0", files: ["0001.sql", "0002.sql"], catalog }, rolledBack: catalog },
  upgrade: { substrate: "compose", requests: 900, failed: 0, serverErrors: 0, byUpstream: { a: { requests: 300, failed: 0, serverErrors: 0, p95: 30 }, b: { requests: 600, failed: 0, serverErrors: 0, p95: 31 } }, switchedAt: 15000, durationMs: 45000 },
  load: { a: load, b: load },
  claimHygiene: {
    claims: 2,
    claimedHunks: 13,
    hunksPerClaim: 6.5,
    maxHunksPerClaim: 12,
    threshold: 10,
    flagged: [{ claim: { artefact: "*", scope: "**", reason: "Rule 0031: Lab steps show estimated reading time", approvedBy: "a-maintainer", rule: "0031", ruleTitle: "Lab steps show estimated reading time" }, hunks: 12, flags: ["covers-many-hunks", "broad-with-approval"] }]
  },
  override: { reason: "Rule 0044: payments hotfix, frame options restored in 16.3.1", by: "a-maintainer", verdict: "fail", applied: true, at: "2026-09-16T09:20:00.000Z" },
  imageArtefacts: { a: sideArtefacts, b: sideArtefacts },
  deployment: {
    production: "16.3.0",
    status: "differs",
    digests: { reader: D(4), catalogue: D(5), live: D(6), time: D(8) },
    recorded: { reader: D(4), catalogue: D(5), live: D(7), time: D(8) },
    record: { candidate: "16.3.0-rc.4", judgedAt: "2026-09-16T09:10:00.000Z", verdict: "pass" },
    problems: [`live: deployed ${D(6)}, but release mode judged ${D(7)} (16.3.0-rc.4)`]
  }
};

function runFixture(mode: Mode, opts: { mutate?: boolean; claims?: string; noise?: string } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "harness-contract-"));
  const b = clone(capture("b"));
  if (opts.mutate) delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
  const outcome = compareFromCaptures({
    mode,
    substrate: "compose",
    captureDir: dir,
    a: capture("a"),
    b,
    claims: opts.claims ? parseClaims(opts.claims) : [],
    masksFile: DEFAULT_MASKS_FILE,
    noiseMaxAgeDays: defaultRunOptions().noiseMaxAgeDays,
    now: "2026-09-16T09:05:00.000Z",
    runs: 1,
    log: () => {},
    ...(opts.noise ? { noise: opts.noise } : {})
  });
  return { dir, outcome, written: JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport };
}

describe("report.json", () => {
  it("the schema accepts a report carrying every field the types allow", () => {
    expectValid(validateReport, full);
  });

  it("one whole-run report carrying every 1.2.0 addition at once is valid and renders", () => {
    // Every artefact name (the bus, static image and runtime ones included), both sides' provenance at its loudest
    // (cached, with static image artefacts recorded beside it), a degraded noise status, hygiene and an override.
    const hunks = ARTEFACTS.map((artefact, i) => ({ id: String(i + 1), artefact, scope: `reader/${artefact}`, summary: `${artefact} differs`, severity: i % 2 ? ("info" as const) : ("fail" as const) }));
    const cached = { ...sideProvenance, summary: "cached 2026-09-15T02:30:00.000Z (registry unreachable; tag freshness unconfirmed)", images: { reader: { ...imageInfo("reader", 1), provenance: "cached" as const }, catalogue: imageInfo("catalogue", 2), live: imageInfo("live", 3) } };
    const report: RunReport = { ...full, provenance: { a: cached, b: sideProvenance }, compare: { ...full.compare, hunks, matches: hunks.map((hunk) => ({ hunk })), unclaimed: hunks.filter((h) => h.severity === "fail") } };
    expectValid(validateReport, report);
    for (const artefact of ARTEFACTS) expect(validateReport({ ...report, compare: { ...report.compare, hunks: [{ ...hunks[0], artefact }] } }), artefact).toBe(true);
    expect(validateReport({ ...report, compare: { ...report.compare, hunks: [{ ...hunks[0], artefact: "not-an-artefact" }] } })).toBe(false);
    const md = renderMarkdown(report);
    const html = renderHtml(report);
    for (const text of ["Claim hygiene", "Harness FAIL overridden", "Image artefacts", "DEGRADED", "cached"]) {
      expect(md, text).toContain(text);
      expect(html.toLowerCase(), text).toContain(text.toLowerCase());
    }
  });

  it("the contract counts the artefacts truthfully and its 1.2.0 changelog lists every addition", () => {
    const words = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two"];
    expect(contractMd).toContain(`one of the ${words[ARTEFACTS.length]} artefact names above`);
    for (const stale of words.slice(1, 25).filter((w) => w !== words[ARTEFACTS.length])) expect(contractMd, stale).not.toContain(`one of the ${stale} artefact names`);
    const changes = contractMd.slice(contractMd.indexOf("### 1.2.0"));
    expect(changes).not.toContain("### 1.3.0");
    const since = new Set(["bus", "image-manifest", "sbom", "vulns", "runtime", "startup"]);
    for (const artefact of since) expect(ARTEFACTS as readonly string[]).toContain(artefact);
    const additions = [...since, "claimHygiene", "override", "imageArtefacts", "cached", "cachedAt", "degraded", "--image-cache", "--require-verified", "--override-reason", "--override-by", "--claim-max-hunks", "--no-runtime", "--startup-restarts", "HARNESS_CLAIM_MAX_HUNKS", "HARNESS_SBOM_SOURCE", "HARNESS_SBOM_CMD", "HARNESS_VULN_CMD", "HARNESS_VULN_DB_DIR", "HARNESS_REQUIRE_STATIC"];
    for (const item of additions) expect(changes, item).toContain(item);
    const cli = json("docs/contract/cli.json");
    for (const flag of cli.flags.filter((f: { since?: string }) => f.since === "1.2.0")) expect(changes, flag.name).toContain(`--${flag.name === "runtime" ? "no-runtime" : flag.name}`);
    for (const [name, v] of Object.entries(cli.environment as Record<string, { meaning?: string }>)) if (v.meaning?.includes("since 1.2.0")) expect(changes, name).toContain(name);
    expect(CONTRACT_VERSION).toBe("1.3.0");
    expect(HARNESS_VERSION).toBe("1.3.0");
    expect(json("package.json").version).toBe(HARNESS_VERSION);
    for (const doc of [cli, json("docs/contract/workflows.json")]) expect(doc.contractVersion).toBe(CONTRACT_VERSION);
  });

  it("its 1.3.0 changelog lists every addition, the decisions and the reasons", () => {
    const start = contractMd.indexOf("### 1.3.0");
    const changes = contractMd.slice(start, contractMd.indexOf("### 1.2.0"));
    expect(start).toBeGreaterThan(0);
    const additions = [
      // A: digests, the record, the deployment check
      "production_digests", "candidate_digests", "--a-digests", "--b-digests", "--deployed", "--deployed-digests", "--release-record", "release-record.schema.json", "release-record.json", "release-records", "publish-record", "deployment", "exit `2`",
      // B: rule on claims
      "`rule`", "ruleTitle", "--rules", "rules_url", "rules.schema.json",
      // C: the local noise store
      "HARNESS_HOME", "--noise", "`none`", "warns",
      // D: the commands, the choice and the reason
      "harness doctor", "harness noise record", "harness noise\n  status", "harness guard", "harness local", "harness override\n  list", "noise history", "the workflows\n  and the monorepo depend on them",
      // E: names
      "HARNESS_PROJECT", "HARNESS_COMPOSE_PROJECT", "HARNESS_KIND_CLUSTER", "tutors-harness-<first 8 hex", "legacy stack", "never adopted or deleted"
    ];
    const cliJson = json("docs/contract/cli.json");
    for (const item of additions) expect(changes, item).toContain(item);
    for (const flag of cliJson.flags.filter((f: { since?: string }) => f.since === "1.3.0")) expect(changes, flag.name).toContain(`--${flag.name}`);
    for (const command of cliJson.commands.filter((c: { since?: string }) => c.since === "1.3.0")) expect(changes, command.name).toContain(command.name);
    for (const [name, v] of Object.entries(cliJson.environment as Record<string, { meaning?: string }>)) if (v.meaning?.includes("since 1.3.0")) expect(changes, name).toContain(name);
    for (const [event, spec] of Object.entries(workflowsContract.repositoryDispatch)) {
      for (const [field, f] of Object.entries(spec.clientPayload as Record<string, { since?: string }>)) if (f.since === "1.3.0") expect(changes, `${event}.${field}`).toContain(field);
    }
    // the non-additive parts are said to be
    for (const caveat of ["was\nignored", "a missing `--noise` no longer", "default name of the compose project", "left alone"]) expect(changes.replaceAll("\n", " ").replaceAll("  ", " "), caveat).toContain(caveat.replaceAll("\n", " "));
  });

  it("a report written before 1.3.0, with no `time` anywhere, is still valid and still renders (a reader must tolerate its absence)", () => {
    const { time: _a, ...a } = full.sides.a;
    const { time: _b, ...b } = full.sides.b;
    const strip = <T extends { time?: unknown }>(x: T) => {
      const { time: _t, ...rest } = x;
      return rest;
    };
    const old = {
      ...full,
      sides: { a, b },
      provenance: { a: { ...sideProvenance, images: strip(sideProvenance.images) }, b: { ...sideProvenance, images: strip(sideProvenance.images) } },
      imageArtefacts: { a: strip(sideArtefacts), b: strip(sideArtefacts) }
    } as unknown as RunReport;
    expectValid(validateReport, old);
    expect(renderMarkdown(old)).toContain("| time | `—` | `—` |");
    expect(renderHtml(old)).toContain("<td>time</td>");
  });

  it("the 1.3.0 changelog lists everything the time app added", () => {
    const changes = contractMd.slice(contractMd.indexOf("### 1.3.0"), contractMd.indexOf("### 1.2.0"));
    for (const item of ["time", "time-a", "3104", "30103", "4103", "sides", "provenance", "imageArtefacts", "time=REF", "time=URL", "--production", "build-images.sh", "recreated"]) expect(changes, item).toContain(item);
    expect(schemaTime(reportSchema)).toBe(3);
  });

  it("the schema and RunReport name the same top-level fields", () => {
    expect(Object.keys(reportSchema.properties).sort()).toEqual(Object.keys(full).sort());
  });

  it("refuses a field the contract does not document, and another major version", () => {
    expect(validateReport({ ...full, extra: 1 })).toBe(false);
    expect(validateReport({ ...full, schemaVersion: SCHEMA_VERSION + 1 })).toBe(false);
    expect(validateReport({ ...full, compare: { ...full.compare, hunks: [{ ...full.compare.hunks[0], confidence: 1 }] } })).toBe(false);
  });

  it("the schema's enums are the code's", () => {
    expect(reportSchema.properties.mode.enum).toEqual([...MODES]);
    expect(reportSchema.properties.substrate.enum).toEqual([...SUBSTRATES]);
    expect(reportSchema.properties.upgrade.properties.substrate.enum).toEqual([...SUBSTRATES]);
    expect(reportSchema.definitions.artefact.enum).toEqual([...ARTEFACTS]);
    expect(reportSchema.properties.verdict.enum.sort()).toEqual(["fail", "pass", "warn"]);
    expect(reportSchema.properties.schemaVersion.const).toBe(SCHEMA_VERSION);
    expect(reportSchema.definitions.noiseStatus.properties).toEqual(Object.fromEntries(Object.entries(noiseSchema.properties as Record<string, Record<string, unknown>>).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).filter(([f]) => f !== "description"))])));
  });

  it("a real release run writes a report the schema accepts, stamped with the harness that wrote it", () => {
    const noiseRun = runFixture("noise");
    const { written } = runFixture("release", {
      mutate: true,
      noise: noiseRun.dir,
      claims: 'version: 1\nclaims:\n  - artefact: network\n    scope: "GET /gone"\n    reason: "Rule 0002: stale claim"\n'
    });
    expectValid(validateReport, written);
    expect(written.verdict).toBe("fail");
    expect(written.schemaVersion).toBe(SCHEMA_VERSION);
    expect(written.harness).toEqual(harnessInfo());
    expect(written.harness.version).toBe(HARNESS_VERSION);
    expect(written.harnessVersion).toBe(HARNESS_VERSION);
    expect(written.noise?.clean).toBe(true);
    expect(written.compare.staleClaims).toHaveLength(1);
  });

  it("image provenance: the schema's values are the code's, a real report carrying it is accepted, and an unknown field or value is not", () => {
    expect(reportSchema.definitions.imageInfo.properties.provenance.enum).toEqual([...PROVENANCES]);
    expect(validateReport({ ...full, provenance: { a: sideProvenance } })).toBe(true);
    expect(validateReport({ ...full, provenance: { a: { ...sideProvenance, images: { ...sideProvenance.images, reader: { ...imageInfo("reader", 1), provenance: "trusted" } } } } })).toBe(false);
    expect(validateReport({ ...full, provenance: { a: { ...sideProvenance, images: { ...sideProvenance.images, reader: { ...imageInfo("reader", 1), digest: "sha256:short" } } } } })).toBe(false);
    expect(validateReport({ ...full, provenance: { a: { ...sideProvenance, signedBy: "x" } } })).toBe(false);

    const dir = mkdtempSync(join(tmpdir(), "harness-contract-"));
    const local = { summary: "local (unverified)", images: { reader: { ref: "tutors/reader:a", id: "sha256:1", provenance: "local" as const }, catalogue: { ref: "tutors/catalogue:a", provenance: "local" as const }, live: { ref: "tutors/live:a", provenance: "local" as const } } };
    const outcome = compareFromCaptures({ mode: "any-two", substrate: "compose", captureDir: dir, a: capture("a", { provenance: local }), b: capture("b"), claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {} });
    const written = JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport;
    expectValid(validateReport, written);
    expect(written.provenance).toEqual({ a: local });
    for (const field of ["provenance", "digest", "revision", "verifiedIdentity", "unverifiedReason", "builtFrom", "allowedUnsigned"]) expect(contractMd, field).toContain(`\`${field}\``);
    for (const value of PROVENANCES) expect(contractMd, value).toContain(`\`${value}\``);
  });

  it("static image artefacts: the schema accepts them, refuses an unknown field, and the contract documents each", () => {
    expect(validateReport({ ...full, imageArtefacts: { a: sideArtefacts } })).toBe(true);
    expect(validateReport({ ...full, imageArtefacts: { a: { ...sideArtefacts, reader: { ...appArtefacts, sbom: { collected: false, reason: "no SBOM attestation" } } } } })).toBe(true);
    expect(validateReport({ ...full, imageArtefacts: { a: { ...sideArtefacts, reader: { ...appArtefacts, sbom: { reason: "no collected flag" } } } } })).toBe(false);
    expect(validateReport({ ...full, imageArtefacts: { a: { ...sideArtefacts, reader: { ...appArtefacts, extra: artefactStatus } } } })).toBe(false);
    for (const field of ["imageArtefacts", "image-manifest", "sbom", "vulns", "collected", "NOT COLLECTED"]) expect(contractMd, field).toContain(field);
  });

  it("every mode writes a report the schema accepts", () => {
    for (const mode of MODES) expectValid(validateReport, runFixture(mode, { mutate: true }).written);
  });

  it("html and markdown name the harness and the contract", () => {
    const { outcome } = runFixture("any-two");
    for (const file of [outcome.files.html, outcome.files.md]) {
      const text = readFileSync(file, "utf8");
      expect(text).toContain(`harness ${HARNESS_VERSION}`);
      expect(text).toContain(`contract ${CONTRACT_VERSION}`);
    }
  });
});

describe("one whole run carrying every 1.3.0 addition at once", () => {
  const rulesText = JSON.stringify({ version: 1, rules: { "0031": { title: "Lab steps show their estimated reading time", digest: "sha256:aa" }, "0044": { title: "Presence is polled every 15 seconds" } } });
  const claimsText = [
    "claims:",
    "  - artefact: headers",
    '    scope: "reader:course"',
    '    rule: "0031"',
    "  - artefact: network",
    '    scope: "GET /gone"',
    '    rule: "0044"',
    '    reason: "free text beside a rule"',
    "  - artefact: dom",
    '    scope: "reader:nothing"',
    '    reason: "Rule 0002: spelled out, as it always could be"'
  ].join("\n");
  const digest = (n: number) => `sha256:${n.toString(16).padStart(2, "0").repeat(32)}`;
  const at = (side: "a" | "b", tag: string, base?: number, provenance?: "pulled+verified") => {
    const images = Object.fromEntries(APPS.map((app) => [app, `quay.io/tutors-sdk/tutors-${app}:${tag}`])) as Record<(typeof APPS)[number], string>;
    const pinned = base === undefined ? images : pinImages(images, Object.fromEntries(APPS.map((app, i) => [app, digest(base + i)])));
    const info = Object.fromEntries(APPS.map((app, i) => [app, { ref: pinned[app], id: `sha256:${i}`, ...(base === undefined ? {} : { digest: digest(base + i) }), provenance: provenance ?? "local" }]));
    return capture(side, { images: pinned, ...(provenance ? { provenance: { summary: provenance, images: info as never } } : {}) });
  };

  it("release mode, then post-deploy mode: pinned digests, rule claims, the store's noise status, the record, the deployment warning", () => {
    // C: a clean A/A in the local store, found because --noise is omitted
    const home = mkdtempSync(join(tmpdir(), "harness-whole-"));
    recordNight({ status: (() => { const d = mkdtempSync(join(tmpdir(), "harness-whole-noise-")); writeFileSync(join(d, "noise-status.json"), JSON.stringify({ schemaVersion: 1, ranAt: new Date().toISOString(), clean: true, hunks: 0 })); return d; })(), store: noiseDir(home) });
    const noise = defaultNoise("release", undefined, () => {}, home);
    expect(noise).toBeDefined();

    // B: claims that name rules, checked against rules.json; A: the candidate pinned by the dispatch's digests
    const rules = parseRules(rulesText);
    const claims = parseClaims(claimsText, "claims.yaml", rules);
    const b = clone(at("b", "16.3.0-rc.4", 10, "pulled+verified"));
    delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
    const dir = mkdtempSync(join(tmpdir(), "harness-whole-run-"));
    const release = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: dir, a: at("a", "16.2.0", 1, "pulled+verified"), b, claims, masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, ...(noise ? { noise } : {}) });
    expectValid(validateReport, release.report);
    expect(release.report.verdict).toBe("pass");
    expect(release.report.sides.b.reader).toBe(`quay.io/tutors-sdk/tutors-reader:16.3.0-rc.4@${digest(10)}`);
    const claimed = release.report.compare.matches.filter((m) => m.claim);
    expect(claimed.map((m) => claimLabel(m.claim!))).toEqual(["Rule 0031: Lab steps show their estimated reading time"]);
    expect(release.report.compare.staleClaims.map(claimLabel)).toEqual(["Rule 0044: Presence is polled every 15 seconds — free text beside a rule", "Rule 0002: spelled out, as it always could be"]);

    // A: the record release mode leaves, and the store post-deploy mode reads it from
    const made = releaseRecordOf(release.report, { pinned: true });
    if (!("record" in made)) throw new Error(made.skipped);
    const store = join(home, "releases");
    const files = writeReleaseRecord(made.record, { store, outDir: dir, log: () => {} });
    expect(files.map((f) => f.split(/[\\/]/).pop())).toEqual(["16.3.0-rc.4.json", "16.3.0.json", "release-record.json"]);
    const ajvRecord = new Ajv({ allErrors: true, strict: true });
    ajvRecord.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const validateRecord = ajvRecord.compile(json("docs/contract/release-record.schema.json"));
    expectValid(validateRecord, JSON.parse(readFileSync(join(dir, "release-record.json"), "utf8")));
    const ajvRules = new Ajv({ allErrors: true, strict: true });
    expectValid(ajvRules.compile(json("docs/contract/rules.schema.json")), JSON.parse(rulesText));

    // the deploy says live is not the image that was judged
    const deployed = { ...Object.fromEntries(APPS.map((app, i) => [app, digest(10 + i)])), live: digest(99) };
    const found = findReleaseRecord("16.3.0", store);
    expect(found.record?.candidate).toBe("16.3.0-rc.4");
    const deployment = judgeDeployment({ production: "16.3.0", digests: deployed, found });
    const postDir = mkdtempSync(join(tmpdir(), "harness-whole-post-"));
    const post = compareFromCaptures({ mode: "post-deploy", substrate: "compose", captureDir: postDir, a: at("a", "16.3.0-rc.4", 10, "pulled+verified"), b: at("b", "16.3.0-rc.4"), claims, masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, ...(noise ? { noise } : {}), deployment });
    const written = JSON.parse(readFileSync(post.files.json, "utf8")) as RunReport;
    expectValid(validateReport, written);
    expect(written.verdict).toBe("warn");
    expect(written.deployment).toMatchObject({ status: "differs", production: "16.3.0", record: { candidate: "16.3.0-rc.4", verdict: "pass" } });
    expect(written.reasons[0]).toMatch(/^DEPLOYED IMAGES DIFFER/);
    for (const text of [readFileSync(post.files.md, "utf8"), readFileSync(post.files.html, "utf8")]) {
      expect(text).toContain("The deployed images are NOT the ones release mode judged");
      expect(text).toContain("Deployment 16.3.0");
    }

    // E: the names this checkout runs under, and the ones it must never take
    expect(composeProject({}, harnessRoot()).name).toBe(derivedName(harnessRoot()));
    expect(kindCluster({}, harnessRoot()).name).toMatch(/^tutors-harness-[0-9a-f]{8}$/);
    expect(kindCluster({}, harnessRoot()).name).not.toBe("tutors-harness");
  });

  it("post-deploy against an external side, with a secret in the console, reordered headers and a gap: still one valid report, no schema change, no secret in any file", () => {
    // Synthetic, assembled at run time: not a credential.
    const key = ["eyJhbGciOiJIUzI1NiJ9", "eyJyb2xlIjoiWCJ9", "c2lnbmF0dXJlWA"].join(".");
    const recorded = capture("a");
    const production = capture("b", { images: { reader: "external:https://tutors.dev", catalogue: "external:https://catalogue.tutors.dev", live: "external:https://live.tutors.dev", time: "external:https://time.tutors.dev" } });
    // the same headers, spelled the way a CDN spells them
    recorded.journeys[0]!.pages[0]!.headers["cache-control"] = "public, max-age=300, immutable";
    production.journeys[0]!.pages[0]!.headers["cache-control"] = "immutable,max-age=300,public";
    production.journeys[0]!.pages[0]!.console.push({ level: "error", text: `blocked: https://example-project.supabase.co/rest/v1/app_errors?apikey=${key}` });
    recorded.journeys[0]!.pages[0]!.console.push({ level: "error", text: `blocked: https://example-project.supabase.co/rest/v1/app_errors?apikey=${key}` });
    const dir = mkdtempSync(join(tmpdir(), "harness-whole-external-"));
    const result = compareFromCaptures({ mode: "post-deploy", substrate: "compose", captureDir: dir, a: recorded, b: production, claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {} });
    const written = JSON.parse(readFileSync(result.files.json, "utf8")) as RunReport;
    expectValid(validateReport, written);
    expect(written.verdict).toBe("pass");
    // every file the run wrote to its report directory: none holds the value
    for (const file of [result.files.json, result.files.md, result.files.html]) expect(readFileSync(file, "utf8"), file).not.toContain(key);
    expect(JSON.stringify(written)).not.toContain("eyJ");
    // the four apps, `time` included, are what the report's sides name
    expect(Object.keys(written.sides.b).sort()).toEqual([...APPS].sort());
  });

  it("a 1.2.0 dispatch, claims file and report are still valid: none of the new fields is required anywhere", () => {
    expect(validateReport(clone(runFixture("release").written))).toBe(true);
    expect(Object.keys(reportSchema.properties.deployment.properties)).not.toContain("required");
    expect(reportSchema.required).not.toContain("deployment");
    expect(reportSchema.definitions.claim.required).toEqual(["artefact", "scope", "reason"]);
    for (const spec of Object.values(workflowsContract.repositoryDispatch)) for (const [field, f] of Object.entries(spec.clientPayload as Record<string, { since?: string; required?: boolean }>)) if (f.since === "1.3.0") expect(f.required, field).toBe(false);
    expect(parseClaims('claims:\n  - artefact: dom\n    scope: "reader:*"\n    reason: "Rule 0031: reading time"\n')).toHaveLength(1);
  });
});

describe("digests and the release record (1.3.0)", () => {
  const recordSchema = json("docs/contract/release-record.schema.json");

  it("the schemas name the harness's apps, whatever they are, for every digest", () => {
    expect(reportSchema.definitions.digests.propertyNames.enum).toEqual([...APPS]);
    expect(recordSchema.properties.digests.propertyNames.enum).toEqual([...APPS]);
    expect(reportSchema.definitions.digests.additionalProperties.pattern).toBe(recordSchema.properties.digests.additionalProperties.pattern);
    expect(new RegExp(reportSchema.definitions.digests.additionalProperties.pattern).test(`sha256:${"a".repeat(64)}`)).toBe(true);
  });

  it("the dispatch payload fields are optional, documented, and named in the release and deployed sections of the contract", () => {
    const { repositoryDispatch } = workflowsContract;
    for (const field of ["production_digests", "candidate_digests"]) expect(repositoryDispatch["release-candidate"]!.clientPayload[field], field).toEqual(expect.objectContaining({ required: false }));
    for (const field of ["production", "digests"]) expect(repositoryDispatch.deployed!.clientPayload[field], field).toEqual(expect.objectContaining({ required: false }));
    for (const heading of ["## Image digests and the release record", "### Digests in the dispatch", "### The release record", "### Checking a deployment"]) expect(contractMd, heading).toContain(heading);
    for (const status of reportSchema.properties.deployment.properties.status.enum) expect(contractMd, status).toContain(`| \`${status}\` |`);
  });

  it("the release records branch is written by one job of release.yml and read by post-deploy.yml", () => {
    const branch = (workflowsContract as unknown as { releaseRecordsBranch: { branch: string; writtenBy: string; job: string; readBy: string[] } }).releaseRecordsBranch;
    const release = read(`.github/workflows/${branch.writtenBy}`);
    expect(branch).toMatchObject({ branch: "release-records", writtenBy: "release.yml", job: "publish-record", readBy: ["post-deploy.yml"] });
    expect(release).toContain(`  ${branch.job}:`);
    expect(workflowsContract.writePermissions["release.yml"]![branch.job]).toEqual(["contents"]);
    for (const f of branch.readBy) expect(read(`.github/workflows/${f}`)).toContain(`?ref=${branch.branch}`);
    expect(contractMd).toContain("`release-records` branch");
  });
});

describe("noise-status.json", () => {
  it("since 1.2.0 a status may carry `degraded`; the schema and the reader agree, and the contract says what it means", () => {
    const degraded = { schemaVersion: 1, ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0, degraded: ["side a did not run pulled+verified images (cached)"] };
    expectValid(validateNoise, degraded);
    expect(parseNoiseStatus(JSON.stringify(degraded))).toEqual(degraded);
    expect(validateNoise({ ...degraded, degraded: [""] })).toBe(false);
    expect(validateNoise({ ...degraded, degraded: "cached" })).toBe(false);
    expect(() => parseNoiseStatus(JSON.stringify({ ...degraded, degraded: "cached" }))).toThrow(/not a valid noise status/);
    for (const field of ["degraded", "--require-verified", "--image-cache", "--override-reason", "--override-by", "claimHygiene", "override", "cachedAt", "HARNESS_CLAIM_MAX_HUNKS"]) expect(contractMd, field).toContain(field);
  });

  it("noise mode writes one the schema accepts; no other mode writes one", () => {
    const { dir, written } = runFixture("noise");
    const status = JSON.parse(readFileSync(join(dir, "noise-status.json"), "utf8"));
    expectValid(validateNoise, status);
    expect(status).toEqual({ schemaVersion: SCHEMA_VERSION, ranAt: written.ranAt, clean: true, hunks: 0 });
    expect(readdirSync(runFixture("release").dir)).not.toContain("noise-status.json");
  });

  it("a dirty A/A is recorded as such", () => {
    const { dir } = runFixture("noise", { mutate: true });
    const status = JSON.parse(readFileSync(join(dir, "noise-status.json"), "utf8"));
    expectValid(validateNoise, status);
    expect(status.clean).toBe(false);
    expect(status.hunks).toBeGreaterThan(0);
  });

  it("the reader accepts what the schema accepts and refuses what it refuses", () => {
    const cases: [unknown, boolean][] = [
      [{ ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0 }, true],
      [{ schemaVersion: 1, ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0 }, true],
      [{ schemaVersion: 2, ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0 }, false],
      [{ clean: true, hunks: 0 }, false],
      [{ ranAt: "yesterday", clean: true, hunks: 0 }, false],
      [{ ranAt: "2026-09-16T02:00:00.000Z", clean: "yes", hunks: 0 }, false]
    ];
    for (const [value, ok] of cases) {
      expect(validateNoise(value), JSON.stringify(value)).toBe(ok);
      if (ok) expect(parseNoiseStatus(JSON.stringify(value))).toEqual(value);
      else expect(() => parseNoiseStatus(JSON.stringify(value))).toThrow(/not a valid noise status/);
    }
  });

  it("a status with no usable date never gives the gate the right to fail", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-contract-"));
    writeFileSync(join(dir, "noise-status.json"), JSON.stringify({ clean: true, hunks: 0 }));
    expect(() => runFixture("release", { mutate: true, noise: dir })).toThrow(/not a valid noise status/);
  });

  it("is trusted for seven days by default, and the contract says so", () => {
    expect(defaultRunOptions().noiseMaxAgeDays).toBe(7);
    expect(contractMd).toMatch(/7 days/);
    const unclaimed: CompareResult["unclaimed"] = [{ id: "1", artefact: "headers", scope: "x", summary: "x", severity: "fail" }];
    const compare: CompareResult = { hunks: unclaimed, matches: [{ hunk: unclaimed[0]! }], unclaimed, staleClaims: [], broadUnapproved: [] };
    const ranAt = new Date("2026-09-16T09:00:00.000Z");
    const at = (days: number) => ({ ranAt: new Date(ranAt.getTime() - days * 86_400_000).toISOString(), clean: true, hunks: 0 });
    const verdict = (days: number) => gate({ mode: "release", compare, noise: at(days), noiseWaived: false, noiseMaxAgeDays: 7, ranAt }).verdict;
    expect(verdict(7)).toBe("fail");
    expect(verdict(7.01)).toBe("warn");
  });
});

describe("exit codes", () => {
  it("are 0 for pass and warn, 1 for fail, as cli.json and contract.md say", () => {
    expect([exitCodeFor("pass"), exitCodeFor("warn"), exitCodeFor("fail")]).toEqual([0, 0, 1]);
    expect(Object.keys(cli.exitCodes)).toEqual(["0", "1", "2"]);
    for (const [code, meaning] of Object.entries(cli.exitCodes)) expect(contractMd).toContain(`| \`${code}\` | ${meaning[0]!.toUpperCase()}${meaning.slice(1)}`);
  });

  it("an image that may not be judged is 2, one that cannot be obtained is 1, as the table says", () => {
    expect([EXIT_UNAVAILABLE, EXIT_CANNOT_JUDGE]).toEqual([1, 2]);
    expect(cli.exitCodes["1"]).toContain("images ensure could not obtain an image");
    expect(cli.exitCodes["2"]).toContain("an image may not be judged");
    expect(read("src/cli.ts")).toMatch(/error instanceof ImageTrustError\) \{\s*console\.error\(`cannot judge: [^\n]*\n\s*process\.exit\(EXIT_CANNOT_JUDGE\);/);
  });

  it("usage errors and harness failures exit 2", () => {
    const source = read("src/cli.ts");
    expect(source).toMatch(/function fail\(message: string\): never \{\s*console\.error\(message\);\s*process\.exit\(2\);/);
    expect(source).toMatch(/console\.error\(error instanceof Error[^\n]*\n\s*process\.exit\(2\);/);
  });
});

describe("claims format", () => {
  it("has a version the contract names, optional in the file, and refuses any other", () => {
    expect(contractMd).toContain(`Claims format version: \`${CLAIMS_VERSION}\``);
    const body = 'claims:\n  - artefact: dom\n    scope: "reader:*"\n    reason: "Rule 0031: reading time"\n';
    expect(parseClaims(body)).toHaveLength(1);
    expect(parseClaims(`version: ${CLAIMS_VERSION}\n${body}`)).toHaveLength(1);
    expect(() => parseClaims(`version: ${CLAIMS_VERSION + 1}\n${body}`)).toThrow(/not a valid claims file/);
  });

  it("the contract lists every artefact a claim may name", () => {
    for (const artefact of ARTEFACTS) expect(contractMd).toContain(`\`${artefact}\``);
  });
});

describe("CLI", () => {
  const source = read("src/cli.ts");

  it("cli.json lists exactly the flags src/cli.ts parses", () => {
    const block = source.slice(source.indexOf("options: {"), source.indexOf("allowNegative"));
    const parsed = [...block.matchAll(/^\s*"?([a-z][a-z-]*)"?: \{ type: "(string|boolean)"(, multiple: true)?/gm)].map((m) => ({ name: m[1]!, type: m[2]!, multiple: Boolean(m[3]) }));
    expect(parsed.length).toBeGreaterThan(20);
    expect(cli.flags.map((f) => ({ name: f.name, type: f.type, multiple: Boolean(f.multiple) }))).toEqual(parsed);
  });

  it("cli.json lists exactly the commands src/cli.ts dispatches", () => {
    const commands = [...source.matchAll(/^\s*case "([a-z][a-z-]*)":/gm), ...source.matchAll(/command === "([a-z]+)"/g)].map((m) => m[1]!);
    expect(cli.commands.map((c) => c.name).sort()).toEqual([...new Set(commands)].sort());
    for (const c of cli.commands) expect(source, `usage text for ${c.name}`).toContain(`harness ${c.name}`);
  });

  it("every subcommand cli.json lists is dispatched and has usage, and the dispatch of `local` and `vuln-db` has no subcommand cli.json lacks", () => {
    const local = read("src/local/cli.ts");
    const arms = (fn: string) => {
      const start = local.indexOf(fn);
      expect(start, fn).toBeGreaterThan(-1);
      const body = local.slice(start, local.indexOf("\n}\n", start));
      return [...body.matchAll(/^\s{4}case "([a-z-]+)":/gm)].map((m) => m[1]!);
    };
    const byName = Object.fromEntries(cli.commands.map((c) => [c.name, c]));
    expect(arms("export function vulnDbCommand").sort()).toEqual([...byName["vuln-db"]!.subcommands!].sort());
    expect(arms("export function buildPlan").sort()).toEqual([...byName.local!.subcommands!].sort());
    for (const c of cli.commands) {
      for (const sub of c.subcommands ?? []) {
        expect(`${source}\n${local}`, `${c.name} ${sub}`).toContain(`"${sub}"`);
        expect(source, `usage for ${c.name} ${sub}`).toMatch(new RegExp(`harness ${c.name}[^\\n]*\\b${sub}\\b`));
      }
    }
    // the 1.3.0 commands are declared, and none of them is stable; a command with no subcommands lists none
    for (const name of ["prune", "vuln-db", "local"]) expect(byName[name]!.stable, name).toBe(false);
    expect(byName.prune!.subcommands).toBeUndefined();
  });

  it("the enumerated flag values are the code's", () => {
    expect(cli.flags.find((f) => f.name === "mode")!.values).toEqual([...MODES]);
    expect(cli.flags.find((f) => f.name === "substrate")!.values).toEqual([...SUBSTRATES]);
  });

  it("the environment variables and image forms in cli.json are the code's, and contract.md documents them", () => {
    const env = (json("docs/contract/cli.json") as { environment: Record<string, { default: string }> }).environment;
    expect(env.HARNESS_IMAGE_PREFIX!.default).toBe(DEFAULT_IMAGE_PREFIX);
    expect(defaultRunOptions().imagePrefix).toBe(process.env.HARNESS_IMAGE_PREFIX ?? DEFAULT_IMAGE_PREFIX);
    expect(env.HARNESS_COSIGN_IDENTITY!.default).toBe(DEFAULT_COSIGN_IDENTITY);
    expect(env.HARNESS_COSIGN_ISSUER!.default).toBe(DEFAULT_COSIGN_ISSUER);
    for (const name of Object.keys(env).filter((k) => !k.startsWith("$"))) {
      expect(contractMd, name).toContain(`\`${name}\``);
      expect(["src/images.ts", "src/run.ts", "src/claims/hygiene.ts", "src/image-static/collect.ts", "src/compare/image-static.ts", "src/local/home.ts", "src/project.ts", "src/not-collected.ts"].map((f) => read(f)).join(" "), name).toContain(name);
    }
    expect(contractMd).toContain(`\`${DEFAULT_COSIGN_IDENTITY}\``);
    // The forms the contract promises, against the one function that expands them.
    const d = `sha256:${"1".repeat(64)}`;
    expect(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE).reader).toBe("quay.io/tutors-sdk/tutors-reader:16.2.0");
    expect(imagesFor("16.2.0", "tutors").reader).toBe("tutors/reader:16.2.0");
    expect(imagesFor(`reader=r@${d},catalogue=c:1@${d},live=l:1`, "tutors").reader).toBe(`r@${d}`);
    expect(() => imagesFor(`16.2.0@${d}`, "tutors")).toThrow();
    expect(() => imagesFor(`quay.io/x/tutors-reader@${d}`, "tutors")).toThrow();
  });

  it("1.3.0: doctor, noise record|status and guard are stable; local, override list and noise history are not, and the contract says which and why", () => {
    const byName = Object.fromEntries(cli.commands.map((c) => [c.name, c]));
    for (const name of ["doctor", "noise", "guard"]) expect(byName[name]!.stable, name).toBe(true);
    for (const name of ["local", "override"]) expect(byName[name]!.stable, name).toBe(false);
    expect(byName.noise!.subcommands).toEqual(["record", "status", "history"]);
    expect(byName.noise!.unstableSubcommands).toEqual(["history"]);
    expect(byName.guard!.subcommands).toEqual(["masks", "engine", "all"]);
    expect(byName.guard!.unstableSubcommands).toBeUndefined();
    for (const sub of byName.noise!.subcommands!.filter((s) => !byName.noise!.unstableSubcommands!.includes(s))) expect(contractMd, sub).toContain(`harness noise ${sub}`);
    expect(contractMd).toContain("harness guard masks");
    // the flags a stable command takes are stable with it, and every one of them is in the table
    const stableFlags = new Set(cli.flags.filter((f) => f.stable).map((f) => f.name));
    for (const flag of ["status", "report", "tag", "store", "run-url", "summary", "require", "for", "base", "json"]) expect(stableFlags.has(flag), flag).toBe(true);
    // and the ones only the unstable commands take are not
    for (const flag of ["only", "migrations-a", "migrations-b", "interval", "port-offset", "dry-run", "once", "record", "last", "since"]) expect(stableFlags.has(flag), flag).toBe(false);
    expect(contractMd).toContain("Which of the 1.3.0 commands are stable");
    // the exit codes those commands add are in cli.json and in the table
    for (const words of ["doctor found a tool a run needs missing", "noise record found the ratchet broken", "guard found a violation"]) {
      expect(cli.exitCodes["1"], words).toContain(words);
      expect(contractMd, words).toContain(words);
    }
  });

  it("contract.md documents every stable command and flag", () => {
    for (const c of cli.commands.filter((c) => c.stable)) expect(contractMd, c.name).toContain(`harness ${c.name}`);
    for (const f of cli.flags.filter((f) => f.stable)) expect(contractMd, f.name).toContain(`\`--${f.name}`);
  });

  it("the workflows and the ones the monorepo copies use only commands and flags cli.json declares; what the monorepo copies, only stable ones", () => {
    const stableCommands = new Set(cli.commands.filter((c) => c.stable).map((c) => c.name));
    const stableFlags = new Set(cli.flags.filter((f) => f.stable).map((f) => f.name));
    // The workflows in this repository ship in the same tree as the CLI, so they can never run a harness that lacks what
    // they call: they may use anything cli.json declares, stable or not. What the monorepo copies (docs/monorepo) is pinned
    // to a harness by tag, and may only rely on what the contract promises.
    const declaredCommands = new Set(cli.commands.map((c) => c.name));
    const declaredFlags = new Set(cli.flags.map((f) => f.name));
    const own = readdirSync(resolve(ROOT, ".github/workflows")).map((f) => `.github/workflows/${f}`);
    const copied = readdirSync(resolve(ROOT, "docs/monorepo")).filter((f) => f.endsWith(".yml")).map((f) => `docs/monorepo/${f}`);
    let calls = 0;
    for (const file of [...own, ...copied]) {
      const commands = own.includes(file) ? declaredCommands : stableCommands;
      const flags = own.includes(file) ? declaredFlags : stableFlags;
      // A call may continue over lines with a trailing backslash.
      const text = read(file).replace(/\\\n/g, " ");
      for (const m of text.matchAll(/pnpm harness ([a-z][a-z-]*)([^\n]*)/g)) {
        calls += 1;
        expect(commands.has(m[1]!), `${file}: harness ${m[1]}`).toBe(true);
        for (const flag of m[2]!.matchAll(/(?<![\w-])--([a-z][a-z-]*)/g)) expect(flags.has(flag[1]!), `${file}: --${flag[1]}`).toBe(true);
      }
    }
    expect(calls).toBeGreaterThan(5);
  });

  it("`harness version --json` prints the stamp that goes into every report", () => {
    const result = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), "version", "--json"], { cwd: ROOT, encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual(harnessInfo());
  });
});

describe("versions", () => {
  it("the contract version is the same everywhere it is written down", () => {
    expect(cli.contractVersion).toBe(CONTRACT_VERSION);
    expect(workflowsContract.contractVersion).toBe(CONTRACT_VERSION);
    expect(contractMd).toContain(`Contract version: \`${CONTRACT_VERSION}\``);
    expect(SCHEMA_VERSION).toBe(Number(CONTRACT_VERSION.split(".")[0]));
    expect(reportSchema.title).toContain(`contract ${SCHEMA_VERSION}.x`);
    expect(noiseSchema.title).toContain(`contract ${SCHEMA_VERSION}.x`);
  });

  it("the harness version is package.json's", () => {
    expect(harnessInfo().version).toBe(json("package.json").version);
    expect(harnessInfo().gitSha === null || /^[0-9a-f]{40}$/.test(harnessInfo().gitSha!)).toBe(true);
  });
});

describe("workflows", () => {
  const dir = resolve(ROOT, ".github/workflows");
  const files = readdirSync(dir);
  const text = Object.fromEntries(files.map((f) => [f, readFileSync(join(dir, f), "utf8")]));
  const parsed = Object.fromEntries(files.map((f) => [f, parse(text[f]!) as { on: Record<string, { types?: string[] }>; permissions?: Record<string, string>; jobs: Record<string, { permissions?: Record<string, string> }> }]));

  it("accept exactly the repository_dispatch event types the contract lists", () => {
    const actual: Record<string, string> = {};
    for (const f of files) for (const type of parsed[f]!.on.repository_dispatch?.types ?? []) actual[type] = f;
    expect(actual).toEqual(Object.fromEntries(Object.entries(workflowsContract.repositoryDispatch).map(([type, v]) => [type, v.workflow])));
  });

  it("read exactly the client_payload fields the contract lists", () => {
    for (const [type, spec] of Object.entries(workflowsContract.repositoryDispatch)) {
      const used = [...new Set([...text[spec.workflow]!.matchAll(/github\.event\.client_payload\.([a-z_]+)/g)].map((m) => m[1]!))].sort();
      expect(used, type).toEqual(Object.keys(spec.clientPayload).sort());
      for (const field of used) expect(contractMd).toContain(`\`${field}\``);
    }
    const sample = read("docs/monorepo/release-dispatch.yml");
    // The sender may spell the payload as `gh -F client_payload[x]=…` flags or as a jq object; both are read.
    const jqObject = /client_payload:\s*\{([^}]*)\}/.exec(sample)?.[1] ?? "";
    const sent = [...sample.matchAll(/client_payload\[([a-z_]+)\]/g), ...jqObject.matchAll(/([a-z_]+):\s*\$/g)].map((m) => m[1]!);
    expect(sent.length).toBeGreaterThan(0);
    const contractPayload = workflowsContract.repositoryDispatch["release-candidate"]!.clientPayload;
    for (const field of sent) expect(Object.keys(contractPayload)).toContain(field);
    // Everything the contract requires is sent.
    for (const [field, spec] of Object.entries(contractPayload)) if (spec.required) expect(sent, field).toContain(field);
    expect(sample).toMatch(/event_type(=|:\s*")release-candidate/);
  });

  it("read exactly the repository variables the contract lists, with the defaults it states", () => {
    const actual: Record<string, { default: string; usedBy: string[] }> = {};
    for (const f of files) {
      for (const m of text[f]!.matchAll(/vars\.([A-Z_]+) \|\| '([^']*)'/g)) {
        actual[m[1]!] ??= { default: m[2]!, usedBy: [] };
        expect(actual[m[1]!]!.default, `${f}: ${m[1]}`).toBe(m[2]);
        if (!actual[m[1]!]!.usedBy.includes(f)) actual[m[1]!]!.usedBy.push(f);
      }
      expect([...text[f]!.matchAll(/vars\.[A-Z_]+/g)].length, `${f}: a variable without a default`).toBe([...text[f]!.matchAll(/vars\.[A-Z_]+ \|\| '/g)].length);
    }
    for (const v of Object.values(actual)) v.usedBy.sort();
    expect(actual).toEqual(workflowsContract.repositoryVariables);
    for (const name of Object.keys(actual)) expect(contractMd).toContain(`\`${name}\``);
  });

  it("install cosign 3 in every job that runs images ensure, and nowhere pass --allow-unsigned", () => {
    const tools = (json("docs/contract/workflows.json") as { tools: { cosign: { action: string; minimumMajor: number; usedBy: string[] } } }).tools.cosign;
    // `harness local smoke` runs `images ensure` itself (ci.yml calls it instead of spelling the step out)
    const ensuring = /harness images ensure|harness local smoke/;
    const using = files.filter((f) => ensuring.test(text[f]!)).sort();
    expect(using).toEqual(tools.usedBy);
    for (const f of using) {
      const ensures = [...text[f]!.matchAll(new RegExp(ensuring, "g"))].length;
      const installs = [...text[f]!.matchAll(new RegExp(`uses: ${tools.action}@v(\\d+)`, "g"))];
      expect(installs.length, f).toBe(ensures);
      // cosign-installer v4 is the first whose default is cosign 3.
      for (const m of installs) expect(Number(m[1]), f).toBeGreaterThanOrEqual(4);
    }
    expect(tools.minimumMajor).toBe(3);
    for (const f of files) expect(text[f], f).not.toMatch(/allow-unsigned|HARNESS_ALLOW_UNSIGNED/);
    expect(workflowsContract.repositoryVariables.HARNESS_IMAGE_PREFIX!.default).toBe(QUAY_IMAGE_TEMPLATE);
    expect(workflowsContract.repositoryVariables.HARNESS_COSIGN_IDENTITY!.default).toBe(DEFAULT_COSIGN_IDENTITY);
  });

  it("publish exactly the artifacts the contract lists", () => {
    const actual: Record<string, { workflow: string; retentionDays: number }> = {};
    for (const f of files) {
      for (const m of text[f]!.matchAll(/uses: actions\/upload-artifact@[^\n]+\n(?:[^\n]*\n){0,3}?\s+name: ([a-z-]+)\n(?:[^\n]*\n){0,3}?\s+retention-days: (\d+)/g)) actual[m[1]!] = { workflow: f, retentionDays: Number(m[2]) };
    }
    expect(actual).toEqual(workflowsContract.artifacts);
    for (const name of Object.keys(actual)) expect(contractMd).toContain(`\`${name}\``);
  });

  it("never hold a permission that could write to a pull request, a check or a status", () => {
    for (const f of files) {
      const blocks = [parsed[f]!.permissions ?? {}, ...Object.values(parsed[f]!.jobs).map((j) => j.permissions ?? {})];
      expect(parsed[f]!.permissions, `${f}: top-level permissions`).toBeDefined();
      for (const block of blocks) {
        expect(typeof block, `${f}: permissions must be a map, not write-all`).toBe("object");
        for (const scope of workflowsContract.forbiddenPermissions) expect(block[scope], `${f}: ${scope}`).toBeUndefined();
      }
    }
  });

  it("hold `write` on exactly the scopes writePermissions lists, and only in the jobs it names, all on this repository", () => {
    const actual: Record<string, Record<string, string[]>> = {};
    for (const f of files) {
      const top = Object.entries(parsed[f]!.permissions ?? {}).filter(([, level]) => level === "write").map(([scope]) => scope);
      if (top.length) (actual[f] ??= {})["<workflow>"] = top.sort();
      for (const [job, def] of Object.entries(parsed[f]!.jobs)) {
        const scopes = Object.entries(def.permissions ?? {}).filter(([, level]) => level === "write").map(([scope]) => scope);
        if (scopes.length) (actual[f] ??= {})[job] = scopes.sort();
      }
    }
    const declared = Object.fromEntries(Object.entries(workflowsContract.writePermissions).filter(([k]) => !k.startsWith("$")).map(([f, v]) => [f, Object.fromEntries(Object.entries(v).filter(([k]) => k !== "why"))]));
    expect(actual).toEqual(declared);
  });

  it("nothing pushes, tags or releases anywhere but the noise and release-records branches of this repository, each from its own workflow", () => {
    const branchOf: Record<string, string> = { "nightly-noise.yml": "noise", "release.yml": "release-records" };
    let pushes = 0;
    for (const f of files) {
      for (const m of text[f]!.matchAll(/git (?:-c [^\n]*?)?push[^\n]*/g)) {
        pushes += 1;
        expect(Object.keys(branchOf), m[0]).toContain(f);
        expect(m[0]).toContain("${GITHUB_REPOSITORY}");
        expect(m[0]).toMatch(new RegExp(` ${branchOf[f]}$`));
        // the noise branch is forced every night; the release records are never forced: no record is lost
        expect(/--force/.test(m[0]), m[0]).toBe(f === "nightly-noise.yml");
      }
      expect(text[f], f).not.toMatch(/git tag|gh release|gh pr |gh api [^\n]*-X (?:POST|PUT|PATCH|DELETE)/);
    }
    expect(pushes).toBe(Object.keys(branchOf).length);
  });

  it("the latest noise status comes from the noise branch, vetted, not from an expiring artifact", () => {
    expect(workflowsContract.noiseBranch.branch).toBe("noise");
    for (const f of workflowsContract.noiseBranch.readBy) {
      expect(text[f], f).toContain("contents/noise-status.json?ref=noise");
      expect(text[f], f).toContain("harness noise status --store noise");
      expect(text[f], f).not.toContain("dawidd6/action-download-artifact@v6\n        continue-on-error: true\n        with:\n          workflow: nightly-noise.yml");
    }
    expect(text[workflowsContract.noiseBranch.writtenBy]).toContain("harness noise record");
    for (const file of workflowsContract.noiseBranch.files) expect(text["nightly-noise.yml"], file).toContain(file);
    expect(contractMd).toContain("`noise` branch");
  });

  it("the nightly asks the registry first, keeps a cache for an outage, and runs the A/A that requires verified images", () => {
    const nightly = text["nightly-noise.yml"]!;
    expect(nightly).toMatch(/harness images ensure --a "\$TAG" --b "\$TAG" --image-cache/);
    expect(nightly).toMatch(/harness run --mode noise --a "\$TAG" --b "\$TAG" --runs 5 --load 20x30s --require-verified/);
    // one runner image for the A/A and for the runs it licenses, so the noise floor it measured is the one they meet
    const image = (f: string) => [...new Set([...text[f]!.matchAll(/runs-on: (ubuntu-[\d.]+)/g)].map((m) => m[1]))];
    expect(image("nightly-noise.yml")).toEqual(["ubuntu-24.04"]);
    expect(image("release.yml")).toContain("ubuntu-24.04");
    expect(image("post-deploy.yml")).toEqual(["ubuntu-24.04"]);
    expect(nightly).toContain("actions/cache/restore@");
    expect(nightly).toContain("actions/cache/save@");
    expect(nightly).toContain("steps.ensure.outputs.image_cache == 'refreshed'");
    // no image-against-itself shortcut: nothing builds or loads locally before `ensure`
    expect(nightly.indexOf("actions/cache/restore@")).toBeLessThan(nightly.indexOf("harness images ensure"));
  });

  it("an override can only come from a person dispatching release.yml by hand", () => {
    const release = text["release.yml"]!;
    expect(Object.keys(workflowsContract.dispatchInputs["release.yml"]!)).toEqual(["override_reason"]);
    expect(release).toContain("OVERRIDE_REASON: ${{ inputs.override_reason }}");
    expect(release).toContain("OVERRIDE_BY: ${{ github.triggering_actor }}");
    expect(release).not.toMatch(/client_payload\.override/);
    expect(release).toContain("harness-override");
  });
});
