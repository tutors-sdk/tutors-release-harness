import { describe, expect, it } from "vitest";
import { expandContract, rollbackCheck } from "../src/modes/migration.ts";
import type { SchemaCatalog } from "../src/types.ts";

const base = (): SchemaCatalog => ({
  tables: {
    app_errors: {
      id: { type: "uuid", nullable: false, default: "gen_random_uuid()" },
      level: { type: "text", nullable: false, default: null },
      context: { type: "jsonb", nullable: true, default: "'{}'::jsonb" },
      url: { type: "text", nullable: true, default: null }
    }
  },
  indexes: ["idx_app_errors_level"],
  functions: ["get_error_counts/1"],
  policies: ["app_errors:anon_insert_app_errors"]
});

describe("expand/contract", () => {
  it("identical schemas produce no hunks", () => {
    expect(expandContract(base(), base())).toEqual([]);
  });

  it("a dropped column, a dropped table and a narrowed type each fail", () => {
    const b = base();
    delete b.tables.app_errors!.url;
    b.tables.app_errors!.context = { type: "json", nullable: true, default: null };
    const hunks = expandContract(base(), b);
    expect(hunks.map((h) => [h.scope, h.severity])).toEqual([
      ["app_errors.context", "fail"],
      ["app_errors.url", "fail"]
    ]);
    const dropped = base();
    dropped.tables = {};
    expect(expandContract(base(), dropped)[0]).toMatchObject({ scope: "app_errors", severity: "fail" });
  });

  it("NOT NULL without a default breaks version a's inserts, with a default it does not", () => {
    const b = base();
    b.tables.app_errors!.url = { type: "text", nullable: false, default: null };
    b.tables.app_errors!.course_id = { type: "text", nullable: false, default: null };
    b.tables.app_errors!.student_id = { type: "text", nullable: false, default: "''::text" };
    const hunks = expandContract(base(), b);
    expect(hunks.filter((h) => h.severity === "fail").map((h) => h.scope).sort()).toEqual(["app_errors.course_id", "app_errors.url"]);
    expect(hunks.find((h) => h.scope === "app_errors.student_id")!.severity).toBe("info");
  });

  it("additions are informational, removals of indexes, functions and policies fail", () => {
    const b = base();
    b.tables.audit = { id: { type: "uuid", nullable: false, default: "gen_random_uuid()" } };
    b.indexes = [];
    b.functions.push("get_error_counts/2");
    b.policies = ["app_errors:anon_select_app_errors"];
    const hunks = expandContract(base(), b);
    expect(hunks.map((h) => [h.scope, h.severity])).toEqual([
      ["audit", "info"],
      ["idx_app_errors_level", "fail"],
      ["get_error_counts/2", "info"],
      ["app_errors:anon_insert_app_errors", "fail"],
      ["app_errors:anon_select_app_errors", "info"]
    ]);
  });
});

describe("rollback rehearsal", () => {
  it("passes when the restored snapshot equals a and fails otherwise", () => {
    expect(rollbackCheck(base(), base())[0]!.severity).toBe("info");
    const broken = base();
    broken.indexes = [];
    expect(rollbackCheck(base(), broken)[0]).toMatchObject({ scope: "rollback", severity: "fail" });
  });
});
