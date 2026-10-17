/**
 * Since 1.43.0: a small reader of the Gherkin the Rule journeys are written in (traffic/journeys/features/*.feature).
 *
 * It reads the subset the monorepo's own feature files use: a `Feature:`, tags on their own lines, `Rule:` blocks, one
 * `Scenario:` per Rule, and `Given`/`When`/`Then`/`And`/`But` steps. Descriptions under a Feature, Rule or Scenario and
 * `#` comments are skipped. Anything else (a Background, an Outline, a table, a doc string) is an error that names the
 * line: a Rule journey is one Rule and one scenario that a person can read top to bottom, as the monorepo's are.
 */
export interface GherkinStep {
  /** Given, When or Then; an And or But takes the keyword of the step before it. */
  keyword: "Given" | "When" | "Then";
  text: string;
  line: number;
}

export interface GherkinRule {
  /** The four-digit id from the Rule's `@rule-NNNN` tag. */
  id: string;
  /** The EARS pattern from its `@ears-*` tag. */
  ears: string;
  /** Every tag on the Rule, without the `@`. */
  tags: string[];
  /** The Rule's sentence. */
  title: string;
  scenario: { name: string; steps: GherkinStep[]; line: number };
  line: number;
}

export interface GherkinFeature {
  file: string;
  name: string;
  tags: string[];
  rules: GherkinRule[];
}

export class GherkinError extends Error {
  constructor(file: string, line: number, message: string) {
    super(`${file}:${line}: ${message}`);
    this.name = "GherkinError";
  }
}

const EARS = ["ubiquitous", "event-driven", "state-driven", "unwanted", "optional", "complex"];

export function parseFeature(text: string, file = "feature"): GherkinFeature {
  const lines = text.split(/\r?\n/);
  let feature: GherkinFeature | undefined;
  let pendingTags: string[] = [];
  let rule: (Omit<GherkinRule, "scenario"> & { scenario?: GherkinRule["scenario"] }) | undefined;
  let last: GherkinStep["keyword"] | undefined;
  const rules: GherkinRule[] = [];

  const close = () => {
    if (!rule) return;
    if (!rule.scenario) throw new GherkinError(file, rule.line, `Rule ${rule.id} has no Scenario`);
    if (!rule.scenario.steps.length) throw new GherkinError(file, rule.scenario.line, `the scenario of Rule ${rule.id} has no steps`);
    rules.push(rule as GherkinRule);
    rule = undefined;
  };

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    if (line.startsWith("@")) {
      pendingTags.push(...line.split(/\s+/).map((t) => t.replace(/^@/, "")));
      return;
    }
    const kw = /^(Feature|Rule|Scenario|Background|Scenario Outline|Scenario Template|Examples):\s*(.*)$/.exec(line);
    if (kw) {
      const [, word, rest] = kw;
      if (word === "Feature") {
        if (feature) throw new GherkinError(file, n, "a second Feature");
        feature = { file, name: rest!.trim(), tags: pendingTags, rules };
      } else if (word === "Rule") {
        if (!feature) throw new GherkinError(file, n, "a Rule before the Feature");
        close();
        const id = pendingTags.find((t) => /^rule-\d{4}$/.test(t))?.slice(5);
        if (!id) throw new GherkinError(file, n, "a Rule needs a @rule-NNNN tag");
        const ears = pendingTags.find((t) => t.startsWith("ears-"))?.slice(5);
        if (!ears || !EARS.includes(ears)) throw new GherkinError(file, n, `Rule ${id} needs one of the tags ${EARS.map((e) => `@ears-${e}`).join(", ")}`);
        rule = { id, ears, tags: pendingTags, title: rest!.trim(), line: n };
      } else if (word === "Scenario") {
        if (!rule) throw new GherkinError(file, n, "a Scenario outside a Rule");
        if (rule.scenario) throw new GherkinError(file, n, `Rule ${rule.id} has a second Scenario: a Rule journey is one scenario`);
        rule.scenario = { name: rest!.trim(), steps: [], line: n };
        last = undefined;
      } else {
        throw new GherkinError(file, n, `${word} is not supported in a Rule journey`);
      }
      pendingTags = [];
      return;
    }
    const step = /^(Given|When|Then|And|But)\s+(.+)$/.exec(line);
    if (step) {
      if (!rule?.scenario) throw new GherkinError(file, n, "a step outside a Scenario");
      const word = step[1] as "Given" | "When" | "Then" | "And" | "But";
      const keyword = word === "And" || word === "But" ? last : word;
      if (!keyword) throw new GherkinError(file, n, `a scenario cannot start with ${word}`);
      last = keyword;
      rule.scenario.steps.push({ keyword, text: step[2]!.trim(), line: n });
      return;
    }
    if (line.startsWith("|") || line.startsWith('"""') || line.startsWith("```")) throw new GherkinError(file, n, "tables and doc strings are not supported in a Rule journey");
    // A description line under a Feature, Rule or Scenario.
    if (rule?.scenario?.steps.length) throw new GherkinError(file, n, `not a step: "${line}"`);
  });
  close();
  if (!feature) throw new GherkinError(file, 1, "no Feature");
  const seen = new Set<string>();
  for (const r of rules) {
    if (seen.has(r.id)) throw new GherkinError(file, r.line, `Rule ${r.id} appears twice`);
    seen.add(r.id);
  }
  return feature;
}
