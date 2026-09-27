/**
 * Every job that runs journeys (installs Chromium) restores the recorded third-party responses before its first harness
 * command and keeps what it recorded, as docs/contract/workflows.json says. The cache itself is tested in
 * tests/third-party-cache.test.ts.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { THIRD_PARTY_HOSTS } from "../src/collectors/third-party-cache.ts";

const ROOT = resolve(import.meta.dirname, "..");
const DIR = resolve(ROOT, ".github/workflows");
const files = readdirSync(DIR).filter((f) => f.endsWith(".yml"));

interface Step {
  id?: string;
  name?: string;
  uses?: string;
  if?: string;
  run?: string;
  with?: Record<string, string>;
}
interface Job {
  env?: Record<string, string>;
  steps: Step[];
}
const jobs = files.flatMap((f) => Object.entries((parse(readFileSync(resolve(DIR, f), "utf8")) as { jobs: Record<string, Job> }).jobs).map(([id, job]) => ({ at: `${f}:${id}`, job })));
const contract = (JSON.parse(readFileSync(resolve(ROOT, "docs/contract/workflows.json"), "utf8")) as { thirdPartyCache: { dir: string; env: string; restoreKey: string; usedBy: string[] } }).thirdPartyCache;

const installsChromium = (job: Job) => job.steps.some((s) => s.run?.includes("playwright install"));
const restores = (s: Step) => !!s.uses?.startsWith("actions/cache/restore@") && s.with?.path === contract.dir;
const saves = (s: Step) => !!s.uses?.startsWith("actions/cache/save@") && s.with?.path === contract.dir;

describe("the recorded third-party responses in CI", () => {
  it("every job that installs Chromium uses them, and the contract lists exactly those jobs", () => {
    const users = jobs.filter(({ job }) => installsChromium(job)).map(({ at }) => at);
    expect(users.sort()).toEqual([...contract.usedBy].sort());
    for (const { at, job } of jobs.filter(({ job }) => !installsChromium(job))) expect(JSON.stringify(job), at).not.toContain("third-party-cache");
  });

  it("each names the directory in the env the harness reads, restores it before any harness command, and saves it last, always, under its content's hash", () => {
    for (const { at, job } of jobs.filter(({ job }) => installsChromium(job))) {
      expect(job.env?.[contract.env], at).toBe(`\${{ github.workspace }}/${contract.dir}`);
      const restore = job.steps.findIndex(restores);
      const firstHarness = job.steps.findIndex((s) => /pnpm harness /.test(s.run ?? ""));
      expect(restore, at).toBeGreaterThan(-1);
      expect(restore, at).toBeLessThan(firstHarness);
      const r = job.steps[restore]!;
      expect(r.id, at).toBe("third-party-cache");
      expect(r.with?.["restore-keys"]?.trim(), at).toBe(contract.restoreKey);
      expect(r.with?.key, at).toBe(`${contract.restoreKey}\${{ github.run_id }}`);

      const save = job.steps.findIndex(saves);
      expect(save, at).toBe(job.steps.length - 1);
      const s = job.steps[save]!;
      const hash = `hashFiles('${contract.dir}/*.json')`;
      expect(s.with?.key, at).toBe(`${contract.restoreKey}\${{ ${hash} }}`);
      expect(s.if, at).toBe(`always() && ${hash} != '' && steps.third-party-cache.outputs.cache-matched-key != format('${contract.restoreKey}{0}', ${hash})`);
    }
  });

  it("the hosts the harness answers are the ones the docs name", () => {
    const docs = readFileSync(resolve(ROOT, "docs/noise-burndown.md"), "utf8");
    for (const host of THIRD_PARTY_HOSTS) expect(docs, host).toContain(host);
  });
});
