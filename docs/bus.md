# The bus collector

Status: interface and rule shipped in 1.2.0, **disabled** until a bus exists.

The monorepo plans a message bus. The harness compares what each side
*publishes* the way it compares what each side *persists*, so the first
bus-carrying release is already compared rather than discovered by the second.

## What is compared

Per journey, per side: the topics published to and how many messages each,
normalised to `{ topic, messages }` (one record per topic, sorted). Payloads,
ordering across topics and timing are not compared: the artefact says *where*
a side tried to write, as the persistence artefact says *which table*.

The rule is the persistence rule (`src/compare/ledger.ts`, shared by both):

- the two sides must agree, by topic and count;
- an anonymous journey must publish nothing. A publish on side b is a failing
  `bus` hunk; a publish on both sides is an informational product finding.

Hunks carry the artefact `bus` and the scope `<journey>/<topic>`, so a claim is
`artefact: bus, scope: "student-signs-in/progress.recorded"`.

## Off by default, and loud about it

With `HARNESS_BUS` unset the collector does nothing and says so:

- the run log has a line per side, `bus traffic not collected: no bus
  configured (set HARNESS_BUS to collect it; see docs/bus.md)`;
- each side's `capture.json` carries `"bus": { "collected": false, "reason":
  "not collected: no bus configured" }`, so an absent collector can never be
  read as a clean bus;
- no journey capture gets a `bus` field, the engine produces no hunk, and
  `report.json`, `report.md` and `report.html` are byte-for-byte what they were.

A side that is a live deployment (post-deploy mode) records `not collected:
external deployment`. If one side collected and the other did not, the engine
emits a single informational hunk (`bus/collection`) and no comparison; it
never fails the run.

An unknown transport name in `HARNESS_BUS` is an error (exit 2), not a
fallback: recording with the wrong transport would silently record nothing.

Surfacing "not collected" in `report.md` would change every existing report, so
it is left to whoever ships the bus; the natural place is one `reasons` line
once a bus is expected to be present.

## The transport seam

`src/bus/transport.ts`:

```ts
interface BusTransport {
  readonly name: string;
  reset(): Promise<void>;                                    // before each journey
  published(): Promise<{ topic: string; messages?: number }[]>; // after it
}
```

`HARNESS_BUS=<transport>:<address>`, where `{side}` in the address becomes `a`
or `b`. Transports register themselves with `registerBusTransport(name,
factory)`. Tests drive the whole path with an in-memory transport
(`tests/bus.test.ts`); nothing needs a broker or Docker.

One transport ships, `http-recorder`, the harness's own bus-stub protocol,
mirroring the persistence stub's:

```
GET  /_harness/published   -> [{ "topic": "progress.recorded", "messages": 2 }]
POST /_harness/reset       -> 204
```

## How it would be wired when the bus exists

There are two shapes, and the transport interface does not care which:

1. **A stub the apps publish to** (preferred: same as persistence). Add
   `fixtures/bus/stub.mjs` speaking the bus's client protocol and the two
   `_harness` routes above, one instance per side
   (`bus-a.harness.test`, `bus-b.harness.test`), with the apps'
   bus-URL environment variable pointing at their side's stub in
   `compose.harness.yaml` and the kind manifests, identically on both sides
   (the "stacks are identical" test in `tests/stack.test.ts` then covers it).
   Then `HARNESS_BUS=http-recorder:http://bus-{side}.harness.test:8092`. No
   broker, no state leaks between runs, and a write is attributable to a side.
2. **A subscriber on a real broker.** Write a transport whose `reset()` records
   a start offset or opens a wildcard subscription per side and whose
   `published()` counts what arrived on each topic since. It registers under
   its own name; nothing else changes.

Either way, the steps when the bus ships are:

1. Pick the shape; add the stub or the transport (a new file, a
   `registerBusTransport` call, and its imports beside `http-recorder` in
   `src/collectors/ledgers.ts`).
2. Set `HARNESS_BUS` in the workflows (`compose.harness.yaml` env for the
   stub; a repository variable for the workflow step).
3. Run an A/A (`noise` mode). Topics carrying timestamps or ids belong in
   topic *names* never; if a name is not stable it is a masking decision for
   `normalise/masks.yaml`, with a reason, like any other.
4. Add the three tests TESTING.md demands for the new stub: A/A, a planted
   publish on an anonymous journey, a change it must not flag; and a mutant
   that publishes from an anonymous journey.
5. Because `bus` is a new artefact already in the contract (1.2.0), no
   further contract bump is needed to start emitting hunks.
