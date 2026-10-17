import type { Page } from "playwright";

/** Shared by the hand-written journeys (journeys.ts) and the Rule journeys' steps (steps.ts). Roles and names only. */
export const VISIBLE = { state: "visible" as const, timeout: 15_000 };

/**
 * The lab step navigation that is visible at this viewport. Up to 16.2.x it is the
 * navigation "Lab steps" (sidebar on desktop, bottom bar on mobile); the course
 * shell that replaced it (2026-09) lists the steps as the list "Steps" in the
 * "Course navigation" sidebar.
 */
export function labSteps(page: Page) {
  return page
    .getByRole("navigation", { name: "Lab steps" })
    .or(page.getByRole("complementary", { name: "Course navigation" }).getByRole("list", { name: "Steps" }))
    .filter({ visible: true })
    .first();
}

/** A lab step's link in the step navigation: "Step 1" up to 16.2.x, "02 Step 1" (numbered) in the course shell. */
export function stepLink(heading: string) {
  return new RegExp(`^(?:\\d+\\s+)?${escapeRegExp(heading)}$`);
}

/**
 * The heading that names the page being read: up to 16.2.x the banner's heading,
 * in the course shell the main content's level-1 heading (the banner names the course),
 * and since mono-repo #400 (sha-3b9e456) a topic's title on the side menu's card of the open learning object.
 */
export function pageHeading(page: Page, name: string) {
  return page
    .getByRole("banner")
    .getByRole("heading", { name })
    .or(page.getByRole("main").getByRole("heading", { level: 1, name }))
    .or(page.getByRole("complementary", { name: "Course navigation" }).getByRole("heading", { level: 2, name }))
    .first();
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * From the reader's sign-in page (`/auth/<course>`), sign in with GitHub (the identity stub) and wait until the course has
 * rendered and the reader has reconnected the student. `atButton` runs once the button is showing, before it is pressed.
 *
 * Once the course has rendered, the reader reconnects the student in the background: it reads their sentiment, then
 * their online status, and only then sets whether they share presence (which shows or hides the course shell's
 * "Activity" group) and routes back to the course. The heading is visible before that, so a capture taken on the heading
 * alone sometimes saw the page before the reconnect and sometimes after (an A/A diff on the sidebar, and a "Couldn't
 * load preload assets" warning when the journey clicked on during that route). The online status read is the
 * reconnect's last await, so it is waited for.
 */
export async function signInFromAuthPage(page: Page, courseId: string, courseTitle: string, atButton?: () => Promise<void>): Promise<void> {
  const button = page.getByRole("button", { name: /Sign in with GitHub/i });
  await button.waitFor(VISIBLE);
  if (atButton) await atButton();
  await paceSignIn(new URL(page.url()).origin);
  const reconnected = page.waitForResponse((r) => /\/rest\/v1\/tutors-connect-users\?select=online_status\b/.test(r.url()), { timeout: 30_000 });
  // Awaited below. If a step before that fails (a mutant that breaks the course), the page closes and
  // this rejects with nobody listening, which would crash the run instead of failing the journey.
  reconnected.catch(() => undefined);
  await button.click();
  // GitHub sign-in (identity stub) -> callback -> session -> the course.
  await page.waitForURL(new RegExp(`/course/${escapeRegExp(courseId)}`), { timeout: 30_000 });
  await page.getByRole("banner").getByRole("heading", { name: courseTitle }).waitFor(VISIBLE);
  await reconnected;
}

/**
 * Since 1.43.0: Better Auth refuses a fourth sign-in (429, and the sign-in page says "Unable to load") when each of the
 * three before it came less than 10 seconds after the previous one: its limiter keeps a count per client and path that
 * starts again only after a 10-second gap (`rateLimit` defaults, sign-in paths: 3 per 10 s). Every journey signs in from the
 * same browser, so it is one client. Two journeys signed in a run never reached it; the Rule journeys sign in once each.
 * So the harness keeps under it per reader, leaving the gap a person would never notice.
 */
export const SIGN_IN_LIMIT = { max: 3, windowMs: 10_000, marginMs: 1_500 };
const signIns = new Map<string, { count: number; last: number }>();

/** Wait until one more sign-in at `origin` keeps within the limit, then count it; returns the wait. Exported for its test. */
export async function paceSignIn(origin: string, now: () => number = Date.now, sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))): Promise<number> {
  const gap = SIGN_IN_LIMIT.windowMs + SIGN_IN_LIMIT.marginMs;
  let state = signIns.get(origin) ?? { count: 0, last: -Infinity };
  if (now() - state.last > gap) state = { count: 0, last: state.last };
  let waited = 0;
  if (state.count >= SIGN_IN_LIMIT.max - 1) {
    waited = Math.max(0, state.last + gap - now());
    if (waited > 0) await sleep(waited);
    state = { count: 0, last: state.last };
  }
  signIns.set(origin, { count: state.count + 1, last: now() });
  return waited;
}
