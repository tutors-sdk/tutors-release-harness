/**
 * `harness readiness --site <dir> [--github f]`: the overnight readiness page. Reads the Main to RC forecasts the pages
 * workflow has copied into the site and the workflow history `harness a3 --fetch-github` wrote beside them (github.json
 * in the site, or --github), and writes readiness.html and readiness.json into the site. Advisory: exit 0 when written,
 * 2 for what it cannot read.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildReadiness, type Readiness } from "./model.ts";
import { readForecasts, readWorkflowRuns } from "./read.ts";
import { renderReadiness } from "./render.ts";

export class ReadinessInputError extends Error {}

export function runReadiness(o: { site: string; github?: string; now: Date; harness: string }): { readiness: Readiness; files: string[] } {
  if (!existsSync(o.site)) throw new ReadinessInputError(`readiness: no site directory at ${o.site}: build the site first (pages.yml copies the main-preview reports into it)`);
  // An explicit --github must be readable; the default, the site's own github.json, may be missing (not read, and said).
  const gh = readWorkflowRuns(o.github ?? join(o.site, "github.json"));
  if (o.github && !gh.runs && !gh.github.includes("did not answer")) throw new ReadinessInputError(`readiness: --github ${o.github} is not a GitHub snapshot (${gh.github})`);
  const readiness = buildReadiness({ now: o.now, harness: o.harness, forecasts: readForecasts(o.site), ...(gh.runs ? { workflowRuns: gh.runs } : {}), github: gh.github });
  mkdirSync(o.site, { recursive: true });
  const files = [join(o.site, "readiness.html"), join(o.site, "readiness.json")];
  writeFileSync(files[0]!, renderReadiness(readiness));
  writeFileSync(files[1]!, `${JSON.stringify(readiness, null, 2)}\n`);
  return { readiness, files };
}
