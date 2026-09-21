/**
 * The pinned vulnerability database: `harness vuln-db update|status`, where a scan looks for the database, and the shapes grype
 * really prints. The runner is fake (no network, no grype); the JSON it hands back is what grype 0.119.0 printed
 * (tests/fixtures/real-tools).
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Exec, ExecResult } from "../src/images.ts";
import { collectImageStatic, staticPolicyFromEnv } from "../src/image-static/collect.ts";
import { packagesFromSpdx } from "../src/image-static/sbom.ts";
import { parseScannerOutput, scannerEnv } from "../src/image-static/vulns.ts";
import { trustPolicyFromEnv } from "../src/images.ts";
import { DEFAULT_VULN_DB_MAX_AGE_DAYS, MIN_GRYPE_VERSION, PINNED_GRYPE_VERSION, compareVersions, dbAgeDays, dbChecksum, judgeDb, maxAgeDays, parseDbStatus, parseGrypeVersion, vulnDbDirFromEnv, vulnDbStatus, vulnDbUpdate, type VulnDbDeps } from "../src/local/vuln-db.ts";
import { spdx } from "./support/image-static.ts";

const REAL = resolve(import.meta.dirname, "fixtures/real-tools");
const real = (name: string) => readFileSync(join(REAL, name), "utf8");
const NOW = new Date("2026-09-21T10:00:00.000Z");
const done = (stdout = "", status = 0, stderr = ""): ExecResult => ({ status, stdout, stderr });
const notInstalled = (): ExecResult => ({ status: null, stdout: "", stderr: "", error: Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" }) as NodeJS.ErrnoException });

describe("what grype 0.119.0 really prints", () => {
  it("`db status -o json`: fresh, missing, and past its age limit", () => {
    expect(parseDbStatus(real("grype-0.119.0-db-status.json"))).toEqual({
      valid: true,
      schemaVersion: "v6.1.9",
      built: "2026-09-21T06:39:24Z",
      from: expect.stringContaining("vulnerability-db_v6.1.9_2026-09-21T00:35:57Z"),
      path: "<db dir>/6/vulnerability.db"
    });
    expect(parseDbStatus(real("grype-0.119.0-db-status-missing.json"))).toEqual({ valid: false, path: "<db dir>/6/vulnerability.db", error: "database does not exist" });
    expect(parseDbStatus(real("grype-0.119.0-db-status-too-old.json"))).toMatchObject({ valid: false, error: "the vulnerability database was built 4 hours ago (max allowed age is 1 hour)" });
  });

  it("the checksum is read out of the download URL, and the age out of `built`", () => {
    const s = parseDbStatus(real("grype-0.119.0-db-status.json"))!;
    expect(dbChecksum(s.from)).toBe("sha256:3fac8f6fb69bb80a7956703caa7fed5d66ee0c936ca0a2c8fa127e4fe7835c7a");
    expect(dbChecksum("https://example.test/db.tar.zst")).toBeUndefined();
    expect(dbAgeDays(s, NOW)).toBeCloseTo(3.35 / 24, 2);
    // grype prints year 1 for "no database"
    expect(dbAgeDays({ valid: false, built: "0001-01-01T00:00:00Z" }, NOW)).toBeUndefined();
  });

  it("older grype's text output is still read", () => {
    expect(parseDbStatus("Location:  /db\nBuilt:     2026-09-17T01:02:03Z\nSchema:    5\nStatus:    valid")).toMatchObject({ valid: true, built: "2026-09-17T01:02:03Z", schemaVersion: "5" });
    expect(parseDbStatus("Status: invalid")).toMatchObject({ valid: false });
    expect(parseDbStatus("")).toBeUndefined();
    expect(parseDbStatus("{not json")).toBeUndefined();
  });

  it("`grype version`, and the version floor", () => {
    expect(parseGrypeVersion("Application:         grype\nVersion:             0.119.0\nBuildDate:           2026-09-17T16:17:07Z")).toBe("0.119.0");
    expect(parseGrypeVersion("no version here")).toBeUndefined();
    expect(compareVersions("0.119.0", "0.96.0")).toBe(1);
    expect(compareVersions("0.96.0", "0.96.0")).toBe(0);
    expect(compareVersions("0.9.9", "0.96.0")).toBe(-1);
    expect(compareVersions("1.0.0-rc.1", "0.119.0")).toBe(1);
    expect(compareVersions(PINNED_GRYPE_VERSION.slice(1), MIN_GRYPE_VERSION)).toBe(1);
  });

  it("`grype sbom:<syft SPDX> -o json` is parsed into findings, with the scanner and database that made them", () => {
    const parsed = parseScannerOutput(real("grype-0.119.0-sbom.trimmed.json"));
    expect(parsed).toMatchObject({ ok: true, source: "grype 0.119.0", data: { scanner: { name: "grype", version: "0.119.0", db: "built 2026-09-21T06:39:24Z schema v6.1.9" } } });
    if (!parsed.ok) throw new Error("unreachable");
    // one advisory is listed once per match (here: wont-fix, then fixed): one finding, with the fix it has
    expect(Object.keys(parsed.data.findings)).toEqual(["CVE-2023-50387"]);
    expect(parsed.data.findings["CVE-2023-50387"]).toEqual({ severity: "High", packages: ["systemd@252.39-1~deb12u2"], fixedIn: "255.4-1" });
  });

  it("syft's SPDX 2.3 for a directory: the described root is left out, the packages remain", () => {
    const packages = packagesFromSpdx(JSON.parse(real("syft-1.52.0-dir.trimmed.spdx.json")));
    expect(packages).toEqual({ "adduser@3.134": 1, "apt@2.6.1": 1, "bash@5.2.15": 1, "bash@5.2.15-2+b13": 1 });
  });
});

describe("judging a database", () => {
  const fresh = parseDbStatus(real("grype-0.119.0-db-status.json"));

  it("usable within the limit, and it says schema, build time, age and checksum", () => {
    const v = judgeDb(fresh, "", NOW, 5);
    expect(v.usable).toBe(true);
    expect(v.detail).toContain("schema v6.1.9");
    expect(v.detail).toContain("built 2026-09-21T06:39:24Z (3 h ago)");
    expect(v.detail).toContain("sha256:3fac8f6f");
    expect(v.checksum).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("not usable when older than the limit, missing, invalid, or when grype said nothing", () => {
    expect(judgeDb(fresh, "", new Date("2026-09-27T10:00:00Z"), 5)).toMatchObject({ usable: false, detail: expect.stringContaining("older than 5 days") });
    expect(judgeDb(fresh, "", new Date("2026-09-27T10:00:00Z"), 7).usable).toBe(true);
    expect(judgeDb(parseDbStatus(real("grype-0.119.0-db-status-missing.json")), "", NOW, 5)).toMatchObject({ usable: false, detail: expect.stringContaining("database does not exist") });
    expect(judgeDb({ ...fresh!, valid: false, error: "checksum mismatch" }, "", NOW, 5).detail).toContain("checksum mismatch");
    expect(judgeDb(undefined, "grype is not installed", NOW, 5)).toMatchObject({ usable: false, detail: expect.stringContaining("grype is not installed") });
  });

  it("HARNESS_VULN_DB_MAX_AGE_DAYS: a positive number, else the default, and the invalid value is reported", () => {
    expect(maxAgeDays({})).toEqual({ days: DEFAULT_VULN_DB_MAX_AGE_DAYS, explicit: false });
    expect(maxAgeDays({ HARNESS_VULN_DB_MAX_AGE_DAYS: "7" })).toEqual({ days: 7, explicit: true });
    expect(maxAgeDays({ HARNESS_VULN_DB_MAX_AGE_DAYS: "1.5" })).toEqual({ days: 1.5, explicit: true });
    for (const bad of ["0", "-2", "soon"]) expect(maxAgeDays({ HARNESS_VULN_DB_MAX_AGE_DAYS: bad })).toEqual({ days: 5, explicit: false, invalid: bad });
    expect(DEFAULT_VULN_DB_MAX_AGE_DAYS).toBe(5);
  });
});

describe("where a scan looks for the database", () => {
  it("HARNESS_VULN_DB_DIR wins; else HARNESS_HOME/vuln-db when it exists; else grype's own cache", () => {
    expect(vulnDbDirFromEnv({ HARNESS_VULN_DB_DIR: "/x", HARNESS_HOME: "/h" }, () => true)).toBe("/x");
    expect(vulnDbDirFromEnv({ HARNESS_HOME: "/h" }, (p) => p === resolve("/h", "vuln-db"))).toBe(resolve("/h", "vuln-db"));
    expect(vulnDbDirFromEnv({ HARNESS_HOME: "/h" }, () => false)).toBeUndefined();
    expect(vulnDbDirFromEnv({}, () => false, "/elsewhere")).toBeUndefined();
    expect(vulnDbDirFromEnv({}, (p) => p === join("/elsewhere", "vuln-db"), "/elsewhere")).toBe(join("/elsewhere", "vuln-db"));
  });

  it("the static policy carries the directory and an explicit age limit, and a scan is given them as grype's own variables", () => {
    const policy = staticPolicyFromEnv({ HARNESS_HOME: "/h", HARNESS_VULN_DB_MAX_AGE_DAYS: "3" }, trustPolicyFromEnv({}), (p) => p === resolve("/h", "vuln-db"));
    expect(policy.vulnDbDir).toBe(resolve("/h", "vuln-db"));
    expect(policy.vulnDbMaxAgeDays).toBe(3);
    expect(staticPolicyFromEnv({ HARNESS_HOME: "/h" }, trustPolicyFromEnv({}), () => false)).not.toHaveProperty("vulnDbDir");
    expect(staticPolicyFromEnv({ HARNESS_HOME: "/h" }, trustPolicyFromEnv({}), () => false)).not.toHaveProperty("vulnDbMaxAgeDays");
    expect(scannerEnv("/db", 3)).toMatchObject({ GRYPE_DB_CACHE_DIR: "/db", GRYPE_DB_AUTO_UPDATE: "false", GRYPE_DB_MAX_ALLOWED_BUILT_AGE: "72h" });
    // no limit given: grype's own 5 days stands
    expect(scannerEnv("/db")).not.toHaveProperty("GRYPE_DB_MAX_ALLOWED_BUILT_AGE");
  });

  it("collecting hands the scanner the directory and the age limit, updates off, and nothing else about the database", () => {
    const images = { reader: "quay.io/x/r:1", catalogue: "quay.io/x/c:1", live: "quay.io/x/l:1" } as never;
    const envs: NodeJS.ProcessEnv[] = [];
    const exec: Exec = (cmd, _args, opts) => {
      if (cmd === "grype") envs.push(opts?.env ?? {});
      return cmd === "syft" ? done(JSON.stringify(spdx([["bash", "5.2.15"]]))) : done(cmd === "grype" ? real("grype-0.119.0-sbom.trimmed.json") : "{}");
    };
    const policy = { ...staticPolicyFromEnv({ HARNESS_SBOM_SOURCE: "generate", HARNESS_VULN_DB_MAX_AGE_DAYS: "2" }, trustPolicyFromEnv({}), () => false), vulnDbDir: "/db", vulnDbMaxAgeDays: 2 };
    const got = collectImageStatic(images, undefined, { exec, files: { write: (n: string) => `/tmp/${n}` }, policy, log: () => {} });
    expect(got.reader.vulns).toMatchObject({ ok: true });
    expect(envs).toHaveLength(3);
    for (const env of envs) expect(env).toMatchObject({ GRYPE_DB_CACHE_DIR: "/db", GRYPE_DB_AUTO_UPDATE: "false", GRYPE_DB_MAX_ALLOWED_BUILT_AGE: "48h" });
  });

  it("a scan that fails on the database says how to fetch it, in grype's own words plus the command; one that fails otherwise does not", () => {
    const images = { reader: "quay.io/x/r:1", catalogue: "quay.io/x/c:1", live: "quay.io/x/l:1" } as never;
    const scan = (stderr: string) => {
      const exec: Exec = (cmd) => (cmd === "syft" ? done(JSON.stringify(spdx([["bash", "5.2.15"]]))) : cmd === "grype" ? done("", 1, stderr) : done("{}"));
      const files = { write: (name: string) => `/tmp/${name}` };
      const policy = { ...staticPolicyFromEnv({ HARNESS_SBOM_SOURCE: "generate" }, trustPolicyFromEnv({}), () => false), vulnDbDir: "/db" };
      return collectImageStatic(images, undefined, { exec, files, policy, log: () => {} }).reader.vulns;
    };
    const stale = scan("ERROR failed to load vulnerability db: the vulnerability database was built 6 days ago (max allowed age is 5 days)");
    expect(stale).toMatchObject({ ok: false, reason: expect.stringContaining("harness vuln-db update") });
    expect(stale).toMatchObject({ reason: expect.stringContaining("built 6 days ago") });
    expect(scan("ERROR failed to load vulnerability db: database does not exist")).toMatchObject({ reason: expect.stringContaining("harness vuln-db update") });
    const other = scan("ERROR could not parse the SBOM");
    expect(other).toMatchObject({ ok: false });
    expect(JSON.stringify(other)).not.toContain("vuln-db");
  });
});

// ---- the command ------------------------------------------------------------------------------------------------

interface Ran {
  cmd: string;
  args: string[];
  env?: NodeJS.ProcessEnv;
}

function fake(o: { env?: NodeJS.ProcessEnv; grype?: (args: string[]) => ExecResult; platform?: NodeJS.Platform; dirs?: string[]; now?: Date } = {}) {
  const ran: Ran[] = [];
  const lines: string[] = [];
  const made: string[] = [];
  const dirs = new Set(o.dirs ?? []);
  const deps: VulnDbDeps = {
    exec: (cmd, args, opts) => {
      ran.push({ cmd, args, ...(opts?.env ? { env: opts.env } : {}) });
      return (o.grype ?? (() => done(real("grype-0.119.0-db-status.json"))))(args);
    },
    env: o.env ?? { HARNESS_HOME: "/h" },
    platform: o.platform ?? "linux",
    now: () => o.now ?? NOW,
    mkdir: (p) => {
      made.push(p);
      dirs.add(p);
    },
    exists: (p) => dirs.has(p),
    log: (l) => lines.push(l)
  };
  return { deps, ran, lines, made };
}

const OWN = resolve("/h", "vuln-db");

describe("harness vuln-db update", () => {
  it("fetches into HARNESS_HOME/vuln-db: the one place a database is updated, into exactly that directory", () => {
    const f = fake();
    expect(vulnDbUpdate(f.deps)).toBe(0);
    expect(f.made).toEqual([OWN]);
    expect(f.ran[0]).toEqual({ cmd: "grype", args: ["db", "update"], env: { GRYPE_DB_CACHE_DIR: OWN, GRYPE_DB_AUTO_UPDATE: "true", GRYPE_CHECK_FOR_APP_UPDATE: "false" } });
    // then the status of what it fetched, read the way a scan reads it
    expect(f.ran[1]).toMatchObject({ cmd: "grype", args: ["db", "status", "-o", "json"], env: { GRYPE_DB_CACHE_DIR: OWN, GRYPE_DB_AUTO_UPDATE: "false" } });
    expect(f.lines.join("\n")).toContain("vulnerability database: usable");
    expect(f.lines.join("\n")).toContain("sha256:3fac8f6f");
  });

  it("HARNESS_VULN_DB_DIR names the directory instead", () => {
    const f = fake({ env: { HARNESS_VULN_DB_DIR: "/cache/db", HARNESS_HOME: "/h" } });
    expect(vulnDbUpdate(f.deps)).toBe(0);
    expect(f.made).toEqual(["/cache/db"]);
    expect(f.ran[0]!.env).toMatchObject({ GRYPE_DB_CACHE_DIR: "/cache/db" });
  });

  it("no grype: says how to install the pinned version on this platform, exits 1", () => {
    for (const [platform, text] of [["win32", "grype_0.119.0_windows_amd64.zip"], ["darwin", "brew install grype"], ["linux", "-b ~/.local/bin v0.119.0"]] as const) {
      const f = fake({ platform, grype: notInstalled });
      expect(vulnDbUpdate(f.deps), platform).toBe(1);
      expect(f.lines.join("\n"), platform).toContain(text);
    }
  });

  it("a failed download exits 1 and says why; it never falls back to another database", () => {
    const f = fake({ grype: (a) => (a[1] === "update" ? done("", 1, "\u001b[31mERROR unable to download db: 503\u001b[0m") : done(real("grype-0.119.0-db-status.json"))) });
    expect(vulnDbUpdate(f.deps)).toBe(1);
    expect(f.lines.join("\n")).toContain("grype db update failed: ERROR unable to download db: 503");
    expect(f.ran).toHaveLength(1);
  });

  it("an update that leaves an unusable database exits 1 even without HARNESS_REQUIRE_STATIC", () => {
    const f = fake({ grype: (a) => (a[1] === "update" ? done("updated") : done(real("grype-0.119.0-db-status-missing.json"), 1)) });
    expect(vulnDbUpdate(f.deps)).toBe(1);
  });
});

describe("harness vuln-db status", () => {
  it("usable: exit 0, the directory, build time, age, checksum, limit", () => {
    const f = fake({ dirs: [OWN] });
    expect(vulnDbStatus(f.deps, { json: false })).toBe(0);
    const text = f.lines.join("\n");
    expect(text).toContain(`directory  ${OWN}`);
    expect(text).toContain("built 2026-09-21T06:39:24Z (3 h ago)");
    expect(text).toContain("limit 5 days");
    // it asks the way a scan asks: updates off, that directory
    expect(f.ran[0]!.env).toMatchObject({ GRYPE_DB_CACHE_DIR: OWN, GRYPE_DB_AUTO_UPDATE: "false" });
  });

  it("no database: informational (exit 0) until HARNESS_REQUIRE_STATIC is set, then exit 1; both say how to fetch it", () => {
    const missing = () => done(real("grype-0.119.0-db-status-missing.json"), 1, "ERROR database does not exist");
    const loose = fake({ grype: missing });
    expect(vulnDbStatus(loose.deps, { json: false })).toBe(0);
    expect(loose.lines.join("\n")).toContain("NOT USABLE");
    expect(loose.lines.join("\n")).toContain("harness vuln-db update");
    expect(loose.lines.join("\n")).toContain("informational");
    const strict = fake({ grype: missing, env: { HARNESS_HOME: "/h", HARNESS_REQUIRE_STATIC: "1" } });
    expect(vulnDbStatus(strict.deps, { json: false })).toBe(1);
    expect(strict.lines.join("\n")).not.toContain("informational");
  });

  it("too old: the same rule, with the limit named", () => {
    const f = fake({ now: new Date("2026-09-30T00:00:00Z"), env: { HARNESS_HOME: "/h", HARNESS_REQUIRE_STATIC: "true" } });
    expect(vulnDbStatus(f.deps, { json: false })).toBe(1);
    expect(f.lines.join("\n")).toContain("older than 5 days");
  });

  it("--json prints the facts a program can read", () => {
    const f = fake({ dirs: [OWN] });
    expect(vulnDbStatus(f.deps, { json: true })).toBe(0);
    expect(JSON.parse(f.lines.join("\n"))).toMatchObject({ usable: true, dir: OWN, limitDays: 5, schemaVersion: "v6.1.9", built: "2026-09-21T06:39:24Z", checksum: `sha256:${"3fac8f6fb69bb80a7956703caa7fed5d66ee0c936ca0a2c8fa127e4fe7835c7a"}` });
  });

  it("no grype at all", () => {
    const f = fake({ grype: notInstalled });
    expect(vulnDbStatus(f.deps, { json: false })).toBe(0);
    expect(f.lines.join("\n")).toContain("grype is not installed");
  });
});
