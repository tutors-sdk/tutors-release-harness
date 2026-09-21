import { describe, expect, it } from "vitest";
import { parseClaims } from "../src/claims/schema.ts";
import { matchClaims } from "../src/claims/matcher.ts";
import { httpRecorder } from "../src/bus/http-recorder.ts";
import { NOT_COLLECTED_EXTERNAL, NOT_COLLECTED_NO_BUS, busCollector, normalisePublishes, parseBusConfig, type BusTransport, type BusTransportFactory } from "../src/bus/transport.ts";
import { busStatusLine, ledgersFor, readLedgers, resetLedgers } from "../src/collectors/ledgers.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { BusPublish, BusStatus, SideCapture, SideName } from "../src/types.ts";
import { capture, journey } from "./support/captures.ts";

const NL = String.fromCharCode(10);
const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const collected: BusStatus = { collected: true, transport: "fake" };
const withBus = (side: SideName, bus: BusPublish[] | undefined, opts: { anonymous?: boolean; journey?: string; status?: BusStatus } = {}) =>
  capture(side, { journeys: [journey({ ...(bus ? { bus } : {}), ...(opts.anonymous === undefined ? {} : { anonymous: opts.anonymous }), ...(opts.journey ? { journey: opts.journey } : {}) })], ...(opts.status ? { bus: opts.status } : {}) });

/** An in-memory transport: what a real one would answer, without a broker. */
class FakeBus implements BusTransport {
  readonly name = "fake";
  private sent: { topic: string; messages?: number }[] = [];
  publish(topic: string, messages?: number) {
    this.sent.push({ topic, ...(messages === undefined ? {} : { messages }) });
  }
  async reset() {
    this.sent = [];
  }
  async published() {
    return [...this.sent];
  }
}

describe("bus configuration", () => {
  it("nothing configured is not an error, it is 'not collected', and says so", () => {
    expect(parseBusConfig(undefined)).toEqual({ kind: "none" });
    expect(parseBusConfig("  ")).toEqual({ kind: "none" });
    const collector = busCollector("a", { config: { kind: "none" } });
    expect(collector.status).toEqual({ collected: false, reason: NOT_COLLECTED_NO_BUS });
    expect(NOT_COLLECTED_NO_BUS).toBe("no bus configured");
    expect(busStatusLine("a", collector.status)).toContain("NOT COLLECTED: bus traffic on side a: no bus configured");
  });

  it("<transport>:<address> parses, anything else is refused", () => {
    expect(parseBusConfig("http-recorder:http://bus-{side}.harness.test:8092")).toEqual({ kind: "transport", name: "http-recorder", address: "http://bus-{side}.harness.test:8092" });
    expect(() => parseBusConfig("nats")).toThrow(/<transport>:<address>/);
    expect(() => parseBusConfig(":x")).toThrow(/<transport>:<address>/);
  });

  it("an unknown transport is an error, never a quiet 'not collected'", () => {
    expect(() => busCollector("a", { config: { kind: "transport", name: "kafka", address: "x" }, transports: new Map() })).toThrow(/unknown bus transport "kafka"/);
  });

  it("an external side is not collected, for its own stated reason", () => {
    expect(busCollector("b", { external: true, config: { kind: "transport", name: "fake", address: "x" } }).status).toEqual({ collected: false, reason: NOT_COLLECTED_EXTERNAL });
  });

  it("{side} in the address becomes the side", async () => {
    const seen: string[] = [];
    const factory: BusTransportFactory = (address) => {
      seen.push(address);
      return new FakeBus();
    };
    busCollector("a", { config: { kind: "transport", name: "fake", address: "bus-{side}" }, transports: new Map([["fake", factory]]) });
    busCollector("b", { config: { kind: "transport", name: "fake", address: "bus-{side}" }, transports: new Map([["fake", factory]]) });
    expect(seen).toEqual(["bus-a", "bus-b"]);
  });
});

describe("normalisePublishes", () => {
  it("one record per topic, at least one message, sorted", () => {
    expect(normalisePublishes([{ topic: "b" }, { topic: "a", messages: 2 }, { topic: "b", messages: 3 }, { topic: "a", messages: 0 }])).toEqual([
      { topic: "a", messages: 3 },
      { topic: "b", messages: 4 }
    ]);
  });
});

