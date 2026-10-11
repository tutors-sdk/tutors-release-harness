/**
 * Service level objectives (since 1.34.0, tutors-sdk/tutors-mono-repo#170): b judged against the absolute targets of the
 * monorepo's release/slo.yaml, from each app's /metrics SLI and the k6 leg. Informing until 2.0: reported, never gates.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { summariseK6 } from "../src/collectors/load.ts";
import { parseMetrics } from "../src/collectors/metrics.ts";
import { InputFileError } from "../src/claims/input-error.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { ENGINE_LEVELS } from "../src/compare/levels.ts";
import { SLO_MIN_REQUESTS, slo } from "../src/compare/slo.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import { loadSlo, parseSlo, type SloFile } from "../src/slo/schema.ts";
import type { LoadSummary, RequestSli, SideCapture } from "../src/types.ts";
import { capture } from "./support/captures.ts";

const FILE = parseSlo(
  [
    "window: 28d",
    "objectives:",
    "  - { id: reader-availability, app: reader, kind: availability, target: 0.995 }",
    "  - { id: reader-latency, app: reader, kind: latency, threshold: 1, target: 0.95 }",
    "  - { id: catalogue-latency, app: catalogue, kind: latency, threshold: 1, target: 0.95 }"
  ].join("\n"),
  "slo.yaml"
);

/** An app's SLI after the journeys: `requests`, of which `errors` are 5xx and `fast` took 1s or less. */
const sli = (requests: number, errors = 0, fast = requests): RequestSli => ({ requests, serverErrors: errors, buckets: { "0.5": Math.min(fast, requests), "1": fast, "2.5": requests, "+Inf": requests } });
const zero: RequestSli = { requests: 0, serverErrors: 0, buckets: {} };

function side(name: "a" | "b", reader: RequestSli, catalogue: RequestSli = sli(200), load?: LoadSummary): SideCapture {
  return capture(name, {
    metrics: {
      before: { reader: { series: {}, sli: zero }, catalogue: { series: {}, sli: zero } },
      after: { reader: { series: {}, sli: reader }, catalogue: { series: {}, sli: catalogue } }
    },
    ...(load ? { load } : {})
  });
}

const k6 = (samples: number[], serverErrors = 0): LoadSummary => ({ requests: samples.length, failed: serverErrors, serverErrors, samples, p50: 0, p95: 0, p99: 0, rate: 20, duration: "30s" });
const fails = (hunks: ReturnType<typeof slo>) => hunks.filter((h) => h.severity === "fail");

describe("the SLO file", () => {
  it("reads the objectives the monorepo keeps", () => {
    expect(FILE.window).toBe("28d");
    expect(FILE.objectives.map((o) => o.id)).toEqual(["reader-availability", "reader-latency", "catalogue-latency"]);
  });

  it("refuses what it cannot judge, naming each objective and field", () => {
    const bad = (body: string) => () => parseSlo(`window: 28d\nobjectives:\n${body}`, "slo.yaml");
    expect(bad("  - { id: x, app: reader, kind: latency, threshold: 0.75, target: 0.95 }")).toThrow(/objective 1, threshold: threshold must be a bucket bound/);
    expect(bad("  - { id: x, app: reader, kind: latency, target: 0.95 }")).toThrow(/objective 1, threshold: a latency objective needs threshold/);
    expect(bad("  - { id: x, app: reader, kind: availability, target: 1 }")).toThrow(/target is a share under 1/);
    expect(bad("  - { id: x, app: website, kind: availability, target: 0.99 }")).toThrow(/objective 1, app/);
    expect(bad("  - { id: x, app: reader, kind: availability, target: 0.99 }\n  - { id: x, app: live, kind: availability, target: 0.99 }")).toThrow(/objective "x", id: is used twice/);
    expect(() => parseSlo("window: [", "slo.yaml")).toThrow(/not valid YAML/);
    expect(() => loadSlo(join(mkdtempSync(join(tmpdir(), "slo-")), "missing.yaml"))).toThrow(InputFileError);
  });
});

describe("the request SLIs a capture keeps", () => {
  it("reads 5xx and the latency buckets from the labelled series the summed ones drop", () => {
    const text = [
      'http_requests_total{method="GET",route="/",status_code="200"} 90',
      'http_requests_total{method="GET",route="/x",status_code="500"} 3',
      'http_requests_total{method="GET",route="/y",status_code="404"} 7',
      'http_request_duration_seconds_bucket{method="GET",route="/",status_code="200",le="1"} 80',
      'http_request_duration_seconds_bucket{method="GET",route="/x",status_code="500",le="1"} 3',
      'http_request_duration_seconds_bucket{method="GET",route="/",status_code="200",le="+Inf"} 90',
      'http_request_duration_seconds_bucket{method="GET",route="/x",status_code="500",le="+Inf"} 3'
    ].join("\n");
    const snap = parseMetrics(text);
    expect(snap.series.http_requests_total).toBe(100);
    expect(snap.sli).toEqual({ requests: 100, serverErrors: 3, buckets: { "1": 83, "+Inf": 93 } });
  });

  it("an app that exports neither keeps no sli, so a snapshot is what it was before 1.34.0", () => {
    expect(parseMetrics("process_cpu_seconds_total 1")).toEqual({ series: { process_cpu_seconds_total: 1 } });
  });

  it("the k6 leg keeps p99", () => {
    const lines = Array.from({ length: 100 }, (_, i) => JSON.stringify({ type: "Point", metric: "http_req_duration", data: { value: i + 1, tags: { status: "200" } } })).join("\n");
    expect(summariseK6(lines, 20, "5s")).toMatchObject({ p95: 96, p99: 100 });
  });
});

