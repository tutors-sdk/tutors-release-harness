// Mutant wrapper: starts the real Tutors server on an internal port and
// proxies port 3000 to it, planting exactly one fault chosen by MUTANT.
//
// Faults are planted at the HTTP edge rather than in the source so a mutant
// can be built from any published image tag without the monorepo. Each one
// is the kind of regression a release could ship; the harness must catch
// every one and name the right artefact (see mutants.yaml).
import { spawn } from "node:child_process";
import http from "node:http";

const MUTANT = process.env.MUTANT ?? "none";
const PORT = Number(process.env.PORT ?? 3000);
const INNER = PORT + 1000;
const ROUTE = new RegExp(process.env.MUTANT_ROUTE ?? "^/course/");
const DELAY_MS = Number(process.env.MUTANT_DELAY_MS ?? 400);
// Where this side persists: set on the anonymous readers as HARNESS_PERSISTENCE_URL
// (ignored by the apps) and on the signed-in readers as PUBLIC_SUPABASE_URL.
const PERSISTENCE = process.env.HARNESS_PERSISTENCE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? "";

const child = spawn(process.execPath, ["build/index.js"], { env: { ...process.env, PORT: String(INNER) }, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => child.kill(signal));

const isHtml = (headers) => /text\/html/.test(headers["content-type"] ?? "");
const REWRITING = ["console-error", "dom-note", "missing-alt", "anon-write", "focus-order"];

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
    default:
      return html;
  }
}

http
  .createServer((req, res) => {
    if (MUTANT === "route-500" && ROUTE.test(req.url ?? "")) {
      res.writeHead(500, { "content-type": "text/plain" });
      return res.end("mutant: planted 500");
    }
    const upstream = http.request({ host: "127.0.0.1", port: INNER, method: req.method, path: req.url, headers: req.headers }, (up) => {
      const headers = { ...up.headers };
      if (MUTANT === "dropped-header") delete headers["x-content-type-options"];

      const rewrite = REWRITING.includes(MUTANT) && isHtml(headers) && !headers["content-encoding"];
      const delay = MUTANT === "slow-ssr" && isHtml(headers) ? DELAY_MS : 0;

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
        const body = Buffer.from(mutateHtml(Buffer.concat(chunks).toString("utf8")), "utf8");
        headers["content-length"] = String(body.length);
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
