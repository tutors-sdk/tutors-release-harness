import { describe, expect, it } from "vitest";
import { courseSites } from "../src/collectors/browser.ts";
import { FIXTURE_SITE_ID, signedInCourseId, TIME_COURSE_ID } from "../traffic/journeys/fixture.ts";
import { onlineStatusRead } from "../traffic/journeys/ui.ts";

/** Since 1.58.0: what the signed-in journeys need of main since mono-repo #327 moved the browser's data calls to the reader. */
const response = (url: string, method = "GET") => ({ url: () => url, request: () => ({ method: () => method }) });

describe("the sign-in waits for the reconnect's online status read on both sides (since 1.58.0, mono-repo #327)", () => {
  it("is the Supabase read up to 17.0.0", () => {
    const read = onlineStatusRead();
    expect(read(response("http://localhost:3103/course/harness-fixture"))).toBe(false);
    expect(read(response("http://persistence-a.harness.test:8090/rest/v1/tutors-connect-users?select=sentiment&id=eq.harness-student"))).toBe(false);
    expect(read(response("http://persistence-a.harness.test:8090/rest/v1/tutors-connect-users?select=online_status&id=eq.harness-student"))).toBe(true);
  });

  it("is the second GET /api/me on main: the first reads the sentiment", () => {
    const read = onlineStatusRead();
    expect(read(response("http://localhost:3203/api/me"))).toBe(false);
    expect(read(response("http://localhost:3203/api/me", "PUT"))).toBe(false);
    expect(read(response("http://localhost:3203/api/profile"))).toBe(false);
    expect(read(response("http://localhost:3203/api/me"))).toBe(true);
  });

  it("counts afresh for each sign-in", () => {
    expect(onlineStatusRead()(response("http://localhost:3203/api/me"))).toBe(false);
  });
});

describe("the signed-in journeys name each course by a Netlify site id (since 1.58.0)", () => {
  const harness = { reader: "http://r", catalogue: "http://c", live: "http://l", courseId: "localhost:8080", rulesCourseId: "localhost:8081" };

  it("the fixture course is harness-fixture on the harness's stack, the side's own id elsewhere", () => {
    expect(signedInCourseId(harness)).toBe(FIXTURE_SITE_ID);
    expect(signedInCourseId({ courseId: "reference-course" })).toBe("reference-course");
  });

  it("the browser is answered for both sites from the course server, and for none on an external side", () => {
    expect(courseSites({ name: "a", images: {} as never, urls: harness })).toEqual([
      [TIME_COURSE_ID, "localhost:8081"],
      [FIXTURE_SITE_ID, "localhost:8080"]
    ]);
    expect(courseSites({ name: "a", images: {} as never, urls: { ...harness, rulesCourseId: undefined } as never })).toEqual([]);
  });
});
