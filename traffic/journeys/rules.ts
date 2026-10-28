import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Journey } from "./journeys.ts";
import { parseFeature, type GherkinFeature, type GherkinRule } from "./gherkin.ts";
import { fixture, signedInCourseId, TIME_COURSE_ID } from "./fixture.ts";
import { bind, type World } from "./steps.ts";

/**
 * Since 1.43.0: the Rule journeys. Each `Rule:` block in traffic/journeys/features/*.feature is one journey of the set
 * `rules`, run on both sides like every other journey and compared the same way; what is new is that the journey says
 * which Rule it proves and which of the monorepo's Rules its scenario exercises, so a difference on its pages is read as
 * a difference in that behaviour (src/report/causes.ts).
 *
 * The Rule is a sentence about the harness ("When the harness runs ..., it shall ... and compare ..."), in EARS, with a
 * `@rule-NNNN` id from the block the project reserved (0582 to 0599). Tags on the Rule:
 *   @journey-<slug>   the journey's name is `rule-<id>-<slug>` (required)
 *   @role-<role>      who the identity stub signs in as: student (default), enrolled, lecturer, owner, admin
 *   @course-rules     since 1.44.0: read the Rule journeys' course (fixtures/course-server/rules-course: signed in, private,
 *                     a quiz, a notebook, a calendar), not the fixture course
 *   @course-site      since 1.57.1: the same course, named by its Netlify site id `harness-rules` as a production course is,
 *                     for a journey the reader's server checks: it fetches https://<id>.netlify.app/tutors.json to find
 *                     the course's educators (mono-repo #519, content locks) and refuses an id with a port. Since 1.58.0
 *                     `@course-rules` names it so too, and the fixture course is `harness-fixture`: since mono-repo #327
 *                     every data route the signed-in reader calls refuses an id with a port
 * The scenario's name ends "(exercises Rules 0011, 0250-0258, ...)": the monorepo Rules the scenario drives, each id or
 * range as the monorepo numbers them, then optionally `; <a note>` (since 1.44.0). Every step must match a sentence in traffic/journeys/steps.ts.
 */
export const FEATURES_DIR = join(import.meta.dirname, "features");
const ROLES = ["student", "enrolled", "lecturer", "owner", "admin"];
const COURSES = ["fixture", "rules", "site"];
/** The Rule journeys' course's title (fixtures/course-server/rules-course-build/build.ts). */
export const RULES_COURSE_TITLE = "Harness Rules Course";

/** `0011, 0250-0258` -> 0011, 0250, 0251, ..., 0258. */
export function expandRuleIds(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(",").map((p) => p.trim()).filter(Boolean)) {
    const range = /^(\d{4})\s*-\s*(\d{4})$/.exec(part);
    if (range) {
      const [from, to] = [Number(range[1]), Number(range[2])];
      if (to < from || to - from > 50) throw new Error(`"${part}" is not a range of Rule ids`);
      for (let n = from; n <= to; n++) out.push(String(n).padStart(4, "0"));
    } else if (/^\d{4}$/.test(part)) out.push(part);
    else throw new Error(`"${part}" is not a Rule id`);
  }
  return out;
}

/**
 * The monorepo Rules a scenario exercises, from its name's trailing "(exercises Rules ...)". Since 1.44.0 a `;` ends the
 * ids and starts a note for people, such as a monorepo scenario that has no Rule yet.
 */
export function exercisedBy(scenarioName: string): string[] {
  const m = /\(exercises Rules? ([^);]+)(?:;[^)]*)?\)\s*$/.exec(scenarioName);
  return m ? expandRuleIds(m[1]!) : [];
}

