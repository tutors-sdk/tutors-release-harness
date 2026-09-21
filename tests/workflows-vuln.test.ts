/**
 * The workflows that judge images collect the `vulns` artefact with a pinned grype and a pinned, cached database.
 *
 * What is held here, from the YAML itself: which jobs install grype, that they all install the same version (the one
 * `harness doctor` and docs/contract/workflows.json name), that the database is fetched once (a cache miss only, by
 * `harness vuln-db update`), cached by UTC day and grype version, saved only from a successful fetch, checked before any run
 * starts, and never updated by anything else; and which jobs set HARNESS_REQUIRE_STATIC. The rest of the workflow rules
 * (declared commands only, cosign, permissions) stay in contract.test.ts.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { PINNED_GRYPE_VERSION, DEFAULT_VULN_DB_MAX_AGE_DAYS, vulnDbDirFromEnv } from "../src/local/vuln-db.ts";
import { harnessHome, vulnDbDir } from "../src/local/home.ts";

const ROOT = resolve(import.meta.dirname, "..");
const DIR = resolve(ROOT, ".github/workflows");
const files = readdirSync(DIR).filter((f) => f.endsWith(".yml"));
const text = Object.fromEntries(files.map((f) => [f, readFileSync(resolve(DIR, f), "utf8")]));

interface Step {
  id?: string;
  name?: string;
  uses?: string;
  if?: string;
  run?: string;
  "continue-on-error"?: boolean;
  with?: Record<string, string>;
}
interface Job {
  name?: string;
  env?: Record<string, string>;
  steps: Step[];
}
const jobsOf = (f: string) => (parse(text[f]!) as { jobs: Record<string, Job> }).jobs;
const contract = JSON.parse(readFileSync(resolve(ROOT, "docs/contract/workflows.json"), "utf8")) as {
  tools: Record<string, { action: string; version: string; usedBy: string[]; requireStatic?: Record<string, boolean> }>;
  vulnerabilityDatabase: { dir: string; env: string; cacheKey: string };
};

/** [workflow file, job id, job] of every job that installs grype. */
const grypeJobs = files.flatMap((f) => Object.entries(jobsOf(f)).filter(([, j]) => j.steps.some((s) => s.uses?.startsWith("anchore/scan-action/download-grype@"))).map(([id, j]) => [f, id, j] as const));
const idx = (job: Job, pred: (s: Step) => boolean) => job.steps.findIndex(pred);

describe("which jobs install grype", () => {
  it("the nightly's noise job, the release job and the mutants job: the jobs that judge images, and no others", () => {
    expect(grypeJobs.map(([f, id]) => `${f}:${id}`).sort()).toEqual(["nightly-noise.yml:noise", "release.yml:release", "weekly-mutants.yml:mutants"]);
    expect([...new Set(grypeJobs.map(([f]) => f))].sort()).toEqual(contract.tools.grype!.usedBy);
  });

  it("not post-deploy (no images: it compares live URLs), not the smoke run in ci.yml, not the rehearsals that do not judge the images", () => {
    expect(text["post-deploy.yml"]).not.toMatch(/grype|vuln-db/);
    expect(text["post-deploy.yml"]).not.toContain("images ensure");
    expect(text["ci.yml"]).not.toMatch(/grype|vuln-db/);
    const release = jobsOf("release.yml");
    for (const id of Object.keys(release).filter((j) => j !== "release")) expect(JSON.stringify(release[id]), id).not.toMatch(/grype|vuln-db/);
  });
});