describe("the slo engine", () => {
  it("ships informing with no date", () => {
    expect(ENGINE_LEVELS.slo).toEqual({ level: "informing" });
  });

  it("A/A: both sides meet every objective, so nothing fails and each objective says it holds", () => {
    const hunks = slo(side("a", sli(400)), side("b", sli(400)), FILE);
    expect(fails(hunks)).toEqual([]);
    expect(hunks.map((h) => h.scope)).toEqual(["reader-availability", "reader-latency", "catalogue-latency"]);
    expect(hunks.every((h) => h.summary.endsWith(": holds"))).toBe(true);
  });

  it("planted: a candidate that answers 2% of requests with 5xx misses availability, new on b", () => {
    const [h] = fails(slo(side("a", sli(400)), side("b", sli(400, 8)), FILE));
    expect(h).toMatchObject({ artefact: "slo", scope: "reader-availability", severity: "fail" });
    expect(h!.summary).toBe("reader-availability: 98.0% of 400 reader requests not 5xx on b (its /metrics across the journeys), objective 99.50%; production 100.0%: missed (new on b)");
  });

  it("a production that misses too is said so, which no diff can show", () => {
    const [h] = fails(slo(side("a", sli(400, 0, 300)), side("b", sli(400, 0, 310)), FILE));
    expect(h!.scope).toBe("reader-latency");
    expect(h!.summary).toMatch(/77\.5% of 400 reader requests under 1s on b .*objective 95\.0%; production 75\.0%: missed \(production too\)$/);
  });

  it("must not flag: b slower than a, still inside the objective (timing's question, not this one's)", () => {
    expect(fails(slo(side("a", sli(400, 0, 400)), side("b", sli(400, 0, 385)), FILE))).toEqual([]);
  });

  it("the k6 leg is judged on its own, for the reader", () => {
    const fast = Array.from({ length: 200 }, () => 120);
    const slow = Array.from({ length: 200 }, (_, i) => (i < 30 ? 1400 : 120));
    const hunks = slo(side("a", sli(400), sli(200), k6(fast)), side("b", sli(400), sli(200), k6(slow)), FILE);
    expect(fails(hunks).map((h) => h.scope)).toEqual(["reader-latency/load"]);
    expect(fails(hunks)[0]!.summary).toContain("85.0% of 200 reader requests under 1s on b (the k6 load leg)");
    expect(hunks.map((h) => h.scope)).toContain("reader-availability/load");
    expect(hunks.map((h) => h.scope)).not.toContain("catalogue-latency/load");
  });

  it("cannot judge: too few requests, or an app that exports no SLI, is not-evaluated and never a finding", () => {
    const thin = slo(side("a", sli(SLO_MIN_REQUESTS - 1, 5)), side("b", sli(SLO_MIN_REQUESTS - 1, 5)), FILE);
    expect(fails(thin)).toEqual([]);
    expect(thin.find((h) => h.scope === "reader-availability/not-evaluated")!.summary).toContain(`fewer than ${SLO_MIN_REQUESTS}`);
    const b = side("b", sli(400));
    delete b.metrics.after.catalogue!.sli;
    expect(slo(side("a", sli(400)), b, FILE).find((h) => h.scope === "catalogue-latency/not-evaluated")!.summary).toBe("catalogue-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for catalogue");
  });

  it("without an SLO file, or against an external side, it writes nothing", () => {
    expect(slo(side("a", sli(400)), side("b", sli(400, 100)), undefined)).toEqual([]);
    expect(slo(side("a", sli(400)), { ...side("b", sli(400, 100)), external: true }, FILE)).toEqual([]);
  });

  it("through a run: the miss is reported as informing and the verdict does not move", () => {
    const masks = loadMasks(DEFAULT_MASKS_FILE);
    const a = side("a", sli(400));
    const b = side("b", sli(400, 40));
    expect(compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks).filter((h) => h.artefact === "slo")).toEqual([]);
    const dir = mkdtempSync(join(tmpdir(), "slo-run-"));
    const run = (file?: SloFile) => compareFromCaptures({ mode: "release", substrate: "compose", captureDir: dir, a, b, claims: [], ...(file ? { slo: file } : {}), masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-11T00:00:00.000Z", runs: 1, log: () => {} });
    const without = run();
    const withSlo = run(FILE);
    expect(withSlo.report.verdict).toBe(without.report.verdict);
    const miss = withSlo.report.compare.hunks.find((h) => h.scope === "reader-availability")!;
    expect(miss).toMatchObject({ severity: "info", level: "informing" });
    expect(withSlo.report.compare.unclaimed.filter((h) => h.artefact === "slo")).toEqual([]);
  });
});
