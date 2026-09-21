/**
 * `harness doctor` on fake machines: no Docker, no network, no real ports. Each
 * case builds the machine a maintainer might really have (a Windows laptop with
 * no cosign, WSL's bash first on PATH, an old cosign, the owner's own compose
 * stack on the harness's subnet) and asserts on what the doctor says and which
 * fix it prints for that platform.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_SCOPES, cidrOverlap, composePorts, composeStubImages, composeSubnet, fixFor, parseCosignVersion, renderDoctor, runDoctor, type Check, type DoctorDeps, type Scope } from "../src/local/doctor.ts";
import type { ExecResult } from "../src/images.ts";
import { DEFAULT_PORTS } from "../src/local/ports.ts";

const ROOT = resolve(import.meta.dirname, "..");
const COMPOSE = readFileSync(resolve(ROOT, "compose.harness.yaml"), "utf8");

const done = (stdout = "", status = 0, stderr = ""): ExecResult => ({ status, stdout, stderr });
const notInstalled = (): ExecResult => ({ status: null, stdout: "", stderr: "", error: Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" }) as NodeJS.ErrnoException });

type Handler = (args: string[]) => ExecResult | undefined;

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
    grype: (args) => (args[0] === "db" ? done("Status: valid") : done("Version:  0.90.0")),
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
    exec: (cmd, args) => tools[cmd]?.(args) ?? notInstalled(),
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
    const r = await run({ tools: { grype: (a) => (a[0] === "db" ? done("", 1, "no vulnerability database found") : done("Version: 0.90.0")) } });
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
          if (a[0] === "network" && a[1] === "inspect") return done("tutors-harness_default|tutors-harness|172.29.0.0/24,\n");
          return healthy().docker!(a);
        }
      }
    });
    expect(find(r.checks, "subnet")!.status).toBe("ok");
  });

  it("other compose projects are named as untouched, a leftover harness project is a warning", async () => {
    const list = JSON.stringify([
      { Name: "tutors", Status: "running(9)" },
      { Name: "tutors-harness", Status: "exited(12)" }
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
