/**
 * Causes, not hunks (since 1.20.0). A forecast of 29 September had 899 unclaimed differences, and 696 of them were one
 * Dockerfile change seen as "package removed" once per package per image. A reader had to work out alone that the 899 came
 * from a handful of changes. This folds the unclaimed differences into causes: one row per kind of difference, with how
 * many hunks it covers, the apps and pages it spans, the things it folded (packages, log fields, assets) and one example.
 *
 * A cause is an artefact and a kind: the hunk's summary with its app or page prefix taken off, the name the summary ends in
 * folded away ("package removed: @isaacs/cliui@8.0.2" is "package removed", the package goes to `items`), hashed build
 * assets folded into one ("{{asset}}"), and every number masked, so "+51 −25 lines at line 4" and "+6 −7 lines at line 36"
 * are one kind. A network request keeps its route, unless it is a hashed build asset: a new /logo.svg is a change of its
 * own, a new hashed chunk is the build. The same key reads the same in two runs, so a cause can be compared night by night.
 *
 * Beside the causes, `together`: the pages on which two or more artefacts moved, grouped by the same set of artefacts, so
 * the Paper rebuild reads "dom, focus, network, screenshot on 16 pages" and not four unrelated counts.
 *
 * Here, under src/report/, and computed from the unclaimed set after the verdict (src/report/index.ts adds it to the report
 * it writes): nothing that judges reads it. It never changes a verdict, the Gate, the score or an exit code.
 */
import { createHash } from "node:crypto";
import { APPS } from "../image-ref.ts";
import type { Artefact, Hunk } from "../types.ts";

/** One cause: a kind of difference, folded across apps, pages and packages. */
export interface Cause {
  /** Eight hex characters of sha256(`key`): the same cause has the same id in every report. */
  id: string;
  /** `<artefact>: <kind>`, the identity of the cause across runs. */
  key: string;
  artefact: Artefact;
  /** The summary with the app or page, the name it ends in, hashed assets and every number folded away. */
  kind: string;
  /** How many unclaimed differences it covers. */
  hunks: number;
  /** The apps it spans (reader, catalogue, live, time), in that order; empty when the hunks name none (a journey's table). */
  apps: string[];
  /** The pages it spans (`app:page`), sorted; empty for a cause that is not about a page (an image, a log, a table). */
  pages: string[];
  /** What was folded away, sorted and distinct: package names, log fields, labels, routes of hashed assets. */
  items: string[];
  /** The first difference it covers, as the report lists it. */
  example: { id: string; scope: string; summary: string };
}

/** Pages on which the same two or more artefacts moved: likely one change, seen through several artefacts. */
export interface PagesTogether {
  artefacts: Artefact[];
  pages: string[];
  /** The unclaimed differences on those pages in those artefacts. */
  hunks: number;
}

/** `report.json` `causes`: the unclaimed set folded into causes. */
export interface Causes {
  /** The unclaimed differences folded (compare.unclaimed). */
  unclaimed: number;
  /** Biggest first, then by key. */
  causes: Cause[];
  /** Pages on which two or more artefacts moved, grouped by the same set of artefacts; most pages first. */
  together: PagesTogether[];
}

const APP_SET = new Set<string>(APPS);
/** `reader:home: ` or `reader: ` or `student-signs-in: ` at the start of a summary. */
const PREFIX = /^([a-z0-9][a-z0-9-]*)(?::([a-z0-9][a-z0-9-]*))?: /;
/** A route or file with a content hash in it, as the normaliser writes it. */
const HASHED = /\S*\{\{hash\}\}\S*/g;
const HAS_HASH = /\{\{hash\}\}/;
/** "<what happened>: <the name it happened to>": a phrase with a space and no digit, then the name. */
const NAMED = /^([^:\d]* [^:\d]*?): (.+)$/s;

const mask = (s: string) => s.replace(/\d+(?:\.\d+)?/g, "#");

/** Page prefixes that are not an app's name: the reference course journey's pages are the reader's (traffic/journeys). */
const PAGE_APP: Readonly<Record<string, string>> = { reference: "reader" };

/** The app a page key or scope head belongs to: `reader`, `reader` for `reader-auth` (the reader set up for sign-in) and `reference`. */
const appOf = (head: string | undefined): string | undefined => (head === undefined ? undefined : APP_SET.has(head) ? head : (PAGE_APP[head] ?? APPS.find((a) => head.startsWith(`${a}-`))));

