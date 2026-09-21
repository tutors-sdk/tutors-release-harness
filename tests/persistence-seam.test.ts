import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { ledgersFor, readLedgers, resetLedgers } from "../src/collectors/ledgers.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { normaliseWrite, persistenceBackend, registerPersistenceBackend } from "../src/persistence/recorder.ts";
import { supabaseRestBackend } from "../src/persistence/supabase-rest.ts";
import type { PersistenceWrite, SideCapture, SideName } from "../src/types.ts";
import { capture, journey } from "./support/captures.ts";
import { FakePostgresWire, fakePostgresBackend } from "./support/fake-postgres-wire.ts";

const ROOT = resolve(import.meta.dirname, "..");
const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const withWrites = (side: SideName, persistence: PersistenceWrite[], overrides: { anonymous?: boolean; journey?: string } = {}) => capture(side, { journeys: [journey({ persistence, ...overrides })] });

describe("normaliseWrite", () => {
  it("is the identity on what the Supabase stub emits, and fixes what a backend may leave loose", () => {
    expect(normaliseWrite({ kind: "write", method: "POST", table: "t", rows: 2 })).toEqual({ kind: "write", method: "POST", table: "t", rows: 2 });
    expect(normaliseWrite({ kind: "rpc", method: "POST", table: "fn" })).toEqual({ kind: "rpc", method: "POST", table: "fn", rows: 0 });
    expect(normaliseWrite({ method: "insert", table: "t", rows: -3 })).toEqual({ kind: "write", method: "INSERT", table: "t", rows: 0 });
  });
});

describe("Supabase-REST backend (first implementation of the seam)", () => {
  it("asks the stub, with the browser-facing host rewritten, and returns normalised writes without sequence numbers", async () => {
    const calls: string[] = [];
    const fake = (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push(`${init?.method ?? "GET"} ${String(input)}`);
      return String(input).endsWith("/writes")
        ? Response.json([
            { seq: 1, kind: "write", method: "POST", table: "learning_records", rows: 1 },
            { seq: 2, kind: "rpc", method: "POST", table: "get_error_counts" }
          ])
        : new Response(null, { status: 204 });
    }) as typeof fetch;
    const recorder = supabaseRestBackend(fake).recorder("http://persistence-a.harness.test:8090");
    await recorder.reset();
    expect(await recorder.writes()).toEqual([
      { kind: "write", method: "POST", table: "learning_records", rows: 1 },
      { kind: "rpc", method: "POST", table: "get_error_counts", rows: 0 }
    ]);
    expect(calls).toEqual(["POST http://localhost:8090/_harness/reset", "GET http://localhost:8090/_harness/writes"]);
  });

  it("a stub that answers an error is an error, not an empty ledger", async () => {
    const recorder = supabaseRestBackend((async () => new Response("no", { status: 500 })) as typeof fetch).recorder("http://localhost:1");
    await expect(recorder.writes()).rejects.toThrow(/-> 500/);
    await expect(recorder.reset()).rejects.toThrow(/-> 500/);
  });

  it("is the default backend; an unknown name is refused rather than falling back", () => {
    expect(persistenceBackend(undefined).name).toBe("supabase-rest");
    expect(persistenceBackend("").name).toBe("supabase-rest");
    expect(() => persistenceBackend("mysql")).toThrow(/unknown persistence backend "mysql".*supabase-rest/);
  });
});

describe("the real stub through the seam", () => {
  let child: ChildProcess;
  let base: string;
  beforeAll(async () => {
    const port = await new Promise<number>((res) => {
      const s = createServer().listen(0, () => {
        const p = (s.address() as { port: number }).port;
        s.close(() => res(p));
      });
    });
    child = spawn(process.execPath, [resolve(ROOT, "fixtures/persistence/stub.mjs"), String(port)], { stdio: ["ignore", "pipe", "pipe"] });
    await new Promise<void>((res, rej) => {
      child.stdout!.on("data", (c) => String(c).includes("listening") && res());
      child.on("exit", (code) => rej(new Error(`stub exited ${code}`)));
      setTimeout(() => rej(new Error("stub did not start")), 15_000);
    });
    base = `http://localhost:${port}`;
  }, 20_000);
  afterAll(() => child.kill());

  it("records by table and method and reset clears, exactly as before the seam", async () => {
    const recorder = persistenceBackend().recorder(base);
    await recorder.reset();
    await fetch(`${base}/rest/v1/learning_records`, { method: "POST", body: JSON.stringify([{ a: 1 }, { a: 2 }]) });
    await fetch(`${base}/rest/v1/learning_records`, { method: "DELETE" });
    await fetch(`${base}/rest/v1/rpc/get_error_counts`, { method: "POST", body: "{}" });
    await fetch(`${base}/rest/v1/learning_records`);
    expect(await recorder.writes()).toEqual([
      { kind: "write", method: "POST", table: "learning_records", rows: 2 },
      { kind: "write", method: "DELETE", table: "learning_records", rows: 0 },
      { kind: "rpc", method: "POST", table: "get_error_counts", rows: 0 }
    ]);
    await recorder.reset();
    expect(await recorder.writes()).toEqual([]);
  });
});

