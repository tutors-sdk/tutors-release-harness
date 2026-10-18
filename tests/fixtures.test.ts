import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handler as identityHandler, USERS } from "../fixtures/identity/stub.mjs";
import { ROOT } from "../src/stack.ts";

/**
 * The fixture stubs are code the harness ships, so they get tests like any
 * other: each is started in-process (or as a child process where it must own
 * its port) and driven with fetch.
 */

async function freePort(): Promise<number> {
  return new Promise((resolvePort) => {
    const s = createServer();
    s.listen(0, () => {
      const port = (s.address() as { port: number }).port;
      s.close(() => resolvePort(port));
    });
  });
}

function startChild(script: string, args: string[], env: Record<string, string>, ready: string): Promise<ChildProcess> {
  return new Promise((resolveChild, reject) => {
    const child = spawn(process.execPath, [resolve(ROOT, script), ...args], { env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout!.on("data", (c) => {
      out += c;
      if (out.includes(ready)) resolveChild(child);
    });
    child.stderr!.on("data", (c) => (out += c));
    child.on("exit", (code) => reject(new Error(`${script} exited ${code}: ${out}`)));
    setTimeout(() => reject(new Error(`${script} did not start: ${out}`)), 10_000);
  });
}

describe("persistence stub", () => {
  let child: ChildProcess;
  let base: string;
  beforeAll(async () => {
    const port = await freePort();
    child = await startChild("fixtures/persistence/stub.mjs", [String(port)], {}, "listening");
    base = `http://localhost:${port}`;
  });
  afterAll(() => child.kill());

  it("reads see an empty table, writes are recorded by table and method, reset clears", async () => {
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    const read = await fetch(`${base}/rest/v1/learning_records?select=*`);
    expect(read.status).toBe(200);
    expect(await read.json()).toEqual([]);
    const post = await fetch(`${base}/rest/v1/learning_records`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify([{ a: 1 }, { a: 2 }]) });
    expect(post.status).toBe(201);
    await fetch(`${base}/rest/v1/tutors-connect-users?login=eq.x`, { method: "PATCH", body: "{}" });
    await fetch(`${base}/rest/v1/rpc/get_error_counts`, { method: "POST", body: "{}" });
    const writes = (await (await fetch(`${base}/_harness/writes`)).json()) as { kind: string; method: string; table: string; rows: number }[];
    expect(writes.map((w) => [w.kind, w.method, w.table, w.rows])).toEqual([
      ["write", "POST", "learning_records", 2],
      ["write", "PATCH", "tutors-connect-users", 1],
      ["rpc", "POST", "get_error_counts", undefined]
    ]);
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    expect(await (await fetch(`${base}/_harness/writes`)).json()).toEqual([]);
  });

  it("keeps the content locks written in a journey and reads them back, filtered and upserted, until reset", async () => {
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    const locks = `${base}/rest/v1/tutors_content_locks`;
    const upsert = (row: object) => fetch(`${locks}?on_conflict=course_id%2Clo_route`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(row) });
    await upsert({ course_id: "c", lo_route: "/t/2", locked: true });
    await upsert({ course_id: "c", lo_route: "/t/2", locked: false });
    await upsert({ course_id: "c", lo_route: "@settings/show-locked", locked: true });
    await upsert({ course_id: "other", lo_route: "/t/2", locked: true });
    const read = async (q: string) => (await (await fetch(`${locks}?select=lo_route,locked&${q}`)).json()) as { lo_route: string; locked: boolean }[];
    expect((await read("course_id=eq.c")).map((r) => [r.lo_route, r.locked])).toEqual([
      ["/t/2", false],
      ["@settings/show-locked", true]
    ]);
    await fetch(`${locks}?course_id=eq.c&lo_route=eq.%2Ft%2F2`, { method: "DELETE" });
    expect((await read("course_id=eq.c")).map((r) => r.lo_route)).toEqual(["@settings/show-locked"]);
    const writes = (await (await fetch(`${base}/_harness/writes`)).json()) as { method: string; table: string }[];
    expect(writes.map((w) => w.method)).toEqual(["POST", "POST", "POST", "POST", "DELETE"]);
    // Any other table still reads empty, and a reset forgets the locks.
    await fetch(`${base}/rest/v1/learning_records`, { method: "POST", body: JSON.stringify({ a: 1 }) });
    expect(await (await fetch(`${base}/rest/v1/learning_records`)).json()).toEqual([]);
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    expect(await read("course_id=eq.c")).toEqual([]);
  });

  it("keeps each student's latest learning object and reads it back as Tutors Live asks: since a time, newest first, at most a limit", async () => {
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    const latest = `${base}/rest/v1/tutors-connect-latest`;
    for (const [student, at] of [["s1", "2026-09-16T09:00:00.000Z"], ["s2", "2026-09-16T09:04:00.000Z"], ["s1", "2026-09-16T09:05:00.000Z"], ["s3", "2026-09-16T08:00:00.000Z"]])
      await fetch(`${latest}?on_conflict=course_id%2Cstudent_id`, { method: "POST", body: JSON.stringify({ course_id: "c", student_id: student, received_at: at }) });
    const read = async (q: string) => ((await (await fetch(`${latest}?select=*&${q}`)).json()) as { student_id: string }[]).map((r) => r.student_id);
    expect(await read("course_id=eq.c&received_at=gte.2026-09-16T09:00:00.000Z&order=received_at.desc")).toEqual(["s1", "s2"]);
    expect(await read("received_at=gte.2026-09-16T07:00:00.000Z&order=received_at.desc&limit=2")).toEqual(["s1", "s2"]);
    expect(await read("order=received_at.asc")).toEqual(["s3", "s2", "s1"]);
  });

  it("accepts realtime broadcasts over REST without recording them as writes", async () => {
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    const broadcast = await fetch(`${base}/realtime/v1/api/broadcast?apikey=k&vsn=2.0.0`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: [] }) });
    expect(broadcast.status).toBe(202);
    expect(await (await fetch(`${base}/_harness/writes`)).json()).toEqual([]);
  });

  it("accepts supabase-js httpSend broadcasts on the per-topic path, also without recording them", async () => {
    await fetch(`${base}/_harness/reset`, { method: "POST" });
    for (const topic of ["localhost%3A8080", "tutors-all-course-access"]) {
      const sent = await fetch(`${base}/realtime/v1/api/broadcast/${topic}/events/lo-event`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ payload: {} }) });
      expect(sent.status).toBe(202);
    }
    expect((await fetch(`${base}/realtime/v1/api/broadcast/x/events`, { method: "POST" })).status).toBe(404);
    expect(await (await fetch(`${base}/_harness/writes`)).json()).toEqual([]);
  });

  it("speaks just enough Phoenix on the realtime socket that the client connects once and never retries", async () => {
    const ws = new WebSocket(`${base.replace("http", "ws")}/realtime/v1/websocket?apikey=k&vsn=2.0.0`);
    const replies: unknown[] = [];
    ws.addEventListener("message", (e) => replies.push(JSON.parse(String(e.data))));
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve);
      ws.addEventListener("error", reject);
    });
    const two = new Promise<void>((resolve) => ws.addEventListener("message", () => replies.length >= 2 && resolve()));
    ws.send(JSON.stringify(["1", "1", "realtime:course-x", "phx_join", { config: { broadcast: { self: false } } }]));
    ws.send(JSON.stringify([null, "2", "phoenix", "heartbeat", {}]));
    ws.send(JSON.stringify([null, null, "realtime:course-x", "broadcast", {}])); // no ref, no reply
    await two;
    expect(replies).toEqual([
      ["1", "1", "realtime:course-x", "phx_reply", { status: "ok", response: { postgres_changes: [] } }],
      [null, "2", "phoenix", "phx_reply", { status: "ok", response: {} }]
    ]);
    ws.close();
    expect(await (await fetch(`${base}/_harness/writes`)).json()).toEqual([]);
  });

  it("answers CORS preflight and never sends a Date header", async () => {
    const preflight = await fetch(`${base}/rest/v1/x`, { method: "OPTIONS" });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe("*");
    const read = await fetch(`${base}/rest/v1/x`);
    expect(read.headers.get("date")).toBeNull();
  });
});

