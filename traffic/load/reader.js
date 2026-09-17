// k6 load against one reader: a fixed arrival rate for a fixed window.
//
// Used by two modes:
//   timing  — run once per side (harness run --load); every request's duration
//             is exported (--out json) and compared with Mann–Whitney U.
//   upgrade — run against the edge proxy while the candidate is rolled in;
//             any failed or 5xx request is a finding. The edge tags every
//             response with x-harness-upstream, recorded here as the
//             `upstream` tag on the edge_* metrics so a failure names its side.
//
// Environment: BASE (required), COURSE (course id), RATE (req/s), DURATION.
import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE;
const COURSE = __ENV.COURSE || "localhost:8080";
const RATE = Number(__ENV.RATE || 20);
const DURATION = __ENV.DURATION || "20s";

const edgeDuration = new Trend("edge_req_duration", true);
const edgeFailed = new Rate("edge_req_failed");

export const options = {
  scenarios: {
    steady: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: Math.max(5, RATE),
      maxVUs: RATE * 4
    }
  },
  // Thresholds are informational here; the harness judges the exported samples.
  thresholds: { http_req_failed: ["rate<1"] },
  summaryTrendStats: ["avg", "med", "p(90)", "p(95)", "p(99)", "max"]
};

const PAGES = ["/", `/course/${COURSE}`, "/healthz/live"];

export default function () {
  const path = PAGES[__ITER % PAGES.length];
  const page = path === "/" ? "home" : path.startsWith("/course") ? "course" : "healthz";
  const res = http.get(`${BASE}${path}`, { tags: { page } });
  const ok = res.status > 0 && res.status < 500;
  check(res, { "status < 500": () => ok });
  const upstream = res.headers["X-Harness-Upstream"] || "direct";
  edgeDuration.add(res.timings.duration, { upstream, status: String(res.status), page });
  edgeFailed.add(!ok, { upstream, status: String(res.status), page });
}