describe("http-recorder transport", () => {
  it("reads the stub's log with the browser-facing host rewritten, and resets it", async () => {
    const calls: string[] = [];
    const fake = (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push(`${init?.method ?? "GET"} ${String(input)}`);
      return String(input).endsWith("/published") ? Response.json([{ topic: "course.viewed", messages: 2 }]) : new Response(null, { status: 204 });
    }) as typeof fetch;
    const transport = httpRecorder("http://bus-a.harness.test:8092", fake);
    await transport.reset();
    expect(await transport.published()).toEqual([{ topic: "course.viewed", messages: 2 }]);
    expect(calls).toEqual(["POST http://localhost:8092/_harness/reset", "GET http://localhost:8092/_harness/published"]);
    await expect(httpRecorder("http://localhost:1", (async () => new Response("", { status: 503 })) as typeof fetch).published()).rejects.toThrow(/-> 503/);
  });
});

describe("the collector around a journey", () => {
  const spec = { name: "a" as SideName, urls: { reader: "", catalogue: "", live: "", courseId: "x" } };

  it("with no bus, nothing is read and the journey capture is untouched", async () => {
    const ledgers = ledgersFor(spec, { bus: busCollector("a", { config: { kind: "none" } }) });
    await resetLedgers(ledgers);
    expect(await readLedgers(ledgers)).toEqual({});
  });

  it("with a transport, it resets before the journey and reads normalised topics after", async () => {
    const bus = new FakeBus();
    const collector = busCollector("a", { config: { kind: "transport", name: "fake", address: "x" }, transports: new Map([["fake", () => bus]]) });
    const ledgers = ledgersFor(spec, { bus: collector });
    bus.publish("leftover");
    await resetLedgers(ledgers);
    bus.publish("progress.recorded");
    bus.publish("progress.recorded");
    bus.publish("audit", 3);
    expect(collector.status).toEqual({ collected: true, transport: "fake" });
    expect(await readLedgers(ledgers)).toEqual({
      bus: [
        { topic: "audit", messages: 3 },
        { topic: "progress.recorded", messages: 2 }
      ]
    });
  });
});

describe("bus engine", () => {
  it("A/A: identical traffic produces nothing; so does a bus that was never collected on either side", () => {
    const traffic = [{ topic: "audit", messages: 1 }];
    expect(diff(withBus("a", traffic, { anonymous: false, status: collected }), withBus("b", traffic, { anonymous: false, status: collected }))).toEqual([]);
    expect(diff(capture("a"), capture("b"))).toEqual([]);
    expect(diff(withBus("a", undefined, { status: { collected: false, reason: NOT_COLLECTED_NO_BUS } }), withBus("b", undefined, { status: { collected: false, reason: NOT_COLLECTED_NO_BUS } }))).toEqual([]);
  });

  it("an anonymous journey that publishes on b only is a failing bus hunk, under the persistence rule", () => {
    const hunks = diff(withBus("a", [], { status: collected }), withBus("b", [{ topic: "progress.recorded", messages: 2 }], { status: collected }));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "bus", scope: "anonymous-student-reads-course/progress.recorded", severity: "fail" });
    expect(hunks[0]!.summary).toBe("anonymous-student-reads-course: anonymous journey published 2 message(s) to progress.recorded (PUBLISH) on b");
  });

  it("an anonymous publish on both sides is a product finding, reported but not gating", () => {
    const traffic = [{ topic: "progress.recorded", messages: 1 }];
    const hunks = diff(withBus("a", traffic, { status: collected }), withBus("b", traffic, { status: collected }));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "bus", severity: "info" });
    expect(hunks[0]!.summary).toMatch(/product finding/);
  });

  it("signed-in journeys must agree message for message, by topic", () => {
    const signed = (side: SideName, messages: number) => withBus(side, [{ topic: "progress.recorded", messages }], { anonymous: false, journey: "student-signs-in", status: collected });
    expect(diff(signed("a", 1), signed("b", 1))).toEqual([]);
    const hunks = diff(signed("a", 1), signed("b", 3));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "bus", scope: "student-signs-in/progress.recorded", severity: "fail" });
    expect(hunks[0]!.summary).toContain("1 message(s) on a, 3 on b");
  });

  it("must not flag: collected on one side only is one informational hunk and never a failure", () => {
    const hunks = diff(withBus("a", [{ topic: "audit", messages: 1 }], { anonymous: false, status: collected }), withBus("b", undefined, { anonymous: false, status: { collected: false, reason: NOT_COLLECTED_EXTERNAL } }));
    expect(hunks.map((h) => [h.artefact, h.severity])).toEqual([["bus", "info"]]);
  });

  it("a claim can name the bus artefact and covers a bus hunk", () => {
    const hunks = diff(withBus("a", [], { status: collected }), withBus("b", [{ topic: "audit", messages: 1 }], { status: collected }));
    const claims = parseClaims(["claims:", "  - artefact: bus", '    scope: "*/audit"', '    reason: "Rule 0042: audit events for anonymous reads"'].join(NL));
    expect(matchClaims(hunks, claims).unclaimed).toEqual([]);
  });
});