describe("identity stub", () => {
  let server: Server;
  let base: string;
  beforeAll(async () => {
    const port = await freePort();
    server = createServer(identityHandler);
    await new Promise<void>((r) => server.listen(port, r));
    base = `http://localhost:${port}`;
  });
  afterAll(() => server.close());

  it("completes authorise -> token -> profile for a role, deterministically", async () => {
    const auth = await fetch(`${base}/login/oauth/authorize?client_id=x&redirect_uri=${encodeURIComponent("http://localhost:3103/auth/callback/github")}&state=s1&login_hint=lecturer`, { redirect: "manual" });
    expect(auth.status).toBe(302);
    const location = new URL(auth.headers.get("location")!);
    expect(location.origin + location.pathname).toBe("http://localhost:3103/auth/callback/github");
    expect(location.searchParams.get("state")).toBe("s1");
    const code = location.searchParams.get("code")!;
    expect(code).toBe("code-lecturer");

    const token = await fetch(`${base}/login/oauth/access_token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `client_id=x&client_secret=y&code=${code}` });
    const tokenBody = (await token.json()) as { access_token: string };
    expect(tokenBody.access_token).toBe("tok-lecturer");

    const user = await fetch(`${base}/user`, { headers: { authorization: `Bearer ${tokenBody.access_token}` } });
    expect(await user.json()).toEqual(USERS.lecturer);
    expect(user.headers.get("date")).toBeNull();
    const emails = (await (await fetch(`${base}/user/emails`, { headers: { authorization: `token ${tokenBody.access_token}` } })).json()) as { email: string }[];
    expect(emails[0]!.email).toBe("lecturer@harness.test");
  });

  it("refuses a bad code and a bad token", async () => {
    expect((await fetch(`${base}/login/oauth/access_token`, { method: "POST", body: "code=code-nobody" })).status).toBe(400);
    expect((await fetch(`${base}/user`, { headers: { authorization: "Bearer tok-nobody" } })).status).toBe(401);
    expect((await fetch(`${base}/user`)).status).toBe(401);
  });

  it("serves TLS with the committed certificate for github.com and api.github.com", async () => {
    const certs = resolve(ROOT, "fixtures", "identity", "certs");
    const tls = createHttpsServer({ key: readFileSync(resolve(certs, "server.key")), cert: readFileSync(resolve(certs, "server.pem")) }, identityHandler);
    const port = await freePort();
    await new Promise<void>((r) => tls.listen(port, r));
    try {
      const cert = readFileSync(resolve(certs, "server.pem"), "utf8");
      expect(cert).toContain("BEGIN CERTIFICATE");
      // Node's fetch cannot be pointed at a custom CA per call; the container does that with NODE_EXTRA_CA_CERTS.
      const previous = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      try {
        const res = await fetch(`https://localhost:${port}/healthz`);
        expect(await res.json()).toEqual({ status: "ok" });
      } finally {
        if (previous === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        else process.env.NODE_TLS_REJECT_UNAUTHORIZED = previous;
      }
    } finally {
      tls.close();
    }
  });
});

