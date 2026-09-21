import { registerBusTransport, type BusTransport } from "./transport.ts";

type Fetch = typeof fetch;

/** `bus-a.harness.test` as the containers see it, rewritten for the harness's own Node process (as for the persistence stub). */
function fromHost(address: string): string {
  return address.replace(/bus-[ab]\.harness\.test/, "localhost");
}

/**
 * The harness's own bus-stub protocol, mirroring the persistence stub's: the
 * stub the apps publish to keeps a log and serves it.
 *
 *   GET  /_harness/published -> [{ "topic": "...", "messages": 1 }, ...]
 *   POST /_harness/reset     -> 204
 *
 * No stub ships yet (there is no bus); this is the wire a future one speaks.
 */
export function httpRecorder(address: string, fetchImpl: Fetch = (input, init) => fetch(input, init)): BusTransport {
  const base = fromHost(address);
  return {
    name: "http-recorder",
    async reset() {
      const response = await fetchImpl(`${base}/_harness/reset`, { method: "POST" });
      if (!response.ok) throw new Error(`POST ${base}/_harness/reset -> ${response.status}`);
    },
    async published() {
      const response = await fetchImpl(`${base}/_harness/published`);
      if (!response.ok) throw new Error(`GET ${base}/_harness/published -> ${response.status}`);
      return (await response.json()) as { topic: string; messages?: number }[];
    }
  };
}

registerBusTransport("http-recorder", (address) => httpRecorder(address));
