import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { COURSE_SITE, handler } from "../fixtures/identity/stub.mjs";

/** Drive the stub's handler with a fake request and read back what it answered. */
async function ask(host: string, path: string): Promise<{ status: number; type?: string | undefined; body: string }> {
  return new Promise((resolve) => {
    const head: { status: number; type?: string | undefined } = { status: 0 };
    const res = {
      sendDate: true,
      writeHead(status: number, headers: Record<string, string>) {
        head.status = status;
        head.type = headers["content-type"];
      },
      end(body?: string | Buffer) {
        resolve({ ...head, body: body === undefined ? "" : body.toString() });
      }
    };
    handler({ url: path, method: "GET", headers: { host } } as never, res as never);
  });
}

describe("the identity stub answers the Rule journeys' course as its Netlify site (since 1.57.1, mono-repo #519)", () => {
  let course: Server;
  beforeAll(async () => {
    course = createServer((req, res) => {
      res.writeHead(req.url === "/tutors.json" ? 200 : 404, { "content-type": "application/json" });
      res.end(req.url === "/tutors.json" ? JSON.stringify({ enrollment: { educators: ["harness-lecturer"] } }) : "{}");
    });
    await new Promise<void>((r) => course.listen(0, "127.0.0.1", r));
    process.env.COURSE_ORIGIN = `http://127.0.0.1:${(course.address() as AddressInfo).port}`;
  });
  afterAll(() => {
    delete process.env.COURSE_ORIGIN;
    course.close();
  });

  it("serves the course's tutors.json from the course server, so the reader's server finds the educators", async () => {
    expect(COURSE_SITE).toBe("harness-rules.netlify.app");
    const got = await ask("harness-rules.netlify.app", "/tutors.json");
    expect(got).toMatchObject({ status: 200, type: "application/json" });
    expect(JSON.parse(got.body)).toEqual({ enrollment: { educators: ["harness-lecturer"] } });
    expect((await ask("harness-rules.netlify.app:443", "/missing.json")).status).toBe(404);
  });

  it("keeps answering as GitHub for every other host", async () => {
    expect((await ask("github.com", "/tutors.json")).status).toBe(404);
    expect((await ask("github.com", "/healthz")).status).toBe(200);
  });

  it("refuses the site when no course server is configured", async () => {
    const origin = process.env.COURSE_ORIGIN;
    delete process.env.COURSE_ORIGIN;
    try {
      expect((await ask("harness-rules.netlify.app", "/tutors.json")).status).toBe(404);
    } finally {
      process.env.COURSE_ORIGIN = origin;
    }
  });
});
