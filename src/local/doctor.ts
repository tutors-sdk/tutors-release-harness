import { parse } from "yaml";
import type { Exec } from "../images.ts";
import { LEGACY_PROJECT, composeProject, kindCluster } from "../project.ts";
import { GRYPE_DB_FIX, GRYPE_INSTALL, MIN_GRYPE_VERSION, PINNED_GRYPE_VERSION, compareVersions, judgeDb, maxAgeDays, parseGrypeVersion, readDbStatus, vulnDbDirFromEnv } from "./vuln-db.ts";

/**
 * `harness doctor`: what this machine lacks to run the harness, and how to get it.
 *
 * Every probe goes through `DoctorDeps`, so the checks are unit tested with a
 * fake machine (no Docker, no network, no real ports). The real deps are in
 * `doctor-real.ts`. Read-only: nothing here starts a container, pulls an image
 * or touches a stack.
 *
 * The scopes say what the machine is wanted for; a tool that a scope needs and
 * that is missing is a `fail`, a tool it merely benefits from a `warn`:
 *
 *   nightly  the A/A on the production tag, pulled and verified from the registry
 *   gate     the release gate for a candidate: A/B, migration and upgrade rehearsals
 *   mutants  the harness's own signal
 *   watch    post-deploy comparison against production (no Docker)
 *   kind     the kind substrate (`--substrate kind`), only when asked for
 */
export const SCOPES = ["nightly", "gate", "mutants", "watch", "kind"] as const;
export type Scope = (typeof SCOPES)[number];
export const DEFAULT_SCOPES: Scope[] = ["nightly", "gate", "mutants", "watch"];

export type CheckStatus = "ok" | "warn" | "fail";
export type Platform = "windows" | "macos" | "linux";

export interface Fix {
  windows: string;
  macos: string;
  linux: string;
}

export interface Check {
  id: string;
  title: string;
  status: CheckStatus;
  detail: string;
  fix?: Fix;
}

export interface DoctorDeps {
  platform: NodeJS.Platform;
  env: NodeJS.ProcessEnv;
  exec: Exec;
  /** `pnpm --version`, or undefined when pnpm cannot be run (on Windows pnpm is a .cmd and needs a shell). */
  pnpmVersion: () => string | undefined;
  nodeVersion: string;
  root: string;
  home: string;
  now: () => Date;
  exists: (path: string) => boolean;
  readText: (path: string) => string | undefined;
  /** Free bytes on the volume holding `path` (its nearest existing ancestor). */
  freeBytes: (path: string) => number | undefined;
  /** Whether a directory can be created and written to. */
  writable: (path: string) => boolean;
  /** "free", "busy" (something listens), "reserved" (the OS forbids binding it, e.g. a Windows excluded port range). */
  portState: (port: number) => Promise<"free" | "busy" | "reserved">;
  chromiumPath: () => Promise<string | undefined>;
}

// ---- what the harness needs, in one place ------------------------------------------------

export const MIN_NODE_MAJOR = 22;
export const MIN_COSIGN_MAJOR = 3;
const GIB = 1024 ** 3;
/** Below this a run's images, SBOMs and captures will not fit. */
export const DISK_FAIL_BYTES = 5 * GIB;
export const DISK_WARN_BYTES = 15 * GIB;
/** A Docker VM clock this far from the host's breaks TLS to the registry and Sigstore. */
export const CLOCK_SKEW_WARN_SECONDS = 60;

const install = (windows: string, macos: string, linux: string): Fix => ({ windows, macos, linux });

