/**
 * The docs said "twelve journeys" while the array held six. A count written in prose is checked against the
 * array, so it cannot drift again: the number of journeys, and of sets, wherever the docs give one.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { journeys } from "../traffic/journeys/journeys.ts";

const ROOT = resolve(import.meta.dirname, "..");
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const read = (f: string) => readFileSync(resolve(ROOT, f), "utf8");

describe("journey counts written in prose", () => {
  it("there are six journeys in three sets", () => {
    expect(journeys).toHaveLength(6);
    expect(new Set(journeys.map((j) => j.set)).size).toBe(3);
  });

  it.each(["README.md", "TESTING.md", "traffic/journeys/journeys.ts", "docs/contract.md", "docs/modes.md", "src/types.ts", "compose.harness.yaml"])(
    "%s states no other number of journeys or sets",
    (file) => {
      for (const m of read(file).matchAll(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+) (journeys|sets)\b/gi)) {
        const n = WORDS.indexOf(m[1]!.toLowerCase());
        const said = n >= 0 ? n : Number(m[1]);
        const truth = m[2] === "journeys" ? journeys.length : new Set(journeys.map((j) => j.set)).size;
        // "the anonymous reference-course journeys" and the like have no number in front; only a count is checked.
        expect(said, `${file}: "${m[0]}"`).toBe(truth);
      }
    }
  );
});
