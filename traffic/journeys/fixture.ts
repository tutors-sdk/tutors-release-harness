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
  /** Appears in both notes' body; a result links to `<topic>/ <note>` (the generator keeps a leading space in titles). */
  searchTerm: "reference material",
  searchResultTitle: /Topic 1\/\s*Note 1/
};