const FIX = {
  node: install("winget install OpenJS.NodeJS.LTS (or https://nodejs.org)", "brew install node@22 (or nvm/fnm: `nvm install 22`)", "install Node 22+ from https://nodejs.org or with nvm/fnm: `nvm install 22` (the repo has an .nvmrc)"),
  pnpm: install("corepack enable (Node 22 ships corepack), or npm install -g pnpm", "corepack enable, or brew install pnpm", "corepack enable, or npm install -g pnpm"),
  git: install("winget install Git.Git (Git for Windows also provides the bash the scripts need)", "brew install git", "your package manager: apt install git"),
  docker: install("winget install Docker.DockerDesktop, then start it and wait for the whale to say running", "brew install --cask docker, then open Docker.app", "https://docs.docker.com/engine/install/ then: sudo usermod -aG docker $USER (and log in again)"),
  compose: install("update Docker Desktop (it bundles Compose v2)", "update Docker Desktop (it bundles Compose v2)", "apt install docker-compose-plugin (or https://docs.docker.com/compose/install/linux/)"),
  linuxContainers: install("right-click the Docker whale in the tray and choose Switch to Linux containers, or: & 'C:\\Program Files\\Docker\\Docker\\DockerCli.exe' -SwitchLinuxEngine", "Docker Desktop is Linux-only on macOS: check the daemon is Docker Desktop's", "check `docker context ls`: the default context must be a Linux engine"),
  cosign: install(
    "scoop install cosign, or download cosign-windows-amd64.exe (v3+) from https://github.com/sigstore/cosign/releases, rename it cosign.exe and put it on PATH",
    "brew install cosign",
    "download cosign v3+ from https://github.com/sigstore/cosign/releases (or brew install cosign) and put it on PATH"
  ),
  syft: install("scoop install syft, or the syft_*_windows_amd64.zip from https://github.com/anchore/syft/releases on PATH", "brew install syft", "curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b ~/.local/bin"),
  grype: install(GRYPE_INSTALL.windows, GRYPE_INSTALL.macos, GRYPE_INSTALL.linux),
  grypeDb: install(GRYPE_DB_FIX, GRYPE_DB_FIX, GRYPE_DB_FIX),
  kind: install("winget install Kubernetes.kind", "brew install kind", "https://kind.sigs.k8s.io/docs/user/quick-start/#installation"),
  kubectl: install("winget install Kubernetes.kubectl", "brew install kubectl", "https://kubernetes.io/docs/tasks/tools/"),
  chromium: install("pnpm exec playwright install chromium", "pnpm exec playwright install chromium", "pnpm exec playwright install --with-deps chromium"),
  bash: install(
    "install Git for Windows (winget install Git.Git) and either put C:\\Program Files\\Git\\bin before C:\\Windows\\System32 on PATH, or set HARNESS_BASH=C:\\Program Files\\Git\\bin\\bash.exe",
    "bash ships with macOS",
    "apt install bash"
  ),
  lineEndings: install("git config core.autocrlf false, then re-checkout: git rm --cached -r . && git reset --hard (the repo's .gitattributes asks for LF), or dos2unix scripts/*.sh", "dos2unix scripts/*.sh", "dos2unix scripts/*.sh"),
  longPaths: install(
    "as administrator: New-ItemProperty -Path HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force; and git config --global core.longpaths true; or keep the checkout at a short path such as D:\\h",
    "not needed on macOS",
    "not needed on Linux"
  ),
  pullImage: (image: string) => install(`docker pull ${image}`, `docker pull ${image}`, `docker pull ${image}`),
  disk: install("free space, or point HARNESS_HOME and --out at a bigger drive; docker system prune -f drops unused images (careful: yours too)", "free space, or point HARNESS_HOME and --out at a bigger disk", "free space, or point HARNESS_HOME and --out at a bigger disk"),
  ports: install(
    "stop what holds the port, or move the harness: --port-offset 1000 (or set the *_PORT_* variables); for a reserved port: netsh int ipv4 show excludedportrange protocol=tcp",
    "stop what holds the port (lsof -iTCP:<port> -sTCP:LISTEN), or move the harness with --port-offset 1000",
    "stop what holds the port (ss -ltnp | grep :<port>), or move the harness with --port-offset 1000"
  ),
  clock: install("Docker Desktop's VM clock drifts after sleep: restart Docker Desktop, or wsl --shutdown then start it again", "restart Docker Desktop", "check timedatectl and the Docker daemon host's NTP"),
  home: install("set HARNESS_HOME to a writable directory", "set HARNESS_HOME to a writable directory", "set HARNESS_HOME to a writable directory")
};

const platformOf = (p: NodeJS.Platform): Platform => (p === "win32" ? "windows" : p === "darwin" ? "macos" : "linux");
export const fixFor = (fix: Fix, platform: NodeJS.Platform): string => fix[platformOf(platform)];

// ---- small parsers, exported for the tests --------------------------------------------------

/** `GitVersion: v3.0.2` out of `cosign version`, or a bare `3.0.2`. */
export function parseCosignVersion(text: string): { major: number; minor: number; patch: number } | undefined {
  const m = /GitVersion:\s*v?(\d+)\.(\d+)\.(\d+)/.exec(text) ?? /^v?(\d+)\.(\d+)\.(\d+)/m.exec(text);
  return m ? { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) } : undefined;
}