/** One Rule block as a journey. Throws, naming the file and line, when a step is unbound or a tag is missing. */
export function journeyOf(feature: GherkinFeature, rule: GherkinRule): Journey {
  const where = `${feature.file}:${rule.line}`;
  const slug = rule.tags.find((t) => t.startsWith("journey-"))?.slice("journey-".length);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${where}: Rule ${rule.id} needs a @journey-<slug> tag (lower case, hyphens)`);
  const role = rule.tags.find((t) => t.startsWith("role-"))?.slice("role-".length) ?? "student";
  if (!ROLES.includes(role)) throw new Error(`${where}: Rule ${rule.id}: @role-${role} is not one of the identity stub's roles (${ROLES.join(", ")})`);
  const course = rule.tags.find((t) => t.startsWith("course-"))?.slice("course-".length) ?? "fixture";
  if (!COURSES.includes(course)) throw new Error(`${where}: Rule ${rule.id}: @course-${course} is not one of the harness's courses (${COURSES.join(", ")})`);
  const bound = rule.scenario.steps.map((s) => {
    const b = bind(s.text);
    if (!b) throw new Error(`${feature.file}:${s.line}: no step matches "${s.text}" (traffic/journeys/steps.ts lists the sentences)`);
    return { ...s, ...b };
  });
  if (!bound.some((s) => /^the page is captured as /.test(s.text))) throw new Error(`${where}: Rule ${rule.id} captures no page ("the page is captured as ...")`);
  return {
    name: `rule-${rule.id}-${slug}`,
    set: "rules",
    anonymous: false,
    target: "readerAuth",
    ...(role !== "student" ? { role } : {}),
    ...(course !== "fixture" ? { course } : {}),
    rules: [rule.id, ...exercisedBy(rule.scenario.name).filter((r) => r !== rule.id)],
    async run(page, urls, onPage, actors) {
      // Since 1.58.0 every Rule journey names its course by a Netlify site id (mono-repo #327's data routes refuse an id
      // with a port): the fixture course as harness-fixture, the Rule course as harness-rules, for `rules` and `site`
      // alike. The browser and the reader's server are both answered from the course server (src/collectors/browser.ts
      // routeCourseSite, fixtures/identity).
      const id = course === "fixture" ? signedInCourseId(urls) : urls.rulesCourseId ? TIME_COURSE_ID : undefined;
      if (!id) throw new Error(`this side serves no ${course} course (external side?)`);
      const world: World = {
        page,
        urls,
        onPage,
        rule: rule.id,
        course: { id, title: course === "fixture" ? fixture.title : RULES_COURSE_TITLE },
        async act(who) {
          if (who === "student") world.page = page;
          else if (!actors) throw new Error("this run cannot open a second browser");
          else world.page = await actors.as("lecturer");
        },
        async forget() {
          await actors?.forget?.();
        }
      };
      for (const s of bound) {
        try {
          if (s.actor) await world.act(s.actor);
          await s.def.run(world, ...s.args);
        } catch (e) {
          // The report shows the first line of a journey's error: lead with the step a person can find in the feature.
          throw new Error(`step "${s.keyword} ${s.text}" (${feature.file}:${s.line}) failed: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`, { cause: e });
        }
      }
    }
  };
}

/** Every feature file in the directory, parsed, in file-name order. */
export function loadFeatures(dir = FEATURES_DIR): GherkinFeature[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".feature"))
    .sort()
    .map((f) => parseFeature(readFileSync(join(dir, f), "utf8"), `traffic/journeys/features/${f}`));
}

/** The Rule journeys, in file then Rule order. Loading fails loudly on an unbound step or a Rule id used twice. */
export function loadRuleJourneys(dir = FEATURES_DIR): Journey[] {
  const out: Journey[] = [];
  const ids = new Map<string, string>();
  for (const feature of loadFeatures(dir)) {
    for (const rule of feature.rules) {
      const seen = ids.get(rule.id);
      if (seen) throw new Error(`${feature.file}:${rule.line}: Rule ${rule.id} is already the journey in ${seen}`);
      ids.set(rule.id, feature.file);
      out.push(journeyOf(feature, rule));
    }
  }
  return out;
}

export const ruleJourneys: Journey[] = loadRuleJourneys();
