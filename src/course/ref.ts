/**
 * Where a published Tutors course lives. The reader (tutors.dev/course/<id>) fetches `https://<id>.netlify.app/tutors.json`
 * unless the id is itself a host (it has a dot, or is localhost or an address), as `determineCourseUrl` in the
 * monorepo's packages/svelte/course/src/course/services/lo-tree.ts does. This file is the same rule, so a capture reads
 * exactly what the reader would.
 */

export interface CourseRef {
  /** The course id the reader shows in its URL: `wit-hdip-comp-sci-2024`, or a host for a course not on Netlify. */
  id: string;
  /** The origin the course's files are served from, no trailing slash: `https://wit-hdip-comp-sci-2024.netlify.app`. */
  origin: string;
}

export class CourseRefError extends Error {}

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]*(:[0-9]+)?$/;
const READER_HOSTS = new Set(["tutors.dev", "www.tutors.dev"]);

const isLocal = (host: string) => /^(localhost|127\.|192\.168\.|10\.|\[?::1\]?)/.test(host);

/** A course id (or host) to where its files are. */
function fromId(id: string): CourseRef {
  if (!ID.test(id)) throw new CourseRefError(`"${id}" is not a course id: expected something like wit-hdip-comp-sci-2024`);
  if (id.endsWith(".netlify.app")) return { id: id.slice(0, -".netlify.app".length), origin: `https://${id}` };
  if (isLocal(id)) return { id, origin: `http://${id}` };
  if (id.includes(".")) return { id, origin: `https://${id}` };
  return { id, origin: `https://${id}.netlify.app` };
}

/**
 * `--course`: a reader URL (`https://tutors.dev/course/<id>`, any page of it), a reader path (`/course/<id>`), a course
 * host URL (`https://<id>.netlify.app`, `http://localhost:8080`), a host, or a bare id.
 */
export function parseCourseRef(input: string): CourseRef {
  const raw = input.trim();
  if (!raw) throw new CourseRefError("--course is empty: pass https://tutors.dev/course/<id> or the course id");
  const readerPath = /^\/course\/([^/?#]+)/.exec(raw);
  if (readerPath) return fromId(decodeURIComponent(readerPath[1]!));
  if (/^https?:\/\//i.test(raw)) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new CourseRefError(`"${raw}" is not a URL`);
    }
    if (READER_HOSTS.has(url.hostname)) {
      const m = /^\/course\/([^/]+)/.exec(url.pathname);
      if (!m) throw new CourseRefError(`"${raw}" is a tutors.dev page but not a course: expected https://tutors.dev/course/<id>`);
      return fromId(decodeURIComponent(m[1]!));
    }
    // A course host given as a URL: its origin is where the files are, whatever path was pasted.
    const ref = fromId(url.host);
    return url.protocol === "http:" ? { ...ref, origin: `http://${url.host}` } : ref;
  }
  return fromId(raw.replace(/\/+$/, ""));
}

/**
 * The course a `web` learning object links to, when it is a Tutors course: `/course/<id>`, `https://tutors.dev/course/<id>`
 * or `https://<id>.netlify.app`. Undefined for any other link (a GitHub repository, Slack, a page elsewhere).
 */
export function linkedCourse(route: string | undefined): CourseRef | undefined {
  if (!route) return undefined;
  const r = route.trim();
  if (/^\/course\/[^/?#]+/.test(r)) return safe(r);
  if (!/^https?:\/\//i.test(r)) return undefined;
  try {
    const url = new URL(r);
    if (READER_HOSTS.has(url.hostname) && /^\/course\/[^/]+/.test(url.pathname)) return safe(r);
    if (url.hostname.endsWith(".netlify.app")) return safe(`https://${url.hostname}`);
  } catch {
    return undefined;
  }
  return undefined;
}

function safe(input: string): CourseRef | undefined {
  try {
    return parseCourseRef(input);
  } catch {
    return undefined;
  }
}