function ipv4(cidr: string): { base: number; bits: number } | undefined {
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/.exec(cidr.trim());
  if (!m) return undefined;
  const octets = [m[1], m[2], m[3], m[4]].map(Number);
  if (octets.some((o) => o > 255) || Number(m[5]) > 32) return undefined;
  return { base: ((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0, bits: Number(m[5]) };
}

/** Whether two IPv4 CIDR ranges share an address. Anything that is not IPv4 CIDR never overlaps. */
export function cidrOverlap(a: string, b: string): boolean {
  const x = ipv4(a);
  const y = ipv4(b);
  if (!x || !y) return false;
  const bits = Math.min(x.bits, y.bits);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return ((x.base & mask) >>> 0) === ((y.base & mask) >>> 0);
}

export interface ComposePort {
  variable: string;
  port: number;
}

/** The host ports compose.harness.yaml publishes, as `${VAR:-default}:container` mappings, with the environment applied. */
export function composePorts(composeText: string, env: NodeJS.ProcessEnv, offset = 0): ComposePort[] {
  const out: ComposePort[] = [];
  for (const m of composeText.matchAll(/"\$\{([A-Z0-9_]+):-(\d+)\}:\d+"/g)) {
    const variable = m[1]!;
    const port = env[variable] ? Number(env[variable]) : Number(m[2]) + offset;
    if (!out.some((p) => p.variable === variable)) out.push({ variable, port });
  }
  return out;
}

/** The compose file's fixed network subnet. */
export function composeSubnet(composeText: string): string | undefined {
  try {
    const doc = parse(composeText, { merge: true }) as { networks?: { default?: { ipam?: { config?: { subnet?: string }[] } } } };
    return doc.networks?.default?.ipam?.config?.[0]?.subnet;
  } catch {
    return undefined;
  }
}

/** Images the compose file names literally (the stubs), for the "present offline" check. */
export function composeStubImages(composeText: string): string[] {
  return [...new Set([...composeText.matchAll(/^\s+image:\s*([^\s$#]+)\s*$/gm)].map((m) => m[1]!))];
}

const tail = (s: string) => s.trim().split(/\r?\n/).filter(Boolean).slice(-1)[0] ?? "";
const missing = (r: ReturnType<Exec>) => r.error?.code === "ENOENT";

// ---- the checks -------------------------------------------------------------------------------

type Selected = ReadonlySet<Scope>;
/** fail when a selected scope needs it, warn when a selected scope only wants it, otherwise the check is not run. */
function severity(selected: Selected, needs: Scope[], wants: Scope[] = []): "fail" | "warn" | undefined {
  if (needs.some((s) => selected.has(s))) return "fail";
  if (wants.some((s) => selected.has(s))) return "warn";
  return undefined;
}

const DOCKER_SCOPES: Scope[] = ["nightly", "gate", "mutants"];
const ok = (id: string, title: string, detail: string): Check => ({ id, title, status: "ok", detail });
const bad = (level: "fail" | "warn", id: string, title: string, detail: string, fix?: Fix): Check => ({ id, title, status: level, detail, ...(fix ? { fix } : {}) });

interface DockerInfo {
  OSType?: string;
  SystemTime?: string;
  ServerVersion?: string;
  Name?: string;
}

export async function runDoctor(scopes: Scope[], deps: DoctorDeps): Promise<{ ok: boolean; scopes: Scope[]; platform: Platform; checks: Check[] }> {
  const selected: Selected = new Set(scopes);
  const checks: Check[] = [];
  const { exec, env } = deps;
  const dockerNeeded = severity(selected, DOCKER_SCOPES);
  const win = deps.platform === "win32";

  // -- node, pnpm, git: always
  const nodeMajor = Number(/^v?(\d+)/.exec(deps.nodeVersion)?.[1]);
  checks.push(nodeMajor >= MIN_NODE_MAJOR ? ok("node", "Node.js", `${deps.nodeVersion} (needs >= ${MIN_NODE_MAJOR})`) : bad("fail", "node", "Node.js", `${deps.nodeVersion}: the harness needs >= ${MIN_NODE_MAJOR}`, FIX.node));

  const wantedPnpm = /"packageManager":\s*"pnpm@(\d+)/.exec(deps.readText(`${deps.root}/package.json`) ?? "")?.[1];
  const pnpm = deps.pnpmVersion();
  if (!pnpm) checks.push(bad("warn", "pnpm", "pnpm", "not found on PATH (only needed to install dependencies and to run `pnpm harness`; `node bin/harness.mjs` works without it)", FIX.pnpm));
  else if (wantedPnpm && pnpm.split(".")[0] !== wantedPnpm) checks.push(bad("warn", "pnpm", "pnpm", `${pnpm}, the repository pins pnpm ${wantedPnpm}.x (packageManager in package.json): a different major rewrites the lockfile`, FIX.pnpm));
  else checks.push(ok("pnpm", "pnpm", pnpm));

  const git = exec("git", ["--version"]);
  checks.push(git.status === 0 ? ok("git", "git", git.stdout.trim()) : bad("fail", "git", "git", "not found: the guards, the version stamp and the monorepo fallback build need it", FIX.git));

  // -- docker: the daemon, its OS, its clock, compose
  let docker: DockerInfo | undefined;
  if (dockerNeeded) {
    const info = exec("docker", ["info", "--format", "{{json .}}"]);
    if (missing(info)) checks.push(bad(dockerNeeded, "docker", "Docker", "the docker CLI is not installed or not on PATH", FIX.docker));
    else if (info.status !== 0) checks.push(bad(dockerNeeded, "docker", "Docker", `the docker CLI is there but the daemon does not answer (${tail(info.stderr) || `exit ${info.status}`}): start Docker Desktop and wait for it to say running`, FIX.docker));
    else {
      try {
        docker = JSON.parse(info.stdout.trim()) as DockerInfo;
      } catch {
        docker = {};
      }
      const context = exec("docker", ["context", "show"]).stdout.trim();
      const via = env.DOCKER_HOST ? `DOCKER_HOST=${env.DOCKER_HOST}` : context ? `context ${context}` : "default context";
      checks.push(ok("docker", "Docker", `engine ${docker.ServerVersion ?? "?"} via ${via}`));
      if (docker.OSType && docker.OSType !== "linux") checks.push(bad("fail", "docker-linux", "Docker runs Linux containers", `the engine reports OSType ${docker.OSType}: the harness's images and stubs are Linux images`, FIX.linuxContainers));
      else checks.push(ok("docker-linux", "Docker runs Linux containers", docker.OSType ?? "linux"));
      const seconds = docker.SystemTime ? Math.round((new Date(docker.SystemTime).getTime() - deps.now().getTime()) / 1000) : undefined;
      if (seconds === undefined || Number.isNaN(seconds)) checks.push(bad("warn", "docker-clock", "Docker's clock agrees with this machine's", "the engine did not report its time", FIX.clock));
      else if (Math.abs(seconds) > CLOCK_SKEW_WARN_SECONDS) checks.push(bad("warn", "docker-clock", "Docker's clock agrees with this machine's", `the engine's clock is ${seconds > 0 ? "ahead by" : "behind by"} ${Math.abs(seconds)} s: pulls, cosign and Sigstore are sensitive to skew, and the frozen-clock probe reads container time`, FIX.clock));
      else checks.push(ok("docker-clock", "Docker's clock agrees with this machine's", `${seconds} s apart`));
    }
    const compose = exec("docker", ["compose", "version", "--short"]);
    const composeMajor = Number(/^v?(\d+)/.exec(compose.stdout.trim())?.[1]);
    checks.push(compose.status === 0 && composeMajor >= 2 ? ok("compose", "docker compose v2", compose.stdout.trim()) : bad(dockerNeeded, "compose", "docker compose v2", compose.status === 0 ? `${compose.stdout.trim()}: v2 is needed (\`docker compose\`, not \`docker-compose\`)` : "`docker compose` is not available", FIX.compose));
  }

  // -- signing and scanning tools
  const cosignSeverity = severity(selected, ["nightly", "gate", "mutants"]);
  if (cosignSeverity) {
    const c = exec("cosign", ["version"]);
    const v = missing(c) ? undefined : parseCosignVersion(`${c.stdout}\n${c.stderr}`);
    if (missing(c)) checks.push(bad(cosignSeverity, "cosign", `cosign >= ${MIN_COSIGN_MAJOR}`, "not installed: no registry image can be verified, and an unverified image is refused (exit 2)", FIX.cosign));
    else if (!v) checks.push(bad("warn", "cosign", `cosign >= ${MIN_COSIGN_MAJOR}`, "installed, but its version could not be read", FIX.cosign));
    else if (v.major < MIN_COSIGN_MAJOR) checks.push(bad(cosignSeverity, "cosign", `cosign >= ${MIN_COSIGN_MAJOR}`, `cosign ${v.major}.${v.minor}.${v.patch}: the monorepo signs with cosign 3 and an older cosign reports those signatures as missing`, FIX.cosign));
    else checks.push(ok("cosign", `cosign >= ${MIN_COSIGN_MAJOR}`, `${v.major}.${v.minor}.${v.patch}`));
  }

  const syftSeverity = severity(selected, ["mutants"], ["nightly", "gate"]);
  if (syftSeverity) {
    const s = exec("syft", ["version"]);
    checks.push(s.status === 0 ? ok("syft", "syft", (/^Version:\s*(\S+)/m.exec(s.stdout)?.[1] ?? "installed")) : bad(syftSeverity, "syft", "syft", syftSeverity === "fail" ? "not installed: the mutants generate SBOMs with it, and without it the added-package mutant escapes" : "not installed: SBOMs then come only from the registry's attestation, and an image without one is 'not collected'", FIX.syft));
  }

  const grypeSeverity = severity(selected, [], ["nightly", "gate", "mutants"]);
  if (grypeSeverity) {
    // A scanner that is not there, too old, or without a usable database makes the vulnerability artefact "not collected":
    // informational, and a failing hunk under HARNESS_REQUIRE_STATIC, so the doctor says fail exactly when a run would.
    const required = /^(1|true|yes)$/i.test(env.HARNESS_REQUIRE_STATIC ?? "");
    const level = required ? "fail" : grypeSeverity;
    const because = required ? ", and HARNESS_REQUIRE_STATIC makes that a failing hunk" : " (informational)";
    const g = exec("grype", ["version"]);
    const version = g.status === 0 ? parseGrypeVersion(g.stdout) : undefined;
    if (g.status !== 0) {
      checks.push(bad(level, "grype", `grype >= ${MIN_GRYPE_VERSION}`, `not installed: the vulnerability artefact is 'not collected'${because}`, FIX.grype));
    } else if (version && compareVersions(version, MIN_GRYPE_VERSION) < 0) {
      checks.push(bad(level, "grype", `grype >= ${MIN_GRYPE_VERSION}`, `grype ${version} is older than ${MIN_GRYPE_VERSION}: its database format is not the one the harness reads, and every scan would be 'not collected'${because}`, FIX.grype));
    } else {
      const pinned = PINNED_GRYPE_VERSION.replace(/^v/, "");
      checks.push(ok("grype", `grype >= ${MIN_GRYPE_VERSION}`, version ? `${version}${version === pinned ? " (the version CI pins)" : `; CI pins ${pinned}: another version can list other vulnerabilities`}` : "installed"));
      // The database: the harness switches grype's updates off during a run, so it must already be there, and fresh enough.
      const dir = vulnDbDirFromEnv(env, deps.exists, deps.home);
      const limit = maxAgeDays(env);
      const title = "grype database is present and recent (updates are off during a run)";
      if (env.HARNESS_VULN_DB_DIR?.trim() && !deps.exists(env.HARNESS_VULN_DB_DIR.trim())) {
        checks.push(bad(level, "grype-db", title, `HARNESS_VULN_DB_DIR=${env.HARNESS_VULN_DB_DIR.trim()} does not exist: every scan would be 'not collected'${because}`, FIX.grypeDb));
      } else {
        const read = readDbStatus({ exec, env }, dir);
        const verdict = judgeDb(read.status, read.failure, deps.now(), limit.days);
        const where = dir ? `in ${dir}` : "in grype's own cache (no HARNESS_VULN_DB_DIR and no HARNESS_HOME/vuln-db)";
        checks.push(verdict.usable ? ok("grype-db", title, `${where}: ${verdict.detail}`) : bad(level, "grype-db", title, `${where}: ${verdict.detail}${because}`, FIX.grypeDb));
        if (limit.invalid) checks.push(bad("warn", "grype-db-max-age", "HARNESS_VULN_DB_MAX_AGE_DAYS", `${limit.invalid} is not a positive number of days: using ${limit.days}`));
      }
    }
  }

  // -- kind, only when asked for
  if (selected.has("kind")) {
    const kind = exec("kind", ["version"]);
    checks.push(kind.status === 0 ? ok("kind", "kind", kind.stdout.trim().split(/\r?\n/)[0] ?? "installed") : bad("fail", "kind", "kind", "not installed", FIX.kind));
    const kubectl = exec("kubectl", ["version", "--client"]);
    checks.push(kubectl.status === 0 ? ok("kubectl", "kubectl", kubectl.stdout.trim().split(/\r?\n/)[0] ?? "installed") : bad("fail", "kubectl", "kubectl", "not installed", FIX.kubectl));
    if (kind.status === 0) {
      const { name: cluster, source } = kindCluster(env, deps.root, deps.platform);
      const clusters = exec("kind", ["get", "clusters"]).stdout.split(/\r?\n/).map((s) => s.trim());
      if (cluster === LEGACY_PROJECT) {
        checks.push(bad("fail", "kind-cluster", `kind cluster "${cluster}"`, `${source} names the cluster "${LEGACY_PROJECT}", the name every checkout used before 1.3.0. A cluster of that name is not adopted or deleted by any harness command, so \`harness kind up\` refuses it: unset ${source} to use this checkout's own name`, install("Remove-Item Env:" + source, "unset " + source, "unset " + source)));
      } else if (clusters.includes(cluster)) {
        checks.push(bad("warn", "kind-cluster", `kind cluster "${cluster}"`, `already exists and would be reused (${source}; only the harness-a and harness-b namespaces are created and deleted in it). If it was not made from deploy/kind/kind-config.yaml, the host ports 4100-4203 are not mapped: set HARNESS_KIND_CLUSTER to give the harness its own cluster`, install("$env:HARNESS_KIND_CLUSTER='harness-local'", "export HARNESS_KIND_CLUSTER=harness-local", "export HARNESS_KIND_CLUSTER=harness-local")));
      } else checks.push(ok("kind-cluster", `kind cluster "${cluster}"`, `not there yet: \`harness kind up\` creates it (name from ${source}; another checkout or worktree gets another name)`));
      // The name every checkout used before 1.3.0 is somebody's cluster, never this one's.
      if (cluster !== LEGACY_PROJECT && clusters.includes(LEGACY_PROJECT)) {
        checks.push(ok("kind-legacy", `legacy kind cluster "${LEGACY_PROJECT}"`, `exists: legacy cluster, not touched. It is not this checkout's (${cluster}) and no harness command adopts, loads into or deletes it. If it was made from deploy/kind/kind-config.yaml it holds the host ports 4100-4203 that a new cluster maps, and \`harness kind up\` will fail on them: delete it yourself (kind delete cluster --name ${LEGACY_PROJECT}) if it is not needed`));
      }
    }
  }

  // -- the browser
  if (severity(selected, ["nightly", "gate", "mutants", "watch"])) {
    const chromium = await deps.chromiumPath();
    checks.push(chromium && deps.exists(chromium) ? ok("chromium", "Playwright's Chromium", chromium) : bad("fail", "chromium", "Playwright's Chromium", "not installed: no journey can run", FIX.chromium));
  }

  // -- images that must be there when the network is not
  if (dockerNeeded && docker) {
    const compose = deps.readText(`${deps.root}/compose.harness.yaml`) ?? "";
    const wanted = [
      { image: env.HARNESS_K6_IMAGE || "grafana/k6:latest", why: "the k6 load run (--load)" },
      ...(selected.has("gate") ? [{ image: env.HARNESS_POSTGRES_IMAGE || "postgres:16-alpine", why: "the migration rehearsal" }] : []),
      ...composeStubImages(compose).map((image) => ({ image, why: "the fixture stubs" }))
    ];
    const absent = wanted.filter((w) => exec("docker", ["image", "inspect", "--format", "{{.Id}}", w.image]).status !== 0);
    if (absent.length) {
      checks.push(bad("warn", "images-offline", "helper images are already local (a run works offline)", `not pulled yet: ${absent.map((a) => `${a.image} (${a.why})`).join(", ")}. The first run pulls them; pull them now if the run must work offline`, FIX.pullImage(absent[0]!.image)));
    } else checks.push(ok("images-offline", "helper images are already local (a run works offline)", wanted.map((w) => w.image).join(", ")));
    const k6 = env.HARNESS_K6_IMAGE || "grafana/k6:latest";
    if (k6.endsWith(":latest") || !k6.includes(":")) checks.push(bad("warn", "k6-pinned", "the k6 image is pinned", `${k6} moves: two nightlies can run different k6 versions. Pin it with HARNESS_K6_IMAGE=grafana/k6:<version>`));
  }

  // -- disk, and where state lives
  const free = deps.freeBytes(deps.home);
  const diskSeverity = severity(selected, ["nightly", "gate", "mutants"], ["watch"]);
  if (diskSeverity) {
    if (free === undefined) checks.push(bad("warn", "disk", "free disk space", "could not be measured"));
    else if (free < DISK_FAIL_BYTES) checks.push(bad("fail", "disk", "free disk space", `${(free / GIB).toFixed(1)} GiB free where ${deps.home} lives; a run needs several GiB for images, SBOMs and captures`, FIX.disk));
    else if (free < DISK_WARN_BYTES) checks.push(bad("warn", "disk", "free disk space", `${(free / GIB).toFixed(1)} GiB free where ${deps.home} lives; two candidate images and a nightly's captures add up`, FIX.disk));
    else checks.push(ok("disk", "free disk space", `${(free / GIB).toFixed(1)} GiB free where ${deps.home} lives`));
  }
  checks.push(deps.writable(deps.home) ? ok("home", "HARNESS_HOME is writable", deps.home) : bad("fail", "home", "HARNESS_HOME is writable", `${deps.home} cannot be created or written to: the noise store, the override log and the image cache live there`, FIX.home));

  // -- ports, the compose project and the subnet: never collide with a developer's own stack
  if (dockerNeeded) {
    const compose = deps.readText(`${deps.root}/compose.harness.yaml`);
    if (compose) {
      const ports = composePorts(compose, env);
      const states = await Promise.all(ports.map(async (p) => ({ ...p, state: await deps.portState(p.port) })));
      const blocked = states.filter((p) => p.state !== "free");
      if (blocked.length) {
        checks.push(bad("fail", "ports", "the host ports the stack publishes are free", blocked.map((p) => `${p.port} (${p.variable}) is ${p.state === "busy" ? "in use" : "reserved by the OS"}`).join("; "), FIX.ports));
      } else checks.push(ok("ports", "the host ports the stack publishes are free", `${states.length} ports, ${Math.min(...states.map((p) => p.port))}-${Math.max(...states.map((p) => p.port))}`));

      const { name: project, source: projectSource } = composeProject(env, deps.root, deps.platform);
      const ls = exec("docker", ["compose", "ls", "--all", "--format", "json"]);
      let projects: { Name?: string; Status?: string }[] = [];
      try {
        projects = ls.status === 0 && ls.stdout.trim() ? (JSON.parse(ls.stdout) as typeof projects) : [];
      } catch {
        projects = [];
      }
      const legacy = project === LEGACY_PROJECT ? undefined : projects.find((p) => p.Name === LEGACY_PROJECT);
      const others = projects.map((p) => p.Name).filter((n): n is string => Boolean(n) && n !== project && n !== LEGACY_PROJECT);
      const ours = projects.find((p) => p.Name === project);
      if (ours) checks.push(bad("warn", "compose-project", `compose project "${project}"`, `already exists (${ours.Status ?? "?"}): a run replaces it, --remove-orphans included. Leftover from an interrupted run, or another run in progress? Other projects (${others.join(", ") || "none"}) are never touched`));
      else checks.push(ok("compose-project", `compose project "${project}" is the harness's own`, `named from ${projectSource}; another checkout or worktree gets another name${others.length ? `. Other projects on this Docker, never touched: ${others.join(", ")}` : "; no other compose projects"}`));
      // What every checkout called its stack before 1.3.0: left exactly as it is.
      if (legacy) {
        checks.push(bad("warn", "legacy-stack", `legacy compose project "${LEGACY_PROJECT}"`, `exists (${legacy.Status ?? "?"}): legacy stack, not touched. It is not this checkout's (${project}) and no harness command removes it. It holds the stack's fixed host ports and subnet, so this checkout's stack cannot start beside it while it runs: stop it yourself if it is not needed (docker compose -p ${LEGACY_PROJECT} down)`));
      }

      const subnet = composeSubnet(compose);
      if (subnet) {
        const ids = exec("docker", ["network", "ls", "--format", "{{.ID}}"]).stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        const inspected = ids.length ? exec("docker", ["network", "inspect", "--format", '{{.Name}}|{{index .Labels "com.docker.compose.project"}}|{{range .IPAM.Config}}{{.Subnet}},{{end}}', ...ids]).stdout : "";
        const clashes = inspected
          .split(/\r?\n/)
          .map((l) => l.trim().split("|"))
          .filter(([name, owner, subnets]) => name && owner !== project && (subnets ?? "").split(",").some((s) => s && cidrOverlap(s, subnet)))
          .map(([name, , subnets]) => `${name} (${subnets?.replace(/,$/, "")})`);
        if (clashes.length) checks.push(bad("fail", "subnet", `the stack's fixed subnet ${subnet} is unused`, `overlaps ${clashes.join(", ")}: \`docker compose up\` fails with "Pool overlaps with other one on this address space". The subnet is fixed in compose.harness.yaml (the identity stub has a fixed address in it); stop the network that holds it, or change both`, install("docker network ls; docker network rm <name> (only if it is not in use)", "docker network ls; docker network rm <name> (only if it is not in use)", "docker network ls; docker network rm <name> (only if it is not in use)")));
        else checks.push(ok("subnet", `the stack's fixed subnet ${subnet} is unused`, "no other Docker network overlaps it"));
      }
    }
  }

  // -- clock and time zone
  const tz = env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const frozen = env.HARNESS_NOW;
  if (frozen && Number.isNaN(Date.parse(frozen))) checks.push(bad("fail", "clock", "the frozen clock (HARNESS_NOW)", `HARNESS_NOW=${frozen} is not an ISO instant, e.g. 2026-09-16T09:05:00.000Z`));
  else checks.push(ok("clock", "clock and time zone", `host time zone ${tz}; it changes no verdict (the browser is pinned to Europe/Dublin, the frozen clock ${frozen ?? "default"} and run directory names are UTC)`));

  // -- Windows traps, and the scripts' bash
  const bashSeverity = severity(selected, ["gate"], ["nightly", "mutants"]);
  if (bashSeverity) {
    const bashCmd = env.HARNESS_BASH || "bash";
    const uname = exec(bashCmd, ["-c", "uname -s"]);
    if (missing(uname)) checks.push(bad(bashSeverity, "bash", "bash for scripts/*.sh", `${bashCmd} not found: the migration rehearsal and the from-source image build need it`, FIX.bash));
    else if (uname.status !== 0) checks.push(bad(bashSeverity, "bash", "bash for scripts/*.sh", `${bashCmd} runs but fails (${tail(uname.stderr + uname.stdout) || `exit ${uname.status}`}): on Windows that is the WSL launcher with no distribution installed`, FIX.bash));
    else if (win && /^Linux/i.test(uname.stdout.trim())) checks.push(bad(bashSeverity, "bash", "bash for scripts/*.sh", "`bash` on PATH is WSL's, not Git Bash: it cannot read D:\\ paths or reach the Windows docker.exe the way the scripts expect", FIX.bash));
    else checks.push(ok("bash", "bash for scripts/*.sh", `${uname.stdout.trim()} (${bashCmd})`));

    const crlf = ["build-images.sh", "fetch-migrations.sh"].filter((f) => (deps.readText(`${deps.root}/scripts/${f}`) ?? "").includes("\r"));
    checks.push(crlf.length ? bad(bashSeverity, "line-endings", "scripts/*.sh have LF line endings", `${crlf.join(", ")} contain CR: bash fails with "\\r: command not found". The repository's .gitattributes asks for LF; something checked it out or copied it as CRLF`, FIX.lineEndings) : ok("line-endings", "scripts/*.sh have LF line endings", "LF"));
  }

  if (win && dockerNeeded && deps.root.length > 90) {
    const reg = exec("reg", ["query", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem", "/v", "LongPathsEnabled"]);
    const enabled = /LongPathsEnabled\s+REG_DWORD\s+0x1/i.test(reg.stdout);
    checks.push(enabled ? ok("long-paths", "long paths", "enabled") : bad("warn", "long-paths", "long paths", `the checkout is ${deps.root.length} characters deep and Windows long paths are off: run directories (out/<time>-<mode>/<side>/...) and node_modules can pass MAX_PATH (260)`, FIX.longPaths));
  }

  const failed = checks.some((c) => c.status === "fail");
  return { ok: !failed, scopes, platform: platformOf(deps.platform), checks };
}

/** The report as text, with the fix for this platform under each problem. */
export function renderDoctor(result: { ok: boolean; scopes: Scope[]; platform: Platform; checks: Check[] }, platform: NodeJS.Platform): string {
  const label: Record<CheckStatus, string> = { ok: "ok  ", warn: "warn", fail: "FAIL" };
  const width = Math.max(...result.checks.map((c) => c.title.length));
  const lines = [`harness doctor (${result.scopes.join(", ")}) on ${result.platform}`, ""];
  for (const c of result.checks) {
    lines.push(`  ${label[c.status]}  ${c.title.padEnd(width)}  ${c.detail}`);
    if (c.status !== "ok" && c.fix) lines.push(`        ${"".padEnd(width)}  fix: ${fixFor(c.fix, platform)}`);
  }
  const fails = result.checks.filter((c) => c.status === "fail").length;
  const warns = result.checks.filter((c) => c.status === "warn").length;
  lines.push("", fails ? `${fails} problem(s) to fix before these runs can be trusted, ${warns} warning(s).` : `ready${warns ? `, with ${warns} warning(s)` : ""}.`);
  return lines.join("\n");
}
