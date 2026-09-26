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
//   POST   /realtime/v1/api/broadcast -> 202        accepted, not recorded (presence runs on timers)
//   WS     /realtime/v1/websocket  -> a Phoenix socket that replies ok to every push (joins, heartbeats,
//                                     presence) and never broadcasts; not recorded
//   GET    /_harness/writes        -> the log, oldest first
//   POST   /_harness/reset         -> clears the log
//
// Both sides get their own stub, so a write is attributable. The stub sends no
// Date header and no ids: nothing here may differ between the sides.
import { createHash } from "node:crypto";
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
  // Realtime's websocket is refused (no upgrade handler), so the client falls back to posting
  // presence broadcasts over REST on a timer. Answering 404 made the browser log a "Failed to load
  // resource ... 404" whose count per page depended on the timer, an A/A console diff. Accept them
  // as Supabase does; they are presence, not writes, so the persistence artefact does not record them.
  if (url.pathname === "/realtime/v1/api/broadcast" && req.method === "POST") {
    await readBody(req);
    return send(202);
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

// Realtime. The reader's Supabase client opens a websocket here for presence. Refusing it made the client
// log "WebSocket connection ... failed" and retry on a backoff timer, so whether a page's console held
// that message depended on whether a retry fell inside the page's window: an A/A console diff. So the
// stub accepts the socket and answers the Phoenix protocol (vsn 2.0.0: each text frame is
// [join_ref, ref, topic, event, payload]) with an ok reply to every push that carries a ref. It never
// sends anything unasked, so both sides see the same empty presence. Binary frames (user broadcasts,
// no ack requested) are read and dropped.
server.on("upgrade", (req, socket) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const key = req.headers["sec-websocket-key"];
  if (url.pathname !== "/realtime/v1/websocket" || typeof key !== "string") {
    socket.end("HTTP/1.1 404 Not Found\r\nconnection: close\r\n\r\n");
    return;
  }
  const accept = createHash("sha1").update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nupgrade: websocket\r\nconnection: Upgrade\r\nsec-websocket-accept: ${accept}\r\n\r\n`);
  socket.on("error", () => socket.destroy());
  let buffer = Buffer.alloc(0);
  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      const frame = readFrame(buffer);
      if (!frame) return;
      buffer = buffer.subarray(frame.length);
      if (frame.opcode === 0x8) {
        socket.end(frameOf(0x8, Buffer.alloc(0)));
        return;
      }
      if (frame.opcode === 0x9) socket.write(frameOf(0xa, frame.payload));
      if (frame.opcode === 0x1) {
        const reply = phoenixReply(frame.payload.toString("utf8"));
        if (reply) socket.write(frameOf(0x1, Buffer.from(reply)));
      }
    }
  });
});

function phoenixReply(text) {
  let message;
  try {
    message = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!Array.isArray(message)) return undefined;
  const [joinRef, ref, topic, event] = message;
  if (ref === null || ref === undefined) return undefined;
  const response = event === "phx_join" ? { postgres_changes: [] } : {};
  return JSON.stringify([joinRef ?? null, ref, topic, "phx_reply", { status: "ok", response }]);
}

/** One client frame from the start of the buffer (clients always mask), or undefined until it is all there. */
function readFrame(buffer) {
  if (buffer.length < 2) return undefined;
  const opcode = buffer[0] & 0x0f;
  const masked = (buffer[1] & 0x80) !== 0;
  let length = buffer[1] & 0x7f;
  let offset = 2;
  if (length === 126) {
    if (buffer.length < 4) return undefined;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 10) return undefined;
    length = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }
  const maskAt = offset;
  if (masked) offset += 4;
  if (buffer.length < offset + length) return undefined;
  const payload = Buffer.from(buffer.subarray(offset, offset + length));
  if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= buffer[maskAt + (i % 4)];
  return { opcode, payload, length: offset + length };
}

/** One unmasked, unfragmented server frame. */
function frameOf(opcode, payload) {
  const head = payload.length < 126 ? Buffer.from([0x80 | opcode, payload.length]) : payload.length < 65536 ? Buffer.from([0x80 | opcode, 126, 0, 0]) : Buffer.from([0x80 | opcode, 127, 0, 0, 0, 0, 0, 0, 0, 0]);
  if (payload.length >= 126 && payload.length < 65536) head.writeUInt16BE(payload.length, 2);
  if (payload.length >= 65536) head.writeBigUInt64BE(BigInt(payload.length), 2);
  return Buffer.concat([head, payload]);
}

server.listen(port, () => console.log(JSON.stringify({ level: "info", message: "persistence stub listening", port })));
