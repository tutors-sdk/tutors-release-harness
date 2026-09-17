import type { Page } from "playwright";
import type { StackUrls } from "../../src/types.ts";
import { fixture } from "./fixture.ts";
import { reference } from "./reference.ts";

/**
 * The named journeys, ported from the monorepo's tier G suite and
 * parameterised by base URL so the same script drives both sides.
 *
 * Each journey drives the UI the way a person would and calls `onPage(key)`
 * after every page settles; the collector decides what to capture there.
 * Selectors are roles and accessible names only. If a journey cannot find
 * something by role, that is an accessibility finding, not a reason to reach
 * for CSS.
 *
 * Twelve journeys, not a hundred: the harness's power is breadth of capture
 * per page, not the number of pages. Add one only when a real regression
 * escaped that a journey would have caught.
 */
export type OnPage = (pageKey: string) => Promise<void>;

export type JourneySet = "fixture" | "auth" | "reference";

export interface Journey {
  name: string;
  /** Which set the journey belongs to; `--set` picks sets, `--journey` picks names. */
  set: JourneySet;
  /** True when the journey never signs in; any persistence write during it is a finding. */
  anonymous: boolean;
  /** Which reader the journey drives. */
  target: "reader" | "readerAuth";
  run: (page: Page, urls: StackUrls, onPage: OnPage) => Promise<void>;
}

const VISIBLE = { state: "visible" as const, timeout: 15_000 };

/** The lab step navigation that is visible at this viewport (sidebar on desktop, bottom bar on mobile). */
function labSteps(page: Page) {
  return page.getByRole("navigation", { name: "Lab steps" }).filter({ visible: true }).first();
}

// ---- fixture course, anonymous ------------------------------------------------------

/** Anonymous student: home page, open the fixture course, topic, lab, move through steps. */
export const anonymousStudentReadsCourse: Journey = {
  name: "anonymous-student-reads-course",
  set: "fixture",
  anonymous: true,
  target: "reader",
  async run(page, urls, onPage) {
    await page.goto(`${urls.reader}/`);
    await page.getByRole("heading", { level: 1, name: /An Open Learning Web Toolkit/ }).waitFor(VISIBLE);
    await onPage("reader:home");

    await page.goto(`${urls.reader}/course/${urls.courseId}`);
    await page.getByRole("banner").getByRole("heading", { name: fixture.title }).waitFor(VISIBLE);
    await onPage("reader:course");

    await page.getByRole("link", { name: new RegExp(`^${fixture.topicTitle}\\b`) }).click();
    await page.waitForURL(new RegExp(`/topic/${urls.courseId}/${fixture.topicPath}$`));
    await page.getByRole("banner").getByRole("heading", { name: fixture.topicTitle }).waitFor(VISIBLE);
    await onPage("reader:topic");

    await page.getByRole("main").getByRole("link", { name: new RegExp(`^${fixture.labTitle}\\b`) }).first().click();
    await page.waitForURL(new RegExp(`/lab/${urls.courseId}/${fixture.labPath}`));
    await page.getByRole("article").getByRole("heading", { level: 1, name: fixture.firstStep.heading }).waitFor(VISIBLE);
    await labSteps(page).waitFor(VISIBLE);
    await onPage("reader:lab-step");

    // Keyboard: the lab advances on ArrowRight.
    await page.keyboard.press("ArrowRight");
    await page.waitForURL(new RegExp(`/${fixture.labPath}/${fixture.secondStep.id}$`));
    await page.getByRole("article").getByRole("heading", { level: 1, name: fixture.secondStep.heading }).waitFor(VISIBLE);
    await onPage("reader:lab-step-2");

    // Pointer: jump back to the first step from the step navigation.
    await labSteps(page).getByRole("link", { name: fixture.firstStep.heading, exact: true }).click();
    await page.waitForURL(new RegExp(`/${fixture.labPath}/${fixture.firstStep.id}$`));
  }
};

/** Anonymous student searches the course and gets a result linking to the matching note. */
export const anonymousStudentSearches: Journey = {
  name: "anonymous-student-searches",
  set: "fixture",
  anonymous: true,
  target: "reader",
  async run(page, urls, onPage) {
    await page.goto(`${urls.reader}/course/${urls.courseId}`);
    await page.getByRole("banner").getByRole("heading", { name: fixture.title }).waitFor(VISIBLE);

    await page.getByRole("button", { name: "Search this course" }).click();
    await page.waitForURL(new RegExp(`/search/${urls.courseId}$`));
    const box = page.getByRole("textbox", { name: "Enter search term:" });
    await box.waitFor(VISIBLE);
    await onPage("reader:search");

    await box.fill(fixture.searchTerm);
    await box.press("Enter");
    await page.getByRole("main").getByRole("link", { name: fixture.searchResultTitle }).first().waitFor(VISIBLE);
    await onPage("reader:search-results");
  }
};

