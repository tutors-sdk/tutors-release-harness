import type { Page } from "playwright";
import type { StackUrls } from "../../src/types.ts";
import type { OnPage } from "./journeys.ts";
import { fixture } from "./fixture.ts";
import { VISIBLE, escapeRegExp, labSteps, pageHeading, signInFromAuthPage, stepLink } from "./ui.ts";

/**
 * Since 1.43.0: the steps a Rule journey's scenario may use (traffic/journeys/features), each a sentence bound to what a
 * person does or sees, by role and accessible name only, as every journey drives the UI.
 *
 * A step runs on one side at a time: the harness runs the same scenario on both sides and compares what each captured,
 * so a step never says "both sides". `Then` steps check what a person would see before the page is captured; a step
 * that cannot find what it names fails the journey, and the report says which step.
 *
 * Quoted words are the step's arguments. A sentence no step matches is an error when the journeys are loaded
 * (tests/rule-journeys.test.ts), never in the middle of a run.
 */
export interface World {
  page: Page;
  urls: StackUrls;
  onPage: OnPage;
  /** The Rule the journey proves: its pages are captured as `<app>:rule-<id>-<name>`. */
  rule: string;
}

export interface StepDefinition {
  pattern: RegExp;
  run: (w: World, ...args: string[]) => Promise<void>;
  /** One line for the step list in docs/user-guide/12-rule-journeys.md. */
  doc: string;
}

const STEPS: StepDefinition[] = [];
const step = (pattern: RegExp, doc: string, run: StepDefinition["run"]) => STEPS.push({ pattern, run, doc });

/** Which app a URL belongs to on this side, for the capture key. */
export function appOf(url: string, urls: StackUrls): string {
  const origin = new URL(url).origin;
  if (urls.readerAuth && origin === new URL(urls.readerAuth).origin) return "reader-auth";
  for (const app of ["reader", "catalogue", "live", "time"] as const) {
    const u = urls[app];
    if (u && origin === new URL(u).origin) return app;
  }
  return "page";
}

/** `<app>:rule-<id>-<name>`: the page key a claim names, carrying the Rule so a difference on it is about that Rule. */
export const pageKeyOf = (app: string, rule: string, name: string) => `${app}:rule-${rule}-${name}`;

const roleNames = ["button", "link", "heading", "dialog", "tab", "checkbox", "menuitem", "region", "navigation", "article"] as const;
type RoleName = (typeof roleNames)[number];
const isRole = (r: string): r is RoleName => (roleNames as readonly string[]).includes(r);

// ---- signing in and moving through the course ------------------------------------------------------------------

step(/^the student signs in from the course$/, "the student signs in from the course: GitHub sign-in through the identity stub, back on the course page", async (w) => {
  if (!w.urls.readerAuth) throw new Error("this side has no signed-in reader (external side?)");
  await w.page.goto(`${w.urls.readerAuth}/auth/${w.urls.courseId}`);
  await signInFromAuthPage(w.page, w.urls.courseId, fixture.title);
});

step(/^the student opens the topic "([^"]+)"$/, 'the student opens the topic "Topic 1": its card on the page', async (w, title) => {
  await w.page.getByRole("main").getByRole("link", { name: new RegExp(`^${escapeRegExp(title)}\\b`) }).first().click();
  await pageHeading(w.page, title).waitFor(VISIBLE);
});

step(/^the student opens the lab "([^"]+)"$/, 'the student opens the lab "Lab 1": its card on the page, then its first step', async (w, title) => {
  await w.page.getByRole("main").getByRole("link", { name: new RegExp(`^${escapeRegExp(title)}\\b`) }).first().click();
  await w.page.getByRole("article").getByRole("heading", { level: 1 }).first().waitFor(VISIBLE);
  await labSteps(w.page).waitFor(VISIBLE);
});

step(/^the student moves to the step "([^"]+)"$/, 'the student moves to the step "Step 1": its link in the lab\'s step navigation', async (w, heading) => {
  await labSteps(w.page).getByRole("link", { name: stepLink(heading) }).click();
  await w.page.getByRole("article").getByRole("heading", { level: 1, name: heading }).waitFor(VISIBLE);
});

// ---- pressing things --------------------------------------------------------------------------------------------

step(/^the student presses the (button|link|tab|menuitem) "([^"]+)"$/, 'the student presses the button "Profile menu" (also link, tab, menuitem): exact accessible name', async (w, role, name) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole(role, { name, exact: true }).filter({ visible: true }).first().click();
});

step(/^the student presses the (button|link) starting "([^"]+)"$/, 'the student presses the button starting "View Online": a name that ends in a count or a state', async (w, role, start) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole(role, { name: new RegExp(`^${escapeRegExp(start)}`) }).filter({ visible: true }).first().click();
});

step(/^the student closes the dialog "([^"]+)"$/, 'the student closes the dialog "View Online": Escape, then it is gone', async (w, name) => {
  await w.page.keyboard.press("Escape");
  await w.page.getByRole("dialog", { name }).waitFor({ state: "hidden", timeout: VISIBLE.timeout });
});

step(/^the student closes every dialog$/, "the student closes every dialog: Escape until none is open (a capture's focus walk may already have closed some)", async (w) => {
  for (let i = 0; i < 5 && (await w.page.getByRole("dialog").count()) > 0; i++) {
    await w.page.keyboard.press("Escape");
    await w.page.waitForTimeout(200);
  }
  if ((await w.page.getByRole("dialog").count()) > 0) throw new Error("a dialog is still open after Escape");
});

// ---- what is on the page -----------------------------------------------------------------------------------------

step(/^the page shows the (button|link|heading|dialog|tab|checkbox|menuitem|region|navigation|article) "([^"]+)"$/, 'the page shows the heading "Lab 1" (any role above): exact accessible name, visible', async (w, role, name) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole(role, { name, exact: true }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(/^the page shows the (button|link) starting "([^"]+)"$/, 'the page shows the button starting "Share Presence"', async (w, role, start) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole(role, { name: new RegExp(`^${escapeRegExp(start)}`) }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(/^the dialog "([^"]+)" shows the (button|link|heading) "([^"]+)"$/, 'the dialog "View Online" shows the link "Harness Student"', async (w, dialog, role, name) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole("dialog", { name: dialog }).getByRole(role, { name, exact: true }).first().waitFor(VISIBLE);
});

step(/^the (button|link) "([^"]+)" is pressed$/, 'the button "confident" is pressed: aria-pressed is true', async (w, role, name) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole(role, { name, exact: true, pressed: true }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(/^the lab step "([^"]+)" is shown$/, 'the lab step "Step 1" is shown: the step\'s level-1 heading', async (w, heading) => {
  await w.page.getByRole("article").getByRole("heading", { level: 1, name: heading }).waitFor(VISIBLE);
});

step(/^the page is captured as "([a-z0-9-]+)"$/, 'the page is captured as "lab-step": every artefact, under the page key <app>:rule-<id>-lab-step', async (w, name) => {
  await w.onPage(pageKeyOf(appOf(w.page.url(), w.urls), w.rule, name!));
});

/** The step a sentence runs, and its quoted arguments; undefined when no step matches. */
export function bind(text: string): { def: StepDefinition; args: string[] } | undefined {
  for (const def of STEPS) {
    const m = def.pattern.exec(text);
    if (m) return { def, args: m.slice(1) };
  }
  return undefined;
}

/** Every step, for the docs and their test. */
export const steps: readonly StepDefinition[] = STEPS;
