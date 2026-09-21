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
import { parseClaims } from "../src/claims/schema.ts";
import { exitCodeFor, gate } from "../src/gate.ts";
import { parseNoiseStatus } from "../src/noise.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { compareFromCaptures, defaultRunOptions } from "../src/run.ts";
import { DEFAULT_COSIGN_IDENTITY, DEFAULT_COSIGN_ISSUER, EXIT_CANNOT_JUDGE, EXIT_UNAVAILABLE } from "../src/images.ts";
import { DEFAULT_IMAGE_PREFIX, QUAY_IMAGE_TEMPLATE, imagesFor } from "../src/image-ref.ts";
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
  commands: { name: string; stable: boolean; subcommands?: string[] }[];
  flags: { name: string; type: "string" | "boolean"; multiple?: boolean; stable: boolean; values?: string[] }[];
  exitCodes: Record<string, string>;
};
const workflowsContract = json("docs/contract/workflows.json") as {
  contractVersion: string;
  repositoryDispatch: Record<string, { workflow: string; clientPayload: Record<string, unknown> }>;
  repositoryVariables: Record<string, { default: string; usedBy: string[] }>;
  artifacts: Record<string, { workflow: string; retentionDays: number }>;
  forbiddenPermissions: string[];
};
const contractMd = read("docs/contract.md");

const ajv = new Ajv({ allErrors: true, strict: true });
ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
const validateReport = ajv.compile(reportSchema);
const validateNoise = ajv.compile(noiseSchema);

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
  builtFrom: { ref: "v16.2.0", sha: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" }
});
const sideProvenance = { summary: "pulled+verified", allowedUnsigned: true as const, images: { reader: imageInfo("reader", 1), catalogue: imageInfo("catalogue", 2), live: imageInfo("live", 3) } };
/** One static image artefact carrying every field the report allows (a real one carries either `reason` or `summary`, not both). */
const artefactStatus = { collected: true, source: "cosign attestation (signature verified)", reason: "no SBOM attestation", summary: "312 distinct package(s)" };
const appArtefacts = { manifest: artefactStatus, sbom: artefactStatus, vulns: artefactStatus };
const sideArtefacts = { reader: appArtefacts, catalogue: appArtefacts, live: appArtefacts };
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
  sides: { a: { reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0" }, b: { reader: "tutors/reader:rc", catalogue: "tutors/catalogue:rc", live: "tutors/live:rc" } },
  provenance: { a: sideProvenance, b: sideProvenance },
  verdict: "fail",
  reasons: ["1 unclaimed diff(s)"],
  noise: { schemaVersion: SCHEMA_VERSION, ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0 },
  compare: {
    hunks: [{ id: "1", artefact: "dom", scope: "reader:lab-step", path: "/lab/x", summary: "semantic DOM differs", detail: "+ x", severity: "fail" }],
    matches: [{ hunk: { id: "1", artefact: "dom", scope: "reader:lab-step", path: "/lab/x", summary: "semantic DOM differs", detail: "+ x", severity: "fail" }, claim: { artefact: "*", scope: "**", reason: "Rule 0031: reading time", approvedBy: "a-maintainer" } }],
    unclaimed: [{ id: "2", artefact: "headers", scope: "reader:home/x-frame-options", path: "/", summary: "header dropped", detail: "-", severity: "fail" }],
    staleClaims: [{ artefact: "network", scope: "GET /gone", reason: "Rule 0002: stale", approvedBy: "a-maintainer" }],
    broadUnapproved: [{ artefact: "*", scope: "**", reason: "everything changed in this one", approvedBy: "" }]
  },
  masksApplied: { "response-date": 4, etag: 0 },
  migration: { a: { ref: "v16.2.0", files: ["0001.sql"], catalog }, b: { ref: "release/16.3.0", files: ["0001.sql", "0002.sql"], catalog }, rolledBack: catalog },
  upgrade: { substrate: "compose", requests: 900, failed: 0, serverErrors: 0, byUpstream: { a: { requests: 300, failed: 0, serverErrors: 0, p95: 30 }, b: { requests: 600, failed: 0, serverErrors: 0, p95: 31 } }, switchedAt: 15000, durationMs: 45000 },
  load: { a: load, b: load },
  imageArtefacts: { a: sideArtefacts, b: sideArtefacts }
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

describe("noise-status.json", () => {
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
    const commands = [...source.matchAll(/^\s*case "([a-z]+)":/gm), ...source.matchAll(/command === "([a-z]+)"/g)].map((m) => m[1]!);
    expect(cli.commands.map((c) => c.name).sort()).toEqual([...new Set(commands)].sort());
    for (const c of cli.commands) expect(source, `usage text for ${c.name}`).toContain(`harness ${c.name}`);
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
      expect(read("src/images.ts") + read("src/run.ts") + read("src/image-static/collect.ts") + read("src/compare/image-static.ts"), name).toContain(name);
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

  it("contract.md documents every stable command and flag", () => {
    for (const c of cli.commands.filter((c) => c.stable)) expect(contractMd, c.name).toContain(`harness ${c.name}`);
    for (const f of cli.flags.filter((f) => f.stable)) expect(contractMd, f.name).toContain(`\`--${f.name}`);
  });

  it("the workflows, and the ones the monorepo copies, use only stable commands and flags", () => {
    const stableCommands = new Set(cli.commands.filter((c) => c.stable).map((c) => c.name));
    const stableFlags = new Set(cli.flags.filter((f) => f.stable).map((f) => f.name));
    const files = [...readdirSync(resolve(ROOT, ".github/workflows")).map((f) => `.github/workflows/${f}`), ...readdirSync(resolve(ROOT, "docs/monorepo")).filter((f) => f.endsWith(".yml")).map((f) => `docs/monorepo/${f}`)];
    let calls = 0;
    for (const file of files) {
      // A call may continue over lines with a trailing backslash.
      const text = read(file).replace(/\\\n/g, " ");
      for (const m of text.matchAll(/pnpm harness ([a-z]+)([^\n]*)/g)) {
        calls += 1;
        expect(stableCommands.has(m[1]!), `${file}: harness ${m[1]}`).toBe(true);
        for (const flag of m[2]!.matchAll(/(?<![\w-])--([a-z][a-z-]*)/g)) expect(stableFlags.has(flag[1]!), `${file}: --${flag[1]}`).toBe(true);
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
    const sent = [...sample.matchAll(/client_payload\[([a-z_]+)\]/g)].map((m) => m[1]!);
    expect(sent.length).toBeGreaterThan(0);
    for (const field of sent) expect(Object.keys(workflowsContract.repositoryDispatch["release-candidate"]!.clientPayload)).toContain(field);
    expect(sample).toContain("event_type=release-candidate");
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
    const using = files.filter((f) => text[f]!.includes("harness images ensure")).sort();
    expect(using).toEqual(tools.usedBy);
    for (const f of using) {
      const ensures = [...text[f]!.matchAll(/harness images ensure/g)].length;
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
        for (const [scope, level] of Object.entries(block)) if (level === "write") expect(`${f}: ${scope}`).toBe("post-deploy.yml: issues");
      }
    }
  });
});
