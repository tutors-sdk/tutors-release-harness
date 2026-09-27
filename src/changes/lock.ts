/**
 * Dependency movement from pnpm-lock.yaml: the direct dependencies of each workspace package (its `importers`
 * entry), at two points, and what moved between them. Transitive packages are left out on purpose: a major bump the
 * workspace asked for is ground the journeys may not cover; the thousands of transitive lines a lock carries are not
 * something a reviewer can look at in fifteen minutes.
 *
 * A line reader, not a YAML parser: the importers section of a pnpm lock (v6 to v9) is regular enough, and this keeps
 * a 20 000-line lock cheap to read twice per pull request.
 */

/** `importer path -> dependency name -> resolved version` (peer suffixes and `link:` versions left out). */
export type DirectDeps = Map<string, Map<string, string>>;

export interface DepChange {
  kind: "major" | "new";
  name: string;
  /** The workspace package that depends on it (`.` is the root, `apps/reader`, …). */
  importer: string;
  from?: string;
  to: string;
}

const unquote = (s: string) => s.trim().replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1");

export function parseLock(text: string): DirectDeps {
  const out: DirectDeps = new Map();
  let inImporters = false;
  let importer: string | undefined;
  let inDeps = false;
  let dep: string | undefined;
  for (const raw of text.split("\n")) {
    if (!raw.trim()) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    if (indent === 0) {
      inImporters = line === "importers:";
      importer = undefined;
      continue;
    }
    if (!inImporters) continue;
    if (indent === 2 && line.endsWith(":")) {
      importer = unquote(line.slice(0, -1));
      out.set(importer, new Map());
      inDeps = false;
    } else if (indent === 4) {
      inDeps = /^(dependencies|devDependencies|optionalDependencies):$/.test(line);
      dep = undefined;
    } else if (indent === 6 && inDeps && line.endsWith(":")) dep = unquote(line.slice(0, -1));
    else if (indent === 8 && inDeps && dep && importer && line.startsWith("version:")) {
      const version = unquote(line.slice("version:".length)).replace(/\(.*$/, "");
      if (/^\d+\.\d+\.\d+/.test(version)) out.get(importer)!.set(dep, version);
    }
  }
  return out;
}

/** The part of a version a breaking change moves: the major, or for 0.x the minor (semver's own rule). */
export function majorOf(version: string): string {
  const [x = "0", y = "0"] = version.split(".");
  return x === "0" ? `0.${y}` : x;
}

/** Direct dependencies that moved a major, and ones that are new to their workspace package. */
export function lockDelta(before: DirectDeps, after: DirectDeps): DepChange[] {
  const out: DepChange[] = [];
  for (const [importer, deps] of after) {
    const was = before.get(importer);
    for (const [name, to] of deps) {
      const from = was?.get(name);
      if (from === undefined) out.push({ kind: "new", name, importer, to });
      else if (majorOf(from) !== majorOf(to) && compareVersions(to, from) > 0) out.push({ kind: "major", name, importer, from, to });
    }
  }
  return out.sort((x, y) => x.kind.localeCompare(y.kind) || x.name.localeCompare(y.name) || x.importer.localeCompare(y.importer));
}

function compareVersions(x: string, y: string): number {
  const a = x.split(/[.-]/).map((p) => Number(p));
  const b = y.split(/[.-]/).map((p) => Number(p));
  for (let i = 0; i < 3; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0);
  return 0;
}
