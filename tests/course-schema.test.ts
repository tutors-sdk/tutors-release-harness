/**
 * tutors.json against the mono-repo's published schema (since 1.33.0, src/course/schema.ts): reported by course check
 * and on the A3, never a fail.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLE, SCHEMA_FILE, SOURCE_FILE, tutorsJsonConformance } from "../src/course/schema.ts";

const ROOT = resolve(import.meta.dirname, "..");
const fixture = () => JSON.parse(readFileSync(resolve(ROOT, "fixtures/course-server/course/tutors.json"), "utf8")) as { los: { id: string; los: { id: string; type: string; los?: unknown[] }[] }[] };

describe("the vendored schema", () => {
  it("is the mono-repo's published tutors.json schema, with the commit it was copied from", () => {
    const schema = JSON.parse(readFileSync(SCHEMA_FILE, "utf8"));
    expect(schema).toMatchObject({ $schema: "https://json-schema.org/draft/2020-12/schema", $id: "urn:tutors:tutors-json" });
    const source = JSON.parse(readFileSync(SOURCE_FILE, "utf8"));
    expect(source).toMatchObject({ repository: "tutors-sdk/tutors-mono-repo", path: "packages/jsr/types/tutors-json.schema.json" });
    expect(source.commit).toMatch(/^[0-9a-f]{7,40}$/);
  });
});

describe("tutorsJsonConformance", () => {
  it("the fixture course conforms, and says which schema it was held to", () => {
    expect(tutorsJsonConformance(fixture())).toEqual({ schema: JSON.parse(readFileSync(SOURCE_FILE, "utf8")).commit, conforms: true, problems: 0, sample: [] });
  });

  it("names each problem by the ids on its path, a field another kind owns once, not the fields its branch allows", () => {
    const course = fixture();
    const topic = course.los[0]!.los[0]!;
    (topic.los!.find((lo) => (lo as { type: string }).type === "note") as Record<string, unknown>).pdf = "https://{{COURSEURL}}/x.pdf";
    (topic as Record<string, unknown>).hide = "no";
    const c = tutorsJsonConformance(course);
    expect(c.conforms).toBe(false);
    expect(c.sample).toEqual(["/los/[unit-1]/los/[topic-01]/hide must be boolean", "/los/[unit-1]/los/[topic-01]/los/[note-01] has a field the schema does not allow: pdf"]);
    expect(c.problems).toBe(2);
  });

  it("keeps the first few problems and counts them all", () => {
    const course = fixture() as unknown as { los: Record<string, unknown>[] };
    course.los = Array.from({ length: SAMPLE + 5 }, (_, n) => ({ ...course.los[0], id: `unit-${n}`, hide: "x" }));
    const c = tutorsJsonConformance(course);
    expect(c.problems).toBe(SAMPLE + 5);
    expect(c.sample).toHaveLength(SAMPLE);
  });

  it("a root that is not a course", () => {
    expect(tutorsJsonConformance({}).sample).toContain("/ must have required property 'type'");
  });
});
