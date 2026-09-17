import { describe, expect, it } from "vitest";
import { schemaHash, stripOrigins } from "../src/collectors/browser.ts";
import { summariseK6 } from "../src/collectors/load.ts";
import { summariseLogs } from "../src/collectors/logs.ts";
import { parseMetrics } from "../src/collectors/metrics.ts";
import { judgeUpgrade, summariseUpgrade } from "../src/modes/upgrade.ts";
import { externalSide, sideSpec } from "../src/stack.ts";

describe("metrics parser", () => {
  it("sums a series over its label sets and ignores comments", () => {
    const text = `# HELP http_requests_total Total requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",status="200"} 12\nhttp_requests_total{method="GET",status="404"} 3\nprocess_start_time_seconds 1.7e9\n`;
    expect(parseMetrics(text).series).toEqual({ http_requests_total: 15, process_start_time_seconds: 1.7e9 });
  });

  it("tolerates an empty body", () => {
    expect(parseMetrics("").series).toEqual({});
  });
});

describe("log summariser", () => {
  it("counts levels, collects keys and measures request-id propagation", () => {
    const raw = [
      JSON.stringify({ level: "info", message: "request", requestId: "a", time: 1 }),
      JSON.stringify({ level: "info", message: "request", requestId: "b", time: 2 }),
      JSON.stringify({ level: "warn", message: "no id", time: 3 }),
      "plain text line the runtime printed"
    ].join("\n");
    expect(summariseLogs(raw)).toEqual({ lines: 4, jsonLines: 3, byLevel: { info: 2, warn: 1 }, keys: ["level", "message", "requestId", "time"], requestIdRatio: 0.667 });
  });
});

describe("schema hash", () => {
  it("ignores values, respects shape", () => {
    expect(schemaHash({ a: 1, b: ["x"] })).toBe(schemaHash({ b: ["y"], a: 2 }));
    expect(schemaHash({ a: 1 })).not.toBe(schemaHash({ a: "1" }));
    expect(schemaHash({ a: 1 })).not.toBe(schemaHash({ a: 1, c: null }));
  });
});

describe("origin stripping", () => {
  it("replaces each of the side's origins and the course host, and nothing else", () => {
    const spec = sideSpec("a", { reader: "r", catalogue: "c", live: "l" });
    const text = `${spec.urls.reader}/course/x ${spec.urls.live}/ ${spec.urls.readerAuth}/auth ${spec.urls.persistence}/rest/v1/t http://localhost:8080/tutors.json https://cdn.example/x`;
    expect(stripOrigins(text, spec)).toBe("{{origin}}/course/x {{origin}}/ {{origin}}/auth {{origin}}/rest/v1/t {{course}}/tutors.json https://cdn.example/x");
  });

  it("normalises the reference course host the same way on a harness side and an external side", () => {
    const local = sideSpec("a", { reader: "r", catalogue: "c", live: "l" });
    const live = externalSide("b", "reader=https://tutors.dev,catalogue=https://c,live=https://l", "reference-course");
    const url = "https://reference-course.netlify.app/topic-01/topic.png";
    expect(stripOrigins(url, local)).toBe("{{course}}/topic-01/topic.png");
    expect(stripOrigins(url, live)).toBe("{{course}}/topic-01/topic.png");
  });
});

describe("k6 summary", () => {
  const line = (metric: string, value: number, tags: Record<string, string> = {}) => JSON.stringify({ type: "Point", metric, data: { time: "t", value, tags } });
  it("collects durations, failures and 5xx from the JSON lines output", () => {
    const text = [
      JSON.stringify({ type: "Metric", metric: "http_req_duration", data: {} }),
      line("http_req_duration", 10, { status: "200" }),
      line("http_req_duration", 30, { status: "200" }),
      line("http_req_duration", 500, { status: "503" }),
      line("http_req_failed", 1, { status: "503" }),
      line("http_req_failed", 0, { status: "200" }),
      "not json"
    ].join("\n");
    const summary = summariseK6(text, 20, "20s");
    expect(summary).toMatchObject({ requests: 3, failed: 1, serverErrors: 1, p50: 30, p95: 500, rate: 20, duration: "20s" });
    expect(summary.samples).toEqual([10, 30, 500]);
  });

  it("subsamples long runs", () => {
    const text = Array.from({ length: 10_000 }, (_, i) => line("http_req_duration", i, { status: "200" })).join("\n");
    expect(summariseK6(text, 20, "20s", 1000).samples.length).toBeLessThanOrEqual(1000);
  });
});

describe("upgrade summary", () => {
  const line = (metric: string, value: number, tags: Record<string, string>) => JSON.stringify({ type: "Point", metric, data: { time: "t", value, tags } });
  it("attributes every request to the upstream that answered and judges the rollout", () => {
    const text = [
      line("edge_req_duration", 10, { upstream: "a", status: "200" }),
      line("edge_req_duration", 12, { upstream: "b", status: "200" }),
      line("edge_req_duration", 0, { upstream: "b", status: "502" }),
      line("edge_req_failed", 1, { upstream: "b", status: "502" })
    ].join("\n");
    const result = summariseUpgrade(text, 15_000, 45_000);
    expect(result.byUpstream.a).toMatchObject({ requests: 1, failed: 0, serverErrors: 0 });
    expect(result.byUpstream.b).toMatchObject({ requests: 2, failed: 1, serverErrors: 1 });
    const hunks = judgeUpgrade(result);
    expect(hunks.map((h) => [h.artefact, h.severity])).toEqual([["upgrade", "fail"]]);
    expect(hunks[0]!.summary).toContain("via b");
  });

  it("a clean rollout is informational, a rollout b never served is a failure", () => {
    const clean = summariseUpgrade([line("edge_req_duration", 10, { upstream: "a", status: "200" }), line("edge_req_duration", 11, { upstream: "b", status: "200" })].join("\n"), 1, 2);
    expect(judgeUpgrade(clean).every((h) => h.severity === "info")).toBe(true);
    // On kind the kubelet switches pods; nothing attributes requests to a side, so "b never served" does not apply.
    const kind = { ...summariseUpgrade(line("edge_req_duration", 10, { upstream: "direct", status: "200" }), 1, 2), substrate: "kind" as const };
    expect(judgeUpgrade(kind).every((h) => h.severity === "info")).toBe(true);
    const onlyA = summariseUpgrade(line("edge_req_duration", 10, { upstream: "a", status: "200" }), 1, 2);
    expect(judgeUpgrade(onlyA).some((h) => h.severity === "fail" && h.scope === "b")).toBe(true);
    expect(judgeUpgrade(summariseUpgrade("", 1, 2))[0]!.summary).toMatch(/no requests/);
  });
});
