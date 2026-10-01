/**
 * `harness readiness --site <dir> [--github f] [--releases f | --fetch-releases]`: the overnight readiness page. Reads the
 * Main to RC forecasts the pages workflow has copied into the site, the workflow history `harness a3 --fetch-github` wrote
 * beside them (github.json in the site, or --github) and, since 1.19.0, the monorepo's release sizes (releases.json in the
 * site, or --releases; --fetch-releases asks GitHub once and writes it), and writes readiness.html and readiness.json into
 * the site. Advisory: exit 0 when written, 2 for what it cannot read.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readWeeklyMutants } from "../a3/read.ts";
import { buildReadiness, type Readiness } from "./model.ts";
import { readForecasts, readReleaseHistory, readWorkflowRuns } from "./read.ts";
import { RELEASES_FILE, type ReleaseHistory } from "./releases.ts";
import { renderReadiness } from "./render.ts";

export class ReadinessInputError extends Error {}

export function runReadiness(o: { site: string; github?: string; mutants?: string; releases?: string; fetched?: ReleaseHistory; now: Date; harness: string }): { readiness: Readiness; files: string[] } {
  if (!existsSync(o.site)) throw new ReadinessInputError(`readiness: no site directory at ${o.site}: build the site first (pages.yml copies the main-preview reports into it)`);
  // An explicit --github must be readable; the default, the site's own github.json, may be missing (not read, and said).
  const gh = readWorkflowRuns(o.github ?? join(o.site, "github.json"));
  if (o.github && !gh.runs && !gh.github.includes("did not answer")) throw new ReadinessInputError(`readiness: --github ${o.github} is not a GitHub snapshot (${gh.github})`);
  // Since 1.18.0: the weekly mutants self-tests for the Tests mark's harness half (--mutants; absent, not measured).
  const mutants = readWeeklyMutants(o.mutants);
  // Since 1.19.0: the release sizes the control chart reads. Fetched this build (written into the site), an explicit
  // --releases that must be one, or the site's own releases.json, which may be missing (not read, and said).
  const releasesFile = join(o.site, RELEASES_FILE);
  if (o.fetched) {
    mkdirSync(o.site, { recursive: true });
    writeFileSync(releasesFile, `${JSON.stringify(o.fetched, null, 2)}\n`);
  }
  const rel = readReleaseHistory(o.releases ?? releasesFile);
  if (o.releases && !rel.history) throw new ReadinessInputError(`readiness: --releases ${o.releases} is not a release history (${rel.source})`);
  const readiness = buildReadiness({ now: o.now, harness: o.harness, forecasts: readForecasts(o.site), ...(gh.runs ? { workflowRuns: gh.runs } : {}), github: gh.github, ...(mutants ? { mutants } : {}), ...(rel.history ? { releases: rel.history } : {}), releasesSource: rel.source });
  mkdirSync(o.site, { recursive: true });
  const files = [join(o.site, "readiness.html"), join(o.site, "readiness.json"), ...(o.fetched ? [releasesFile] : [])];
  writeFileSync(files[0]!, renderReadiness(readiness));
  writeFileSync(files[1]!, `${JSON.stringify(readiness, null, 2)}\n`);
  return { readiness, files };
}
