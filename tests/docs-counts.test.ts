/**
 * Counts written in prose are held to the files they count: the host ports of the compose stack, the kind ports, the
 * mutants and the apps. They drifted when `time` joined (13 ports said, 15 published; two mutants said not built,
 * both in mutants.yaml), so a count that is written down is now checked.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { composePorts } from "../src/local/doctor.ts";
import { APPS } from "../src/image-ref.ts";
import { DEFAULT_PORTS } from "../src/local/ports.ts";

const ROOT = resolve(import.meta.dirname, "..");
const read = (f: string) => readFileSync(resolve(ROOT, f), "utf8");

describe("host ports", () => {
  const published = composePorts(read("compose.harness.yaml"), {});

  it("compose publishes 15, and every one has a variable in DEFAULT_PORTS", () => {
    expect(published).toHaveLength(15);
    expect(Object.keys(DEFAULT_PORTS)).toHaveLength(15);
  });

  it("docs/local.md says 15 wherever it counts them, and no other number", () => {
    const said = [...read("docs/local.md").matchAll(/(?:the (\d+) host ports|Host ports \((\d+)\))/g)].map((m) => Number(m[1] ?? m[2]));
    expect(said.length).toBeGreaterThanOrEqual(2);
    for (const n of said) expect(n).toBe(published.length);
  });

  it("the kind range written in the docs and in the doctor is the range kind-config.yaml maps", () => {
    const host = [...read("deploy/kind/kind-config.yaml").matchAll(/hostPort:\s*(\d+)/g)].map((m) => Number(m[1]));
    const range = `${Math.min(...host)}-${Math.max(...host)}`;
    for (const f of ["docs/local.md", "src/local/doctor.ts"]) {
      for (const m of read(f).matchAll(/\b(4\d{3})-(4\d{3})\b/g)) expect(`${m[1]}-${m[2]}`, f).toBe(range);
    }
    const kindReadme = /maps the same host ports \((\d+)–(\d+)\)/.exec(read("deploy/kind/README.md"))!;
    expect(`${kindReadme[1]}-${kindReadme[2]}`).toBe(range);
  });
});

describe("apps", () => {
  it("four, and the docs that count them say four", () => {
    expect(APPS).toHaveLength(4);
    for (const f of ["docs/images.md", "README.md", "docs/contract.md"]) {
      for (const m of read(f).matchAll(/\b(three|four|five) (apps|images)\b/gi)) expect(m[1]!.toLowerCase(), `${f}: "${m[0]}"`).toBe("four");
    }
  });
});

describe("mutants", () => {
  const mutants = (parse(read("mutants/mutants.yaml")) as { mutants: { name: string; kind?: string }[] }).mutants;

  it("ten in mutants.yaml, eight of them edge faults, and the README names all eight and does not say any is unbuilt", () => {
    expect(mutants).toHaveLength(10);
    const edge = mutants.filter((m) => (m.kind ?? "edge") === "edge").map((m) => m.name);
    expect(edge).toHaveLength(8);
    const readme = read("mutants/README.md");
    for (const name of edge) expect(readme, name).toContain(name);
    expect(readme).not.toMatch(/need source access|belong in the monorepo|needs? (the )?(persistence|a keyboard-order) collector/);
    expect(readme).toContain("builds ten images");
  });
});
