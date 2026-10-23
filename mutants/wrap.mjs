// Mutant wrapper: starts the real Tutors server on an internal port and
// proxies port 3000 to it, planting exactly one fault chosen by MUTANT.
//
// Faults are planted at the HTTP edge rather than in the source so a mutant
// can be built from any published image tag without the monorepo. Each one
// is the kind of regression a release could ship; the harness must catch
// every one and name the right artefact (see mutants.yaml).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import http from "node:http";

const MUTANT = process.env.MUTANT ?? "none";
const PORT = Number(process.env.PORT ?? 3000);
const INNER = PORT + 1000;
const ROUTE = new RegExp(process.env.MUTANT_ROUTE ?? "^/course/");
// slow-ssr plants 400 ms; slow-ssr-mild (since 1.26.0, the timing tolerance's mutant) 150 ms.
const SLOW = { "slow-ssr": 400, "slow-ssr-mild": 150 };
const DELAY_MS = Number(process.env.MUTANT_DELAY_MS ?? SLOW[MUTANT] ?? 400);
// Where this side persists: set on the anonymous readers as HARNESS_PERSISTENCE_URL
// (ignored by the apps) and on the signed-in readers as PUBLIC_SUPABASE_URL.
const PERSISTENCE = process.env.HARNESS_PERSISTENCE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? "";

// Since 1.57.0 (harness hardening plan, B5) every engine that had no planted fault has one; the ones planted here are
// screenshot-shift, metric-dropped, log-level-flood, writes-outside-tmp, slow-boot, slo-5xx-burst and realtime-chatty.
const log = (level, message) => console.log(JSON.stringify({ level, message }));

