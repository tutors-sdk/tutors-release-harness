/**
 * Since 1.43.0: the Rule journeys (traffic/journeys/features). The feature files load, every step binds, the ids stay in
 * the block the project reserved, sign-ins are paced under the reader's limiter, and a difference on a Rule journey's
 * page is attributed to its Rule in the causes.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFeature } from "../traffic/journeys/gherkin.ts";
import { exercisedBy, expandRuleIds, loadRuleJourneys, ruleJourneys } from "../traffic/journeys/rules.ts";
import { appOf, bind, pageKeyOf, steps } from "../traffic/journeys/steps.ts";
import { SIGN_IN_LIMIT, paceSignIn, refusedOnce, signedIn } from "../traffic/journeys/ui.ts";
import { foldCauses, causesMarkdown } from "../src/report/causes.ts";
import { ruleOfHunk, ruleTouchedWords, rulesTouched } from "../src/report/rules-touched.ts";
import type { Hunk } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");

const FEATURE = `@harness
Feature: F

  @rule-0599 @ears-event-driven @journey-demo
  Rule: When the harness runs the demo journey, it shall capture the course.

    Scenario: Demo (exercises Rules 0011, 0250-0252)
      Given the student signs in from the course
      And the page is captured as "course"
      But the page shows the button "Profile menu"
`;

describe("the Gherkin reader", () => {
  it("reads a Rule, its tags, its scenario and its steps, And and But taking the keyword before them", () => {
    const f = parseFeature(FEATURE, "demo.feature");
    expect(f.name).toBe("F");
    expect(f.tags).toEqual(["harness"]);
    const [r] = f.rules;
    expect(r).toMatchObject({ id: "0599", ears: "event-driven", tags: ["rule-0599", "ears-event-driven", "journey-demo"], line: 5 });
    expect(r!.scenario.steps.map((s) => [s.keyword, s.line])).toEqual([
      ["Given", 8],
      ["Given", 9],
      ["Given", 10]
    ]);
  });

  it.each([
    ["Background:", "Feature: F\n  Background:\n", /demo.feature:2: Background is not supported/],
    ["an outline", "Feature: F\n  @rule-0599 @ears-ubiquitous\n  Rule: R\n    Scenario Outline: S\n", /Scenario Outline is not supported/],
    ["no id", "Feature: F\n  @ears-ubiquitous\n  Rule: R\n", /demo.feature:3: a Rule needs a @rule-NNNN tag/],
    ["no EARS tag", "Feature: F\n  @rule-0599\n  Rule: R\n", /needs one of the tags @ears-ubiquitous/],
    ["a second scenario", "Feature: F\n  @rule-0599 @ears-ubiquitous\n  Rule: R\n    Scenario: A\n      Given x\n    Scenario: B\n", /a second Scenario/],
    ["a table", "Feature: F\n  @rule-0599 @ears-ubiquitous\n  Rule: R\n    Scenario: A\n      Given x\n      | a |\n", /tables and doc strings/],
    ["a starting And", "Feature: F\n  @rule-0599 @ears-ubiquitous\n  Rule: R\n    Scenario: A\n      And x\n", /cannot start with And/],
    ["no steps", "Feature: F\n  @rule-0599 @ears-ubiquitous\n  Rule: R\n    Scenario: A\n", /has no steps/],
    ["a duplicate id", "Feature: F\n  @rule-0599 @ears-ubiquitous\n  Rule: R\n    Scenario: A\n      Given x\n  @rule-0599 @ears-ubiquitous\n  Rule: R2\n    Scenario: B\n      Given y\n", /Rule 0599 appears twice/]
  ])("rejects %s, naming the line", (_what, text, error) => {
    expect(() => parseFeature(text, "demo.feature")).toThrow(error);
  });
});

describe("Rule ids", () => {
  it("expands ids and ranges, and reads them from a scenario's name", () => {
    expect(expandRuleIds("0011, 0250-0252")).toEqual(["0011", "0250", "0251", "0252"]);
    expect(exercisedBy("A student reads a lab (exercises Rules 0011, 0303)")).toEqual(["0011", "0303"]);
    expect(exercisedBy("No list")).toEqual([]);
    expect(exercisedBy('Turned away (exercises Rules 0011, 0267; whitelist-management.feature "Non-whitelisted student denied access")')).toEqual(["0011", "0267"]);
    expect(() => expandRuleIds("0252-0250")).toThrow(/not a range/);
    expect(() => expandRuleIds("11")).toThrow(/not a Rule id/);
  });
});

describe("the Rule journeys", () => {
  it("load from the feature files, each in the set rules, signed in, with an id the project reserved (0582 to 0599)", () => {
    expect(ruleJourneys.length).toBeGreaterThanOrEqual(2);
    for (const j of ruleJourneys) {
      expect(j.set).toBe("rules");
      expect(j.anonymous).toBe(false);
      const id = Number(j.rules![0]);
      expect(id >= 582 && id <= 599, `${j.name}: Rule ${j.rules![0]} is outside 0582-0599`).toBe(true);
      expect(j.name).toMatch(new RegExp(`^rule-${j.rules![0]}-[a-z0-9-]+$`));
      expect(j.rules!.length, `${j.name} names no monorepo Rule it exercises`).toBeGreaterThan(1);
    }
    expect(ruleJourneys.map((j) => j.name)).toEqual(expect.arrayContaining(["rule-0582-signed-in-lab", "rule-0583-presence"]));
  });

  it("fail to load on a sentence no step matches, naming the file and line", () => {
    const dir = mkdtempSync(join(tmpdir(), "rule-journeys-"));
    writeFileSync(join(dir, "x.feature"), FEATURE.replace("the page shows the button", "the student juggles the button"));
    expect(() => loadRuleJourneys(dir)).toThrow(/x.feature:10: no step matches "the student juggles the button "Profile menu""/);
  });

  it("fail to load without a capture, a journey tag, or with a role the identity stub does not have", () => {
    const dir = mkdtempSync(join(tmpdir(), "rule-journeys-"));
    writeFileSync(join(dir, "x.feature"), FEATURE.replace('      And the page is captured as "course"\n', ""));
    expect(() => loadRuleJourneys(dir)).toThrow(/captures no page/);
    writeFileSync(join(dir, "x.feature"), FEATURE.replace(" @journey-demo", ""));
    expect(() => loadRuleJourneys(dir)).toThrow(/needs a @journey-<slug> tag/);
    writeFileSync(join(dir, "x.feature"), FEATURE.replace("@journey-demo", "@journey-demo @role-dean"));
    expect(() => loadRuleJourneys(dir)).toThrow(/@role-dean is not one of/);
    writeFileSync(join(dir, "x.feature"), FEATURE.replace("@journey-demo", "@journey-demo @role-lecturer"));
    expect(loadRuleJourneys(dir)[0]).toMatchObject({ name: "rule-0599-demo", role: "lecturer", rules: ["0599", "0011", "0250", "0251", "0252"] });
    expect(loadRuleJourneys(dir)[0]!.course).toBeUndefined();
    writeFileSync(join(dir, "x.feature"), FEATURE.replace("@journey-demo", "@journey-demo @course-rules"));
    expect(loadRuleJourneys(dir)[0]).toMatchObject({ course: "rules" });
    writeFileSync(join(dir, "x.feature"), FEATURE.replace("@journey-demo", "@journey-demo @course-moodle"));
    expect(() => loadRuleJourneys(dir)).toThrow(/@course-moodle is not one of the harness's courses/);
  });

  it("bind each step's quoted words as its arguments", () => {
    expect(bind('the student presses the button starting "View Online"')?.args).toEqual(["button", "View Online"]);
    expect(bind('the dialog "View Online" shows the link "Harness Student"')?.args).toEqual(["View Online", "link", "Harness Student"]);
    expect(bind("the student flies")).toBeUndefined();
  });

  it("capture pages as <app>:rule-<id>-<name>, the app read from the URL's origin", () => {
    const urls = { reader: "http://localhost:3001", readerAuth: "http://localhost:3011", catalogue: "http://localhost:3002", live: "http://localhost:3003", time: "http://localhost:3004", courseId: "c" } as never;
    expect(appOf("http://localhost:3011/lab/c/x", urls)).toBe("reader-auth");
    expect(appOf("http://localhost:3003/", urls)).toBe("live");
    expect(appOf("http://elsewhere/", urls)).toBe("page");
    expect(pageKeyOf("reader-auth", "0582", "lab-step")).toBe("reader-auth:rule-0582-lab-step");
  });

  it("read the Rule journeys' course where they say so, as a whitelisted role unless they prove the turning away", () => {
    const enrollment = readFileSync(resolve(ROOT, "fixtures/course-server/rules-course/enrollment.yaml"), "utf8");
    expect(enrollment).toMatch(/whitelist:\n\s+- harness-enrolled\n/);
    const tutors = JSON.parse(readFileSync(resolve(ROOT, "fixtures/course-server/rules-course/tutors.json"), "utf8"));
    expect(tutors).toMatchObject({ title: "Harness Rules Course", properties: { auth: 1, private: 1, llm: 2 }, enrollment: { whitelist: ["harness-enrolled"] } });
    const onRules = ruleJourneys.filter((j) => j.course === "rules");
    expect(onRules.map((j) => j.rules![0])).toEqual(["0584", "0585", "0586", "0587"]);
    for (const j of onRules) expect(j.role ?? "student", j.name).toBe(j.name === "rule-0586-private-course" ? "student" : "enrolled");
  });

  it("run a step against a side that serves no Rule journeys' course as a failure that says so", async () => {
    const j = ruleJourneys.find((x) => x.course === "rules")!;
    await expect(j.run({} as never, { reader: "http://r", catalogue: "http://c", live: "http://l", courseId: "c" }, async () => {})).rejects.toThrow(/serves no rules course/);
  });

  it("the guide lists every step, as its doc line says it", () => {
    const guide = readFileSync(resolve(ROOT, "docs/user-guide/12-rule-journeys.md"), "utf8");
    for (const s of steps) expect(guide, s.doc).toContain(`- ${s.doc}`);
  });
});

describe("pacing sign-ins under the reader's limiter", () => {
  /** A clock that a sleep moves forward. */
  const clock = (t: number) => {
    const waits: number[] = [];
    return { waits, at: (ms: number) => void (t = ms), now: () => t, sleep: async (ms: number) => void (waits.push(ms), (t += ms)) };
  };
  const gap = SIGN_IN_LIMIT.windowMs + SIGN_IN_LIMIT.marginMs;

  it("lets two through, then waits out the quiet gap before the third, per origin", async () => {
    const c = clock(1_000);
    const origin = `http://pace-${Math.random()}`;
    expect(await paceSignIn(origin, c.now, c.sleep)).toBe(0);
    c.at(2_000);
    expect(await paceSignIn(origin, c.now, c.sleep)).toBe(0);
    c.at(3_000);
    expect(await paceSignIn(origin, c.now, c.sleep)).toBe(2_000 + gap - 3_000);
    expect(c.waits).toEqual([2_000 + gap - 3_000]);
    expect(await paceSignIn(`${origin}-other`, c.now, c.sleep)).toBe(0);
  });

  it("runs the gap from when a sign-in landed, and after a refusal waits the whole gap", async () => {
    const c = clock(0);
    const origin = `http://pace-${Math.random()}`;
    await paceSignIn(origin, c.now, c.sleep);
    signedIn(origin, () => 4_000);
    c.at(4_000 + gap);
    await paceSignIn(origin, c.now, c.sleep);
    c.at(4_000 + gap + 1);
    expect(await paceSignIn(origin, c.now, c.sleep)).toBe(gap - 1);
    refusedOnce(origin, () => 50_000);
    c.at(50_000);
    expect(await paceSignIn(origin, c.now, c.sleep)).toBe(gap);
  });

  it("starts the count again after a quiet gap", async () => {
    const c = clock(0);
    const origin = `http://pace-${Math.random()}`;
    await paceSignIn(origin, c.now, c.sleep);
    c.at(1_000);
    await paceSignIn(origin, c.now, c.sleep);
    c.at(1_000 + gap + 1);
    expect(await paceSignIn(origin, c.now, c.sleep)).toBe(0);
  });
});

