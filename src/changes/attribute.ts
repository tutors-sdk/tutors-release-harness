/**
 * Which PR did it (since 1.20.1): each cause of a report (src/report/causes.ts) beside the pull requests that could have
 * made it. The scorecard's unclaimed row showed "—" for all 899 differences while changes.json already listed the files
 * of all 67 PRs.
 *
 * Two ways, in order:
 *
 * 1. By delta. A cause that is new since the previous forecast beside the same baseline (its key was not among that
 *    forecast's causes) can only come from the PRs merged between the two forecasts: those in tonight's changes.json and
 *    not in the previous one, usually one to three. Of those, the ones whose files match the cause's paths (2, below)
 *    are named; when none match, all of them are, since one of them did it.
 * 2. By path, for every other cause: the PRs whose files touch what the cause is about. A difference on a page of an app
 *    (dom, screenshot, focus, network, headers, console, axe, timing) matches that app's source and the shared packages
 *    (`apps/<app>/**`, `packages/**`); one in an image (sbom, image-manifest, vulns, runtime, startup) matches a
 *    Dockerfile, a package manifest or the lockfile; logs and metrics match the app and the packages; a journey's table
 *    (persistence) matches the reader and the packages. Documentation, tests and workflows never match: they cannot
 *    change what an image does. The PRs are ranked by how many files matched the direct paths (the app's source, a
 *    Dockerfile), then the indirect ones (the packages, a manifest), then by merge order.
 *
 * The attribution is a lead to read, never a verdict: it names who to ask, and nothing that judges reads it.
 */
import picomatch from "picomatch";
import type { Cause } from "../report/causes.ts";
import type { Changes, PrRisk } from "./signals.ts";

/** A PR named against a cause. */
export interface AttributedPr {
  pr: number | null;
  sha: string;
  title: string;
  url?: string;
  /** How many of its files matched the cause's paths; 0 for a PR named by delta alone. */
  files: number;
  /** Of those, how many matched the primary paths (the app's own source, a Dockerfile); it ranks by these first. */
  direct: number;
}

export type AttributionHow = "new" | "path";

/** One cause and the PRs that could have made it. */
export interface CauseAttribution {
  /** The cause's id (src/report/causes.ts). */
  cause: string;
  key: string;
  hunks: number;
  /** new: the cause was not in the previous forecast, and the PRs are from those merged since. path: matched by files. */
  how: AttributionHow;
  /** Most files matched first; empty when nothing matched. */
  prs: AttributedPr[];
}

/** For the lead: the previous forecast compared with, and what was merged since. */
export interface Attribution {
  /** The previous forecast beside the same baseline, when one was kept (the delta's `against`). */
  against?: { id: string; candidate: string };
  /** PRs merged since the previous forecast (in this range, not in its range); undefined without one. */
  mergedSince?: AttributedPr[];
  causes: CauseAttribution[];
  /** Causes with at least one PR named. */
  attributed: number;
}

const IMAGE = new Set(["sbom", "image-manifest", "vulns", "runtime", "startup"]);

/** Files that cannot change what an image does: documentation, tests, the CI. */
const INERT = picomatch(["**/*.md", "**/*.mdx", "**/LICENSE*", "**/*.{test,spec}.{ts,js,svelte}", "**/{test,tests,e2e,__tests__}/**", ".github/**", ".changeset/**", "docs/**"], { dot: true });

/**
 * The globs of what a cause is about: `primary` is what makes it directly (a Dockerfile for an image, the app's own source
 * for a page), `secondary` what can make it through a dependency (a package manifest, the shared packages).
 */
export function pathsOf(c: Pick<Cause, "artefact" | "apps">): { primary: string[]; secondary: string[] } {
  const apps = c.apps.length ? c.apps : c.artefact === "persistence" ? ["reader"] : ["*"];
  if (IMAGE.has(c.artefact)) return { primary: ["**/Dockerfile*", "**/.dockerignore"], secondary: c.artefact === "sbom" || c.artefact === "vulns" ? ["pnpm-lock.yaml", "package.json", "apps/*/package.json", "packages/**/package.json"] : [] };
  // A page, a log, a metric, a journey's table: the app's own source, then the packages every app is built from.
  return { primary: apps.map((a) => `apps/${a}/**`), secondary: ["packages/**"] };
}

const named = (p: PrRisk, files = 0, direct = 0): AttributedPr => ({ pr: p.pr, sha: p.sha, title: p.title, ...(p.url ? { url: p.url } : {}), files, direct });

/** The PRs whose files match the cause's paths: most primary files first, then most secondary, then in merge order. */
export function byPath(c: Pick<Cause, "artefact" | "apps">, prs: PrRisk[]): AttributedPr[] {
  const paths = pathsOf(c);
  const primary = picomatch(paths.primary, { dot: true });
  const secondary = paths.secondary.length ? picomatch(paths.secondary, { dot: true }) : () => false;
  return prs
    .map((p, i) => {
      const live = p.files.filter((f) => !INERT(f));
      const one = live.filter((f) => primary(f)).length;
      return { p, i, one, two: live.filter((f) => !primary(f) && secondary(f)).length };
    })
    .filter((x) => x.one + x.two > 0)
    .sort((x, y) => y.one - x.one || y.two - x.two || x.i - y.i)
    .map((x) => named(x.p, x.one + x.two, x.one));
}

/** A PR by its number, a direct commit by its sha. */
const idOf = (p: Pick<PrRisk, "pr" | "sha">) => (p.pr !== null ? `#${p.pr}` : p.sha);

/** The PRs of a range that are not in an earlier range: what was merged between two forecasts. */
export function mergedSince(now: Changes, before: Changes): PrRisk[] {
  const seen = new Set(before.prs.map(idOf));
  return now.prs.filter((p) => !seen.has(idOf(p)) && !p.release);
}

/**
 * Attribute each cause. `previous`, when a forecast beside the same baseline was kept, is its cause keys and its
 * changes.json; a cause whose key it lacks is new and is attributed by delta.
 */
export function attribute(causes: Cause[], changes: Changes, previous?: { id: string; candidate: string; keys: Set<string>; changes?: Changes }): Attribution {
  const since = previous?.changes ? mergedSince(changes, previous.changes) : undefined;
  const prs = changes.prs.filter((p) => !p.release);
  const out = causes.map((c): CauseAttribution => {
    if (previous && !previous.keys.has(c.key) && since?.length) {
      const matched = byPath(c, since);
      return { cause: c.id, key: c.key, hunks: c.hunks, how: "new", prs: matched.length ? matched : since.map((p) => named(p)) };
    }
    return { cause: c.id, key: c.key, hunks: c.hunks, how: "path", prs: byPath(c, prs) };
  });
  return {
    ...(previous ? { against: { id: previous.id, candidate: previous.candidate } } : {}),
    ...(since ? { mergedSince: since.map((p) => named(p)) } : {}),
    causes: out,
    attributed: out.filter((c) => c.prs.length).length
  };
}
