import { linkedCourse, type CourseRef } from "./ref.ts";

/**
 * What a published course's `tutors.json` makes the reader load from the course's own host, read from the tree alone.
 *
 * The generator (the monorepo's packages/jsr/gen) writes a file's address in one of three ways, and the reader resolves
 * each one against the course host (packages/jsr/model/src/utils/lo-utils.ts and markdown-utils.ts `filter`):
 *
 *   - an absolute placeholder, `https://{{COURSEURL}}/unit-1/topic-01/topic.png`, in img, pdf, excalidraw and any other
 *     field;
 *   - an archive, `route: /archive/{{COURSEURL}}/unit-1/topic-01/archive` plus `archiveFile: code.zip`;
 *   - markdown (a lab step, a note, a notebook cell) naming `img/...`, `./img/...`, `archives/...` or `archive/...`
 *     relative to its learning object's folder, which the reader prefixes with that folder's address.
 *
 * Anything else (YouTube, GitHub, Slack, another site) is not the course's and is never fetched. A `web` learning object
 * that links another Tutors course is returned in `links`, for the capture to follow.
 */

export interface AssetRef {
  /** The file's path on the course host, from its root, `/`-separated, no leading slash: `unit-1/topic-01/topic.png`. */
  path: string;
  /** The route of the first learning object that named it (with {{COURSEURL}}), for the record. */
  from: string;
}

export interface CourseAssets {
  assets: AssetRef[];
  /** Tutors courses the course links to (its `web` learning objects), in order, once each. */
  links: CourseRef[];
  /** Learning objects per type, for the record and a quick look at what was captured. */
  types: Record<string, number>;
}

type Lo = Record<string, unknown> & { route?: unknown; type?: unknown; los?: unknown; contentMd?: unknown };

const PLACEHOLDER = "{{COURSEURL}}";
const ABSOLUTE = /https?:\/\/\{\{COURSEURL\}\}(\/[^\s"'<>()\\]*)/g;
// `img/`, `./img/`, `archives/`, `archive/` that does not already belong to a longer URL or path; `archive/refs` is GitHub's.
const RELATIVE = /(?<![\w/.:%-])(?:\.\/)?((?:img|archives?)\/[^\s"'<>()\\[\]]+)/g;

/** A path on the course host, normalised; undefined when it leaves the root or is not a file. */
export function normalisePath(raw: string): string | undefined {
  let p = raw.split(/[?#]/)[0]!;
  try {
    p = decodeURI(p);
  } catch {
    // Left as written: a stray % is still a file name.
  }
  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      if (!out.length) return undefined;
      out.pop();
      continue;
    }
    out.push(seg);
  }
  // Markdown punctuation that ends a sentence is not part of the name.
  const last = out.at(-1)?.replace(/[.,;:!]+$/, "");
  if (!last || !last.includes(".")) return undefined;
  out[out.length - 1] = last;
  return out.join("/");
}

/** The folder a learning object's relative paths resolve against: its route after {{COURSEURL}}. */
function folderOf(route: string): string {
  const at = route.indexOf(PLACEHOLDER);
  return at < 0 ? "" : route.slice(at + PLACEHOLDER.length).replace(/^\/+|\/+$/g, "");
}

/** Every string in a value, however deep. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

export function courseAssets(tree: unknown): CourseAssets {
  const found = new Map<string, AssetRef>();
  const links = new Map<string, CourseRef>();
  const types: Record<string, number> = {};
  const add = (raw: string, from: string, folder = "") => {
    const path = normalisePath(folder ? `${folder}/${raw}` : raw);
    if (path && !found.has(path)) found.set(path, { path, from });
  };

  const visit = (lo: Lo, folder: string) => {
    const type = typeof lo.type === "string" ? lo.type : "unknown";
    types[type] = (types[type] ?? 0) + 1;
    const route = typeof lo.route === "string" ? lo.route : "";
    // A lab's steps carry their own routes, but their markdown is relative to the lab (convertLabToHtml).
    const own = type === "step" ? folder : route.includes(PLACEHOLDER) ? folderOf(route) : folder;

    for (const [key, value] of Object.entries(lo)) {
      if (key === "los") continue;
      for (const s of strings(value)) {
        for (const m of s.matchAll(ABSOLUTE)) add(m[1]!, route);
        // Relative paths only in prose the reader filters: markdown and notebook cells, never ids or titles.
        if (key === "contentMd" || key === "cells" || key === "summary") for (const m of s.matchAll(RELATIVE)) add(m[1]!, route, own);
      }
    }
    if (type === "archive" && typeof lo.archiveFile === "string" && lo.archiveFile) add(`${folderOf(route)}/${lo.archiveFile}`, route);
    if (type === "web") {
      const linked = linkedCourse(route);
      if (linked && !links.has(linked.id)) links.set(linked.id, linked);
    }
    if (Array.isArray(lo.los)) for (const child of lo.los) if (child && typeof child === "object") visit(child as Lo, own);
  };

  if (tree && typeof tree === "object") visit(tree as Lo, "");
  return { assets: [...found.values()].sort((a, b) => a.path.localeCompare(b.path)), links: [...links.values()], types };
}
