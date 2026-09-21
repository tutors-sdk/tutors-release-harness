/**
 * The bus seam. The monorepo will add a message bus; the harness must compare
 * what each side publishes from the first bus-carrying release, so the
 * collector's interface exists before the bus does.
 *
 * A transport answers "which topics did this side publish to since the last
 * reset, and how many messages each?" Nothing else about the bus (its broker,
 * its wire format, its schemas) reaches the harness: the engine
 * (src/compare/extra.ts) sees `BusPublish` records only, and applies the same
 * rules as for a persistence write. docs/bus.md says how a real transport
 * would be wired.
 */
import type { BusPublish, BusStatus, SideName } from "../types.ts";

export type { BusPublish, BusStatus };

/** Records what one side published to the bus, one journey at a time. */
export interface BusTransport {
  /** Transport name (`http-recorder`, …); shown in the capture and in logs. */
  readonly name: string;
  /** Forget everything recorded so far. */
  reset(): Promise<void>;
  /** Publishes since the last reset, in any order and possibly several per topic; the collector normalises them. */
  published(): Promise<{ topic: string; messages?: number }[]>;
}

/** Makes a transport for one side from the address the operator configured. */
export type BusTransportFactory = (address: string, side: SideName) => BusTransport;

/** The reason recorded, and logged, when no bus is configured. Loud on purpose: an absent collector must not read as a clean bus. */
export const NOT_COLLECTED_NO_BUS = "not collected: no bus configured";
/** Post-deploy mode's live side is not a harness stack, so there is no bus recorder to read. */
export const NOT_COLLECTED_EXTERNAL = "not collected: external deployment";

/** Collapse raw publishes to the normal form: one record per topic, messages ≥ 1, sorted by topic. */
export function normalisePublishes(raw: { topic: string; messages?: number }[]): BusPublish[] {
  const byTopic = new Map<string, number>();
  for (const p of raw) byTopic.set(p.topic, (byTopic.get(p.topic) ?? 0) + Math.max(1, Math.floor(p.messages ?? 1) || 1));
  return [...byTopic.entries()].sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)).map(([topic, messages]) => ({ topic, messages }));
}

const TRANSPORTS = new Map<string, BusTransportFactory>();

export function registerBusTransport(name: string, factory: BusTransportFactory): void {
  TRANSPORTS.set(name, factory);
}

/** How the operator asked for bus collection: `HARNESS_BUS=<transport>:<address>`; `{side}` in the address becomes `a` or `b`. */
export type BusConfig = { kind: "none" } | { kind: "transport"; name: string; address: string };

export function parseBusConfig(value: string | undefined): BusConfig {
  const text = value?.trim();
  if (!text) return { kind: "none" };
  const at = text.indexOf(":");
  if (at <= 0 || at === text.length - 1) throw new Error(`HARNESS_BUS must be <transport>:<address>, got "${text}"`);
  return { kind: "transport", name: text.slice(0, at), address: text.slice(at + 1) };
}

/**
 * The collector for one side. With no bus configured it is inert and says so:
 * `status` carries the reason, `reset`/`published` do nothing. An unknown
 * transport is an error, never a fallback to "not collected".
 */
export interface BusCollector {
  status: BusStatus;
  reset(): Promise<void>;
  /** The journey's publishes, or undefined when nothing is collected. */
  read(): Promise<BusPublish[] | undefined>;
}

export function busCollector(side: SideName, opts: { config?: BusConfig; external?: boolean; transports?: Map<string, BusTransportFactory> } = {}): BusCollector {
  const config = opts.config ?? parseBusConfig(process.env.HARNESS_BUS);
  const notCollected = (reason: string): BusCollector => ({ status: { collected: false, reason }, reset: async () => {}, read: async () => undefined });
  if (opts.external) return notCollected(NOT_COLLECTED_EXTERNAL);
  if (config.kind === "none") return notCollected(NOT_COLLECTED_NO_BUS);
  const registry = opts.transports ?? TRANSPORTS;
  const factory = registry.get(config.name);
  if (!factory) throw new Error(`unknown bus transport "${config.name}" (HARNESS_BUS); known: ${[...registry.keys()].sort().join(", ") || "none"}`);
  const transport = factory(config.address.replaceAll("{side}", side), side);
  return { status: { collected: true, transport: transport.name }, reset: () => transport.reset(), read: async () => normalisePublishes(await transport.published()) };
}
