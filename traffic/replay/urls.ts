/**
 * The replay set (since 1.28.0; runway improvement G, after Diffy): a fixed list of course URLs, each fetched on both
 * sides by the `replay-course-urls` journey and compared on status, headers and network only (`replay`, informing).
 *
 * The list is the decision the runway asked for: "which course URLs are fixed enough to replay". It starts with the
 * pinned fixture course (fixtures/course-server/course), which this repository serves and nothing upstream can move,
 * and with pages no other journey opens: the second topic, a talk, both notes, a step of the second lab, and a topic
 * that does not exist. `{course}` is the side's own fixture course id. Add a URL only when it is anonymous, read-only
 * and fixed; a published course's URLs belong here only once its content is pinned.
 */
export interface ReplayUrl {
  /** The page key's suffix: the page is `replay:<key>`. */
  key: string;
  /** Path on the reader; `{course}` is the course id. */
  path: string;
}

export const REPLAY_URLS: readonly ReplayUrl[] = [
  { key: "topic-02", path: "/topic/{course}/unit-1/topic-02" },
  { key: "talk-01", path: "/talk/{course}/unit-1/topic-01/talk-01" },
  { key: "note-01", path: "/note/{course}/unit-1/topic-01/note-01" },
  { key: "note-02", path: "/note/{course}/unit-1/topic-02/note-02" },
  { key: "lab-02-step-03", path: "/lab/{course}/unit-1/topic-02/book-lab-01/Step-03" },
  { key: "missing-topic", path: "/topic/{course}/unit-1/no-such-topic" }
];
