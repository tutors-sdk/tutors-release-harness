/**
 * `harness a3 --site <dir> [--kaizen kaizen/] [--noise-history f] [--scoreboard f] [--github f | --fetch-github]`: the A3
 * Aggregator. Reads the kept reports the pages workflow has copied into the site, the kaizen register and, with
 * --fetch-github (GITHUB_TOKEN or GH_TOKEN), the workflows' history; writes a3.html, a3.json and, when it asked
 * GitHub, github.json into the site. Advisory: exit 0 when written, 2 for what it cannot read.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tokenFrom, type FetchLike } from "../changes/github.ts";
import { fetchGithub, type GithubSnapshot } from "./github.ts";
import { buildA3, subjectRun, type A3 } from "./model.ts";
import { readInputs } from "./read.ts";
import { renderA3 } from "./render.ts";

export class A3InputError extends Error {}

export async function runA3(o: { site: string; kaizen: string; noiseHistory?: string; scoreboard?: string; github?: string; fetchGithub?: boolean; now: Date; harness: string; env?: NodeJS.ProcessEnv; fetch?: FetchLike }): Promise<{ a3: A3; files: string[] }> {
  if (!existsSync(o.site)) throw new A3InputError(`a3: no site directory at ${o.site}: build the site first (pages.yml copies each stream's reports into it)`);
  let github: GithubSnapshot | undefined;
  if (o.github) {
    try {
      github = JSON.parse(readFileSync(o.github, "utf8")) as GithubSnapshot;
    } catch (e) {
      throw new A3InputError(`a3: --github ${o.github} is not a GitHub snapshot: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  // Read once without GitHub to learn which commits the value stream spans, then ask GitHub about exactly those.
  const first = readInputs({ site: o.site, kaizen: o.kaizen, ...(o.noiseHistory ? { noiseHistory: o.noiseHistory } : {}), ...(o.scoreboard ? { scoreboard: o.scoreboard } : {}), now: o.now, harness: o.harness });
  if (!github && o.fetchGithub) {
    const subject = subjectRun(first.runs);
    const prov = subject?.report?.provenance;
    const production = prov?.a?.images?.reader?.version ?? undefined;
    const head = prov?.b?.images?.reader?.revision ?? undefined;
    const token = tokenFrom(o.env ?? process.env);
    github = await fetchGithub({ fetch: o.fetch ?? (fetch as unknown as FetchLike), ...(token ? { token } : {}), now: o.now, ...(production ? { production } : {}), ...(head ? { head } : {}) });
  }
  const a3 = buildA3({ ...first, ...(github ? { github } : {}) });
  mkdirSync(o.site, { recursive: true });
  const files = [join(o.site, "a3.html"), join(o.site, "a3.json")];
  writeFileSync(files[0]!, renderA3(a3));
  writeFileSync(files[1]!, `${JSON.stringify(a3, null, 2)}\n`);
  if (github && o.fetchGithub) {
    files.push(join(o.site, "github.json"));
    writeFileSync(files[2]!, `${JSON.stringify(github, null, 2)}\n`);
  }
  return { a3, files };
}
