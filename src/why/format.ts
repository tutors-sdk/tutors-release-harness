/**
 * The 5 Whys file (kaizen/<date>-<tag>-<finding>.md): its fields, how it is read back, and `harness why check`.
 *
 * Kaizen, not blame. A 5 Whys goes from a finding to a countermeasure to the system: every answer is checkable against
 * an artefact, a PR or a document; "human error" is never an answer, it is the prompt for the next why; the chain ends
 * when the answer is a process or a tool; and the countermeasure is exactly one of the seven kinds the team controls.
 *
 * The file is Markdown people fill in, with a shape a machine can read:
 *
 *   # 5 Whys: <title>
 *   - **Trigger:** Gate FAIL                      the header fields, one per line
 *   ## Why 1: <question>                           five sections; the text under each is the answer (HTML comments
 *   ## Why 2 … ## Why 5                            are prompts and do not count)
 *   - **Chain ends at:** Why 3                     where the chain ends, and in what: a process or a tool
 *   - **Kind:** mutant                             the countermeasure: kind, what, the mutant's path, owner, due,
 *   - **Verified by:** 16.4.0                      and the release it was verified closed in (empty while open)
 *
 * Pure: src/why/register.ts and src/why/command.ts read the files.
 */

/** The seven things the team controls. Where to stop: add one only when a 5 Whys shows an escape the seven could not address. */
export const COUNTERMEASURE_KINDS = ["mutant", "journey", "mask review", "EARS spec", "claim guidance", "SOP change", "glance rule"] as const;
export type CountermeasureKind = (typeof COUNTERMEASURE_KINDS)[number];

/** What each kind changes, in one line: the stub's prompt and the docs' table. */
export const KIND_MEANS: Record<CountermeasureKind, string> = {
  mutant: "a new mutant under mutants/ that plants this escape, so the harness proves every week it would catch it (the best kind)",
  journey: "a journey (traffic/journeys) that reaches what no journey reached",
  "mask review": "a mask in normalise/masks.yaml reviewed, narrowed or removed",
  "EARS spec": "an EARS Rule in the monorepo that states the behaviour, so the claim can name it",
  "claim guidance": "claims/README.md or release/README.md: how to write the claim that would have been right",
  "SOP change": "a change to release/SOP.md in the monorepo, by PR, citing this file",
  "glance rule": "a change to how the glance ranks or what it looks for (src/glance/rank.ts)"
};

/** The triggers: the four the plan makes not optional, an escalated glance mark, and a finding opened by hand. */
export const TRIGGERS = {
  gate: "Gate FAIL",
  band: "Red band",
  rollback: "rollback",
  "run-rule": "run rule",
  escalated: "escalated glance mark",
  finding: "finding"
} as const;
export type TriggerId = keyof typeof TRIGGERS;
export const TRIGGER_WORDS = Object.values(TRIGGERS) as string[];

/** The header fields, in the order the stub writes them. */
export const HEADER_FIELDS = ["Trigger", "Finding", "Release", "Run", "Opened"] as const;
/** The fields after the chain. */
export const END_FIELDS = ["Chain ends at", "Ends in", "Kind", "Countermeasure", "Mutant", "Owner", "Due", "Verified by"] as const;
export const ENDS_IN = ["process", "tool"] as const;
export const WHYS = 5;
export const MUTANTS_DIR = "mutants/";

/** The Lean reasons `why check` gives, word for word, so a rejected answer says what to do next. */
export const REASONS = {
  blame: '"human error" is not an answer, it is the prompt for the next why: ask what in the process or the tools let it through (docs/lean.md, Kaizen)',
  person: 'names a person, not a cause: the register records countermeasures to the system, and "a person was careless" is never one; ask why the system let it happen (docs/lean.md, Guardrails)',
  endsIn: "the chain ends when the answer is a process or a tool: say which (Ends in: process | tool)",
  kind: `the countermeasure is exactly one of the seven kinds the team controls: ${COUNTERMEASURE_KINDS.join(" · ")}`,
  mutant: "a mutant countermeasure names the path under mutants/ that plants the escape, so the register can link it"
} as const;

export interface WhyAnswer {
  n: number;
  question: string;
  /** The answer with the prompts (HTML comments) taken out, trimmed; "" when unanswered. */
  answer: string;
}

export interface WhyFile {
  title: string;
  fields: Record<string, string>;
  whys: WhyAnswer[];
}

const stripComments = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "");
const FIELD = /^\s*[-*]\s+\*\*([A-Za-z ]+):\*\*(.*)$/;