describe("one pinned grype", () => {
  it("every job pins the version harness doctor names, with the action's `v`, and installs it through env so the cache key cannot drift from it", () => {
    expect(PINNED_GRYPE_VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(contract.tools.grype!.version).toBe(PINNED_GRYPE_VERSION);
    expect(contract.tools.grype!.action).toBe("anchore/scan-action/download-grype");
    for (const [f, id, job] of grypeJobs) {
      const at = `${f}:${id}`;
      expect(job.env?.GRYPE_VERSION, at).toBe(PINNED_GRYPE_VERSION);
      const step = job.steps.find((s) => s.uses?.startsWith("anchore/scan-action/download-grype@"))!;
      // a full version, never a moving major: the action's own default moves with its release
      expect(step.uses, at).toMatch(/@v\d+\.\d+\.\d+$/);
      expect(step.with?.["grype-version"], at).toBe("${{ env.GRYPE_VERSION }}");
      expect(step.id, at).toBe("grype");
      // the action prints the binary's absolute path as `cmd`; it is not on PATH, and the harness runs `grype`
      const path = job.steps.find((s) => s.run?.includes("$GITHUB_PATH") && s.run.includes("steps.grype.outputs.cmd"));
      expect(path, at).toBeDefined();
      expect(idx(job, (s) => s === path), at).toBeGreaterThan(idx(job, (s) => s === step));
    }
    // the same version appears nowhere else as a literal, so a bump is one edit per job and one constant
    for (const f of files) expect([...text[f]!.matchAll(/\bv0\.\d+\.\d+\b/g)].map((m) => m[0]).filter((v) => v !== PINNED_GRYPE_VERSION), f).toEqual([]);
  });

  it("syft is pinned too, in the one job that generates SBOMs (the others read the images' SBOM attestation)", () => {
    expect(contract.tools.syft!.usedBy).toEqual(["weekly-mutants.yml"]);
    const job = jobsOf("weekly-mutants.yml").mutants!;
    expect(job.env?.SYFT_VERSION).toBe(contract.tools.syft!.version);
    expect(job.steps.find((s) => s.uses?.startsWith("anchore/sbom-action/download-syft@"))!.with?.["syft-version"]).toBe("${{ env.SYFT_VERSION }}");
    expect(job.steps.find((s) => s.uses?.startsWith("anchore/sbom-action/download-syft@"))!.id).toBe("syft");
    for (const f of files.filter((f) => f !== "weekly-mutants.yml")) expect(text[f], f).not.toContain("download-syft");
  });
});

describe("one pinned, cached, never-updated database", () => {
  it("fetched once, on a cache miss, by the harness command, into the directory a local run also uses", () => {
    expect(contract.vulnerabilityDatabase.dir).toBe(".harness/vuln-db");
    // the local default: <HARNESS_HOME>/vuln-db with HARNESS_HOME at its default, `.harness` in the checkout
    expect(vulnDbDir(harnessHome({}))).toBe(resolve(ROOT, ".harness", "vuln-db"));
    expect(vulnDbDirFromEnv({ HARNESS_HOME: resolve(ROOT, ".harness") }, () => true)).toBe(resolve(ROOT, ".harness", "vuln-db"));
    for (const [f, id, job] of grypeJobs) {
      const at = `${f}:${id}`;
      expect(job.env?.HARNESS_VULN_DB_DIR, at).toBe("${{ github.workspace }}/.harness/vuln-db");
      const restore = job.steps.find((s) => s.uses?.startsWith("actions/cache/restore@") && s.with?.path === ".harness/vuln-db")!;
      const save = job.steps.find((s) => s.uses?.startsWith("actions/cache/save@") && s.with?.path === ".harness/vuln-db")!;
      const fetch = job.steps.find((s) => s.run?.trim() === "pnpm harness vuln-db update")!;
      expect(restore && save && fetch, at).toBeTruthy();
      // the id every `if` below reads
      expect(restore.id, at).toBe("vulndb-cache");
      expect(fetch.id, at).toBe("vulndb-fetch");
      // only on a miss of today's entry; an outage of grype's servers leaves what the cache had rather than failing a job that may not need it
      expect(fetch.if, at).toBe("steps.vulndb-cache.outputs.cache-hit != 'true'");
      expect(fetch["continue-on-error"], at).toBe(true);
      // a database that failed to arrive is never saved under today's key: the save follows only a fetch that succeeded
      expect(save.if, at).toBe("steps.vulndb-fetch.outcome == 'success'");
      expect(idx(job, (s) => s === restore), at).toBeLessThan(idx(job, (s) => s === fetch));
      expect(idx(job, (s) => s === fetch), at).toBeLessThan(idx(job, (s) => s === save));
    }
  });

  it("cached by UTC day and grype version; an earlier day is the fallback, another grype version never is", () => {
    expect(contract.vulnerabilityDatabase.cacheKey).toBe("vuln-db-grype-<GRYPE_VERSION>-<UTC day>");
    for (const [f, id, job] of grypeJobs) {
      const at = `${f}:${id}`;
      const day = job.steps.find((s) => s.id === "vulndb")!;
      expect(day.run, at).toBe('echo "day=$(date -u +%F)" >> "$GITHUB_OUTPUT"');
      const restore = job.steps.find((s) => s.id === "vulndb-cache")!;
      const save = job.steps.find((s) => s.uses?.startsWith("actions/cache/save@") && s.with?.path === ".harness/vuln-db")!;
      const key = "vuln-db-grype-${{ env.GRYPE_VERSION }}-${{ steps.vulndb.outputs.day }}";
      expect(restore.with?.key, at).toBe(key);
      expect(save.with?.key, at).toBe(key);
      expect(restore.with?.["restore-keys"]?.trim(), at).toBe("vuln-db-grype-${{ env.GRYPE_VERSION }}-");
      expect(idx(job, (s) => s === day), at).toBeLessThan(idx(job, (s) => s.id === "vulndb-cache"));
    }
  });

  it("checked after the fetch and before anything runs: `harness vuln-db status`, which fails the job only where the artefact is required", () => {
    for (const [f, id, job] of grypeJobs) {
      const at = `${f}:${id}`;
      const status = idx(job, (s) => s.run?.trim() === "pnpm harness vuln-db status");
      expect(status, at).toBeGreaterThan(idx(job, (s) => s.id === "vulndb-fetch"));
      const first = idx(job, (s) => /pnpm harness (images ensure|run|mutants)\b/.test(s.run ?? ""));
      expect(first, at).toBeGreaterThan(status);
      expect(job.steps[status]!["continue-on-error"], at).toBeUndefined();
    }
  });

  it("nothing else in any workflow updates a database, or turns the scanner's own updates on", () => {
    for (const f of files) {
      expect(text[f], f).not.toMatch(/grype db (update|import)/);
      expect(text[f], f).not.toMatch(/GRYPE_DB_AUTO_UPDATE\s*[:=]\s*["']?(true|1)/i);
      // the age limit is the default everywhere: a set variable would make a workflow judge with another limit than a local run
      expect(text[f], f).not.toMatch(/^\s*(export\s+)?HARNESS_VULN_DB_MAX_AGE_DAYS\s*[:=]/m);
      // `harness vuln-db update` is the fetch, and there is exactly one per job that installs grype
      const updates = [...text[f]!.matchAll(/pnpm harness vuln-db update/g)].length;
      expect(updates, f).toBe(grypeJobs.filter(([file]) => file === f).length);
    }
    expect(DEFAULT_VULN_DB_MAX_AGE_DAYS).toBe(5);
  });

  it("both sides of a comparison read one directory: every scan in a job uses the same HARNESS_VULN_DB_DIR, and no step overrides it", () => {
    for (const f of files) {
      for (const [id, job] of Object.entries(jobsOf(f))) {
        for (const s of job.steps) expect(JSON.stringify(s), `${f}:${id}`).not.toContain("HARNESS_VULN_DB_DIR");
      }
    }
  });
});

describe("HARNESS_REQUIRE_STATIC: the nightly and the release require the static artefacts, the mutants do not", () => {
  it("set on exactly the jobs the contract says, and on no other job", () => {
    const required = files.flatMap((f) => Object.entries(jobsOf(f)).filter(([, j]) => j.env?.HARNESS_REQUIRE_STATIC !== undefined).map(([id, j]) => [f, id, j.env!.HARNESS_REQUIRE_STATIC] as const));
    expect(required).toEqual([
      ["nightly-noise.yml", "noise", "1"],
      ["release.yml", "release", "1"]
    ]);
    for (const [f, id, job] of grypeJobs) expect(job.env?.HARNESS_REQUIRE_STATIC === "1", `${f}:${id}`).toBe(contract.tools.grype!.requireStatic![f]);
    // no workflow-level setting reaches the mutants or the other jobs through the back door
    for (const f of files) expect((parse(text[f]!) as { env?: Record<string, string> }).env?.HARNESS_REQUIRE_STATIC, f).toBeUndefined();
    expect(text["weekly-mutants.yml"]).not.toMatch(/^s*HARNESS_REQUIRE_STATIC:/m);
  });

  it("the mutants' vulnerability status step cannot fail the job, and the required jobs' can", () => {
    // `vuln-db status` exits 1 on an unusable database only under HARNESS_REQUIRE_STATIC (tests/vuln-db.test.ts), so the same step
    // is a check where the artefact is required and a printout where it is not
    expect(jobsOf("weekly-mutants.yml").mutants!.env?.HARNESS_REQUIRE_STATIC).toBeUndefined();
    for (const [f, id] of grypeJobs.filter(([f]) => f !== "weekly-mutants.yml")) expect(jobsOf(f)[id]!.env?.HARNESS_REQUIRE_STATIC).toBe("1");
  });
});
