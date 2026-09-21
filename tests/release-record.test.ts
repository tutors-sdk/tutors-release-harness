/**
 * The release record and the deployment check (contract 1.3.0). What release mode judged is written down; what a
 * deploy later reports is held against it; a difference is a warning, never a failure, and never a pass.
 *
 * The three tests TESTING.md asks of a new rule, for the deployment check: an A/A (what agrees says nothing), planted
 * changes it must catch (a digest that differs, an app missing on either side, no record), and changes it must not flag.
 */
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { exitCodeForReport } from "../src/override.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { APPS } from "../src/image-ref.ts";
import type { Digests } from "../src/digests.ts";
import { RELEASE_RECORD_FILE, findReleaseRecord, isTag, judgeDeployment, parseReleaseRecord, releaseOf, releaseRecordOf, shippable, writeReleaseRecord, type ReleaseRecord } from "../src/release-record.ts";
import { releasesDir } from "../src/local/home.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Deployment, ImageInfo, Mode, RunReport, SideCapture, SideProvenance } from "../src/types.ts";
import { capture, clone } from "./support/captures.ts";

const ROOT = resolve(import.meta.dirname, "..");
/** A digest that is distinct per n, for any n below 256. */
const d = (n: number) => `sha256:${n.toString(16).padStart(2, "0").repeat(32)}`;
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-${name}-`));
const digestsOf = (n: number): Digests => Object.fromEntries(APPS.map((app, i) => [app, d(n + i)]));

function provenance(base: number, kind: ImageInfo["provenance"] = "pulled+verified"): SideProvenance {
  const images = Object.fromEntries(APPS.map((app, i) => [app, { ref: `quay.io/tutors-sdk/tutors-${app}:16.3.0-rc.4`, id: `sha256:${i}`, ...(kind === "built-from-ref" ? {} : { digest: d(base + i) }), provenance: kind }])) as SideProvenance["images"];
  return { summary: kind, images };
}

function sideWith(side: "a" | "b", tag: string, prov?: SideProvenance): SideCapture {
  const c = capture(side, { images: Object.fromEntries(APPS.map((app) => [app, `quay.io/tutors-sdk/tutors-${app}:${tag}`])) as SideCapture["images"] });
  return prov ? { ...c, provenance: prov } : c;
}

function compare(mode: Mode, o: { b?: SideCapture; a?: SideCapture; changed?: boolean; noise?: string; deployment?: Deployment; override?: { reason: string; by: string } } = {}) {
  const b = o.b ?? clone(capture("b"));
  if (o.changed) delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
  const outcome = compareFromCaptures({
    mode,
    substrate: "compose",
    captureDir: tmp("record-run"),
    a: o.a ?? capture("a"),
    b,
    claims: [],
    masksFile: DEFAULT_MASKS_FILE,
    noiseMaxAgeDays: 7,
    now: "2026-09-16T09:05:00.000Z",
    runs: 1,
    log: () => {},
    ...(o.noise ? { noise: o.noise } : {}),
    ...(o.deployment ? { deployment: o.deployment } : {}),
    ...(o.override ? { override: o.override } : {})
  });
  return { report: outcome.report, written: JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport, files: outcome.files };
}

function cleanNoise(): string {
  const dir = tmp("noise");
  writeFileSync(join(dir, "noise-status.json"), JSON.stringify({ schemaVersion: 1, ranAt: new Date().toISOString(), clean: true, hunks: 0 }));
  return dir;
}

/** A finished release-mode report for candidate 16.3.0-rc.4, its b side pulled and verified at digests d(10..). */
function releaseReport(o: { changed?: boolean; prov?: SideProvenance; override?: boolean } = {}): RunReport {
  const b = sideWith("b", "16.3.0-rc.4", o.prov ?? provenance(10));
  return compare("release", { a: sideWith("a", "16.2.0"), b, ...(o.changed ? { changed: true } : {}), noise: cleanNoise(), ...(o.override ? { override: { reason: "Rule 0044: payments hotfix, frame options restored in 16.3.1", by: "me" } } : {}) }).report;
}

describe("the release record: what release mode judged", () => {
  it("names the candidate, its release and production, and keeps the registry digest of every image that ran", () => {
    const made = releaseRecordOf(releaseReport(), { pinned: true, at: new Date("2026-09-16T09:10:00.000Z") });
    if (!("record" in made)) throw new Error(made.skipped);
    expect(made.record).toMatchObject({ schemaVersion: 1, candidate: "16.3.0-rc.4", release: "16.3.0", production: "16.2.0", recordedAt: "2026-09-16T09:10:00.000Z", verdict: "pass", overridden: false, pinned: true, verified: true, digests: digestsOf(10) });
  });

  it("an image that was not pulled and verified leaves no digest to vouch for, and says so", () => {
    const made = releaseRecordOf(releaseReport({ prov: provenance(10, "built-from-ref") }), { pinned: false });
    if (!("record" in made)) throw new Error(made.skipped);
    expect(made.record).toMatchObject({ verified: false, pinned: false, digests: {} });
    const unverified = releaseRecordOf(releaseReport({ prov: provenance(10, "pulled-unverified") }), { pinned: false });
    expect("record" in unverified && unverified.record.verified).toBe(false);
  });

  it("a candidate with no tag (a digest-only reference) cannot be named, so nothing is recorded", () => {
    const report = { ...releaseReport(), sides: { a: releaseReport().sides.a, b: Object.fromEntries(APPS.map((app) => [app, `quay.io/tutors-sdk/tutors-${app}@${d(1)}`])) as RunReport["sides"]["b"] } };
    expect(releaseRecordOf(report, { pinned: true })).toMatchObject({ skipped: expect.stringContaining("no tag") });
  });

  it("is written into the store and the run directory; the release's own name is only kept for a candidate that could ship", () => {
    const write = (report: RunReport) => {
      const made = releaseRecordOf(report, { pinned: true });
      if (!("record" in made)) throw new Error(made.skipped);
      const store = tmp("store");
      const outDir = tmp("out");
      writeReleaseRecord(made.record, { store, outDir, log: () => {} });
      return { store: readdirSync(store).sort(), outDir: readdirSync(outDir), made };
    };
    const pass = write(releaseReport());
    expect(pass.store).toEqual(["16.3.0-rc.4.json", "16.3.0.json"]);
    expect(pass.outDir).toEqual([RELEASE_RECORD_FILE]);

    // A FAIL: the record of that candidate exists (it was judged), but no release file claims it could ship.
    const failed = write(releaseReport({ changed: true }));
    expect(failed.made.record.verdict).toBe("fail");
    expect(shippable(failed.made.record)).toBe(false);
    expect(failed.store).toEqual(["16.3.0-rc.4.json"]);

    // The same FAIL, overridden by a person: it shipped, so it is the release's record.
    const overridden = write(releaseReport({ changed: true, override: true }));
    expect(overridden.made.record).toMatchObject({ verdict: "fail", overridden: true });
    expect(overridden.store).toEqual(["16.3.0-rc.4.json", "16.3.0.json"]);
  });

  it("the file it writes is valid against the schema in the contract, and parses back", () => {
    const made = releaseRecordOf(releaseReport(), { pinned: true });
    if (!("record" in made)) throw new Error(made.skipped);
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const validate = ajv.compile(JSON.parse(readFileSync(resolve(ROOT, "docs/contract/release-record.schema.json"), "utf8")));
    const text = JSON.stringify(made.record);
    expect(validate(JSON.parse(text)), JSON.stringify(validate.errors)).toBe(true);
    expect(parseReleaseRecord(text)).toEqual(made.record);
    expect(validate({ ...made.record, extra: 1 })).toBe(false);
    expect(validate({ ...made.record, digests: { reader: "sha256:abc" } })).toBe(false);
    expect(() => parseReleaseRecord(JSON.stringify({ ...made.record, extra: 1 }))).toThrow(/not a valid release record/);
    expect(() => parseReleaseRecord("{")).toThrow(/not valid JSON/);
    expect(releaseOf("16.3.0-rc.4")).toBe("16.3.0");
    expect(releaseOf("16.3.0")).toBe("16.3.0");
    expect(releaseOf("main")).toBe("main");
  });

  it("a tag names a file, so nothing that is not a tag is one", () => {
    for (const ok of ["16.3.0", "16.3.0-rc.4", "main", "sha-abc1234"]) expect(isTag(ok), ok).toBe(true);
    for (const bad of ["", "../x", "a/b", ".hidden", "a b", "x".repeat(129), "a\\b"]) expect(isTag(bad), bad).toBe(false);
  });
});

function store(record: ReleaseRecord | undefined, name = record?.candidate): { dir: string } {
  const dir = tmp("releases");
  if (record) writeFileSync(join(dir, `${name}.json`), JSON.stringify(record));
  return { dir };
}

function recordOf(over: Partial<ReleaseRecord> = {}): ReleaseRecord {
  const made = releaseRecordOf(releaseReport(), { pinned: true });
  if (!("record" in made)) throw new Error(made.skipped);
  return { ...made.record, ...over };
}

describe("finding the record: --release-record, else the store under HARNESS_HOME, nothing else", () => {
  it("a directory is searched for <tag>.json, a file is taken as it is", () => {
    const record = recordOf();
    const { dir } = store(record, "16.3.0");
    expect(findReleaseRecord("16.3.0", dir).record).toEqual(record);
    expect(findReleaseRecord("16.3.0", join(dir, "16.3.0.json")).record).toEqual(record);
  });

  it("without --release-record it reads <HARNESS_HOME>/releases, and only there", () => {
    const home = tmp("home");
    mkdirSync(releasesDir(home), { recursive: true });
    expect(findReleaseRecord("16.3.0", undefined, home)).toMatchObject({ file: join(releasesDir(home), "16.3.0.json"), problem: expect.stringContaining("no release record at") });
    writeFileSync(join(releasesDir(home), "16.3.0.json"), JSON.stringify(recordOf()));
    expect(findReleaseRecord("16.3.0", undefined, home).record?.candidate).toBe("16.3.0-rc.4");
    // an explicit path wins, and an empty one is not quietly replaced by the store
    const empty = tmp("empty");
    expect(findReleaseRecord("16.3.0", empty, home).record).toBeUndefined();
  });

  it("a record of another release, an empty file and a malformed one are problems, not crashes", () => {
    const wrong = store(recordOf({ candidate: "16.4.0-rc.1", release: "16.4.0" }), "16.3.0");
    expect(findReleaseRecord("16.3.0", wrong.dir).problem).toMatch(/is the record of 16\.4\.0-rc\.1 \(release 16\.4\.0\), not of 16\.3\.0/);
    const empty = tmp("empty");
    writeFileSync(join(empty, "16.3.0.json"), "  ");
    expect(findReleaseRecord("16.3.0", empty).problem).toMatch(/is empty/);
    const bad = tmp("bad");
    writeFileSync(join(bad, "16.3.0.json"), JSON.stringify({ candidate: "x" }));
    expect(findReleaseRecord("16.3.0", bad).problem).toMatch(/is not a valid release record/);
  });

  it("a candidate's own tag finds its record too (a candidate that was deployed as it was)", () => {
    const { dir } = store(recordOf());
    expect(findReleaseRecord("16.3.0-rc.4", dir).record?.candidate).toBe("16.3.0-rc.4");
  });
});

describe("judging a deployment against the record", () => {
  const found = (record?: ReleaseRecord) => ({ file: "releases/16.3.0.json", ...(record ? { record } : { problem: "no release record at releases/16.3.0.json" }) });

  it("A/A: what was judged is what runs, so there is nothing to say", () => {
    const judged = judgeDeployment({ production: "16.3.0", digests: digestsOf(10), found: found(recordOf()) });
    expect(judged).toMatchObject({ status: "match", problems: [], recorded: digestsOf(10), record: { candidate: "16.3.0-rc.4", verdict: "pass" } });
  });

  it("planted: one app at another digest is `differs`, and names the app, both digests and the candidate", () => {
    const deployed = { ...digestsOf(10), catalogue: d(9) };
    const judged = judgeDeployment({ production: "16.3.0", digests: deployed, found: found(recordOf()) });
    expect(judged.status).toBe("differs");
    expect(judged.problems).toEqual([`catalogue: deployed ${d(9)}, but release mode judged ${d(11)} (16.3.0-rc.4)`]);
  });

  it("planted: no record, or a deploy that reports no digests, cannot be confirmed and says why", () => {
    expect(judgeDeployment({ production: "16.3.0", digests: digestsOf(10), found: found() })).toMatchObject({ status: "no-record", problems: [expect.stringContaining("no release record for 16.3.0")] });
    expect(judgeDeployment({ production: "16.3.0", digests: digestsOf(10) })).toMatchObject({ status: "no-record", problems: [expect.stringContaining("none was looked for")] });
    expect(judgeDeployment({ production: "16.3.0", digests: {}, found: found(recordOf()) })).toMatchObject({ status: "not-reported", problems: [expect.stringContaining("no image digests")] });
  });

  it("planted: an app with a digest on one side only is `incomplete`; a differing app still outranks it", () => {
    const [first, ...rest] = APPS;
    const partialDeploy = Object.fromEntries(rest.map((app) => [app, digestsOf(10)[app]]));
    const missingOnDeploy = judgeDeployment({ production: "16.3.0", digests: partialDeploy, found: found(recordOf()) });
    expect(missingOnDeploy.status).toBe("incomplete");
    expect(missingOnDeploy.problems).toEqual([`${first}: the release record has a digest (${d(10)}), but the deploy did not report one`]);

    const unverifiedRecord = recordOf({ verified: false, digests: {} });
    const missingInRecord = judgeDeployment({ production: "16.3.0", digests: digestsOf(10), found: found(unverifiedRecord) });
    expect(missingInRecord.status).toBe("incomplete");
    expect(missingInRecord.problems[0]).toContain("was not pulled and verified from a registry");

    const both = judgeDeployment({ production: "16.3.0", digests: { ...partialDeploy, [rest[0]!]: d(9) }, found: found(recordOf()) });
    expect(both.status).toBe("differs");
    expect(both.problems).toHaveLength(2);
  });

  it("must not flag: the order the digests were sent in, an app the deploy leaves out of both, or a record from a FAIL that shipped", () => {
    const reversed = Object.fromEntries(Object.entries(digestsOf(10)).reverse());
    expect(judgeDeployment({ production: "16.3.0", digests: reversed, found: found(recordOf()) }).status).toBe("match");
    const oneApp = { [APPS[0]]: d(10) };
    expect(judgeDeployment({ production: "16.3.0", digests: oneApp, found: found(recordOf({ digests: oneApp })) }).status).toBe("match");
    expect(judgeDeployment({ production: "16.3.0", digests: digestsOf(10), found: found(recordOf({ verdict: "fail", overridden: true })) }).status).toBe("match");
  });
});

describe("through the pipeline: post-deploy mode with a deployment", () => {
  const deployment = (status: "match" | "differs") => judgeDeployment({ production: "16.3.0", digests: status === "match" ? digestsOf(10) : { ...digestsOf(10), live: d(9) }, found: { file: "f", record: recordOf() } });

  it("A/A: a matching deployment leaves a clean post-deploy run a PASS, with the deployment in the report and nothing loud", () => {
    const { report, written, files } = compare("post-deploy", { deployment: deployment("match") });
    expect(report.verdict).toBe("pass");
    expect(written.deployment?.status).toBe("match");
    expect(report.reasons.some((r) => /DEPLOYED IMAGES/.test(r))).toBe(false);
    expect(readFileSync(files.md, "utf8")).not.toMatch(/NOT the ones release mode judged/);
  });

  it("planted: images that are not the ones judged turn a PASS into a WARN, first among the reasons, exit 0, loud in both reports", () => {
    const { report, files } = compare("post-deploy", { deployment: deployment("differs") });
    expect(report.verdict).toBe("warn");
    expect(exitCodeForReport(report)).toBe(0);
    expect(report.reasons[0]).toContain(`DEPLOYED IMAGES DIFFER from what release mode judged (advisory, never a FAIL): live: deployed ${d(9)}, but release mode judged ${digestsOf(10).live} (16.3.0-rc.4)`);
    const md = readFileSync(files.md, "utf8");
    expect(md).toContain("The deployed images are NOT the ones release mode judged (16.3.0-rc.4)");
    expect(md).toContain("### Deployment 16.3.0: differs");
    const html = readFileSync(files.html, "utf8");
    expect(html).toContain("The deployed images are NOT the ones release mode judged");
    expect(renderMarkdown(report)).toBe(md);
    expect(renderHtml(report)).toBe(html);
  });

  it("planted: no record and no digests are a WARN too, worded as not confirmed rather than as a difference", () => {
    const none = judgeDeployment({ production: "16.3.0", digests: digestsOf(10), found: { file: "f", problem: "no release record at f" } });
    const { report } = compare("post-deploy", { deployment: none });
    expect(report.verdict).toBe("warn");
    expect(report.reasons[0]).toMatch(/^DEPLOYED IMAGES NOT CONFIRMED against what release mode judged/);
  });

  it("must not flag: a real FAIL stays a FAIL (and exits 1), and a deployment problem does not soften or duplicate it", () => {
    const failing = compare("post-deploy", { changed: true, noise: cleanNoise(), deployment: deployment("differs") });
    expect(failing.report.verdict).toBe("fail");
    expect(exitCodeForReport(failing.report)).toBe(1);
    expect(failing.report.reasons.filter((r) => /DEPLOYED IMAGES/.test(r))).toHaveLength(1);
  });

  it("must not flag: no deployment at all is a 1.2.0 report, without the field", () => {
    const { written } = compare("post-deploy");
    expect(written).not.toHaveProperty("deployment");
    expect(compare("release").written).not.toHaveProperty("deployment");
  });
});