/** Read a 5 Whys back. Unknown sections are kept out of the answers; nothing throws: `checkWhy` says what is missing. */
export function parseWhy(text: string): WhyFile {
  const lines = stripComments(text).split("\n");
  const fields: Record<string, string> = {};
  const whys: WhyAnswer[] = [];
  let title = "";
  let current: { n: number; question: string; body: string[] } | undefined;
  const close = () => {
    if (current) whys.push({ n: current.n, question: current.question, answer: current.body.join("\n").trim() });
    current = undefined;
  };
  for (const line of lines) {
    const h1 = /^#\s+(.*)$/.exec(line);
    if (h1 && !title) {
      title = h1[1]!.trim();
      continue;
    }
    const why = /^##\s+Why\s+([1-9])\b[:.]?\s*(.*)$/i.exec(line);
    if (why) {
      close();
      current = { n: Number(why[1]), question: why[2]!.trim(), body: [] };
      continue;
    }
    if (/^##\s/.test(line)) {
      close();
      continue;
    }
    const f = FIELD.exec(line);
    // A field line inside a why is part of the answer (Why 1's facts are a list of bold labels too); fields live outside them.
    if (f && !current) {
      fields[f[1]!.trim()] = f[2]!.trim();
      continue;
    }
    if (current) current.body.push(line);
  }
  close();
  return { title, fields, whys };
}

// ---- blame --------------------------------------------------------------------------------------------

/** Phrases that put a finding on a person rather than the system. */
const BLAME_PHRASES = [
  "human error", "user error", "operator error", "developer error", "people error", "reviewer error", "carelessness", "careless", "sloppiness", "sloppy",
  "negligence", "negligent", "oversight", "inattention", "not paying attention", "lack of attention", "lack of care", "laziness", "lazy", "mistakes", "mistake",
  "error", "errors", "forgot", "forgotten", "forget", "forgetting", "missed it", "missed", "overlooked", "should have known", "should have checked", "should have noticed", "did not check",
  "didn't check", "did not notice", "didn't notice", "fault", "blame", "bad judgement", "bad judgment", "poor judgement", "poor judgment", "not careful", "wasn't careful", "was not careful"
];
/** Words that carry no cause on their own: who, and the grammar around it. */
const FILLER = new Set([
  "a", "an", "the", "it", "its", "it's", "this", "that", "was", "were", "is", "be", "been", "because", "of", "by", "on", "in", "at", "to", "for", "from", "just", "simply", "only", "again",
  "and", "or", "their", "his", "her", "our", "my", "your", "they", "he", "she", "we", "i", "you", "them", "him", "someone", "somebody", "someone's", "whoever", "who", "person", "people",
  "human", "team", "member", "dev", "devs", "developer", "developers", "engineer", "engineers", "reviewer", "reviewers", "captain", "author", "authors", "contributor", "contributors",
  "maintainer", "maintainers", "user", "users", "operator", "made", "make", "did", "do", "not", "no", "so", "s", "part", "side", "some", "one", "case", "simple", "plain", "pure", "all", "just"
]);

const words = (s: string) => s.match(/@?[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) ?? [];

/**
 * Why an answer is not an answer, or undefined when it is one. Only an answer that is *nothing but* blame is rejected:
 * "human error" is, "the reviewer missed it" is, "Ana forgot" is; "human error: the SOP has no step that checks X" is
 * not, because the rest of it is a cause someone can check.
 */
export function blameIn(answer: string): string | undefined {
  let t = ` ${answer.toLowerCase().replace(/[’]/g, "'")} `;
  let blamed = false;
  for (const p of [...BLAME_PHRASES].sort((x, y) => y.length - x.length)) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "gu");
    if (re.test(t)) {
      blamed = true;
      t = t.replace(re, " ");
    }
  }
  const lowerLeft = words(t).filter((w) => !FILLER.has(w.replace(/^@/, "")));
  // What is left once blame and filler are gone, in the answer's own casing: a person's name is all that can remain.
  const original = words(answer);
  const left = original.filter((w) => lowerLeft.includes(w.toLowerCase()));
  if (!lowerLeft.length) return blamed ? REASONS.blame : answer.trim() ? REASONS.person : undefined;
  const nameLike = (w: string) => w.startsWith("@") || /^\p{Lu}[\p{Ll}'’-]+$/u.test(w);
  if (left.length && left.length <= 3 && left.every(nameLike) && (blamed || original.length <= 3 || /^@/.test(left[0]!))) return REASONS.person;
  return undefined;
}

// ---- check ----------------------------------------------------------------------------------------------

export interface CheckProblem {
  /** Where: "Why 2", "Kind", "Owner", … */
  at: string;
  why: string;
}

export interface Countermeasure {
  kind: CountermeasureKind | null;
  what: string;
  mutant: string | null;
  owner: string;
  due: string;
  verifiedBy: string;
}