/** Where a hunk is: its app, and its page when it is about one (`app:page`, as the summary or the scope names it). */
function placeOf(h: Pick<Hunk, "scope" | "summary">): { app?: string; page?: string } {
  const m = PREFIX.exec(h.summary ?? "");
  const head = h.scope.split("/")[0]!;
  const page = m?.[2] ? `${m[1]}:${m[2]}` : /^[a-z0-9-]+:[a-z0-9-]+$/.test(head) ? head : undefined;
  const app = appOf(page?.split(":")[0] ?? m?.[1] ?? head.split(":")[0]);
  return { ...(app ? { app } : {}), ...(page ? { page } : {}) };
}

/** What a hunk's summary is, with the app, the page, the name it ends in and every number folded away; and that name. */
export function kindOf(h: Pick<Hunk, "artefact" | "scope" | "summary">): { kind: string; item?: string } {
  let s = (h.summary ?? "").replace(PREFIX, "");
  let item: string | undefined;
  const named = NAMED.exec(s);
  if (named) {
    const [, phrase, rest] = named;
    // A route is what a network difference is about; only a hashed build asset is folded, into one {{asset}}.
    if (h.artefact === "network") {
      if (HAS_HASH.test(rest!)) item = h.scope;
    } else {
      s = phrase!;
      // The name, as the scope says it when the scope is app/name (a package without its version); else as the summary did.
      const tail = h.scope.includes("/") ? h.scope.slice(h.scope.indexOf("/") + 1) : undefined;
      item = tail ?? rest!.slice(0, 120);
    }
  }
  if (h.artefact === "network" && !item && HAS_HASH.test(s)) item = h.scope;
  return { kind: mask(s.replace(HASHED, "{{asset}}")).trim(), ...(item ? { item } : {}) };
}

/** The identity of a hunk's cause across runs. */
export const causeKey = (h: Pick<Hunk, "artefact" | "scope" | "summary">): string => `${h.artefact}: ${kindOf(h).kind}`;

const causeId = (key: string) => createHash("sha256").update(key).digest("hex").slice(0, 8);
const appOrder = (x: string, y: string) => APPS.indexOf(x as (typeof APPS)[number]) - APPS.indexOf(y as (typeof APPS)[number]);

/** Fold the unclaimed differences into causes, and the pages where several artefacts moved together. Pure. */
export function foldCauses(unclaimed: Hunk[]): Causes {
  const by = new Map<string, { artefact: Artefact; kind: string; hunks: Hunk[]; apps: Set<string>; pages: Set<string>; items: Set<string> }>();
  const onPage = new Map<string, Map<Artefact, number>>();
  for (const h of unclaimed) {
    const { kind, item } = kindOf(h);
    const key = `${h.artefact}: ${kind}`;
    const c = by.get(key) ?? { artefact: h.artefact, kind, hunks: [], apps: new Set(), pages: new Set(), items: new Set() };
    by.set(key, c);
    c.hunks.push(h);
    const { app, page } = placeOf(h);
    if (app) c.apps.add(app);
    if (page) {
      c.pages.add(page);
      const m = onPage.get(page) ?? new Map<Artefact, number>();
      onPage.set(page, m);
      m.set(h.artefact, (m.get(h.artefact) ?? 0) + 1);
    }
    if (item) c.items.add(item);
  }
  const causes: Cause[] = [...by.entries()]
    .map(([key, c]) => {
      const first = c.hunks[0]!;
      return { id: causeId(key), key, artefact: c.artefact, kind: c.kind, hunks: c.hunks.length, apps: [...c.apps].sort(appOrder), pages: [...c.pages].sort(), items: [...c.items].sort(), example: { id: first.id, scope: first.scope, summary: first.summary } };
    })
    .sort((x, y) => y.hunks - x.hunks || x.key.localeCompare(y.key));

  const groups = new Map<string, PagesTogether>();
  for (const [page, arts] of onPage) {
    if (arts.size < 2) continue;
    const artefacts = [...arts.keys()].sort();
    const g = groups.get(artefacts.join(",")) ?? { artefacts, pages: [], hunks: 0 };
    groups.set(artefacts.join(","), g);
    g.pages.push(page);
    g.hunks += [...arts.values()].reduce((a, b) => a + b, 0);
  }
  const together = [...groups.values()].map((g) => ({ ...g, pages: g.pages.sort() })).sort((x, y) => y.pages.length - x.pages.length || y.hunks - x.hunks || x.artefacts.join().localeCompare(y.artefacts.join()));
  return { unclaimed: unclaimed.length, causes, together };
}

// ---- rendering: report.html and report.md ---------------------------------------------------------------

