/**
 * B5 (harness hardening plan, since 1.57.0): the edge faults planted for the engines that had none, run through the real
 * wrapper (mutants/wrap.mjs) in front of a small stand-in for the reader's build/index.js. The weekly self-test proves
 * the harness catches them; this proves each one is planted at all.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const WRAP = resolve(import.meta.dirname, "..", "mutants", "wrap.mjs");

/** The stand-in app: a page, and the reader's /metrics with the three request series. */
const APP = `
import http from "node:http";
http.createServer((req, res) => {
  if (req.url === "/metrics") {
    res.writeHead(200, { "content-type": "text/plain; version=0.0.4" });
    return res.end(["# HELP http_requests_total Requests", "# TYPE http_requests_total counter", 'http_requests_total{method="GET",route="/",status_code="200"} 7', "# HELP http_requests_in_flight In flight", "# TYPE http_requests_in_flight gauge", "http_requests_in_flight 1", ""].join("\\n"));
  }
  res.writeHead(200, { "content-type": "text/html" });
  res.end("<html><head><title>t</title></head><body><main>course</main></body></html>");
}).listen(Number(process.env.PORT), "127.0.0.1");
`;

const freePort = () =>
  new Promise<number>((done) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const port = (s.address() as { port: number }).port;
      s.close(() => done(port));
    });
  });

let running: ChildProcess | undefined;
afterEach(() => {
  running?.kill("SIGTERM");
  running = undefined;
});

async function wrapper(mutant: string, o: { readOnlyCwd?: boolean } = {}): Promise<{ port: number; out: () => string; startedMs: number }> {
  const dir = mkdtempSync(join(tmpdir(), "harness-wrap-"));
  mkdirSync(join(dir, "build"));
  writeFileSync(join(dir, "build", "index.js"), APP);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ type: "module" }));
  if (o.readOnlyCwd) chmodSync(dir, 0o555);
  let port = await freePort();
  while (port >= 64535) port = await freePort();
  let out = "";
  const started = Date.now();
  running = spawn(process.execPath, [WRAP], { cwd: dir, env: { ...process.env, MUTANT: mutant, PORT: String(port), HARNESS_PERSISTENCE_URL: "http://persistence.test" }, stdio: ["ignore", "pipe", "pipe"] });
  running.stdout!.on("data", (c) => (out += String(c)));
  running.stderr!.on("data", (c) => (out += String(c)));
  for (let i = 0; i < 200; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/`);
      if (r.status === 200) return { port, out: () => out, startedMs: Date.now() - started };
    } catch {
      /* not listening yet */
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`the wrapper for ${mutant} never answered 200: ${out}`);
}

const get = async (port: number, path: string) => {
  const r = await fetch(`http://127.0.0.1:${port}${path}`);
  return { status: r.status, text: await r.text() };
};

describe("the planted faults for the engines that had none", () => {
  it("screenshot-shift moves the page down two pixels with a stylesheet, and nothing else", async () => {
    const w = await wrapper("screenshot-shift");
    const page = await get(w.port, "/");
    expect(page.text).toContain("<style>html{margin-top:2px!important}</style></head>");
    expect(page.text).toContain("<main>course</main>");
  });

  it("metric-dropped removes the http_requests_in_flight series, its HELP and TYPE, and keeps the rest", async () => {
    const w = await wrapper("metric-dropped");
    const m = await get(w.port, "/metrics");
    expect(m.text).not.toContain("http_requests_in_flight");
    expect(m.text).toContain('http_requests_total{method="GET",route="/",status_code="200"} 7');
  });

  it("slo-5xx-burst: every page calls the burst endpoint three times, it answers 500, and /metrics counts each as a 5xx request", async () => {
    const w = await wrapper("slo-5xx-burst");
    expect((await get(w.port, "/")).text).toContain('for (let i = 0; i < 3; i++) fetch("/harness-mutant-burst"');
    expect((await get(w.port, "/harness-mutant-burst")).status).toBe(500);
    expect((await get(w.port, "/harness-mutant-burst?x=1")).status).toBe(500);
    const m = await get(w.port, "/metrics");
    expect(m.text).toContain('http_requests_total{method="GET",route="/harness-mutant-burst",status_code="500"} 2');
    expect(m.text).toContain("http_requests_in_flight 1");
  });

  it("realtime-chatty: every page posts two more Realtime broadcasts to the side's persistence", async () => {
    const w = await wrapper("realtime-chatty");
    expect((await get(w.port, "/")).text).toContain('fetch("http://persistence.test/realtime/v1/api/broadcast", { method: "POST"');
  });

  it("log-level-flood logs a warning, as a JSON line, for every page served", async () => {
    const w = await wrapper("log-level-flood");
    await get(w.port, "/a");
    await get(w.port, "/b");
    await new Promise((r) => setTimeout(r, 100));
    const warns = w
      .out()
      .split("\n")
      .filter((l) => l.startsWith("{") && JSON.parse(l).level === "warn");
    expect(warns.length).toBeGreaterThanOrEqual(3);
  });

  it.skipIf(process.getuid?.() === 0)("writes-outside-tmp: the failed write into the app's directory is logged as the app would log it", async () => {
    const w = await wrapper("writes-outside-tmp", { readOnlyCwd: true });
    expect(w.out()).toMatch(/"level":"error","message":"mutant: could not write the cache: E(ROFS|ACCES)/);
  });

  it("slow-boot: the server listens three seconds late", async () => {
    const w = await wrapper("slow-boot");
    expect(w.startedMs).toBeGreaterThanOrEqual(3000);
  }, 15_000);

  it("no mutant: the page and the metrics pass through untouched", async () => {
    const w = await wrapper("none");
    expect((await get(w.port, "/")).text).toBe("<html><head><title>t</title></head><body><main>course</main></body></html>");
    expect((await get(w.port, "/metrics")).text).toContain("http_requests_in_flight 1");
  });
});
