/**
 * Asset-graph folding (since 1.27.0, runway change 9): build churn under /_app/immutable/ (chunks requested more or
 * fewer times, new or gone, and the `link` preload header with them) folded into one hunk per app. Informing until 2.0:
 * the hunk is reported, and network and headers are exactly what they were. Blocking: the churn hunks become information.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSET_PATH, assetGraph, foldAssetChurn, isAssetChurn, isHeaderChurn, isNetworkChurn } from "../src/compare/asset-graph.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { ENGINE_LEVELS, applyLevels, type EngineLevels } from "../src/compare/levels.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Hunk, NetworkEntry, SideCapture } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const asset = (name: string, bytes?: number): NetworkEntry => ({ method: "GET", url: `{{origin}}/_app/immutable/${name}`, status: 200, contentType: name.endsWith(".css") ? "text/css" : "text/javascript", cacheControl: "public, max-age=31536000, immutable", schemaHash: "", ...(bytes !== undefined ? { bytes } : {}) });
const LINK_A = '<../_app/immutable/assets/0.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.js>; rel="modulepreload"; nopush';
const LINK_B = '<../_app/immutable/assets/0.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/extra.js>; rel="modulepreload"; nopush';
const side = (name: "a" | "b", extra: NetworkEntry[], link: string) => {
  const p = page();
  return capture(name, { journeys: [journey({ pages: [{ ...p, headers: { ...p.headers, link }, network: [...p.network, ...extra] }] })] });
};
const A = side("a", [asset("chunks/one.js", 1000), asset("chunks/two.js", 2000), asset("assets/0.css", 500)], LINK_A);
const B = side("b", [asset("chunks/one.js", 1000), asset("chunks/two.js", 2000), asset("chunks/extra.js", 4000), asset("assets/0.css", 500), asset("chunks/two.js", 2000)], LINK_B);
const blocking: EngineLevels = { ...ENGINE_LEVELS, "asset-graph": { level: "blocking" } };

describe("what is churn", () => {
  it("a request under /_app/immutable/ made more or fewer times, or on one side only", () => {
    expect(ASSET_PATH.test("/_app/immutable/chunks/x.js")).toBe(true);
    const n = (scope: string, summary: string): Hunk => ({ id: "1", artefact: "network", scope, summary, severity: "fail" });
    expect(isNetworkChurn(n("GET /_app/immutable/chunks/{{hash}}.js", "reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 30× on b"))).toBe(true);
    expect(isNetworkChurn(n("GET /_app/immutable/assets/1.{{hash}}.css", "reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css"))).toBe(true);
    expect(isNetworkChurn(n("GET /_app/immutable/assets/1.{{hash}}.css", "reader:home: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css"))).toBe(true);
    // the same asset answering differently is not churn, and a request outside the asset tree is never churn
    expect(isNetworkChurn(n("GET /_app/immutable/chunks/x.js", "reader:home: GET /_app/immutable/chunks/x.js status changed: 200 → 404"))).toBe(false);
    expect(isNetworkChurn(n("GET /logo.svg", "reader:home: request no longer made on b: GET /logo.svg"))).toBe(false);
  });

  it("the link header when every link on both sides is under /_app/immutable/", () => {
    const h = (scope: string, summary: string): Hunk => ({ id: "1", artefact: "headers", scope, summary, severity: "fail" });
    expect(isHeaderChurn(h("reader:home/link", `reader:home: header link changed: ${LINK_A} → ${LINK_B}`))).toBe(true);
    expect(isHeaderChurn(h("reader:home/link", `reader:home: header link changed: ${LINK_A} → <https://fonts.example/x.css>; rel="preload"`))).toBe(false);
    expect(isHeaderChurn(h("reader:home/content-security-policy", "reader:home: header content-security-policy changed: a → b"))).toBe(false);
    expect(isAssetChurn(h("reader:home/link", "reader:home: header link dropped on b: link (was <x/_app/immutable/a.js>)"))).toBe(true);
  });
});

describe("one hunk per app", () => {
  it("counts the immutable requests, JS and CSS, their bytes, and the network and headers differences that are this churn", () => {
    const hunks = diff(A, B);
    const churn = hunks.filter(isAssetChurn);
    expect(churn.map((h) => h.artefact).sort()).toEqual(["headers", "network", "network"]);
    const ag = hunks.filter((h) => h.artefact === "asset-graph");
    expect(ag).toEqual([{ id: expect.stringMatching(/^asset-graph:reader:/), artefact: "asset-graph", scope: "reader", severity: "fail", summary: "reader: the asset graph changed: 3 → 5 immutable requests (JS 2 → 4, CSS 1 → 1), 3 KB → 9 KB; 2 network and 1 headers difference(s) are this churn" }]);
  });

  it("an A/A has none, and bytes are not measured when a response sent no content-length", () => {
    expect(diff(A, side("b", [asset("chunks/one.js", 1000), asset("chunks/two.js", 2000), asset("assets/0.css", 500)], LINK_A)).filter((h) => h.artefact === "asset-graph")).toEqual([]);
    const unsized = side("b", [asset("chunks/one.js"), asset("chunks/two.js"), asset("chunks/extra.js"), asset("assets/0.css")], LINK_B);
    expect(diff(A, unsized).find((h) => h.artefact === "asset-graph")!.summary).toContain("(JS 2 → 3, CSS 1 → 1), bytes not measured (no content-length on every response);");
  });

  it("bytes alone moving, with every response sized, is a change", () => {
    const heavier = side("b", [asset("chunks/one.js", 1000), asset("chunks/two.js", 9000), asset("assets/0.css", 500)], LINK_A);
    expect(assetGraph(A, heavier, []).map((h) => h.summary)).toEqual(["reader: the asset graph changed: 3 → 3 immutable requests (JS 2 → 2, CSS 1 → 1), 3 KB → 10 KB; 0 network and 0 headers difference(s) are this churn"]);
  });

  it("a live deployment is not compared", () => {
    expect(assetGraph({ ...A, external: true }, B, [])).toEqual([]);
  });
});

describe("informing, then blocking", () => {
  it("ships informing: network and headers are what they were, and the asset-graph hunk is information", () => {
    expect(ENGINE_LEVELS["asset-graph"]).toEqual({ level: "informing" });
    const at = new Date("2026-10-10T09:00:00Z");
    const hunks = diff(A, B);
    expect(foldAssetChurn(hunks, at)).toBe(hunks);
    const run = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-ag-")), a: A, b: B, claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-10T09:00:00.000Z", runs: 1, ranAt: at, log: () => {} }).report;
    expect(run.compare.unclaimed.map((h) => h.artefact).sort()).toEqual(["headers", "network", "network"]);
    expect(run.compare.hunks.find((h) => h.artefact === "asset-graph")).toMatchObject({ severity: "info", level: "informing" });
  });

  it("blocking (2.0): each churn hunk becomes information naming asset-graph, so the app's one hunk is what gates", () => {
    const at = new Date("2026-10-10T09:00:00Z");
    const run = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-ag-")), a: A, b: B, claims: [{ artefact: "asset-graph", scope: "reader", reason: "chore(build): #400 split the course chunk" }], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-10T09:00:00.000Z", runs: 1, ranAt: at, levels: blocking, log: () => {} }).report;
    expect(run.compare.unclaimed).toEqual([]);
    const folded = run.compare.hunks.filter(isAssetChurn);
    expect(folded).toHaveLength(3);
    for (const h of folded) expect(h).toMatchObject({ severity: "info", summary: expect.stringMatching(/\(folded into asset-graph\)$/) });
    expect(run.verdict).not.toBe("fail");
  });
});

describe("first-load JavaScript (1.53.0)", () => {
  const KB = 1024;
  const loads = (name: "a" | "b", js: (number | undefined)[], over: Partial<ReturnType<typeof page>> = {}) => {
    const p = page();
    return capture(name, { journeys: [journey({ pages: [{ ...p, ...over, network: [...p.network, ...js.map((b, i) => asset(`chunks/c${i}.js`, b)), asset("assets/0.css", 900 * KB)] }] })] });
  };
  const first = (a: SideCapture, b: SideCapture) => assetGraph(a, b, []).filter((h) => h.scope.endsWith("/first-load-js"));

  it("A/A: the same JavaScript on both sides is no threshold hunk", () => {
    expect(first(loads("a", [300 * KB, 200 * KB]), loads("b", [300 * KB, 200 * KB]))).toEqual([]);
  });

  it("planted: 10% and 50 KB more on a document load is a hunk on that page, informing", () => {
    const got = first(loads("a", [300 * KB, 200 * KB]), loads("b", [300 * KB, 260 * KB]));
    expect(got).toMatchObject([{ artefact: "asset-graph", scope: "reader/first-load-js", path: "/course/localhost:8080", severity: "fail", summary: "reader: first-load JavaScript grew 500 KB → 560 KB (+12%) on reader:course, over the threshold of 10% and 50 KB" }]);
    expect(applyLevels(got, new Date("2026-10-23T00:00:00Z"))[0]).toMatchObject({ severity: "info", level: "informing" });
  });

  it("must not flag: under either threshold, CSS, a client-side route change, or a response that did not say its size", () => {
    expect(first(loads("a", [300 * KB, 200 * KB]), loads("b", [300 * KB, 240 * KB]))).toEqual([]); // +8%, 40 KB
    expect(first(loads("a", [100 * KB]), loads("b", [140 * KB]))).toEqual([]); // +40%, but 40 KB
    expect(first(loads("a", [300 * KB, 200 * KB], { timing: { ttfbMs: -1, responseEndMs: -1 } }), loads("b", [300 * KB, 300 * KB], { timing: { ttfbMs: -1, responseEndMs: -1 } }))).toEqual([]);
    expect(first(loads("a", [300 * KB, 200 * KB]), loads("b", [300 * KB, undefined, 300 * KB]))).toEqual([]);
    expect(first(loads("a", [300 * KB]), loads("b", [250 * KB]))).toEqual([]); // shrinking is never a finding
  });
});
