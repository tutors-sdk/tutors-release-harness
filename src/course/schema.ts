import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";

/**
 * Since 1.33.0: does a course's tutors.json conform to the mono-repo's published schema (`TUTORS_JSON_SCHEMA` in
 * `@tutors/tutors-types`, copied to fixtures/tutors-json/ with the commit it came from)?
 *
 * A report, never a gate: the reader opens courses written by older generators that the strict schema refuses
 * (before gen-lib 4.2.20, for example), so a course that does not conform still loads. What it shows is how far the
 * courses lecturers have published are from what the generator on main promises to write.
 *
 * The messages read as the mono-repo's scripts/checks/lib/tutors-json.ts writes them, so a line here and a line from
 * the generator differential say the same thing the same way.
 */

export const SCHEMA_FILE = fileURLToPath(new URL("../../fixtures/tutors-json/tutors-json.schema.json", import.meta.url));
export const SOURCE_FILE = fileURLToPath(new URL("../../fixtures/tutors-json/source.json", import.meta.url));

/** At most this many problems are kept per course; `problems` counts them all. */
export const SAMPLE = 10;

export interface TutorsJsonConformance {
  /** The mono-repo commit the schema was copied from. */
  schema: string;
  conforms: boolean;
  /** Every way the tutors.json breaks the schema, counted once each. */
  problems: number;
  /** The first few, as `<id path> <what is wrong>`. */
  sample: string[];
}

let compiled: { validate: ReturnType<Ajv2020["compile"]>; commit: string } | undefined;

function validator() {
  if (!compiled) {
    // strictTypes off: the schema's if/then branches name properties without repeating `type: "object"`.
    const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false });
    const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA_FILE, "utf8")) as object);
    const { commit } = JSON.parse(readFileSync(SOURCE_FILE, "utf8")) as { commit: string };
    compiled = { validate, commit };
  }
  return compiled;
}

export function tutorsJsonConformance(tree: unknown): TutorsJsonConformance {
  const { validate, commit } = validator();
  const lines = validate(tree) ? [] : describe(tree, validate.errors ?? []);
  return { schema: commit, conforms: lines.length === 0, problems: lines.length, sample: lines.slice(0, SAMPLE) };
}

/** The id path of a JSON pointer, so `/los/0/los/2` reads `/los/[topic-01]/los/[lab-1]`. */
function readable(value: unknown, pointer: string): string {
  let node = value;
  let path = "";
  for (const part of pointer.split("/").slice(1)) {
    node = (node as Record<string, unknown> | undefined)?.[part];
    const id = /^\d+$/.test(part) && node && typeof node === "object" ? (node as { id?: unknown }).id : undefined;
    path += typeof id === "string" ? `/[${id}]` : `/${part}`;
  }
  return path || "/";
}

function describe(value: unknown, errors: ErrorObject[]): string[] {
  const lines = new Set<string>();
  for (const error of errors) {
    // `if` failures only say which branch applied; the branch's own errors carry the detail.
    if (error.keyword === "if") continue;
    const where = readable(value, error.instancePath);
    if (error.keyword === "unevaluatedProperties") {
      // A kind's fields count as allowed only when its branch passes, so a failing branch would also flag the fields
      // it does allow. Report the cause.
      const below = `${error.instancePath}/`;
      const caused = (other: ErrorObject) =>
        other.keyword !== "if" && (other.instancePath.startsWith(below) || (other.instancePath === error.instancePath && other.keyword !== "unevaluatedProperties"));
      if (errors.some(caused)) continue;
      lines.add(`${where} has a field the schema does not allow: ${(error.params as { unevaluatedProperty: string }).unevaluatedProperty}`);
      continue;
    }
    if (error.keyword === "additionalProperties") {
      lines.add(`${where} has a field the schema does not allow: ${(error.params as { additionalProperty: string }).additionalProperty}`);
      continue;
    }
    lines.add(`${where} ${error.message}`);
  }
  return [...lines];
}
