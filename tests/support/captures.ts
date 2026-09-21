import type { JourneyCapture, PageCapture, SideCapture, SideName } from "../../src/types.ts";

/** A small, fully deterministic capture that two sides can share and tests can mutate. */
export function page(overrides: Partial<PageCapture> = {}): PageCapture {
  return {
    pageKey: "reader:course",
    path: "/course/localhost:8080",
    aria: ["- banner:", '  - heading "Runway Fixture Course" [level=1]', "- main:", '  - link "Topic 1"', "- contentinfo:"].join("\n"),
    headers: {
      "content-type": "text/html",
      "x-frame-options": "SAMEORIGIN",
      "x-content-type-options": "nosniff",
      date: "Wed, 16 Sep 2026 09:05:00 GMT",
      "x-request-id": "abc-123"
    },
    network: [
      { method: "GET", url: "{{origin}}/course/localhost:8080", status: 200, contentType: "text/html", cacheControl: "", schemaHash: "" },
      { method: "GET", url: "http://localhost:8080/tutors.json", status: 200, contentType: "application/json", cacheControl: "no-store", schemaHash: "deadbeef" }
    ],
    console: [],
    axe: [{ rule: "button-name", impact: "critical", target: "#dialog-trigger" }],
    focus: ['a "Skip to content"', 'button "Open course tree"', 'a "Topic 1"'],
    timing: { ttfbMs: 40, responseEndMs: 60 },
    ...overrides
  };
}

export function journey(overrides: Partial<JourneyCapture> = {}): JourneyCapture {
  return { journey: "anonymous-student-reads-course", run: 1, anonymous: true, durationMs: 4000, pages: [page()], persistence: [], ...overrides };
}

export function capture(side: SideName, overrides: Partial<SideCapture> = {}): SideCapture {
  return {
    side,
    images: { reader: `tutors/reader:${side}`, catalogue: `tutors/catalogue:${side}`, live: `tutors/live:${side}`, time: `tutors/time:${side}` },
    capturedAt: "2026-09-16T09:05:00.000Z",
    journeys: [journey()],
    metrics: {
      before: { reader: { series: { http_requests_total: 10, process_cpu_seconds_total: 1.5, tutors_course_loads_total: 0 } } },
      after: { reader: { series: { http_requests_total: 22, process_cpu_seconds_total: 2.75, tutors_course_loads_total: 1 } } }
    },
    logs: { reader: { lines: 30, jsonLines: 30, byLevel: { info: 28, warn: 2 }, keys: ["level", "message", "requestId", "time"], requestIdRatio: 0.9 } },
    ...overrides
  };
}

/** Deep-clone so a test can mutate one side without touching the other. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