describe("a second backend drives the same collector and the same rule", () => {
  // A Postgres-wire-shaped fake: no HTTP, no Docker, its own vocabulary (INSERT, not POST).
  const wires = new Map<string, FakePostgresWire>();
  const backend = fakePostgresBackend(wires);
  const spec = (side: SideName) => ({ name: side, urls: { reader: "", catalogue: "", live: "", courseId: "x", persistence: `pg://${side}` } });

  /** What captureSide does around one journey, with the journey's own database traffic in the middle. */
  async function runJourney(side: SideName, traffic: (wire: FakePostgresWire) => void) {
    const ledgers = ledgersFor(spec(side), { backend });
    await resetLedgers(ledgers);
    traffic(wires.get(`pg://${side}`)!);
    return readLedgers(ledgers);
  }

  it("the collector resets before a journey, so each journey's ledger is its own", async () => {
    await runJourney("a", (w) => w.execute("insert into leftover (x) values (1)"));
    expect((await runJourney("a", () => {})).persistence).toEqual([]);
  });

  it("A/A: identical traffic on both sides produces no hunk", async () => {
    const traffic = (w: FakePostgresWire) => {
      w.execute(`INSERT INTO "tutors-connect-users" (id) VALUES ('1')`);
      w.execute("SELECT * FROM courses");
    };
    const a = await runJourney("a", traffic);
    const b = await runJourney("b", traffic);
    expect(a.persistence).toEqual([{ kind: "write", method: "INSERT", table: "tutors-connect-users", rows: 1 }]);
    const signedIn = { anonymous: false, journey: "student-signs-in" };
    expect(diff(withWrites("a", a.persistence!, signedIn), withWrites("b", b.persistence!, signedIn))).toEqual([]);
  });

  it("planted: an anonymous journey that inserts on b only fails, by table", async () => {
    const a = await runJourney("a", (w) => w.execute("select * from courses"));
    const b = await runJourney("b", (w) => w.execute("insert into learning_records (id) values (1), (2)"));
    const hunks = diff(withWrites("a", a.persistence!), withWrites("b", b.persistence!));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "persistence", scope: "anonymous-student-reads-course/learning_records", severity: "fail" });
    expect(hunks[0]!.summary).toBe("anonymous-student-reads-course: anonymous journey wrote 2 row(s) to learning_records (INSERT) on b");
  });

  it("planted: signed-in journeys must agree row for row", async () => {
    const a = await runJourney("a", (w) => w.execute("insert into notes (id) values (1)"));
    const b = await runJourney("b", (w) => w.execute("insert into notes (id) values (1), (2), (3)"));
    const signedIn = { anonymous: false, journey: "j" };
    const hunks = diff(withWrites("a", a.persistence!, signedIn), withWrites("b", b.persistence!, signedIn));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.summary).toBe("j: INSERT notes — 1 row(s) on a, 3 on b");
  });

  it("must not flag: reads, and function calls on an anonymous journey, are not writes", async () => {
    const a = await runJourney("a", () => {});
    const b = await runJourney("b", (w) => {
      w.execute("select * from courses where id = 1");
      w.execute("select public.get_error_counts(60)");
    });
    expect(b.persistence).toEqual([{ kind: "rpc", method: "SELECT", table: "get_error_counts", rows: 0 }]);
    // An rpc is compared (a has none, b has one)...
    expect(diff(withWrites("a", a.persistence!), withWrites("b", b.persistence!)).map((h) => h.severity)).toEqual(["fail"]);
    // ...but it is never the anonymous rule: identical on both sides it is quiet.
    expect(diff(withWrites("a", b.persistence!), withWrites("b", b.persistence!))).toEqual([]);
  });

  it("both backends hand the engine records of the same shape", async () => {
    const wire = new FakePostgresWire();
    wire.execute("insert into t (x) values (1)");
    const viaFake = wire.snapshot();
    const viaRest = await supabaseRestBackend((async () => Response.json([{ kind: "write", method: "POST", table: "t", rows: 1 }])) as typeof fetch).recorder("http://localhost:1").writes();
    expect(Object.keys(viaFake[0]!).sort()).toEqual(Object.keys(viaRest[0]!).sort());
  });

  it("registering a backend makes it selectable by name", () => {
    registerPersistenceBackend(backend);
    expect(persistenceBackend("fake-postgres-wire")).toBe(backend);
  });
});

describe("a side with no persistence stub", () => {
  it("has no persistence ledger and reads none (the journey keeps its empty default)", async () => {
    const ledgers = ledgersFor({ name: "a", urls: { reader: "", catalogue: "", live: "", courseId: "x" } });
    expect(ledgers.persistence).toBeUndefined();
    expect(await readLedgers(ledgers)).toEqual({});
  });
});