/** How many of a cause's pages and items a row names; the rest are counted. */
export const CAUSE_LISTED = { pages: 6, items: 8 } as const;

/** An example's summary, cut: a changed link header runs to kilobytes. */
const cut = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const listed = (xs: string[], n: number, f: (x: string) => string) => `${xs.slice(0, n).map(f).join(", ")}${xs.length > n ? ` and ${xs.length - n} more` : ""}`;

/** The headline: "899 unclaimed differences, 19 causes". */
export const causesHeadline = (c: Causes) => `${c.unclaimed} unclaimed difference${c.unclaimed === 1 ? "" : "s"}, ${c.causes.length} cause${c.causes.length === 1 ? "" : "s"}`;

/** What a cause folded, in words: "174 packages: @isaacs/cliui, …". */
function foldedWords(c: Cause): string {
  const noun = c.artefact === "sbom" ? "package" : c.artefact === "logs" ? "field" : c.artefact === "network" ? "route" : c.artefact === "headers" ? "header" : "name";
  return `${c.items.length} ${noun}${c.items.length === 1 ? "" : "s"}`;
}

/** report.html: the cause table, then the pages on which several artefacts moved together. */
export function causesHtml(c: Causes | undefined, esc: (s: string) => string): string {
  if (!c?.causes.length) return "";
  const rows = c.causes.map((x) => {
    const items = x.items.length ? `<br><small>${foldedWords(x)}: ${listed(x.items, CAUSE_LISTED.items, (i) => `<code>${esc(i)}</code>`)}</small>` : "";
    const pages = x.pages.length ? `${x.pages.length}<br><small>${listed(x.pages, CAUSE_LISTED.pages, (p) => `<code>${esc(p)}</code>`)}</small>` : "—";
    return `<tr id="cause-${x.id}"><td><code>${esc(x.artefact)}</code> ${esc(x.kind)}${items}</td><td data-label="differences">${x.hunks}</td><td data-label="apps">${x.apps.map(esc).join(", ") || "—"}</td><td data-label="pages">${pages}</td><td data-label="example"><a href="#hunk-${esc(x.example.id)}">${esc(cut(x.example.summary))}</a></td></tr>`;
  });
  const together = c.together.length
    ? `<p>Moved together on the same pages, so likely one change each:</p><ul>${c.together.map((g) => `<li>${g.artefacts.map((a) => `<code>${esc(a)}</code>`).join(", ")} on ${g.pages.length} page${g.pages.length === 1 ? "" : "s"} (${g.hunks} differences): ${listed(g.pages, CAUSE_LISTED.pages, (p) => `<code>${esc(p)}</code>`)}</li>`).join("")}</ul>`
    : "";
  return `<section class="causes">
<h2 id="causes">${esc(causesHeadline(c))}</h2>
<p>The unclaimed differences folded by kind across apps, pages and packages: a number, a hash or a package name does not make a new cause. Read beside the verdict; it never changes it.</p>
<table><thead><tr><th>cause</th><th>differences</th><th>apps</th><th>pages</th><th>example</th></tr></thead><tbody>
${rows.join("\n")}
</tbody></table>
${together}
</section>`;
}

const mdCell = (s: string) => s.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();

/** report.md: the same table, pages and items counted with the first few named. */
export function causesMarkdown(c: Causes | undefined): string[] {
  if (!c?.causes.length) return [];
  const lines = [`### ${causesHeadline(c)}`, "", "Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.", "", "| cause | differences | apps | pages | example |", "|---|---|---|---|---|"];
  for (const x of c.causes) {
    const items = x.items.length ? ` (${foldedWords(x)}: ${listed(x.items, CAUSE_LISTED.items, (i) => `\`${mdCell(i)}\``)})` : "";
    const pages = x.pages.length ? `${x.pages.length}: ${listed(x.pages, CAUSE_LISTED.pages, (p) => `\`${p}\``)}` : "—";
    lines.push(`| \`${x.artefact}\` ${mdCell(x.kind)}${items} | ${x.hunks} | ${x.apps.join(", ") || "—"} | ${pages} | ${mdCell(cut(x.example.summary))} |`);
  }
  lines.push("");
  if (c.together.length) {
    lines.push("Moved together on the same pages, so likely one change each:", "");
    for (const g of c.together) lines.push(`- ${g.artefacts.map((a) => `\`${a}\``).join(", ")} on ${g.pages.length} page${g.pages.length === 1 ? "" : "s"} (${g.hunks} differences): ${listed(g.pages, CAUSE_LISTED.pages, (p) => `\`${p}\``)}`);
    lines.push("");
  }
  return lines;
}
