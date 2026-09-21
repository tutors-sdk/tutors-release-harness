import { busCollector, type BusCollector } from "../bus/transport.ts";
import "../bus/http-recorder.ts";
import { notCollectedText } from "../not-collected.ts";
import { persistenceBackend, type PersistenceBackend, type WriteRecorder } from "../persistence/recorder.ts";
import "../persistence/supabase-rest.ts";
import type { BusStatus, JourneyCapture, SideSpec } from "../types.ts";

/**
 * The write ledgers of one side: what it persisted and what it published,
 * each behind its own seam. `captureSide` resets them before a journey and
 * reads them after; nothing here knows a backend's shape.
 */
export interface Ledgers {
  persistence?: WriteRecorder;
  bus: BusCollector;
}

export function ledgersFor(spec: Pick<SideSpec, "name" | "urls" | "external">, opts: { backend?: PersistenceBackend; bus?: BusCollector } = {}): Ledgers {
  const stub = spec.urls.persistence;
  return {
    ...(stub ? { persistence: (opts.backend ?? persistenceBackend()).recorder(stub) } : {}),
    bus: opts.bus ?? busCollector(spec.name, { external: spec.external === true })
  };
}

export async function resetLedgers(ledgers: Ledgers): Promise<void> {
  await ledgers.persistence?.reset();
  await ledgers.bus.reset();
}

/** What to merge into the journey's capture: `persistence` when the side has a stub, `bus` when bus traffic is collected. */
export async function readLedgers(ledgers: Ledgers): Promise<Partial<Pick<JourneyCapture, "persistence" | "bus">>> {
  const out: Partial<Pick<JourneyCapture, "persistence" | "bus">> = {};
  if (ledgers.persistence) out.persistence = await ledgers.persistence.writes();
  const bus = await ledgers.bus.read();
  if (bus) out.bus = bus;
  return out;
}

/** The line the run log carries when a side's bus is not collected: loud, because silence would read as a clean bus. */
export function busStatusLine(side: "a" | "b", status: BusStatus): string {
  return status.collected ? `  ${side}: bus traffic collected via ${status.transport}` : `  ${notCollectedText({ what: "bus traffic", side, reason: status.reason })} (set HARNESS_BUS to collect it; see docs/bus.md)`;
}
