/**
 * What the journeys expect to find in the pinned fixture course
 * (fixtures/course-server/course). Change the course and this file together.
 */
export const fixture = {
  title: "Runway Fixture Course",
  topicTitle: "Topic 1",
  topicPath: "unit-1/topic-01",
  labTitle: "Lab 1",
  labPath: "unit-1/topic-01/book-lab-01",
  firstStep: { id: "Setup", heading: "Lab 1" },
  secondStep: { id: "Step-01", heading: "Step 1" },
  /** Appears in both notes' body. */
  searchTerm: "reference material",
  /**
   * A result's link: `<topic>/ <note>` up to 16.2.x (the generator keeps a leading
   * space in titles), `<note> note` (title then type) in the course shell.
   */
  searchResultTitle: /^(?:Topic 1\/\s*)?Note 1\b/,
  /** A resource the search term does not match; its link must not be among the results. */
  searchNonResultTitle: /^Talk 1\b/
};

/**
 * Since 1.47.0: the plain id the time app journeys give the Rule journeys' course (its tutors.json `courseId`). The time
 * app reads a course's PIN from `https://<id>.netlify.app/tutors.json`, which the harness answers from the course server
 * (src/collectors/browser.ts); the seeds name the course by it (fixtures/persistence/seeds).
 */
export const TIME_COURSE_ID = "harness-rules";

/**
 * Since 1.58.0: the fixture course as a Netlify site id, for the journeys that sign in. Since mono-repo #327 the reader's
 * data routes (`/api/analytics`, `/api/courses/visit`, ...) refuse a course id with a port (`localhost:8080`, 400), and
 * `/api/courses/visit` reads the course's title from `https://<id>.netlify.app/tutors.json`. A production course id is a
 * Netlify site, so the signed-in journeys name the fixture course as one, answered from the course server in the browser
 * (src/collectors/browser.ts) and in the reader's server (fixtures/identity). Anonymous journeys keep `localhost:8080`.
 */
export const FIXTURE_SITE_ID = "harness-fixture";

/** The fixture course's id for a signed-in journey: its Netlify site id on the harness's own stack, else the side's own. */
export function signedInCourseId(urls: { courseId: string; rulesCourseId?: string }): string {
  return urls.rulesCourseId ? FIXTURE_SITE_ID : urls.courseId;
}
