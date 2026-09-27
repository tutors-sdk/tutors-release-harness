/**
 * The published reference course, `tutors-sdk/tutors-reference-course`, as
 * the reader resolves it. Unlike the fixture course it is served by Netlify,
 * not by this repository, so it is an upstream the harness does not control:
 * the same for both sides in one run (fine for A/A and A/B), and the only
 * course production can be asked about (post-deploy mode).
 *
 * The reader resolves the id `reference-course` to
 * https://reference-course.netlify.app/tutors.json and keeps the short id in
 * its routes, so URLs are asserted against `courseId`, not the host.
 */
export const reference = {
  courseId: "reference-course",
  host: "reference-course.netlify.app",
  title: "Reference Course",
  topicTitle: "Reference",
  /**
   * The topic and lab cards are found by where they link, not by their accessible names: up to 16.2.x a card's link
   * named it by title then summary, and since the new UI (monorepo main, Sept 2026) by title then type, with the
   * summary outside the link. The href is the same in both, so the journey runs on production and on main alike.
   */
  topicPath: "topic-07-reference",
  labPath: "topic-07-reference/book-a",
  notePath: "topic-07-reference/note-1"
};
