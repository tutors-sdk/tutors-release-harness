/**
 * The third-party cache: Google Fonts, Iconify and jsDelivr are fetched once, recorded, and every later request, on
 * either side and in every later run, is answered from the record. What is under test is the record (hit, miss,
 * persistence, which headers it keeps) and what a host that cannot be reached is answered with; the routes are fakes.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Route } from "playwright";
import { afterEach, describe, expect, it } from "vitest";
import { THIRD_PARTY_URL, ThirdPartyCache, UNREACHABLE_STATUS, answerFromCache, liveFetcher, stableHeaders, thirdPartyCache, type Fetcher } from "../src/collectors/third-party-cache.ts";
import { harnessHome, thirdPartyCacheDir } from "../src/local/home.ts";

const FONT = "https://fonts.gstatic.com/s/inter/v13/abc.woff2";
const dirs: string[] = [];
const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "third-party-"));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A fetcher that counts its calls and answers what it is given. */
function counting(answer: { status: number; headers?: Record<string, string>; body?: string } | Error) {
  const calls: string[] = [];
  const fetcher: Fetcher = async (url) => {
    calls.push(url);
    if (answer instanceof Error) throw answer;
    return { status: answer.status, headers: answer.headers ?? {}, body: Buffer.from(answer.body ?? "") };
  };
  return { calls, fetcher };
}

describe("which requests it answers", () => {
  it("the fonts, icon and stylesheet hosts, and nothing else", () => {
    for (const url of ["https://fonts.googleapis.com/css2?family=Inter", FONT, "https://api.iconify.design/mdi.json?icons=home", "https://api.simplesvg.com/x.json", "https://api.unisvg.com/x.json", "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"]) expect(THIRD_PARTY_URL.test(url), url).toBe(true);
    for (const url of ["http://localhost:3000/", "https://github.com/login", "https://fonts.googleapis.com.evil.test/", "https://evil.test/?u=https://fonts.gstatic.com/", "https://notcdn.jsdelivr.net/x"]) expect(THIRD_PARTY_URL.test(url), url).toBe(false);
  });
});

describe("the record", () => {
  it("a miss fetches once; every later request, concurrent or not, is the same answer without the network", async () => {
    const cache = new ThirdPartyCache(tempDir());
    const { calls, fetcher } = counting({ status: 200, headers: { "content-type": "font/woff2" }, body: "WOFF" });
    const [a, b] = await Promise.all([cache.get(FONT, fetcher), cache.get(FONT, fetcher)]);
    const c = await cache.get(FONT, fetcher);
    expect(calls).toEqual([FONT]);
    expect(a).toBe(b);
    expect(c.body.toString()).toBe("WOFF");
    expect(c.status).toBe(200);
  });

  it("persists: a new process (a new cache on the same directory) answers from disk and never fetches", async () => {
    const dir = tempDir();
    await new ThirdPartyCache(dir).get(FONT, counting({ status: 200, headers: { "content-type": "font/woff2" }, body: "WOFF" }).fetcher);
    expect(readdirSync(dir).filter((f) => f.endsWith(".json"))).toHaveLength(1);
    expect(readdirSync(dir).some((f) => f.endsWith(".tmp"))).toBe(false);
    const offline = counting(new Error("getaddrinfo ENOTFOUND fonts.gstatic.com"));
    const again = await new ThirdPartyCache(dir).get(FONT, offline.fetcher);
    expect(offline.calls).toEqual([]);
    expect(again).toEqual({ url: FONT, status: 200, headers: { "content-type": "font/woff2" }, body: Buffer.from("WOFF") });
  });

  it("a binary body survives the round trip byte for byte", async () => {
    const dir = tempDir();
    const bytes = Buffer.from([0, 1, 2, 250, 255, 10, 13]);
    await new ThirdPartyCache(dir).get(FONT, async () => ({ status: 200, headers: {}, body: bytes }));
    expect((await new ThirdPartyCache(dir).get(FONT, counting(new Error("offline")).fetcher)).body.equals(bytes)).toBe(true);
  });

  it("a torn or foreign file is a miss, and the new record replaces it", async () => {
    const dir = tempDir();
    const cache = new ThirdPartyCache(dir);
    writeFileSync(cache.fileFor(FONT)!, "{not json");
    const { calls, fetcher } = counting({ status: 200, body: "fresh" });
    expect((await cache.get(FONT, fetcher)).body.toString()).toBe("fresh");
    expect(calls).toHaveLength(1);
    expect(JSON.parse(readFileSync(cache.fileFor(FONT)!, "utf8")).url).toBe(FONT);
  });

  it("a 404 is content and is recorded; a 5xx is the host's bad moment, answered alike for this process but not written down", async () => {
    const dir = tempDir();
    const missing = "https://api.iconify.design/nope.json";
    await new ThirdPartyCache(dir).get(missing, counting({ status: 404, body: "404" }).fetcher);
    expect((await new ThirdPartyCache(dir).get(missing, counting(new Error("offline")).fetcher)).status).toBe(404);

    const cache = new ThirdPartyCache(dir);
    const flaky = counting({ status: 503, body: "busy" });
    expect((await cache.get(FONT, flaky.fetcher)).status).toBe(503);
    expect((await cache.get(FONT, flaky.fetcher)).status).toBe(503);
    expect(flaky.calls).toHaveLength(1);
    const next = counting({ status: 200, body: "WOFF" });
    expect((await new ThirdPartyCache(dir).get(FONT, next.fetcher)).status).toBe(200);
    expect(next.calls).toHaveLength(1);
  });

  it("with no directory it still answers both sides alike, from memory", async () => {
    const cache = new ThirdPartyCache(undefined);
    const { calls, fetcher } = counting({ status: 200, body: "css" });
    expect((await cache.get(FONT, fetcher)).body.toString()).toBe("css");
    expect((await cache.get(FONT, fetcher)).body.toString()).toBe("css");
    expect(calls).toHaveLength(1);
    expect(cache.fileFor(FONT)).toBeUndefined();
  });
});

