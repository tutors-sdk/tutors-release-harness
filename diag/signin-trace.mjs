// Diagnostic only (never merged): sign in on one side and print every request with its start, end and
// duration relative to the click, plus console and websocket events, so a slow sign-in shows where it waits.
import { chromium } from "playwright";
const [side, base] = process.argv.slice(2);
const identity = `https://localhost:${process.env.IDENTITY_PORT ?? 8443}`;
const course = "localhost:8080";
const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP *.harness.test 127.0.0.1"] });
for (let run = 1; run <= 2; run++) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  await context.route(/^https:\/\/(api\.)?github\.com\//, async (route) => {
    const o = new URL(route.request().url());
    const response = await route.fetch({ url: `${identity}${o.pathname}${o.search}`, maxRedirects: 0 });
    await route.fulfill({ response });
  });
  const page = await context.newPage();
  let t0 = Date.now();
  const at = () => `${String(Date.now() - t0).padStart(6)}ms`;
  const started = new Map();
  const pending = new Set();
  page.on("requestfinished", (r) => pending.delete(r));
  page.on("requestfailed", (r) => pending.delete(r));
  page.on("response", (resp) => { const m = resp.request().method(); if (m !== "GET" && m !== "HEAD") pending.delete(resp.request()); });
  page.on("request", (r) => { pending.add(r); started.set(r, Date.now()); console.log(`${side}#${run} ${at()} -> ${r.method()} ${r.url()}`); });
  page.on("requestfinished", (r) => console.log(`${side}#${run} ${at()} <- ${r.method()} ${r.url()} (${Date.now() - started.get(r)}ms)`));
  page.on("requestfailed", (r) => console.log(`${side}#${run} ${at()} !! ${r.method()} ${r.url()} ${r.failure()?.errorText} (${Date.now() - started.get(r)}ms)`));
  page.on("console", (m) => console.log(`${side}#${run} ${at()} console.${m.type()}: ${m.text()}`));
  page.on("websocket", (ws) => {
    console.log(`${side}#${run} ${at()} ws open ${ws.url()}`);
    ws.on("framesent", (f) => console.log(`${side}#${run} ${at()} ws > ${String(f.payload).slice(0, 160)}`));
    ws.on("framereceived", (f) => console.log(`${side}#${run} ${at()} ws < ${String(f.payload).slice(0, 160)}`));
    ws.on("close", () => console.log(`${side}#${run} ${at()} ws close`));
    ws.on("socketerror", (e) => console.log(`${side}#${run} ${at()} ws error ${e}`));
  });
  await page.goto(`${base}/auth/${course}`);
  const button = page.getByRole("button", { name: /Sign in with GitHub/i });
  await button.waitFor({ state: "visible" });
  t0 = Date.now();
  console.log(`${side}#${run} ${at()} CLICK sign in`);
  const reconnected = page.waitForResponse((r) => /\/rest\/v1\/tutors-connect-users\?select=online_status\b/.test(r.url()), { timeout: 60_000 }).then(() => console.log(`${side}#${run} ${at()} STEP online_status read`), (e) => console.log(`${side}#${run} ${at()} STEP online_status never: ${e.message}`));
  await button.click();
  await page.waitForURL(new RegExp(`/course/${course}`), { timeout: 60_000 });
  console.log(`${side}#${run} ${at()} STEP on course url`);
  await page.getByRole("banner").getByRole("heading").first().waitFor({ state: "visible", timeout: 60_000 });
  console.log(`${side}#${run} ${at()} STEP course heading`);
  await reconnected;
  for (const label of ["course", "topic"]) {
    if (label === "topic") {
      await page.getByRole("link", { name: /^Topic 1\b/ }).click();
      await page.waitForURL(/\/topic\//);
      console.log(`${side}#${run} ${at()} STEP on topic url`);
    }
    const n0 = Date.now();
    let idle = 0; while (Date.now() - n0 < 5000) { if (pending.size === 0) { if (!idle) idle = Date.now(); else if (Date.now() - idle >= 500) break; } else idle = 0; await new Promise((r) => setTimeout(r, 50)); }
    console.log(`${side}#${run} ${at()} ${label} quiet after ${Date.now() - n0}ms`);
    console.log(`${side}#${run} ${at()} ${label} still pending: ${[...pending].map((r) => `${r.method()} ${r.url()} (${r.resourceType()}, ${Date.now() - started.get(r)}ms)`).join(" | ") || "none"}`);
  }
  console.log(`${side}#${run} ${at()} DONE`);
  await context.close();
}
await browser.close();