export const kindOf = (value: string): CountermeasureKind | undefined => COUNTERMEASURE_KINDS.find((k) => k.toLowerCase() === value.trim().toLowerCase());
/** A release, as Verified by names it: 16.4.0, v16.4.0, 16.4.0-rc.2. */
export const isRelease = (s: string) => /^v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(s);
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

/** The countermeasure as written, for the register; a value the check would refuse is kept as written (kind: null). */
export function countermeasureOf(f: WhyFile): Countermeasure {
  const v = (name: string) => (f.fields[name] ?? "").trim();
  const mutant = v("Mutant").replace(/^`|`$/g, "");
  return { kind: kindOf(v("Kind")) ?? null, what: v("Countermeasure"), mutant: mutant || null, owner: v("Owner"), due: v("Due"), verifiedBy: v("Verified by") };
}

/** Where the chain ends: "Why 3", "3", "why 3 (a process)". */
export function chainEnd(value: string | undefined): number | undefined {
  const m = /^(?:why\s*)?([1-5])\b/i.exec((value ?? "").trim());
  return m ? Number(m[1]) : undefined;
}

/** A path under mutants/ (a fragment such as mutants/mutants.yaml#my-mutant is allowed), never out of it. */
export function isMutantPath(p: string): boolean {
  const path = p.split("#")[0]!.replace(/^\.\//, "");
  return path.startsWith(MUTANTS_DIR) && path.length > MUTANTS_DIR.length && !path.split("/").includes("..");
}

/** `harness why check`: every problem with a filled 5 Whys, each with its Lean reason. Empty means valid. */
export function checkWhy(f: WhyFile): CheckProblem[] {
  const out: CheckProblem[] = [];
  const v = (name: string) => (f.fields[name] ?? "").trim();
  if (!f.title) out.push({ at: "title", why: "starts with a `# 5 Whys: …` heading" });
  if (!TRIGGER_WORDS.includes(v("Trigger"))) out.push({ at: "Trigger", why: `names what opened it: one of ${TRIGGER_WORDS.join(", ")}` });
  const byN = new Map(f.whys.map((w) => [w.n, w]));
  for (let n = 1; n <= WHYS; n++) if (!byN.has(n)) out.push({ at: `Why ${n}`, why: "the section is missing (## Why 1 to ## Why 5)" });
  const end = chainEnd(v("Chain ends at"));
  if (end === undefined) out.push({ at: "Chain ends at", why: "say which why the chain ends at (Why 1 to Why 5): the first answer that is a process or a tool" });
  for (let n = 1; n <= (end ?? WHYS); n++) {
    const w = byN.get(n);
    if (!w) continue;
    if (!w.answer) {
      out.push({ at: `Why ${n}`, why: `is unanswered, and the chain runs to Why ${end ?? WHYS}: every answer up to where it ends is checkable against an artefact, a PR or a document` });
      continue;
    }
    const blame = blameIn(w.answer);
    if (blame) out.push({ at: `Why ${n}`, why: blame });
  }
  if (!(ENDS_IN as readonly string[]).includes(v("Ends in").toLowerCase())) out.push({ at: "Ends in", why: REASONS.endsIn });
  const cm = countermeasureOf(f);
  if (!cm.kind) out.push({ at: "Kind", why: v("Kind") ? `"${v("Kind")}" is not one: ${REASONS.kind}` : REASONS.kind });
  if (!cm.what) out.push({ at: "Countermeasure", why: "say what changes in the system, in one sentence" });
  else {
    const blame = blameIn(cm.what);
    if (blame) out.push({ at: "Countermeasure", why: blame });
  }
  if (cm.kind === "mutant" && !(cm.mutant && isMutantPath(cm.mutant))) out.push({ at: "Mutant", why: cm.mutant ? `"${cm.mutant}" is not under mutants/: ${REASONS.mutant}` : REASONS.mutant });
  if (!cm.owner) out.push({ at: "Owner", why: "every 5 Whys has an owner (SOP step 12): the person who sees the countermeasure through, not the person who caused the finding" });
  if (!cm.due) out.push({ at: "Due", why: "every 5 Whys has a due date (SOP step 12), as YYYY-MM-DD" });
  else if (!isDate(cm.due)) out.push({ at: "Due", why: `"${cm.due}" is not a date: YYYY-MM-DD` });
  if (cm.verifiedBy && !isRelease(cm.verifiedBy)) out.push({ at: "Verified by", why: `"${cm.verifiedBy}" is not a release tag: the release in which the countermeasure was verified closed (e.g. 16.4.0), or empty while open` });
  return out;
}
