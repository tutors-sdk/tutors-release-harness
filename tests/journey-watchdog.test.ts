/**
 * Issue #4: a journey whose renderer died hung the whole run for 35 minutes, because Playwright was waiting on a call
 * with no deadline. A journey now has one, a crash ends it at once, and neither stops the next journey. The browser is
 * a stand-in: what is under test is the bookkeeping around `journey.run`, not Chromium.
 */
import { EventEmitter } from "node:events";
import type { Browser } from "playwright";
import { describe, expect, it } from "vitest";
import { captureJourney, withDeadline } from "../src/collectors/browser.ts";
import type { Journey } from "../traffic/journeys/journeys.ts";
import type { SideSpec } from "../src/types.ts";

const never = () => new Promise<never>(() => undefined);

function fakeBrowser(o: { closeHangs?: boolean } = {}) {
  const page = Object.assign(new EventEmitter(), { clock: { setFixedTime: async () => undefined }, url: () => "http://reader.harness.test/" });
  const context = {
    timeout: 0,
    closed: false,
    setDefaultTimeout(ms: number) {
      this.timeout = ms;
    },
    route: async () => undefined,
    newPage: async () => page,
    close() {
      this.closed = true;
      return o.closeHangs ? never() : Promise.resolve();
    }
  };
  const browser = { newContext: async () => context } as unknown as Browser;
  return { browser, page, context };
}

const spec = { name: "b", images: {}, urls: { reader: "http://reader.harness.test", readerAuth: "http://reader-auth.harness.test" } } as unknown as SideSpec;
const journey = (run: Journey["run"]): Journey => ({ name: "anonymous-student-reads-course", set: "fixture", anonymous: true, target: "reader", run });
const opts = { outDir: "/tmp/unused", now: "2026-09-16T09:05:00.000Z", screenshots: false, axe: false, focusStops: 0 };

describe("withDeadline", () => {
  it("passes a result or an error through when the work settles in time", async () => {
    await expect(withDeadline(Promise.resolve(7), 1_000, () => new Error("late"))).resolves.toBe(7);
    await expect(withDeadline(Promise.reject(new Error("broke")), 1_000, () => new Error("late"))).rejects.toThrow("broke");
  });

  it("rejects with the deadline's error when the work never settles, and with the abort's when that comes first", async () => {
    await expect(withDeadline(never(), 20, () => new Error("late"))).rejects.toThrow("late");
    await expect(withDeadline(never(), 1_000, () => new Error("late"), Promise.reject(new Error("renderer crashed")))).rejects.toThrow("renderer crashed");
  });

  it("swallows a rejection of work it has stopped waiting for", async () => {
    let fail!: (e: Error) => void;
    const work = new Promise<never>((_, reject) => (fail = reject));
    await expect(withDeadline(work, 10, () => new Error("late"))).rejects.toThrow("late");
    fail(new Error("after the deadline")); // an unhandled rejection here would fail the test run
    await new Promise((r) => setTimeout(r, 10));
  });
});

describe("captureJourney: a journey cannot hang the run", () => {
  it("records a journey that never finishes as errored within its deadline, closes its context and returns", async () => {
    const { browser, context } = fakeBrowser();
    const started = Date.now();
    const result = await captureJourney(browser, spec, journey(() => never()), 1, { ...opts, journeyTimeoutMs: 50 });
    expect(Date.now() - started).toBeLessThan(2_000);
    expect(result.error).toBe("journey timed out after 0s");
    expect(result.pages).toEqual([]);
    expect(context.closed).toBe(true);
    expect(context.timeout).toBe(30_000);
  });

  it("ends a journey at once when its renderer crashes", async () => {
    const { browser, page } = fakeBrowser();
    const result = await captureJourney(
      browser,
      spec,
      journey(() => {
        setTimeout(() => page.emit("crash"), 5);
        return never();
      }),
      1,
      { ...opts, journeyTimeoutMs: 60_000 }
    );
    expect(result.error).toBe("renderer crashed");
  });

  it("does not wait forever on a context that will not close, and the next journey still runs", async () => {
    const hung = fakeBrowser({ closeHangs: true });
    const first = captureJourney(hung.browser, spec, journey(() => never()), 1, { ...opts, journeyTimeoutMs: 20 });
    await expect(first).resolves.toMatchObject({ error: "journey timed out after 0s" });
    const next = await captureJourney(fakeBrowser().browser, spec, journey(async () => undefined), 2, opts);
    expect(next.error).toBeUndefined();
  }, 15_000);
});
