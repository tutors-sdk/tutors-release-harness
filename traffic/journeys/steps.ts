import type { Page } from "playwright";
import type { StackUrls } from "../../src/types.ts";
import type { OnPage } from "./journeys.ts";
import { VISIBLE, escapeRegExp, labSteps, pageHeading, signInFromAuthPage, stepLink, turnedAway } from "./ui.ts";

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
  /** Since 1.44.0: the course the journey reads (`@course-rules` picks the Rule journeys' course), its id and title. */
  course: { id: string; title: string };
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

const roleNames = ["button", "link", "heading", "dialog", "tab", "checkbox", "menuitem", "region", "navigation", "article", "status", "alert", "group", "radio", "combobox", "table", "row", "progressbar"] as const;
const ROLES = roleNames.join("|");
type RoleName = (typeof roleNames)[number];
const isRole = (r: string): r is RoleName => (roleNames as readonly string[]).includes(r);

// ---- signing in and moving through the course ------------------------------------------------------------------

step(/^the student signs in from the course$/, "the student signs in from the course: GitHub sign-in through the identity stub, back on the course page", async (w) => {
  if (!w.urls.readerAuth) throw new Error("this side has no signed-in reader (external side?)");
  await w.page.goto(`${w.urls.readerAuth}/auth/${w.course.id}`);
  await signInFromAuthPage(w.page, w.course.id, w.course.title);
});

step(/^the student signs in from the course and is turned away$/, "the student signs in from the course and is turned away: signed in, then sent to My courses, not the course (a private course they are not enrolled on)", async (w) => {
  if (!w.urls.readerAuth) throw new Error("this side has no signed-in reader (external side?)");
  await w.page.goto(`${w.urls.readerAuth}/auth/${w.course.id}`);
  await signInFromAuthPage(w.page, w.course.id, w.course.title, undefined, "turned-away");
});

step(/^the student opens the course by its address and is turned away$/, "the student opens the course by its address and is turned away: the course URL typed in, then sent to My courses", async (w) => {
  await w.page.goto(`${w.urls.readerAuth}/course/${w.course.id}`);
  await turnedAway(w.page);
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

step(/^the student opens the (talk|note|notebook|quiz) "([^"]+)"$/, 'the student opens the quiz "Quiz 1" (also talk, note, notebook): its card on the page', async (w, type, title) => {
  await w.page.getByRole("main").getByRole("link", { name: new RegExp(`^${escapeRegExp(title!)}\\b`) }).first().click();
  await w.page.waitForURL(new RegExp(`/${type}/`), { timeout: VISIBLE.timeout });
  await w.page.getByRole("main").getByRole("navigation", { name: "Breadcrumbs" }).getByText(title!, { exact: true }).waitFor(VISIBLE);
});

step(/^the student goes back to the topic "([^"]+)"$/, 'the student goes back to the topic "Topic 1": its link in the breadcrumbs', async (w, title) => {
  await w.page.getByRole("navigation", { name: "Breadcrumbs" }).getByRole("link", { name: title, exact: true }).click();
  await pageHeading(w.page, title!).waitFor(VISIBLE);
});

step(/^the student reloads the page$/, "the student reloads the page: as the browser's reload button does, then the banner is back", async (w) => {
  await w.page.reload();
  await w.page.getByRole("banner").first().waitFor(VISIBLE);
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

// 17.0.0 names the Preferences menu's button "Open Theme Menu"; mono-repo #505 (after 17.0.0) renamed it "Preferences".
const PREFERENCES_BUTTON = /^(Preferences|Open Theme Menu)$/;

step(/^the student opens the Preferences menu$/, 'the student opens the Preferences menu: its header button (named "Preferences", or "Open Theme Menu" up to 17.0.0), then the dialog "Preferences"', async (w) => {
  await w.page.getByRole("button", { name: PREFERENCES_BUTTON }).filter({ visible: true }).first().click();
  await w.page.getByRole("dialog", { name: "Preferences", exact: true }).waitFor(VISIBLE);
});

step(/^the page shows the Preferences button$/, 'the page shows the Preferences button: named "Preferences", or "Open Theme Menu" up to 17.0.0', async (w) => {
  await w.page.getByRole("button", { name: PREFERENCES_BUTTON }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(/^the student chooses "([^"]+)" in the group "([^"]+)"$/, 'the student chooses "const" in the group "1. Which keyword declares a constant?": a radio button by its label', async (w, option, group) => {
  await w.page.getByRole("group", { name: group, exact: true }).getByRole("radio", { name: option, exact: true }).check();
});

step(/^the student selects "([^"]+)" in the combobox "([^"]+)"$/, 'the student selects "Assessments" in the combobox "Show": an option of a select by its label', async (w, option, box) => {
  await w.page.getByRole("combobox", { name: box, exact: true }).filter({ visible: true }).first().selectOption({ label: option! });
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

step(new RegExp(`^the page shows the (${ROLES}) "([^"]+)"$`), 'the page shows the heading "Lab 1" (a status or alert by its text, present even when visually hidden; also button, link, dialog, tab, checkbox, menuitem, region, navigation, article, status, alert, group, radio, combobox, table, row, progressbar): exact accessible name, visible', async (w, role, name) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  // A status or an alert is a live region, often visually hidden: what a screen reader announces, so present is enough.
  if (role === "status" || role === "alert") return w.page.getByRole(role, { name, exact: true }).or(w.page.getByRole(role).filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name!)}\\s*$`) })).first().waitFor({ state: "attached", timeout: VISIBLE.timeout });
  await w.page.getByRole(role, { name, exact: true }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(new RegExp(`^the page shows no (${ROLES}) "([^"]+)"$`), 'the page shows no heading "Harness Rules Course": nothing visible by that role and exact name', async (w, role, name) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  const n = await w.page.getByRole(role, { name, exact: true }).filter({ visible: true }).count();
  if (n) throw new Error(`the page shows ${n} ${role}(s) "${name}"`);
});

step(/^the page shows the (button|link|row) starting "([^"]+)"$/, 'the page shows the button starting "Share Presence" (also link, row)', async (w, role, start) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  await w.page.getByRole(role, { name: new RegExp(`^${escapeRegExp(start)}`) }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(/^the page shows the text "([^"]+)"$/, 'the page shows the text "2 of 4": words on the page that no role names', async (w, text) => {
  await w.page.getByText(text!, { exact: true }).filter({ visible: true }).first().waitFor(VISIBLE);
});

step(/^the combobox "([^"]+)" shows "([^"]+)"$/, 'the combobox "Theme" shows "Dyslexia": its selected option', async (w, box, option) => {
  await w.page.getByRole("combobox", { name: box, exact: true }).filter({ visible: true }).first().getByRole("option", { name: option, exact: true, selected: true }).waitFor({ state: "attached", timeout: VISIBLE.timeout });
});

step(/^the table "([^"]+)" has (\d+) rows?$/, 'the table "Calendar" has 2 rows: its header row included', async (w, table, n) => {
  const rows = w.page.getByRole("table", { name: table, exact: true }).getByRole("row");
  await rows.first().waitFor(VISIBLE);
  const until = Date.now() + VISIBLE.timeout;
  while ((await rows.count()) !== Number(n)) {
    if (Date.now() > until) throw new Error(`the table "${table}" has ${await rows.count()} rows, not ${n}`);
    await w.page.waitForTimeout(100);
  }
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