// writes-outside-tmp (runtime's mutant): a cache written into the app's own directory at boot. The harness stacks run
// with a read-only root filesystem, so the write fails, and the error the app logs is the only trace (EROFS).
if (MUTANT === "writes-outside-tmp") {
  try {
    writeFileSync(`${process.cwd()}/.harness-mutant-cache`, "planted");
  } catch (e) {
    log("error", `mutant: could not write the cache: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// slow-boot (startup's mutant): three seconds of work before the server listens, on every start.
const BOOT_DELAY_MS = MUTANT === "slow-boot" ? 3000 : 0;
let child;
setTimeout(() => {
  child = spawn(process.execPath, ["build/index.js"], { env: { ...process.env, PORT: String(INNER) }, stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 1));
}, BOOT_DELAY_MS);
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => (child ? child.kill(signal) : process.exit(0)));

const isHtml = (headers) => /text\/html/.test(headers["content-type"] ?? "");
const REWRITING = ["console-error", "dom-note", "missing-alt", "anon-write", "focus-order", "extra-chunk", "secret-in-body", "screenshot-shift", "slo-5xx-burst", "realtime-chatty"];
// metric-dropped and slo-5xx-burst rewrite the app's /metrics.
const METRICS_REWRITING = ["metric-dropped", "slo-5xx-burst"];
// slo-5xx-burst: the endpoint every page calls three times, which answers 500, counted into the app's request SLI.
const BURST_PATH = "/harness-mutant-burst";
let burst500s = 0;
// extra-chunk (since 1.27.0, asset-graph's mutant): one more hashed JS chunk on every page, served by this wrapper.
const PLANTED_CHUNK = "/_app/immutable/chunks/harness-planted.js";
// Since 1.53.0 the chunk weighs 1 MiB (a comment), so asset-graph's first-load-js threshold (10% and 50 KB) fires too.
const PLANTED_CHUNK_BODY = `export {};\n/*${"x".repeat(1024 * 1024)}*/\n`;

/** The app's Prometheus text with the planted fault: a series gone, or the burst's 500s counted. */
function mutateMetrics(text) {
  if (MUTANT === "metric-dropped") return text.split("\n").filter((l) => !/^(# (HELP|TYPE) )?http_requests_in_flight\b/.test(l)).join("\n");
  if (MUTANT === "slo-5xx-burst") return `${text.replace(/\n*$/, "\n")}http_requests_total{method="GET",route="${BURST_PATH}",status_code="500"} ${burst500s}\n`;
  return text;
}

function mutateHtml(html) {
  switch (MUTANT) {
    case "console-error":
      return html.replace("</head>", '<script>console.error("mutant: planted console error")</script></head>');
    case "dom-note":
      return html.replace("</body>", '<div role="note">planted note from the mutant</div></body>');
    case "missing-alt":
      return html.replace("</body>", '<img src="/mutant-planted.png" width="1" height="1"></body>');
    case "anon-write":
      // A page that records a learning event for whoever is looking at it, signed in or not.
      return html.replace(
        "</body>",
        `<script>fetch(${JSON.stringify(`${PERSISTENCE}/rest/v1/learning_records`)}, { method: "POST", headers: { "content-type": "application/json", apikey: "mutant" }, body: JSON.stringify({ course_id: "mutant", lo: location.pathname }) }).catch(() => {});</script></body>`
      );
    case "focus-order":
      // A navigator whose links leave the tab order: keyboard users can no longer reach them. The reader serves a bare
      // shell (about 1 KB) and renders every page in the browser, so at `load` there is no <nav> yet, and it re-renders
      // its navigators on client-side navigation: the fault is applied by an observer, to every <nav> link as it appears.
      return html.replace(
        "</body>",
        `<script>(() => { const plant = () => { for (const a of document.querySelectorAll("nav a")) if (a.tabIndex !== -1) a.tabIndex = -1; }; new MutationObserver(plant).observe(document.documentElement, { childList: true, subtree: true }); plant(); })();</script></body>`
      );
    case "extra-chunk":
      // A re-chunked build: every page loads one more module under /_app/immutable/. It does nothing.
      return html.replace("</body>", `<script type="module" src="${PLANTED_CHUNK}"></script></body>`);
    case "screenshot-shift":
      // A stylesheet change that moves everything down by two pixels: no text, landmark or request changes.
      return html.replace("</head>", "<style>html{margin-top:2px!important}</style></head>");
    case "slo-5xx-burst":
      return html.replace("</body>", `<script>for (let i = 0; i < 3; i++) fetch(${JSON.stringify(BURST_PATH)}, { cache: "no-store" }).catch(() => {});</script></body>`);
    case "realtime-chatty":
      // Two more Realtime broadcasts per page view, as a reader that announced every scroll would send.
      return html.replace(
        "</body>",
        `<script>for (let i = 0; i < 2; i++) fetch(${JSON.stringify(`${PERSISTENCE}/realtime/v1/api/broadcast`)}, { method: "POST", headers: { "content-type": "application/json", apikey: "mutant" }, body: JSON.stringify({ messages: [{ topic: "mutant", event: "scroll", payload: { i } }] }) }).catch(() => {});</script></body>`
      );
    case "secret-in-body":
      // secret-in-body (since 1.52.0, secrets-in-response's mutant): a server load that hands a private setting to the
      // page, serialised where no one sees it but every browser receives it.
      return html.replace("</body>", `<script type="application/json" id="harness-mutant-leak">${JSON.stringify({ authSecret: process.env.PRIVATE_AUTH_SECRET ?? "" })}</script></body>`);
    default:
      return html;
  }
}

http
  .createServer((req, res) => {
    if (MUTANT === "extra-chunk" && (req.url ?? "").split("?")[0] === PLANTED_CHUNK) {
      const body = PLANTED_CHUNK_BODY;
      res.writeHead(200, { "content-type": "text/javascript", "content-length": String(Buffer.byteLength(body)), "cache-control": "public, max-age=31536000, immutable" });
      return res.end(body);
    }
    if (MUTANT === "slo-5xx-burst" && (req.url ?? "").split("?")[0] === BURST_PATH) {
      burst500s += 1;
      res.writeHead(500, { "content-type": "text/plain", "cache-control": "no-store" });
      return res.end("mutant: planted 500");
    }
    const isMetrics = METRICS_REWRITING.includes(MUTANT) && (req.url ?? "").split("?")[0] === "/metrics";
    // The rewritten bodies are read as text: ask the app for them uncompressed.
    if (isMetrics) delete req.headers["accept-encoding"];
    if (MUTANT === "route-500" && ROUTE.test(req.url ?? "")) {
      res.writeHead(500, { "content-type": "text/plain" });
      return res.end("mutant: planted 500");
    }
    const upstream = http.request({ host: "127.0.0.1", port: INNER, method: req.method, path: req.url, headers: req.headers }, (up) => {
      const headers = { ...up.headers };
      if (MUTANT === "dropped-header") delete headers["x-content-type-options"];
      // replay-header (since 1.28.0, the replay set's mutant): the same header dropped on /note/ pages only, which no
      // journey but the replay set opens on the fixture course.
      if (MUTANT === "replay-header" && /^\/note\//.test(req.url ?? "")) delete headers["x-content-type-options"];

      const rewrite = ((REWRITING.includes(MUTANT) && isHtml(headers)) || isMetrics) && !headers["content-encoding"];
      const delay = MUTANT in SLOW && isHtml(headers) ? DELAY_MS : 0;
      // log-level-flood (logs' mutant): a warning for every page served.
      if (MUTANT === "log-level-flood" && isHtml(headers)) log("warn", `mutant: planted warning for ${req.method} ${(req.url ?? "").split("?")[0]}`);

      if (!rewrite) {
        setTimeout(() => {
          res.writeHead(up.statusCode ?? 502, headers);
          up.pipe(res);
        }, delay);
        return;
      }
      const chunks = [];
      up.on("data", (c) => chunks.push(c));
      up.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        const body = Buffer.from(isMetrics ? mutateMetrics(text) : mutateHtml(text), "utf8");
        headers["content-length"] = String(body.length);
        // A streamed (chunked) answer now has a length: both headers together are not HTTP/1.1.
        delete headers["transfer-encoding"];
        delete headers["etag"];
        res.writeHead(up.statusCode ?? 502, headers);
        res.end(body);
      });
    });
    upstream.on("error", () => {
      res.writeHead(502);
      res.end("mutant proxy: upstream unavailable");
    });
    req.pipe(upstream);
  })
  .listen(PORT, "0.0.0.0", () => console.log(JSON.stringify({ level: "info", message: "mutant proxy listening", mutant: MUTANT, port: PORT, inner: INNER })));
