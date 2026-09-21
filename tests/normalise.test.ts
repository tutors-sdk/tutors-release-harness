import { describe, expect, it } from "vitest";
import { DEFAULT_MASKS_FILE, MasksFileSchema, loadMasks, normalise } from "../src/normalise/masks.ts";
import { capture } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);

describe("masks.yaml", () => {
  it("loads, and every mask has a reason a reviewer can weigh", () => {
    expect(masks.masks.length).toBeGreaterThan(0);
    for (const m of masks.masks) expect(m.reason.length).toBeGreaterThanOrEqual(20);
  });

  it("rejects a mask without a reason (negative fixture)", () => {
    const bad = { ...masks, masks: [{ id: "no-reason", artefact: "headers", header: "date", reason: "noise" }] };
    expect(MasksFileSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a mask that hides nothing in particular (negative fixture)", () => {
    const bad = { ...masks, masks: [{ id: "vague", artefact: "headers", reason: "this mask exists because reasons and more reasons" }] };
    expect(MasksFileSchema.safeParse(bad).success).toBe(false);
  });
});

describe("normalise", () => {
  it("drops masked headers and counts the hit", () => {
    const { capture: out, hits } = normalise(capture("a"), masks);
    const headers = out.journeys[0]!.pages[0]!.headers;
    expect(headers).not.toHaveProperty("date");
    expect(headers).not.toHaveProperty("x-request-id");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(hits["response-date"]).toBe(1);
    expect(hits["request-id"]).toBe(1);
  });

  it("drops runtime metric series but keeps the app's own", () => {
    const { capture: out, hits } = normalise(capture("a"), masks);
    expect(out.metrics.after.reader!.series).not.toHaveProperty("process_cpu_seconds_total");
    expect(out.metrics.after.reader!.series).toHaveProperty("http_requests_total");
    expect(hits["metrics-process"]).toBe(2);
  });

  it("drops third-party requests but keeps the fixture course's", () => {
    const input = capture("a");
    input.journeys[0]!.pages[0]!.network.push({ method: "GET", url: "https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.min.css", status: 200, contentType: "text/css", cacheControl: "", schemaHash: "" });
    const { capture: out, hits } = normalise(input, masks);
    const urls = out.journeys[0]!.pages[0]!.network.map((n) => n.url);
    expect(urls).toEqual(["{{origin}}/course/localhost:8080", "http://localhost:8080/tutors.json"]);
    expect(hits["third-party-requests"]).toBe(1);
  });

  it("drops the signed-in reader's timer-driven calls to the persistence stub, and nothing the reader itself serves", () => {
    const input = capture("a");
    const entry = (url: string) => ({ method: "POST", url, status: 201, contentType: "application/json", cacheControl: "", schemaHash: "abc" });
    input.journeys[0]!.pages[0]!.network.push(
      entry("{{origin}}/rest/v1/rpc/get_count_learning_records"),
      entry("{{origin}}/rest/v1/tutors-connect-latest?on_conflict=course_id%2Cstudent_id"),
      entry("{{origin}}/realtime/v1/websocket?apikey=k"),
      entry("{{origin}}/auth/v1/user"),
      entry("{{origin}}/auth/localhost:8080/__data.json?x-sveltekit-invalidated=10"),
      entry("{{origin}}/course/restaurant/v1/notes")
    );
    const { capture: out, hits } = normalise(input, masks);
    const urls = out.journeys[0]!.pages[0]!.network.map((n) => n.url);
    expect(urls).toContain("{{origin}}/auth/localhost:8080/__data.json?x-sveltekit-invalidated=10");
    expect(urls).toContain("{{origin}}/course/restaurant/v1/notes");
    expect(urls.filter((u) => /\/(rest|realtime|auth)\/v1\//.test(u))).toEqual([]);
    expect(hits["persistence-stub-requests"]).toBe(4);
  });

  it("removes log keys named by a mask from the key set", () => {
    const withKey = { ...masks, masks: [{ id: "log-time", artefact: ["logs" as const], key: "time", reason: "test-only mask to prove log key masking works" }] };
    const { capture: out, hits } = normalise(capture("a"), withKey);
    expect(out.logs.reader!.keys).not.toContain("time");
    expect(out.logs.reader!.keys).toContain("requestId");
    expect(hits["log-time"]).toBe(1);
  });

  it("keeps the asset name and drops the hash ($1 in replace)", () => {
    const input = capture("a");
    input.journeys[0]!.pages[0]!.network.push(
      { method: "GET", url: "{{origin}}/_app/immutable/assets/0.IqN_BvhY.css", status: 200, contentType: "text/css", cacheControl: "", schemaHash: "" },
      { method: "GET", url: "{{origin}}/_app/immutable/chunks/B1n-O3K0.js", status: 200, contentType: "text/javascript", cacheControl: "", schemaHash: "" },
      { method: "GET", url: "{{origin}}/_app/immutable/entry/start.CkQ9dBEs.js", status: 200, contentType: "text/javascript", cacheControl: "", schemaHash: "" }
    );
    const { capture: out, hits } = normalise(input, masks, "release");
    const urls = out.journeys[0]!.pages[0]!.network.map((n) => n.url);
    expect(urls).toContain("{{origin}}/_app/immutable/assets/0.{{hash}}.css");
    expect(urls).toContain("{{origin}}/_app/immutable/chunks/{{hash}}.js");
    expect(urls).toContain("{{origin}}/_app/immutable/entry/start.{{hash}}.js");
    expect(hits["hashed-assets"]).toBe(3);
  });

  it("rewrites hashed asset names inside header values too", () => {
    const input = capture("a");
    input.journeys[0]!.pages[0]!.headers.link = '<../_app/immutable/assets/0.IqN_BvhY.css>; rel="preload"; as="style"';
    const { capture: out } = normalise(input, masks, "release");
    expect(out.journeys[0]!.pages[0]!.headers.link).toBe('<../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"');
  });

  it("applies mode-scoped masks only in their modes", () => {
    const input = capture("a");
    input.journeys[0]!.pages[0]!.headers.age = "0";
    input.journeys[0]!.pages[0]!.headers["content-length"] = "912";
    const release = normalise(input, masks, "release").capture.journeys[0]!.pages[0]!.headers;
    expect(release).toHaveProperty("age");
    expect(release).not.toHaveProperty("content-length");
    const post = normalise(input, masks, "post-deploy");
    expect(post.capture.journeys[0]!.pages[0]!.headers).not.toHaveProperty("age");
    expect(post.hits["cdn-age"]).toBe(1);
    expect(normalise(input, masks, "release").hits).not.toHaveProperty("cdn-age");
  });

  it("rejects drop on anything but a network pattern (negative fixture)", () => {
    const bad = { ...masks, masks: [{ id: "bad-drop", artefact: "dom", pattern: "x", drop: true, reason: "drop is only meaningful for requests" }] };
    expect(MasksFileSchema.safeParse(bad).success).toBe(false);
  });

  it("reports zero for masks that did not fire, so silent masks are visible", () => {
    const { hits } = normalise(capture("a"), masks);
    expect(hits["etag"]).toBe(0);
  });

  it("is pure: the input capture is untouched", () => {
    const input = capture("a");
    const before = JSON.stringify(input);
    normalise(input, masks);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("applies a dom pattern mask", () => {
    const withPattern = { ...masks, masks: [{ id: "course-title", artefact: ["dom" as const], pattern: "Runway Fixture Course", replace: "{{title}}", reason: "test-only mask to prove pattern replacement works" }] };
    const { capture: out, hits } = normalise(capture("a"), withPattern);
    expect(out.journeys[0]!.pages[0]!.aria).toContain("{{title}}");
    expect(hits["course-title"]).toBe(1);
  });
});