describe("course server", () => {
  let child: ChildProcess;
  let base: string;
  beforeAll(async () => {
    const port = await freePort();
    child = await startChild("fixtures/course-server/serve.mjs", [resolve(ROOT, "fixtures", "course-server", "course"), String(port)], {}, "listening");
    base = `http://localhost:${port}`;
  });
  afterAll(() => child.kill());

  it("serves the pinned course with CORS and without Date, ETag or Last-Modified", async () => {
    const res = await fetch(`${base}/tutors.json`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    for (const h of ["date", "etag", "last-modified"]) expect(res.headers.get(h), h).toBeNull();
    expect(((await res.json()) as { title: string }).title).toContain("Runway Fixture Course");
    expect((await fetch(`${base}/../etc/passwd`)).status).not.toBe(200);
    expect((await fetch(`${base}/nope.json`)).status).toBe(404);
  });
});

describe("edge proxy", () => {
  let upstreamA: Server;
  let upstreamB: Server;
  let child: ChildProcess;
  let base: string;
  let slowArrived: () => void = () => {};
  beforeAll(async () => {
    const [pa, pb, pe] = await Promise.all([freePort(), freePort(), freePort()]);
    upstreamA = createServer((req, res) => {
      if (req.url === "/slow") slowArrived();
      setTimeout(() => res.writeHead(200, { "x-side": "a" }).end("a"), 200);
    });
    upstreamB = createServer((_req, res) => res.writeHead(200, { "x-side": "b" }).end("b"));
    await new Promise<void>((r) => upstreamA.listen(pa, r));
    await new Promise<void>((r) => upstreamB.listen(pb, r));
    child = await startChild("fixtures/edge/edge.mjs", [], { PORT: String(pe), UPSTREAM_A: `http://localhost:${pa}`, UPSTREAM_B: `http://localhost:${pb}` }, "listening");
    base = `http://localhost:${pe}`;
  });
  afterAll(() => {
    child.kill();
    upstreamA.close();
    upstreamB.close();
  });

  it("routes to a, switches to b for new requests, and lets in-flight requests finish on a", async () => {
    const first = await fetch(`${base}/`);
    expect(first.headers.get("x-harness-upstream")).toBe("a");
    expect(await first.text()).toBe("a");

    const arrived = new Promise<void>((r) => (slowArrived = r));
    const inFlight = fetch(`${base}/slow`); // takes 200ms on a
    // Switch only once the request has reached a: a fixed sleep raced the proxy on a busy runner.
    await arrived;
    const switched = await fetch(`${base}/_harness/switch?to=b`, { method: "POST" });
    expect(await switched.json()).toEqual({ upstream: "b" });
    const after = await fetch(`${base}/`);
    expect(after.headers.get("x-harness-upstream")).toBe("b");
    const finished = await inFlight;
    expect(finished.headers.get("x-harness-upstream")).toBe("a");
    expect(await finished.text()).toBe("a");
    expect(await (await fetch(`${base}/_harness/state`)).json()).toMatchObject({ upstream: "b", switched: 1 });
  });

  it("answers 502 with the upstream named when it is down", async () => {
    upstreamB.close();
    await new Promise((r) => setTimeout(r, 50));
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(502);
    expect(res.headers.get("x-harness-upstream")).toBe("b");
  });
});

describe("mutant wrapper", () => {
  it("has a planting rule for every mutant and rewrites HTML only for the rewriting ones", () => {
    const wrap = readFileSync(resolve(ROOT, "mutants", "wrap.mjs"), "utf8");
    for (const name of ["dropped-header", "route-500", "console-error", "dom-note", "missing-alt", "slow-ssr", "anon-write", "focus-order"]) expect(wrap).toContain(`"${name}"`);
    expect(wrap).toContain('headers["content-length"] = String(body.length)');
    expect(wrap).toContain('delete headers["etag"]');
  });

  it("plants the focus-order fault on navigators that appear after load, because the reader renders in the browser", async () => {
    const wrap = readFileSync(resolve(ROOT, "mutants", "wrap.mjs"), "utf8");
    const script = /case "focus-order":[\s\S]*?<script>([\s\S]*?)<\/script>/.exec(wrap)?.[1];
    expect(script).toBeTruthy();
    const anchors: { tabIndex: number }[] = [];
    let observed: (() => void) | undefined;
    const context = {
      document: { documentElement: {}, querySelectorAll: (selector: string) => (selector === "nav a" ? anchors : []) },
      MutationObserver: class {
        constructor(cb: () => void) {
          observed = cb;
        }
        observe() {}
      }
    };
    const { runInNewContext } = await import("node:vm");
    runInNewContext(script as string, context);
    // The shell has no <nav> yet; the client render adds one, and the observer fires.
    anchors.push({ tabIndex: 0 }, { tabIndex: 0 });
    observed?.();
    expect(anchors.map((a) => a.tabIndex)).toEqual([-1, -1]);
  });
});
