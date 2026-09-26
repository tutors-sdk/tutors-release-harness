import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readReport, renderScorecard, scorecard } from "../src/ci/scorecard.ts";

const ROOT = join(import.meta.dirname, "..", "examples");

// A checked-in example is a real run's report and the scorecard computed from it. A change to the scoring
// that moves an example's scorecard must move the checked-in file too, so the change is visible in review.
describe("checked-in examples", () => {
  for (const name of readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    it(`${name}: the scorecard is what the report gives`, () => {
      const dir = join(ROOT, name);
      const card = scorecard(readReport(dir));
      expect(JSON.parse(readFileSync(join(dir, "scorecard.json"), "utf8"))).toEqual(card);
      expect(readFileSync(join(dir, "scorecard.md"), "utf8")).toBe(renderScorecard(card) + "\n");
    });
  }
});
