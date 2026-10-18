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
  /**
   * Since 1.45.0: make `page` the named person's: "the student" is the journey's own role, "the lecturer" the identity
   * stub's lecturer in a browser of their own on the same side, opened the first time a step names them.
   */
  act(who: Actor): Promise<void>;
}

/** Who a step's sentence names as its subject. */
export type Actor = "student" | "lecturer";

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
  if (urls.liveAuth && origin === new URL(urls.liveAuth).origin) return "live-auth";
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

step(/^the student opens Tutors Live$/, "the student opens Tutors Live: Live's home page on this side, reading the side's persistence stub (said of the lecturer, since 1.46.0)", async (w) => {
  if (!w.urls.liveAuth) throw new Error("this side has no Tutors Live reading its persistence stub (external side?)");
  await w.page.goto(`${w.urls.liveAuth}/`);
  await w.page.getByRole("heading", { level: 1, name: "Tutors Live" }).waitFor(VISIBLE);
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

// Skeleton's Switch: a visually hidden checkbox inside a label, named by aria-label. Pressing the label is what a person does.
const switchNamed = (w: World, name: string) => w.page.getByRole("switch", { name, exact: true }).or(w.page.getByRole("checkbox", { name, exact: true })).first();

step(/^the student switches (on|off) "([^"]+)"$/, 'the student switches on "Lock Topic 2" (also off): a switch by its accessible name, then it reads as asked', async (w, state, name) => {
  const toggle = switchNamed(w, name!);
  const want = state === "on";
  if ((await toggle.isChecked()) !== want) await toggle.setChecked(want, { force: true });
  for (const deadline = Date.now() + VISIBLE.timeout; (await toggle.isChecked()) !== want; ) {
    if (Date.now() > deadline) throw new Error(`the switch "${name}" is not ${state}`);
    await w.page.waitForTimeout(100);
  }
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

step(/^the page shows no (button|link|row) starting "([^"]+)"$/, 'the page shows no link starting "Topic 2" (also button, row): nothing visible whose name starts so', async (w, role, start) => {
  if (!isRole(role!)) throw new Error(`not a role: ${role}`);
  const n = await w.page.getByRole(role, { name: new RegExp(`^${escapeRegExp(start!)}`) }).filter({ visible: true }).count();
  if (n) throw new Error(`the page shows ${n} ${role}(s) starting "${start}"`);
});

step(/^the card "([^"]+)" shows the text "([^"]+)"$/, 'the card "Topic 2" shows the text "Locked": the article whose heading is the card\'s title holds the words', async (w, title, text) => {
  await w.page.getByRole("article").filter({ has: w.page.getByRole("heading", { name: title, exact: true }) }).getByText(text!, { exact: true }).first().waitFor(VISIBLE);
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
  await w.onPage(pageKeyOf(appOf(w.page.url(), w.urls), w.rule, name!), w.page);
});

/**
 * The step a sentence runs, its quoted arguments, and who acts; undefined when no step matches. Since 1.45.0 every
 * "the student ..." step can be said of "the lecturer ..." instead: the same step, run in the lecturer's browser. A step
 * that names nobody ("the page shows ...") runs in the browser of whoever acted last.
 */
export function bind(text: string): { def: StepDefinition; args: string[]; actor?: Actor } | undefined {
  const lecturer = text.startsWith("the lecturer ");
  const said = lecturer ? `the student ${text.slice("the lecturer ".length)}` : text;
  for (const def of STEPS) {
    const m = def.pattern.exec(said);
    if (m) return { def, args: m.slice(1), ...(lecturer ? { actor: "lecturer" as const } : said.startsWith("the student ") ? { actor: "student" as const } : {}) };
  }
  return undefined;
}

/** Every step, for the docs and their test. */
export const steps: readonly StepDefinition[] = STEPS;
