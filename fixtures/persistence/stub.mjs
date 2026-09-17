// Persistence stub: a Supabase-REST-shaped server that answers every query
// with nothing and records every write, so the harness can see exactly what
// each side tried to persist during a journey.
//
//   node fixtures/persistence/stub.mjs [port]
//
//   GET    /rest/v1/<table>        -> []            (reads see an empty table)
//   POST   /rest/v1/<table>        -> 201 [body]    recorded as a write
//   PATCH  /rest/v1/<table>        -> 200 []        recorded as a write
//   DELETE /rest/v1/<table>        -> 204           recorded as a write
//   POST   /rest/v1/rpc/<fn>       -> 200 []        recorded as an rpc call
//   *      /auth/v1/*              -> 200 {}        (no sessions here; identity is fixtures/identity)
//   GET    /_harness/writes        -> the log, oldest first
//   POST   /_harness/reset         -> clears the log
//
// Both sides get their own stub, so a write is attributable. The stub sends no
// Date header and no ids: nothing here may differ between the sides.
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? process.env.PORT ?? 8090);
let writes = [];
let seq = 0;

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "access-control-expose-headers": "*",
  "cache-control": "no-store"
};

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

const server = createServer(async (req, res) => {
  res.sendDate = false;
  const url = new URL(req.url ?? "/", "http://localhost");
  const send = (status, body, extra = {}) => {
    const text = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
    res.writeHead(status, { ...cors, ...extra, ...(text ? { "content-type": "application/json" } : {}) });
    res.end(text);
  };

  if (req.method === "OPTIONS") return send(204);
  if (url.pathname === "/healthz") return send(200, { status: "ok" });
  if (url.pathname === "/_harness/writes") return send(200, writes);
  if (url.pathname === "/_harness/reset" && req.method === "POST") {
    writes = [];
    return send(204);
  }

  const rest = /^\/rest\/v1\/(rpc\/)?([^/?]+)/.exec(url.pathname);
  if (rest) {
    const [, rpc, name] = rest;
    const body = await readBody(req);
    if (rpc) {
      writes.push({ seq: ++seq, kind: "rpc", method: req.method, table: name });
      return send(200, []);
    }
    switch (req.method) {
      case "GET":
      case "HEAD":
        return send(200, [], { "content-range": "*/0" });
      case "POST": {
        writes.push({ seq: ++seq, kind: "write", method: "POST", table: name, rows: rowCount(body) });
        return send(201, body ? safeJson(body) : []);
      }
      case "PATCH":
      case "PUT":
        writes.push({ seq: ++seq, kind: "write", method: req.method, table: name, rows: rowCount(body) });
        return send(200, []);
      case "DELETE":
        writes.push({ seq: ++seq, kind: "write", method: "DELETE", table: name, rows: 0 });
        return send(204);
      default:
        return send(405);
    }
  }
  if (url.pathname.startsWith("/auth/v1/")) {
    await readBody(req);
    return send(200, {});
  }
  if (url.pathname.startsWith("/storage/v1/")) return send(404, { message: "no storage in the harness" });
  return send(404, { message: "not found" });
});

function safeJson(text) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}
function rowCount(text) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.length : 1;
  } catch {
    return 1;
  }
}

server.listen(port, () => console.log(JSON.stringify({ level: "info", message: "persistence stub listening", port })));