describe("a host that cannot be reached", () => {
  it("a miss is answered with one fixed failure, the same for every later request (both sides), and not written down", async () => {
    const dir = tempDir();
    const cache = new ThirdPartyCache(dir);
    const down = counting(new Error("connect ECONNREFUSED 142.250.0.1:443"));
    const first = await cache.get(FONT, down.fetcher);
    const second = await cache.get(FONT, down.fetcher);
    expect(first.status).toBe(UNREACHABLE_STATUS);
    expect(second).toBe(first);
    expect(down.calls).toHaveLength(1);
    // no error text from the network stack: the body is the same whatever the stack said
    expect(first.body.toString()).toBe(`fonts.gstatic.com was unreachable and ${FONT} has no recorded copy (harness third-party cache)\n`);
    expect(readdirSync(dir)).toEqual([]);
    const up = counting({ status: 200, body: "WOFF" });
    expect((await new ThirdPartyCache(dir).get(FONT, up.fetcher)).status).toBe(200);
  });

  it("the live fetcher gives up on a host that refuses, and that is the fixed failure", async () => {
    const server = createServer();
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as AddressInfo).port;
    await new Promise<void>((r) => server.close(() => r()));
    const url = `http://127.0.0.1:${port}/s/font.woff2`;
    const got = await new ThirdPartyCache(undefined).get(url, liveFetcher({}, 2_000));
    expect(got.status).toBe(UNREACHABLE_STATUS);
  });
});

describe("the headers a record keeps", () => {
  it("drops the ones that describe the moment or the CDN node, keeps the ones that describe the content, lower-cased and sorted", () => {
    expect(
      stableHeaders({
        Date: "Sun, 27 Sep 2026 10:00:00 GMT",
        Age: "3600",
        Expires: "Mon, 27 Sep 2027 10:00:00 GMT",
        "Last-Modified": "Mon, 01 Jan 2024 00:00:00 GMT",
        "Set-Cookie": "NID=1",
        "CF-Ray": "abc-DUB",
        "cf-cache-status": "HIT",
        "X-Served-By": "cache-dub4321",
        "X-Cache": "HIT",
        "X-Timer": "S1",
        "x-goog-hash": "crc32c=1",
        "Alt-Svc": 'h3=":443"',
        "Content-Encoding": "br",
        "Content-Length": "123",
        "Content-Type": "font/woff2",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
        "Timing-Allow-Origin": "*",
        ETag: '"v1"'
      })
    ).toEqual({ "access-control-allow-origin": "*", "cache-control": "public, max-age=31536000", "content-type": "font/woff2", etag: '"v1"', "timing-allow-origin": "*" });
  });

  it("a record on disk holds only the stable headers", async () => {
    const dir = tempDir();
    const cache = new ThirdPartyCache(dir);
    await cache.get(FONT, counting({ status: 200, headers: { date: "now", "content-type": "font/woff2", "x-served-by": "node-1" }, body: "WOFF" }).fetcher);
    expect(JSON.parse(readFileSync(cache.fileFor(FONT)!, "utf8")).headers).toEqual({ "content-type": "font/woff2" });
  });
});

