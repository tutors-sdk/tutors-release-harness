// Static server for the pinned fixture course, shared by both sides.
//
//   node fixtures/course-server/serve.mjs [root] [port] [root port]...
//
// Since 1.44.0 it takes more than one root and port pair, one server each: the
// fixture course on 8080 and the Rule journeys' course (rules-course) on 8081.
//
// The reader fetches `http://<courseid>/tutors.json` from the browser, so every
// response allows any origin, as Netlify does for published courses. Responses
// carry no Date, ETag or Last-Modified header: the fixture must never be a
// source of noise between the two sides.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const args = process.argv.slice(2);
const pairs = args.length ? [] : [[process.env.COURSE_ROOT ?? "fixtures/course-server/course", process.env.PORT ?? "8080"]];
for (let i = 0; i < args.length; i += 2) pairs.push([args[i], args[i + 1] ?? process.env.PORT ?? "8080"]);

const TYPES = {
  ".json": "application/json",
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".marp": "text/markdown; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8"
};

const serve = (root) => (req, res) => {
  // Node adds a Date header by default; the fixture is deterministic without it.
  res.sendDate = false;
  const headers = { "access-control-allow-origin": "*", "cache-control": "no-store" };
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);

  if (pathname === "/healthz") return res.writeHead(200, headers).end("ok");

  const file = normalize(join(root, pathname));
  if (!file.startsWith(root)) return res.writeHead(403, headers).end();
  try {
    const target = statSync(file).isDirectory() ? join(file, "index.html") : file;
    statSync(target);
    res.writeHead(200, { ...headers, "content-type": TYPES[extname(target)] ?? "application/octet-stream" });
    createReadStream(target).pipe(res);
  } catch {
    res.writeHead(404, headers).end("not found");
  }
};

for (const [dir, p] of pairs) {
  const root = resolve(dir);
  const port = Number(p);
  createServer(serve(root)).listen(port, () => console.log(JSON.stringify({ level: "info", message: "fixture course server listening", port, root })));
}
