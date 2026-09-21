/**
 * `harness doctor` on fake machines: no Docker, no network, no real ports. Each
 * case builds the machine a maintainer might really have (a Windows laptop with
 * no cosign, WSL's bash first on PATH, an old cosign, the owner's own compose
 * stack on the harness's subnet) and asserts on what the doctor says and which
 * fix it prints for that platform.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_SCOPES, cidrOverlap, composePorts, composeStubImages, composeSubnet, fixFor, parseCosignVersion, renderDoctor, runDoctor, type Check, type DoctorDeps, type Scope } from "../src/local/doctor.ts";
import type { ExecResult } from "../src/images.ts";
import { DEFAULT_PORTS } from "../src/local/ports.ts";
import { LEGACY_PROJECT, derivedName } from "../src/project.ts";

const ROOT = resolve(import.meta.dirname, "..");
const COMPOSE = readFileSync(resolve(ROOT, "compose.harness.yaml"), "utf8");
/** The compose project and kind cluster this fake machine's checkout gets (a linux path, so no lowercasing). */
const OWN = derivedName(ROOT, "linux");

const done = (stdout = "", status = 0, stderr = ""): ExecResult => ({ status, stdout, stderr });
const notInstalled = (): ExecResult => ({ status: null, stdout: "", stderr: "", error: Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" }) as NodeJS.ErrnoException });

type Handler = (args: string[], opts?: { env?: NodeJS.ProcessEnv }) => ExecResult | undefined;

interface Machine {
  platform?: NodeJS.Platform;
  env?: NodeJS.ProcessEnv;
  node?: string;
  /** command name -> handler; the first that answers wins, "docker" handlers see the args */
  tools?: Record<string, Handler>;
  files?: Record<string, string>;
  free?: number;
  busyPorts?: number[];
  reservedPorts?: number[];
  chromium?: string | undefined;
  pnpm?: string | undefined;
  homeWritable?: boolean;
  now?: Date;
}

const NOW = new Date("2026-09-16T09:05:00.000Z");

const GRYPE_DB_URL = `https://grype.anchore.io/databases/v6/vulnerability-db_v6.1.9_2026-09-15T00:35:57Z_1789972764.tar.zst?checksum=sha256%3A${"3f".repeat(32)}`;

/** grype as `grype version` and `grype db status -o json` print it (tests/fixtures/real-tools); the database was built `hoursOld` before NOW. */
function grypeWith(o: { version?: string; hoursOld?: number; db?: "missing" | "invalid"; seen?: { env?: NodeJS.ProcessEnv }[] } = {}): Handler {
  return (args, opts) => {
    if (args[0] !== "db") return done(`Application:         grype\nVersion:             ${o.version ?? "0.119.0"}\nBuildDate:           2026-09-17T16:17:07Z`);
    o.seen?.push(opts?.env ? { env: opts.env } : {});
    if (o.db === "missing") return done(JSON.stringify({ schemaVersion: "", path: "/db/6/vulnerability.db", valid: false, error: "database does not exist" }), 1, "ERROR database does not exist");
    const built = new Date(NOW.getTime() - (o.hoursOld ?? 30) * 3_600_000).toISOString();
    const status = { schemaVersion: "v6.1.9", from: GRYPE_DB_URL, built, path: "/db/6/vulnerability.db", valid: o.db !== "invalid" };
    return done(JSON.stringify(o.db === "invalid" ? { ...status, error: "checksum mismatch" } : status), o.db === "invalid" ? 1 : 0);
  };
}

/** A healthy machine: everything present, everything free. */
function healthy(): Record<string, Handler> {
  return {
    git: () => done("git version 2.50.0"),
    docker: (args) => {
      const [a, b] = args;
      if (a === "info") return done(JSON.stringify({ OSType: "linux", SystemTime: NOW.toISOString(), ServerVersion: "29.0.0" }));
      if (a === "context") return done("desktop-linux");
      if (a === "compose" && b === "version") return done("2.40.0");
      if (a === "compose" && b === "ls") return done("[]");
      if (a === "image") return done("sha256:abc");
      if (a === "network" && b === "ls") return done("");
      return undefined;
    },
    cosign: () => done("GitVersion:    v3.0.2\nGitCommit: abc"),
    syft: () => done("Version:  1.20.0"),
    grype: grypeWith(),
    kind: (args) => (args[0] === "get" ? done("") : done("kind v0.30.0 go1.24 windows/amd64")),
    kubectl: () => done("Client Version: v1.34.0"),
    bash: () => done("Linux"),
    reg: () => done("LongPathsEnabled    REG_DWORD    0x1")
  };
}

function machine(m: Machine = {}): DoctorDeps {
  const tools = { ...healthy(), ...m.tools };
  const files: Record<string, string> = {
    [`${ROOT}/package.json`]: '{ "packageManager": "pnpm@10.28.1" }',
    [`${ROOT}/compose.harness.yaml`]: COMPOSE,
    [`${ROOT}/scripts/build-images.sh`]: "#!/usr/bin/env bash\n",
    [`${ROOT}/scripts/fetch-migrations.sh`]: "#!/usr/bin/env bash\n",
    ...m.files
  };
  return {
    platform: m.platform ?? "linux",
    env: m.env ?? {},
    exec: (cmd, args, opts) => tools[cmd]?.(args, opts) ?? notInstalled(),
    pnpmVersion: () => ("pnpm" in m ? m.pnpm : "10.28.1"),
    nodeVersion: m.node ?? "v22.12.0",
    root: ROOT,
    home: "/tmp/harness-home",
    now: () => m.now ?? NOW,
    exists: (p) => p.includes("chrome") || p in files,
    readText: (p) => files[p],
    freeBytes: () => m.free ?? 200 * 1024 ** 3,
    writable: () => m.homeWritable ?? true,
    portState: async (port) => (m.reservedPorts?.includes(port) ? "reserved" : m.busyPorts?.includes(port) ? "busy" : "free"),
    chromiumPath: async () => ("chromium" in m ? m.chromium : "/ms-playwright/chromium/chrome")
  };
}

const run = async (m: Machine = {}, scopes: Scope[] = DEFAULT_SCOPES) => runDoctor(scopes, machine(m));
const find = (checks: Check[], id: string) => checks.find((c) => c.id === id);

describe("a healthy machine", () => {
  it("is ready: exit 0, and every check is ok", async () => {
    const r = await run();
    expect(r.ok).toBe(true);
    expect(r.checks.filter((c) => c.status !== "ok").map((c) => `${c.id}: ${c.detail}`)).toEqual(["k6-pinned: grafana/k6:latest moves: two nightlies can run different k6 versions. Pin it with HARNESS_K6_IMAGE=grafana/k6:<version>"]);
  });

  it("does not ask for kind or kubectl unless asked", async () => {
    expect((await run()).checks.map((c) => c.id)).not.toContain("kind");
    expect((await run({}, ["kind"])).checks.map((c) => c.id)).toEqual(expect.arrayContaining(["kind", "kubectl", "kind-cluster"]));
  });
});

describe("missing tools, with the fix for the platform", () => {
  it("no cosign: a failure that says why, with the Windows, macOS and Linux install", async () => {
    const r = await run({ platform: "win32", tools: { cosign: notInstalled } });
    const c = find(r.checks, "cosign")!;
    expect(r.ok).toBe(false);
    expect(c.status).toBe("fail");
    expect(c.detail).toContain("no registry image can be verified");
    expect(fixFor(c.fix!, "win32")).toContain("cosign-windows-amd64.exe");
    expect(fixFor(c.fix!, "darwin")).toBe("brew install cosign");
    expect(fixFor(c.fix!, "linux")).toContain("github.com/sigstore/cosign/releases");
  });

  it("cosign 2 is too old: the monorepo signs with cosign 3", async () => {
    const c = find((await run({ tools: { cosign: () => done("GitVersion:    v2.4.1") } })).checks, "cosign")!;
    expect(c.status).toBe("fail");
    expect(c.detail).toContain("cosign 2.4.1");
  });

  it("no syft is a failure only where the mutants need it, a warning elsewhere", async () => {
    const withMutants = await run({ tools: { syft: notInstalled } }, ["mutants"]);
    expect(find(withMutants.checks, "syft")!.status).toBe("fail");
    const gateOnly = await run({ tools: { syft: notInstalled } }, ["gate"]);
    expect(find(gateOnly.checks, "syft")!.status).toBe("warn");
    expect(gateOnly.ok).toBe(true);
    expect(find(await run({ tools: { syft: notInstalled } }, ["watch"]).then((r) => r.checks), "syft")).toBeUndefined();
  });

  it("no grype is informational, unless HARNESS_REQUIRE_STATIC makes the vulnerability artefact mandatory", async () => {
    expect(find((await run({ tools: { grype: notInstalled } })).checks, "grype")!.status).toBe("warn");
    const strict = await run({ tools: { grype: notInstalled }, env: { HARNESS_REQUIRE_STATIC: "1" } });
    expect(find(strict.checks, "grype")!.status).toBe("fail");
  });

  it("grype without a database, updates being off during a run, warns", async () => {
    const r = await run({ tools: { grype: (a) => (a[0] === "db" ? done("", 1, "no vulnerability database found") : done("Version: 0.119.0")) } });
    expect(find(r.checks, "grype-db")!.status).toBe("warn");
    expect(find(r.checks, "grype-db")!.detail).toContain("no vulnerability database");
  });

  it("no Playwright browser fails every scope that runs journeys, watch included", async () => {
    const r = await run({ chromium: undefined }, ["watch"]);
    expect(find(r.checks, "chromium")!.status).toBe("fail");
    expect(fixFor(find(r.checks, "chromium")!.fix!, "linux")).toContain("playwright install --with-deps chromium");
  });

  it("the watch scope needs no Docker at all", async () => {
    const r = await run({ tools: { docker: notInstalled, cosign: notInstalled } }, ["watch"]);
    expect(r.ok).toBe(true);
    expect(r.checks.map((c) => c.id)).not.toContain("docker");
  });

  it("old Node and a different pnpm major are reported", async () => {
    expect(find((await run({ node: "v20.11.0" })).checks, "node")!.status).toBe("fail");
    expect(find((await run({ pnpm: "9.15.0" })).checks, "pnpm")!.status).toBe("warn");
    expect(find((await run({ pnpm: undefined })).checks, "pnpm")!.status).toBe("warn");
  });
});

describe("grype and the pinned vulnerability database", () => {
  const scoped = (m: Machine = {}, scopes: Scope[] = ["nightly"]) => run(m, scopes);

  it("a recent database is ok, and the doctor says its schema, build time, age and checksum, and which grype CI pins", async () => {
    const r = await scoped({ tools: { grype: grypeWith({ hoursOld: 30 }) } });
    expect(find(r.checks, "grype")).toMatchObject({ status: "ok", title: "grype >= 0.96.0" });
    expect(find(r.checks, "grype")!.detail).toContain("the version CI pins");
    const db = find(r.checks, "grype-db")!;
    expect(db.status).toBe("ok");
    expect(db.detail).toContain("schema v6.1.9");
    expect(db.detail).toContain("built 2026-09-15T03:05:00.000Z (1.3 days ago)");
    expect(db.detail).toContain(`sha256:${"3f".repeat(32)}`);
    expect(db.detail).toContain("limit 5 days");
  });

  it("a database older than the limit warns; under HARNESS_REQUIRE_STATIC it fails, because every scan would be 'not collected'", async () => {
    const stale = { tools: { grype: grypeWith({ hoursOld: 6 * 24 }) } };
    const warn = await scoped(stale);
    expect(find(warn.checks, "grype-db")!.status).toBe("warn");
    expect(find(warn.checks, "grype-db")!.detail).toContain("older than 5 days");
    expect(warn.ok).toBe(true);
    const strict = await scoped({ ...stale, env: { HARNESS_REQUIRE_STATIC: "1" } });
    expect(find(strict.checks, "grype-db")!.status).toBe("fail");
    expect(strict.ok).toBe(false);
  });

  it("HARNESS_VULN_DB_MAX_AGE_DAYS moves the limit, and is passed to grype so the scan and the doctor agree", async () => {
    const seen: { env?: NodeJS.ProcessEnv }[] = [];
    const tools = { grype: grypeWith({ hoursOld: 6 * 24, seen }) };
    expect(find((await scoped({ tools, env: { HARNESS_VULN_DB_MAX_AGE_DAYS: "7" } })).checks, "grype-db")!.status).toBe("ok");
    expect(seen[0]!.env).toMatchObject({ GRYPE_DB_MAX_ALLOWED_BUILT_AGE: "168h" });
    expect(find((await scoped({ tools: { grype: grypeWith({ hoursOld: 30 }) }, env: { HARNESS_VULN_DB_MAX_AGE_DAYS: "1" } })).checks, "grype-db")!.status).toBe("warn");
    const bogus = await scoped({ tools: { grype: grypeWith({ hoursOld: 30 }) }, env: { HARNESS_VULN_DB_MAX_AGE_DAYS: "soon" } });
    expect(find(bogus.checks, "grype-db-max-age")).toMatchObject({ status: "warn", detail: "soon is not a positive number of days: using 5" });
    expect(find(bogus.checks, "grype-db")!.status).toBe("ok");
  });

  it("looks at the harness's own directory: HARNESS_VULN_DB_DIR, else HARNESS_HOME/vuln-db when it exists, with updates off", async () => {
    const seen: { env?: NodeJS.ProcessEnv }[] = [];
    const tools = { grype: grypeWith({ seen }) };
    const own = join("/tmp/harness-home", "vuln-db");
    await scoped({ tools, files: { [own]: "" } });
    expect(seen[0]!.env).toMatchObject({ GRYPE_DB_CACHE_DIR: own, GRYPE_DB_AUTO_UPDATE: "false", GRYPE_CHECK_FOR_APP_UPDATE: "false" });
    // grype's own age check is off for this call, so `valid` means intact and the doctor judges the age itself
    expect(seen[0]!.env).toMatchObject({ GRYPE_DB_VALIDATE_AGE: "false" });
    const named = await scoped({ tools, env: { HARNESS_VULN_DB_DIR: "/data/vuln-db" }, files: { "/data/vuln-db": "" } });
    expect(seen[1]!.env).toMatchObject({ GRYPE_DB_CACHE_DIR: "/data/vuln-db" });
    expect(find(named.checks, "grype-db")!.detail).toContain("in /data/vuln-db");
    // neither: grype's own cache, said so
    const neither = await scoped({ tools });
    expect(seen[2]!.env).not.toHaveProperty("GRYPE_DB_CACHE_DIR");
    expect(find(neither.checks, "grype-db")!.detail).toContain("grype's own cache");
  });

  it("a HARNESS_VULN_DB_DIR that does not exist, a missing database and an invalid one each warn with the update command", async () => {
    const gone = find((await scoped({ env: { HARNESS_VULN_DB_DIR: "/nope" } })).checks, "grype-db")!;
    expect(gone.status).toBe("warn");
    expect(gone.detail).toContain("HARNESS_VULN_DB_DIR=/nope does not exist");
    for (const db of ["missing", "invalid"] as const) {
      const c = find((await scoped({ tools: { grype: grypeWith({ db }) } })).checks, "grype-db")!;
      expect(c.status, db).toBe("warn");
      expect(fixFor(c.fix!, "linux"), db).toContain("harness vuln-db update");
    }
    expect(find((await scoped({ tools: { grype: grypeWith({ db: "missing" }) } })).checks, "grype-db")!.detail).toContain("database does not exist");
  });

  it("too old a grype (its database format is not the harness's) warns, and fails under HARNESS_REQUIRE_STATIC", async () => {
    const old = { tools: { grype: grypeWith({ version: "0.80.2" }) } };
    const c = find((await scoped(old)).checks, "grype")!;
    expect(c.status).toBe("warn");
    expect(c.detail).toContain("older than 0.96.0");
    expect(find((await scoped({ ...old, env: { HARNESS_REQUIRE_STATIC: "yes" } })).checks, "grype")!.status).toBe("fail");
    expect(find((await scoped({ tools: { grype: grypeWith({ version: "0.96.0" }) } })).checks, "grype")!.status).toBe("ok");
    expect(find((await scoped({ tools: { grype: grypeWith({ version: "0.100.1" }) } })).checks, "grype")!.status).toBe("ok");
  });

  it("no grype prints the install for each platform, with the version CI pins", async () => {
    const r = await scoped({ tools: { grype: notInstalled } });
    const c = find(r.checks, "grype")!;
    expect(c.status).toBe("warn");
    expect(fixFor(c.fix!, "win32")).toContain("grype_0.119.0_windows_amd64.zip");
    expect(fixFor(c.fix!, "win32")).toContain("no admin");
    expect(fixFor(c.fix!, "darwin")).toContain("brew install grype");
    expect(fixFor(c.fix!, "linux")).toContain("install.sh | sh -s -- -b ~/.local/bin v0.119.0");
    // no database check without a scanner
    expect(find(r.checks, "grype-db")).toBeUndefined();
  });

  it("the watch scope needs neither grype nor its database", async () => {
    const r = await scoped({ tools: { grype: notInstalled } }, ["watch"]);
    expect(r.checks.map((c) => c.id)).not.toContain("grype");
  });

  it("the report prints the fix for the platform under the problem, and a database problem alone does not change the exit code", async () => {
    const r = await scoped({ platform: "win32", tools: { grype: grypeWith({ db: "missing" }) } });
    expect(r.ok).toBe(true);
    expect(renderDoctor(r, "win32")).toContain("fix: harness vuln-db update");
  });
});

describe("Docker", () => {
  it("not installed, and installed but stopped, are told apart", async () => {
    const none = find((await run({ tools: { docker: notInstalled } })).checks, "docker")!;
    expect(none.detail).toContain("not installed");
    const stopped = find((await run({ tools: { docker: (a) => (a[0] === "info" ? done("", 1, "error during connect: the system cannot find the file specified") : undefined) } })).checks, "docker")!;
    expect(stopped.status).toBe("fail");
    expect(stopped.detail).toContain("daemon does not answer");
    expect(stopped.detail).toContain("start Docker Desktop");
  });

  it("Windows containers mode is a failure with the switch command", async () => {
    const r = await run({ platform: "win32", tools: { docker: (a) => (a[0] === "info" ? done(JSON.stringify({ OSType: "windows", SystemTime: NOW.toISOString() })) : healthy().docker!(a)) } });
    const c = find(r.checks, "docker-linux")!;
    expect(c.status).toBe("fail");
    expect(fixFor(c.fix!, "win32")).toContain("Switch to Linux containers");
  });

  it("a Docker VM clock two minutes off warns (Docker Desktop drifts after sleep)", async () => {
    const skewed = new Date(NOW.getTime() - 130_000).toISOString();
    const r = await run({ tools: { docker: (a) => (a[0] === "info" ? done(JSON.stringify({ OSType: "linux", SystemTime: skewed })) : healthy().docker!(a)) } });
    const c = find(r.checks, "docker-clock")!;
    expect(c.status).toBe("warn");
    expect(c.detail).toContain("behind by 130 s");
  });

  it("helper images that are not local are named, for an offline run", async () => {
    const r = await run({ tools: { docker: (a) => (a[0] === "image" && a.at(-1) === "grafana/k6:latest" ? done("", 1, "No such image") : healthy().docker!(a)) } });
    const c = find(r.checks, "images-offline")!;
    expect(c.status).toBe("warn");
    expect(c.detail).toContain("grafana/k6:latest (the k6 load run (--load))");
    expect(fixFor(c.fix!, "linux")).toBe("docker pull grafana/k6:latest");
  });
});

describe("collisions with a developer's own stack", () => {
  it("names the busy ports, the variable that moves each, and --port-offset", async () => {
    const r = await run({ busyPorts: [3100, 8080], reservedPorts: [8443] });
    const c = find(r.checks, "ports")!;
    expect(r.ok).toBe(false);
    expect(c.detail).toContain("3100 (READER_PORT_A) is in use");
    expect(c.detail).toContain("8080 (COURSE_PORT) is in use");
    expect(c.detail).toContain("8443 (IDENTITY_PORT) is reserved by the OS");
    expect(fixFor(c.fix!, "win32")).toContain("--port-offset");
    expect(fixFor(c.fix!, "win32")).toContain("excludedportrange");
  });

  it("checks the ports the environment moves them to", async () => {
    const r = await run({ busyPorts: [3100], env: { READER_PORT_A: "4100" } });
    expect(find(r.checks, "ports")!.status).toBe("ok");
  });

  it("another network on the harness's fixed subnet is a failure that names it", async () => {
    const networks = "abc\ndef";
    const r = await run({
      tools: {
        docker: (a) => {
          if (a[0] === "network" && a[1] === "ls") return done(networks);
          if (a[0] === "network" && a[1] === "inspect") return done("bridge||172.17.0.0/16,\ntutors_default|tutors|172.29.0.0/16,\n");
          return healthy().docker!(a);
        }
      }
    });
    const c = find(r.checks, "subnet")!;
    expect(c.status).toBe("fail");
    expect(c.detail).toContain("tutors_default (172.29.0.0/16)");
    expect(c.detail).toContain("Pool overlaps");
  });

  it("the harness's own network does not clash with itself", async () => {
    const r = await run({
      tools: {
        docker: (a) => {
          if (a[0] === "network" && a[1] === "ls") return done("abc");
          if (a[0] === "network" && a[1] === "inspect") return done(`${OWN}_default|${OWN}|172.29.0.0/24,\n`);
          return healthy().docker!(a);
        }
      }
    });
    expect(find(r.checks, "subnet")!.status).toBe("ok");
  });

  it("other compose projects are named as untouched, a leftover project of this checkout is a warning", async () => {
    const list = JSON.stringify([
      { Name: "tutors", Status: "running(9)" },
      { Name: OWN, Status: "exited(12)" }
    ]);
    const r = await run({ tools: { docker: (a) => (a[0] === "compose" && a[1] === "ls" ? done(list) : healthy().docker!(a)) } });
    const c = find(r.checks, "compose-project")!;
    expect(c.status).toBe("warn");
    expect(c.detail).toContain("Other projects (tutors) are never touched");
    const own = await run({ env: { HARNESS_COMPOSE_PROJECT: "harness-local" }, tools: { docker: (a) => (a[0] === "compose" && a[1] === "ls" ? done(list) : healthy().docker!(a)) } });
    expect(find(own.checks, "compose-project")!.status).toBe("ok");
  });
});

describe("Windows traps", () => {
  it("`bash` that is WSL's, not Git Bash, is named, with HARNESS_BASH as the way out", async () => {
    const r = await run({ platform: "win32", tools: { bash: () => done("Linux") } }, ["gate"]);
    const c = find(r.checks, "bash")!;
    expect(c.status).toBe("fail");
    expect(c.detail).toContain("WSL");
    expect(fixFor(c.fix!, "win32")).toContain("HARNESS_BASH");
  });

  it("a WSL launcher with no distribution installed is a failure, not a pass", async () => {
    const r = await run({ platform: "win32", tools: { bash: () => done("", 1, "Windows Subsystem for Linux has no installed distributions.") } }, ["gate"]);
    expect(find(r.checks, "bash")!.detail).toContain("no installed distributions");
  });

  it("Git Bash is fine", async () => {
    const r = await run({ platform: "win32", tools: { bash: () => done("MINGW64_NT-10.0-26200") } }, ["gate"]);
    expect(find(r.checks, "bash")!.status).toBe("ok");
  });

  it("CRLF in a script is caught before bash says `\\r: command not found`", async () => {
    const r = await run({ files: { [`${ROOT}/scripts/build-images.sh`]: "#!/usr/bin/env bash\r\nset -e\r\n" } }, ["gate"]);
    const c = find(r.checks, "line-endings")!;
    expect(c.status).toBe("fail");
    expect(c.detail).toContain("build-images.sh");
  });

  it("a deep checkout with long paths off warns; with them on it does not", async () => {
    const deep = "D:\\" + "x".repeat(100);
    const off = machine({ platform: "win32", tools: { reg: () => done("LongPathsEnabled    REG_DWORD    0x0") } });
    off.root = deep;
    expect(find((await runDoctor(["gate"], off)).checks, "long-paths")!.status).toBe("warn");
    const on = machine({ platform: "win32" });
    on.root = deep;
    expect(find((await runDoctor(["gate"], on)).checks, "long-paths")!.status).toBe("ok");
  });

  it("never runs the Windows-only checks elsewhere", async () => {
    expect((await run({ platform: "linux" })).checks.map((c) => c.id)).not.toContain("long-paths");
  });
});

describe("state, disk and the clock", () => {
  it("low disk warns, very low fails, unwritable HARNESS_HOME fails", async () => {
    expect(find((await run({ free: 10 * 1024 ** 3 })).checks, "disk")!.status).toBe("warn");
    expect(find((await run({ free: 2 * 1024 ** 3 })).checks, "disk")!.status).toBe("fail");
    expect(find((await run({ homeWritable: false })).checks, "home")!.status).toBe("fail");
  });

  it("an invalid frozen clock is a failure; the host time zone is reported and does not matter", async () => {
    expect(find((await run({ env: { HARNESS_NOW: "yesterday" } })).checks, "clock")!.status).toBe("fail");
    const ok = find((await run({ env: { TZ: "Asia/Tokyo" } })).checks, "clock")!;
    expect(ok.status).toBe("ok");
    expect(ok.detail).toContain("Asia/Tokyo");
  });
});

describe("the report", () => {
  it("shows the fix for the platform under each problem, and the counts", async () => {
    const r = await run({ tools: { cosign: notInstalled } });
    const text = renderDoctor(r, "win32");
    expect(text).toContain("FAIL  cosign >= 3");
    expect(text).toContain("scoop install cosign");
    expect(text).not.toContain("brew install cosign");
    expect(text).toMatch(/1 problem\(s\) to fix/);
    expect(renderDoctor(await run(), "linux")).toMatch(/ready, with 1 warning/);
  });
});

describe("the parsers", () => {
  it("reads cosign's version output", () => {
    expect(parseCosignVersion("GitVersion:    v3.0.2\nGitCommit:     x")).toEqual({ major: 3, minor: 0, patch: 2 });
    expect(parseCosignVersion("2.4.1")).toEqual({ major: 2, minor: 4, patch: 1 });
    expect(parseCosignVersion("nothing")).toBeUndefined();
  });

  it("finds overlapping IPv4 ranges and ignores anything else", () => {
    expect(cidrOverlap("172.29.0.0/24", "172.29.0.0/16")).toBe(true);
    expect(cidrOverlap("172.29.0.0/24", "172.29.1.0/24")).toBe(false);
    expect(cidrOverlap("172.29.0.0/24", "10.0.0.0/8")).toBe(false);
    expect(cidrOverlap("172.29.0.0/24", "fd00::/64")).toBe(false);
    expect(cidrOverlap("0.0.0.0/0", "172.29.0.0/24")).toBe(true);
  });

  it("reads the ports, the subnet and the stub images out of compose.harness.yaml itself", () => {
    expect(composeSubnet(COMPOSE)).toBe("172.29.0.0/24");
    const ports = composePorts(COMPOSE, {});
    expect(Object.fromEntries(ports.map((p) => [p.variable, p.port]))).toEqual(DEFAULT_PORTS);
    expect(composePorts(COMPOSE, {}, 1000).find((p) => p.variable === "READER_PORT_A")!.port).toBe(4100);
    expect(composePorts(COMPOSE, { READER_PORT_A: "5000" }, 1000).find((p) => p.variable === "READER_PORT_A")!.port).toBe(5000);
    expect(composeStubImages(COMPOSE)).toContain("node:22-bookworm-slim");
  });
});

describe("this checkout's own names (contract 1.3.0)", () => {
  /** A docker that records every call, on top of the healthy one, with `compose ls` answering `projects`. */
  function recording(projects: object[]) {
    const calls: string[] = [];
    const docker: Handler = (a) => {
      calls.push(a.join(" "));
      return a[0] === "compose" && a[1] === "ls" ? done(JSON.stringify(projects)) : healthy().docker!(a);
    };
    return { calls, docker };
  }

  it("says which compose project and kind cluster this checkout uses, and where the name came from", async () => {
    const r = await run({}, ["gate", "kind"]);
    expect(find(r.checks, "compose-project")).toMatchObject({ status: "ok", title: `compose project "${OWN}" is the harness's own` });
    expect(find(r.checks, "compose-project")!.detail).toContain(`named from this checkout's path (${ROOT})`);
    expect(find(r.checks, "kind-cluster")).toMatchObject({ status: "ok", title: `kind cluster "${OWN}"` });
    const overridden = await run({ env: { HARNESS_PROJECT: "mine" } }, ["gate", "kind"]);
    expect(find(overridden.checks, "compose-project")!.title).toContain('"mine"');
    expect(find(overridden.checks, "compose-project")!.detail).toContain("named from HARNESS_PROJECT");
    expect(find(overridden.checks, "kind-cluster")!.title).toContain('"mine"');
    // the specific variables beat the general one
    const specific = await run({ env: { HARNESS_PROJECT: "mine", HARNESS_COMPOSE_PROJECT: "compose-only", HARNESS_KIND_CLUSTER: "kind-only" } }, ["gate", "kind"]);
    expect(find(specific.checks, "compose-project")!.title).toContain('"compose-only"');
    expect(find(specific.checks, "kind-cluster")!.title).toContain('"kind-only"');
  });

  it("planted: a stack under the old default name is reported as a legacy stack, not touched, and nothing is run against it", async () => {
    const { calls, docker } = recording([{ Name: LEGACY_PROJECT, Status: "running(12)" }, { Name: "tutors", Status: "running(9)" }]);
    const r = await run({ tools: { docker } });
    const legacy = find(r.checks, "legacy-stack")!;
    expect(legacy.status).toBe("warn");
    expect(legacy.title).toBe(`legacy compose project "${LEGACY_PROJECT}"`);
    expect(legacy.detail).toContain("legacy stack, not touched");
    expect(legacy.detail).toContain(`docker compose -p ${LEGACY_PROJECT} down`);
    // this checkout's own project is fine, and the developer's other one is named but not blamed
    expect(find(r.checks, "compose-project")).toMatchObject({ status: "ok" });
    expect(find(r.checks, "compose-project")!.detail).toContain("Other projects on this Docker, never touched: tutors");
    expect(find(r.checks, "compose-project")!.detail).not.toContain(LEGACY_PROJECT);
    // read-only: no down, no rm, no stop, no kill, nothing that changes a container
    expect(calls.filter((c) => /\b(down|rm|stop|kill|prune|remove|delete)\b/.test(c))).toEqual([]);
  });

  it("must not flag: no legacy stack, or a machine whose project IS called tutors-harness by choice, says nothing about a legacy one", async () => {
    expect(find((await run()).checks, "legacy-stack")).toBeUndefined();
    const { docker } = recording([{ Name: LEGACY_PROJECT, Status: "running(12)" }]);
    const chosen = await run({ env: { HARNESS_COMPOSE_PROJECT: LEGACY_PROJECT }, tools: { docker } });
    expect(find(chosen.checks, "legacy-stack")).toBeUndefined();
    expect(find(chosen.checks, "compose-project")!.status).toBe("warn"); // it is this run's own leftover, as any project of that name would be
  });

  it("planted: a kind cluster called tutors-harness is the owner's: reported as not touched, never as this checkout's", async () => {
    const kind: Handler = (a) => (a[0] === "get" ? done(`${LEGACY_PROJECT}\nsomething-else\n`) : done("kind v0.30.0"));
    const r = await run({ tools: { kind } }, ["kind"]);
    expect(find(r.checks, "kind-cluster")).toMatchObject({ status: "ok", title: `kind cluster "${OWN}"` });
    const legacy = find(r.checks, "kind-legacy")!;
    expect(legacy.detail).toContain("legacy cluster, not touched");
    expect(legacy.detail).toContain("no harness command adopts, loads into or deletes it");
    expect(r.ok).toBe(true);
  });

  it("planted: HARNESS_KIND_CLUSTER=tutors-harness would adopt the owner's cluster, so it is a failure that says the harness refuses it", async () => {
    const r = await run({ env: { HARNESS_KIND_CLUSTER: LEGACY_PROJECT } }, ["kind"]);
    const c = find(r.checks, "kind-cluster")!;
    expect(c.status).toBe("fail");
    expect(c.detail).toContain("is not adopted or deleted by any harness command");
    expect(r.ok).toBe(false);
  });

  it("the derived name of a cluster that already exists is a warning that it would be reused, as before", async () => {
    const kind: Handler = (a) => (a[0] === "get" ? done(`${OWN}\n`) : done("kind v0.30.0"));
    const c = find((await run({ tools: { kind } }, ["kind"])).checks, "kind-cluster")!;
    expect(c.status).toBe("warn");
    expect(c.detail).toContain("already exists and would be reused");
  });
});
