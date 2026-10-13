// The trusted edge a Tutors app expects in front of it, for one upstream.
//
// SvelteKit 3's adapter-node has no runtime ORIGIN: an app learns its own
// origin from the request, and without a proxy header it assumes https. The
// harness publishes plain http on localhost, so a Kit 3 reader would compare
// the browser's http origin with an https one it made up and refuse sign-in.
// Production puts a proxy here that says which protocol the browser used; this
// is that proxy, saying "http". Older images still read ORIGIN and ignore it.
//
//   node fixtures/edge/forwarded.mjs
//     UPSTREAM=http://reader-auth-a:3000 PORT=3000
import http from "node:http";

const PORT = Number(process.env.PORT ?? 3000);
const target = new URL(process.env.UPSTREAM ?? "http://reader-auth-a:3000");

http
  .createServer((req, res) => {
    const headers = { ...req.headers, "x-forwarded-proto": "http" };
    const upstream = http.request({ host: target.hostname, port: target.port || 80, method: req.method, path: req.url, headers }, (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    });
    upstream.on("error", (error) => {
      if (res.headersSent) return res.destroy(error);
      res.writeHead(502, { "content-type": "text/plain" });
      res.end(`edge: upstream unavailable: ${error.message}`);
    });
    req.pipe(upstream);
  })
  .listen(PORT, "0.0.0.0", () => console.log(JSON.stringify({ level: "info", message: "forwarding edge listening", port: PORT, upstream: target.href })));
