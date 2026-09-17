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
  /** Accessible name of the topic card: title then summary, whitespace-collapsed. */
  topicLink: /^Reference Example of all learning resource/,
  topicTitle: "Reference",
  topicPath: "topic-07-reference",
  labTitle: /^Lab-07/,
  labPath: "topic-07-reference/book-a",
  notePath: "topic-07-reference/note-1"
};
