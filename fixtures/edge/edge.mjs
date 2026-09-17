// Edge proxy for upgrade mode: one entry point whose upstream can be switched
// while traffic flows, standing in for the ingress/router in front of a
// rolling deployment.
//
//   node fixtures/edge/edge.mjs
//     UPSTREAM_A=http://reader-a:3000 UPSTREAM_B=http://reader-b:3000 PORT=3000
//
//   POST /_harness/switch?to=b     new requests go to B; in-flight ones finish on A
//   GET  /_harness/state           {"upstream":"a","switched":n,"inFlight":n}
//
// Every proxied response gets an `x-harness-upstream: a|b` header so the load
// generator can attribute failures to the side that produced them.
import http from "node:http";

const PORT = Number(process.env.PORT ?? 3000);
const upstreams = { a: new URL(process.env.UPSTREAM_A ?? "http://reader-a:3000"), b: new URL(process.env.UPSTREAM_B ?? "http://reader-b:3000") };
let current = "a";
let switched = 0;
let inFlight = 0;

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname === "/_harness/switch" && req.method === "POST") {
      const to = url.searchParams.get("to");
      if (to !== "a" && to !== "b") {
        res.writeHead(400);
        return res.end("to=a|b");
      }
      current = to;
      switched += 1;
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ upstream: current }));
    }
    if (url.pathname === "/_harness/state") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ upstream: current, switched, inFlight }));
    }

    const side = current;
    const target = upstreams[side];
    inFlight += 1;
    const upstream = http.request(
      { host: target.hostname, port: target.port || 80, method: req.method, path: req.url, headers: { ...req.headers, host: req.headers.host ?? target.host } },
      (up) => {
        res.writeHead(up.statusCode ?? 502, { ...up.headers, "x-harness-upstream": side });
        up.pipe(res);
        up.on("end", () => (inFlight -= 1));
      }
    );
    upstream.on("error", (error) => {
      inFlight -= 1;
      res.writeHead(502, { "content-type": "text/plain", "x-harness-upstream": side });
      res.end(`edge: upstream ${side} unavailable: ${error.message}`);
    });
    req.pipe(upstream);
  })
  .listen(PORT, "0.0.0.0", () => console.log(JSON.stringify({ level: "info", message: "edge listening", port: PORT, upstream: current })));
