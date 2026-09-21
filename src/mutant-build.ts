import { join } from "node:path";
import { dockerRef } from "./image-ref.ts";
import type { Exec } from "./images.ts";
import type { TempFiles } from "./image-static/command.ts";

/**
 * How a mutant is made.
 *   edge             the production reader image plus a wrapper that plants a fault at the HTTP edge (mutants/wrap.mjs)
 *   planted-package  the production image plus one extra package on disk: an npm package COPYed into node_modules,
 *                    needing no root, no network and no package manager, so it also works on a distroless image
 *   base-swap        the production filesystem laid over a different base image: same app, same configuration,
 *                    different lowest layers
 */
export const MUTANT_KINDS = ["edge", "planted-package", "base-swap"] as const;
export type MutantKind = (typeof MUTANT_KINDS)[number];

/**
 * The base a base-swap mutant is built on. Must not share its lowest layer with the production image, and must lay
 * its root out the way production does: `COPY --from=production / /` over an image whose /bin is a directory (alpine)
 * fails in BuildKit ("cannot replace to directory .../bin with file"), because the production image's /bin is a
 * symlink into /usr. ubuntu is a different distribution with the same merged-/usr layout as the node image's Debian.
 */
export const DEFAULT_ALT_BASE = "ubuntu:24.04";

export interface BuildContext {
  exec: Exec;
  files: TempFiles;
  /** The repository's mutants/ directory. */
  mutantsDir: string;
  altBase: string;
  log: (m: string) => void;
}

interface Inspected {
  Config?: { WorkingDir?: string; User?: string; Entrypoint?: string[] | null; Cmd?: string[] | null; ExposedPorts?: Record<string, unknown> | null; Env?: string[] | null };
  RootFS?: { Layers?: string[] | null };
}

function inspect(exec: Exec, ref: string): Inspected {
  const result = exec("docker", ["image", "inspect", "--format", "{{json .}}", dockerRef(ref)]);
  if (result.status !== 0) throw new Error(`docker image inspect ${ref} exited ${result.status}: ${result.stderr.trim()}`);
  return JSON.parse(result.stdout.trim()) as Inspected;
}

/** A Dockerfile ENV/LABEL value: double-quoted, with `$` escaped so the build does not expand it. */
const quote = (v: string) => JSON.stringify(v).replaceAll("$", "\\$");

/**
 * The Dockerfile of a base-swap mutant. Filesystem metadata is not copied by
 * `COPY --from`, so the production image's configuration (working directory,
 * user, environment, ports, entrypoint, command) is written out again from
 * what `docker image inspect` says it is: the mutant differs from production
 * in its base layers and in nothing else.
 */
export function baseSwapDockerfile(base: string, altBase: string, config: NonNullable<Inspected["Config"]>): string {
  const lines = [`FROM ${dockerRef(base)} AS production`, `FROM ${altBase}`, "COPY --from=production / /"];
  for (const entry of config.Env ?? []) {
    const eq = entry.indexOf("=");
    if (eq > 0) lines.push(`ENV ${entry.slice(0, eq)}=${quote(entry.slice(eq + 1))}`);
  }
  if (config.WorkingDir) lines.push(`WORKDIR ${config.WorkingDir}`);
  for (const port of Object.keys(config.ExposedPorts ?? {})) lines.push(`EXPOSE ${port}`);
  if (config.User) lines.push(`USER ${config.User}`);
  if (config.Entrypoint) lines.push(`ENTRYPOINT ${JSON.stringify(config.Entrypoint)}`);
  if (config.Cmd) lines.push(`CMD ${JSON.stringify(config.Cmd)}`);
  return `${lines.join("\n")}\n`;
}

/** Build one mutant image; returns its tag. Throws when the build fails or does not do what the mutant says it does. */
export function buildMutantImage(mutant: { name: string; kind: MutantKind }, base: string, image: string, ctx: BuildContext): string {
  const docker = (args: string[]) => {
    const result = ctx.exec("docker", args);
    if (result.status !== 0) throw new Error(`docker build for mutant ${mutant.name} exited ${result.status}: ${result.stderr.trim().split(/\r?\n/).slice(-3).join(" / ")}`);
  };
  const common = ["build", "-q", "--build-arg", `BASE=${dockerRef(base)}`, "-t", image];
  switch (mutant.kind) {
    case "edge":
      docker([...common, "-f", join(ctx.mutantsDir, "Dockerfile"), "--build-arg", `MUTANT=${mutant.name}`, ctx.mutantsDir]);
      return image;
    case "planted-package":
      docker([...common, "-f", join(ctx.mutantsDir, "Dockerfile.planted-package"), ctx.mutantsDir]);
      return image;
    case "base-swap": {
      const config = inspect(ctx.exec, base).Config ?? {};
      const dockerfile = ctx.files.write(`Dockerfile.${mutant.name}`, baseSwapDockerfile(base, ctx.altBase, config));
      docker([...common, "-f", dockerfile, ctx.mutantsDir]);
      // A base-swap mutant that kept the production base's lowest layer plants nothing.
      const before = inspect(ctx.exec, base).RootFS?.Layers?.[0];
      const after = inspect(ctx.exec, image).RootFS?.Layers?.[0];
      if (!before || !after) throw new Error(`mutant ${mutant.name}: cannot read the lowest layer of ${base} or ${image}`);
      if (before === after) throw new Error(`mutant ${mutant.name}: ${ctx.altBase} shares its lowest layer with ${base}, so the base was not swapped; set HARNESS_MUTANT_ALT_BASE to an image from a different distribution`);
      return image;
    }
  }
}
