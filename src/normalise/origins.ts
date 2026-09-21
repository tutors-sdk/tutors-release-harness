import type { SideCapture } from "../types.ts";

/**
 * Origins that belong to the system under test on BOTH sides of a comparison.
 *
 * The collector replaces the origin a side was captured at with `{{origin}}`, per side: the recorded
 * candidate ran at http://reader-a:3000, production answers at https://tutors.dev. That is enough
 * while a link to "the app itself" is written the same way on both sides. It is not when an
 * absolute link is a literal in the app or in the course content (the reader's footer "Tutors
 * v16" link, "What's New in Tutors", a course link to `https://tutors.dev`): on the recorded side it
 * stays `https://tutors.dev`, on production the collector rewrote it to `{{origin}}`, and every
 * such link became a false DOM hunk.
 *
 * Nothing in a capture says whether an own-origin string was built from the runtime origin or typed
 * as a literal, so a rule that leaves production's origin alone in content cannot be right (a link the
 * app builds from its origin would then differ instead). What is right is to treat the production URL
 * as the system's own origin on both sides: an external side's URLs, taken from its images
 * (`external:<url>`, which is what `--production` / HARNESS_PRODUCTION_URLS became), are rewritten
 * to `{{origin}}` in the OTHER side's captures too. A link that points at the same destination is then
 * the same string; a link that points elsewhere (another host, another path, another port) is not.
 */
export function externalOrigins(...captures: SideCapture[]): string[] {
  const origins = new Set<string>();
  for (const c of captures) {
    for (const image of Object.values(c.images)) {
      const m = /^external:(https?:\/\/[^/\s]+)\/*$/i.exec(image);
      if (m) origins.add(m[1]!);
    }
  }
  return [...origins].sort((x, y) => y.length - x.length || x.localeCompare(y));
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Rewrite each origin to `{{origin}}`, but only where it really is that origin: not `https://tutors.dev.example`,
 * `https://tutors.dev-x.example`, `https://tutors.dev:8443` (another port is another origin) or `https://tutors.dev@host`.
 */
export function rewriteOrigins(text: string, origins: readonly string[]): { text: string; count: number } {
  if (!origins.length || !text) return { text, count: 0 };
  const re = new RegExp(`(?:${origins.map(escape).join("|")})(?![\\w:@-]|\\.\\w)`, "gi");
  let count = 0;
  const out = text.replace(re, () => {
    count += 1;
    return "{{origin}}";
  });
  return { text: out, count };
}
