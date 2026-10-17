/**
 * What a PR says it will move (since 1.41.0): the artefacts its CHANGELOG line names, in the trailing parenthesis the
 * monorepo's CONTRIBUTING.md (Changelog Entries) asks for, `(axe, dom)`. The release author turns that line into a claim
 * when the release is cut, so on a forecast of main a difference its own PR declared is explained, not owed: the
 * contributor already said it, and nobody should open a follow-up PR to say it again.
 *
 * Two places, the first that has a hint wins:
 *   - the PR title, `fix(reader): raise nav contrast (axe, dom)`, which `pnpm release:changelog` also reads;
 *   - the PR body's CHANGELOG line, as the PR template asks for it: `- [x] CHANGELOG: \`Nav contrast raised (axe, dom)\``.
 *     An unticked template line is the template's own example and is never read.
 *
 * A declaration is a lead the reports print and the ledger counts. It never changes the verdict: the release gate still
 * needs the claim.
 */
import { ARTEFACTS } from "../types.ts";

export interface Declaration {
  /** The artefacts named, in the order written. Empty for an explicit `none`. */
  artefacts: string[];
  /** The CHANGELOG entry without its hint, as the claim's reason will quote it. */
  entry: string;
  source: "title" | "body";
}

const HINT = /\s*\(([a-z-]+(?:\s*,\s*[a-z-]+)*)\)\s*$/;
const PR_REF = /\s*\((?:PR )?#\d+\)\s*$/;
const KNOWN = new Set<string>(ARTEFACTS);

/** The artefact hint ending `text`, and the text without it; undefined when it has none, or names something unknown. */
export function hintOf(text: string): { artefacts: string[]; entry: string } | undefined {
  const t = text.trim().replace(PR_REF, "");
  const m = HINT.exec(t);
  if (!m) return /^none\.?$/i.test(t) ? { artefacts: [], entry: "none" } : undefined;
  const names = m[1]!.split(",").map((n) => n.trim());
  if (!names.every((n) => KNOWN.has(n))) return undefined;
  return { artefacts: names, entry: t.slice(0, m.index).trim() };
}

/** The CHANGELOG line of a PR body: a ticked or plain line `CHANGELOG: <entry>`, the entry in backticks or bare. */
export function changelogLineOf(body: string): string | undefined {
  const text = body.replace(/<!--[\s\S]*?-->/g, "");
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*[-*]\s*\[\s\]/.test(line)) continue;
    const m = /\bCHANGELOG(?: line| entry)?\s*:\s*(.+)$/.exec(line);
    if (!m) continue;
    const rest = m[1]!.trim();
    const ticked = /^`([^`]+)`/.exec(rest);
    return (ticked ? ticked[1]! : rest).trim();
  }
  return undefined;
}

/** What a PR declares, from its title, else its body's CHANGELOG line; undefined when neither names artefacts. */
export function declarationOf(title: string, body?: string): Declaration | undefined {
  const t = hintOf(title);
  if (t && t.artefacts.length) return { ...t, source: "title" };
  const line = body !== undefined ? changelogLineOf(body) : undefined;
  const b = line !== undefined ? hintOf(line) : undefined;
  return b ? { ...b, source: "body" } : undefined;
}

/** `(axe, dom)`, or `none`. */
export const declaredWords = (d: Pick<Declaration, "artefacts">) => (d.artefacts.length ? `(${d.artefacts.join(", ")})` : "none");