/** The catalogue renders its (empty, anonymous) listing. */
export const catalogueLoads: Journey = {
  name: "catalogue-loads",
  set: "fixture",
  anonymous: true,
  target: "reader",
  async run(page, urls, onPage) {
    await page.goto(`${urls.catalogue}/`);
    await page.getByRole("main").getByText("Totals").first().waitFor(VISIBLE);
    await onPage("catalogue:home");
  }
};

/** Live renders its tabs with no presence data in anonymous mode. */
export const liveLoads: Journey = {
  name: "live-loads",
  set: "fixture",
  anonymous: true,
  target: "reader",
  async run(page, urls, onPage) {
    await page.goto(`${urls.live}/`);
    const courses = page.getByRole("tab", { name: /^Courses/ });
    await courses.waitFor(VISIBLE);
    await page.getByRole("tab", { name: /^Students/ }).click();
    await page.getByRole("tab", { name: /^Students/, selected: true }).waitFor(VISIBLE);
    await onPage("live:home");
  }
};

// ---- signed in, against the identity and persistence stubs ------------------------

/**
 * A student signs in with GitHub (the identity stub), lands on the course and
 * reads a topic. What the reader persists for a signed-in student is the
 * persistence artefact; that it persists nothing before sign-in is the anonymous rule.
 */
export const studentSignsIn: Journey = {
  name: "student-signs-in",
  set: "auth",
  anonymous: false,
  target: "readerAuth",
  async run(page, urls, onPage) {
    const base = urls.readerAuth;
    if (!base) throw new Error("this side has no signed-in reader (external side?)");
    await page.goto(`${base}/auth/${urls.courseId}`);
    const button = page.getByRole("button", { name: /Sign in with GitHub/i });
    await button.waitFor(VISIBLE);
    await onPage("reader-auth:sign-in");

    await button.click();
    // Auth.js -> identity stub -> callback -> session -> the course.
    await page.waitForURL(new RegExp(`/course/${urls.courseId}`), { timeout: 30_000 });
    await page.getByRole("banner").getByRole("heading", { name: fixture.title }).waitFor(VISIBLE);
    await onPage("reader-auth:course");

    await page.getByRole("link", { name: new RegExp(`^${fixture.topicTitle}\\b`) }).click();
    await page.waitForURL(new RegExp(`/topic/${urls.courseId}/${fixture.topicPath}$`));
    await page.getByRole("banner").getByRole("heading", { name: fixture.topicTitle }).waitFor(VISIBLE);
    await onPage("reader-auth:topic");
  }
};

// ---- the published reference course ----------------------------------------------------

/** Anonymous reader of the published reference course: course, a topic, a lab, a note. */
export const referenceCourseReads: Journey = {
  name: "reference-course-reads",
  set: "reference",
  anonymous: true,
  target: "reader",
  async run(page, urls, onPage) {
    const course = reference.courseId;
    await page.goto(`${urls.reader}/course/${course}`);
    await page.getByRole("banner").getByRole("heading", { name: reference.title }).waitFor(VISIBLE);
    await onPage("reference:course");

    await page.getByRole("main").getByRole("link", { name: reference.topicLink }).first().click();
    await page.waitForURL(new RegExp(`/topic/${course}/${reference.topicPath}$`));
    await page.getByRole("banner").getByRole("heading", { name: reference.topicTitle }).waitFor(VISIBLE);
    await onPage("reference:topic");

    await page.getByRole("main").getByRole("link", { name: reference.labTitle }).first().click();
    await page.waitForURL(new RegExp(`/lab/${course}/${reference.labPath}`));
    await page.getByRole("article").getByRole("heading", { level: 1 }).first().waitFor(VISIBLE);
    await labSteps(page).waitFor(VISIBLE);
    await onPage("reference:lab");

    await page.goto(`${urls.reader}/note/${course}/${reference.notePath}`);
    await page.getByRole("article").waitFor(VISIBLE);
    await onPage("reference:note");
  }
};

/** Every journey, in the order they run. */
export const journeys: Journey[] = [anonymousStudentReadsCourse, anonymousStudentSearches, catalogueLoads, liveLoads, studentSignsIn, referenceCourseReads];

export function journeyByName(name: string): Journey {
  const journey = journeys.find((j) => j.name === name);
  if (!journey) throw new Error(`Unknown journey "${name}". Known: ${journeys.map((j) => j.name).join(", ")}`);
  return journey;
}

/** The journeys for the given sets and, when given, only those names. */
export function selectJourneys(sets: JourneySet[], names: string[] = []): Journey[] {
  const bySet = journeys.filter((j) => sets.includes(j.set));
  if (!names.length) return bySet;
  return names.map(journeyByName);
}
