/**
 * The reader pages of a course, from its tutors.json: every learning object the reader opens on a page of its own, with
 * the title that page shows. `harness course check` opens a sample of them; a benchmark can open all of them.
 */

export interface ReaderRoute {
  /** The reader path for this course id: `/lab/localhost:8090/unit-1/topic-01/book-lab-01/Step-01`. */
  path: string;
  type: string;
  /** The title the page shows, trimmed (the generator keeps a leading space). */
  title: string;
}

/** Learning objects the reader shows on a page of their own. A web link, an archive, a video or a GitHub link is not one. */
export const PAGE_TYPES = new Set(["topic", "lab", "step", "note", "talk", "tutorial", "notebook"]);

type Lo = { route?: unknown; type?: unknown; title?: unknown; los?: unknown };

/** The course page first, then every page in the order of the tree. */
export function readerRoutes(tree: unknown, courseId: string): ReaderRoute[] {
  const root = tree as Lo;
  const routes: ReaderRoute[] = [{ path: `/course/${courseId}`, type: "course", title: String(root?.title ?? "").trim() }];
  const seen = new Set<string>(routes.map((r) => r.path));
  const visit = (lo: Lo) => {
    const type = typeof lo.type === "string" ? lo.type : "";
    const route = typeof lo.route === "string" ? lo.route : "";
    if (PAGE_TYPES.has(type) && route.includes("{{COURSEURL}}") && !route.endsWith("/")) {
      const path = route.replace("{{COURSEURL}}", courseId);
      if (!seen.has(path)) {
        seen.add(path);
        routes.push({ path, type, title: String(lo.title ?? "").trim() });
      }
    }
    if (Array.isArray(lo.los)) for (const child of lo.los) if (child && typeof child === "object") visit(child as Lo);
  };
  if (root && typeof root === "object") visit(root);
  return routes;
}

/**
 * A fixed sample of at most `n` routes (0 is all): the course page, then the first page of each type, then pages evenly
 * spread over the rest. The same course and n always give the same sample, so two runs open the same pages.
 */
export function sampleRoutes(routes: ReaderRoute[], n: number): ReaderRoute[] {
  if (n <= 0 || routes.length <= n) return routes;
  const picked = new Set<number>([0]);
  const firstOfType = new Map<string, number>();
  routes.forEach((r, i) => !firstOfType.has(r.type) && firstOfType.set(r.type, i));
  for (const i of firstOfType.values()) if (picked.size < n) picked.add(i);
  const rest = routes.map((_, i) => i).filter((i) => !picked.has(i));
  const want = n - picked.size;
  for (let k = 0; k < want && rest.length; k++) picked.add(rest[Math.floor((k * rest.length) / want)]!);
  return [...picked].sort((a, b) => a - b).map((i) => routes[i]!);
}