/** A stand-in for Playwright's Route: records what it was answered with. */
function fakeRoute(url: string, method = "GET", headers: Record<string, string> = {}) {
  const seen: { fulfilled?: { status: number; headers: Record<string, string>; body: Buffer }; fellBack: boolean } = { fellBack: false };
  const route = {
    request: () => ({ url: () => url, method: () => method, headers: () => headers }),
    fulfill: async (r: { status: number; headers: Record<string, string>; body: Buffer }) => {
      seen.fulfilled = r;
    },
    fallback: async () => {
      seen.fellBack = true;
    }
  } as unknown as Route;
  return { route, seen };
}

describe("answering the browser", () => {
  it("both sides get byte-identical answers; the host's own CORS answer is opened to any origin (the sides' ports differ)", async () => {
    const cache = new ThirdPartyCache(undefined);
    const { calls, fetcher } = counting({ status: 200, headers: { "content-type": "font/woff2", "access-control-allow-origin": "http://reader-a.harness.test:3001" }, body: "WOFF" });
    const a = fakeRoute(FONT, "GET", { origin: "http://reader-a.harness.test:3001" });
    const b = fakeRoute(FONT, "GET", { origin: "http://reader-b.harness.test:3002" });
    await answerFromCache(a.route, cache, () => fetcher);
    await answerFromCache(b.route, cache, () => fetcher);
    expect(calls).toHaveLength(1);
    expect(b.seen.fulfilled).toEqual(a.seen.fulfilled);
    expect(a.seen.fulfilled!.headers).toEqual({ "content-type": "font/woff2", "access-control-allow-origin": "*" });
    expect(a.seen.fulfilled!.body.toString()).toBe("WOFF");
  });

  it("only GET is recorded: anything else goes on to the network as before", async () => {
    const { calls, fetcher } = counting({ status: 200 });
    const post = fakeRoute("https://api.iconify.design/x", "POST");
    await answerFromCache(post.route, new ThirdPartyCache(undefined), () => fetcher);
    expect(post.seen.fellBack).toBe(true);
    expect(post.seen.fulfilled).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it("the live fetch passes on what a host picks its content by (the user agent), not the side's origin or referer", async () => {
    let got: Record<string, string | string[] | undefined> = {};
    const server = createServer((req, res) => {
      got = req.headers;
      res.writeHead(200, { "content-type": "text/css", date: "Sun, 27 Sep 2026 10:00:00 GMT" });
      res.end("@font-face{}");
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    try {
      const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/css2?family=Inter`;
      const fetched = await liveFetcher({ "user-agent": "tutors-release-harness (x)", accept: "text/css", origin: "http://reader-a.harness.test:3001", referer: "http://reader-a.harness.test:3001/course" })(url);
      expect(fetched.status).toBe(200);
      expect(fetched.body.toString()).toBe("@font-face{}");
      expect(got["user-agent"]).toBe("tutors-release-harness (x)");
      expect(got.origin).toBeUndefined();
      expect(got.referer).toBeUndefined();
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });
});

describe("where it lives", () => {
  it("HARNESS_THIRD_PARTY_CACHE_DIR, else <HARNESS_HOME>/third-party-cache; one cache per directory per process", () => {
    expect(thirdPartyCacheDir({ HARNESS_THIRD_PARTY_CACHE_DIR: "/data/tp" })).toBe(resolve("/data/tp"));
    expect(thirdPartyCacheDir({ HARNESS_HOME: "/h" })).toBe(join(harnessHome({ HARNESS_HOME: "/h" }), "third-party-cache"));
    expect(thirdPartyCacheDir({ HARNESS_THIRD_PARTY_CACHE_DIR: "  " })).toBe(join(harnessHome({}), "third-party-cache"));
    expect(thirdPartyCache("/x/one")).toBe(thirdPartyCache("/x/one"));
    expect(thirdPartyCache("/x/one")).not.toBe(thirdPartyCache("/x/two"));
  });
});