describe("attributing differences to Rules", () => {
  const hunk = (artefact: Hunk["artefact"], scope: string, summary: string) => ({ artefact, scope, summary, severity: "fail" }) as Hunk;
  const hunks = [
    hunk("dom", "reader-auth:rule-0582-lab-step", "reader-auth:rule-0582-lab-step: DOM differs"),
    hunk("persistence", "rule-0582-signed-in-lab/learning_records", "row added"),
    hunk("axe", "reader-auth:rule-0583-profile-menu/color-contrast", "reader-auth:rule-0583-profile-menu: new violation"),
    hunk("dom", "reader:home", "reader:home: DOM differs")
  ];

  it("reads the Rule from a page key or a ledger scope, and nothing from any other page", () => {
    expect(hunks.map(ruleOfHunk)).toEqual(["0582", "0582", "0583", undefined]);
  });

  it("counts each Rule's differences and artefacts, most first, with the Rules its scenario exercises", () => {
    const touched = rulesTouched(hunks);
    expect(touched.map((r) => [r.rule, r.hunks, r.artefacts])).toEqual([
      ["0582", 2, ["dom", "persistence"]],
      ["0583", 1, ["axe"]]
    ]);
    expect(touched[0]!.exercises).toEqual(["0011", "0250", "0252", "0260", "0303", "0330"]);
    expect(ruleTouchedWords(touched[1]!)).toBe("Rule 0583 (exercises 0046, 0064, 0280): 1 difference in axe");
  });

  it("puts them in the causes, and says nothing when no Rule journey moved", () => {
    const causes = foldCauses(hunks);
    expect(causes.rules?.map((r) => r.rule)).toEqual(["0582", "0583"]);
    expect(causesMarkdown(causes).join("\n")).toContain("`rule-0582-signed-in-lab`: Rule 0582");
    expect(foldCauses([hunks[3]!]).rules).toBeUndefined();
  });
});
