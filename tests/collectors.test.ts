import { describe, expect, it } from "vitest";
import { schemaHash, stripOrigins } from "../src/collectors/browser.ts";
import { summariseLogs } from "../src/collectors/logs.ts";
import { parseMetrics } from "../src/collectors/metrics.ts";
import { sideSpec } from "../src/stack.ts";

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
  it("replaces each of the side's origins and nothing else", () => {
    const spec = sideSpec("a", { reader: "r", catalogue: "c", live: "l" });
    const text = `${spec.urls.reader}/course/x ${spec.urls.live}/ http://localhost:8080/tutors.json`;
    expect(stripOrigins(text, spec)).toBe("{{origin}}/course/x {{origin}}/ http://localhost:8080/tutors.json");
  });
});
