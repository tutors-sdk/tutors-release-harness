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
