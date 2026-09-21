import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statfsSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { realExec } from "../images.ts";
import { harnessRoot } from "../project.ts";
import type { DoctorDeps } from "./doctor.ts";
import { harnessHome } from "./home.ts";

/** Try to listen on a port on every address docker would publish it on. */
function tryListen(port: number, host: string): Promise<"free" | "busy" | "reserved"> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", (e: NodeJS.ErrnoException) => resolve(e.code === "EACCES" ? "reserved" : e.code === "EADDRINUSE" ? "busy" : "free"));
    server.once("listening", () => server.close(() => resolve("free")));
    server.listen({ port, host, exclusive: true });
  });
}

async function portState(port: number): Promise<"free" | "busy" | "reserved"> {
  // Docker publishes on 0.0.0.0; on Windows something bound to 127.0.0.1 alone does not stop a 0.0.0.0 bind, but does stop Docker's.
  for (const host of ["0.0.0.0", "127.0.0.1"]) {
    const state = await tryListen(port, host);
    if (state !== "free") return state;
  }
  return "free";
}

function nearestExisting(path: string): string {
  let p = path;
  while (!existsSync(p) && dirname(p) !== p) p = dirname(p);
  return p;
}

export function realDoctorDeps(env: NodeJS.ProcessEnv = process.env): DoctorDeps {
  const home = harnessHome(env);
  return {
    platform: process.platform,
    env,
    exec: (cmd, args, opts) => realExec(cmd, args, opts),
    pnpmVersion: () => {
      // pnpm is pnpm.cmd on Windows, which Node will not start without a shell.
      const r = spawnSync("pnpm --version", { shell: true, encoding: "utf8" });
      return r.status === 0 ? r.stdout.trim().split(/\r?\n/).pop() : undefined;
    },
    nodeVersion: process.version,
    root: harnessRoot(),
    home,
    now: () => new Date(),
    exists: existsSync,
    readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : undefined),
    freeBytes: (path) => {
      try {
        const s = statfsSync(nearestExisting(path));
        return s.bavail * s.bsize;
      } catch {
        return undefined;
      }
    },
    writable: (path) => {
      try {
        mkdirSync(path, { recursive: true });
        const probe = join(path, `.doctor-${process.pid}`);
        writeFileSync(probe, "");
        rmSync(probe, { force: true });
        return true;
      } catch {
        return false;
      }
    },
    portState,
    chromiumPath: async () => {
      try {
        const { chromium } = await import("playwright");
        return chromium.executablePath();
      } catch {
        return undefined;
      }
    }
  };
}
