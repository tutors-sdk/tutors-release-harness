import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(import.meta.dirname, "..", "fixtures", "migrations", "supabase-legacy-tables.sql"), "utf8");

/** The CREATE TABLE statement for `name`, quoted or not. */
function table(name: string): string {
  const quoted = name.includes("-") ? `"${name}"` : name;
  const start = sql.indexOf(`CREATE TABLE IF NOT EXISTS public.${quoted} (`);
  expect(start, `${name} is created`).toBeGreaterThanOrEqual(0);
  return sql.slice(start, sql.indexOf(");", start));
}

describe("legacy Supabase tables fixture", () => {
  // 17.0.0's migrations index and write these; without them the rehearsal fails with
  // "relation does not exist" (Main to RC and the rc.1 gate, 15 Oct 2026).
  it("creates every table the monorepo's migrations touch but never create", () => {
    expect(table("tutors-connect-latest")).toContain("received_at timestamptz");
    expect(table("calendar")).toContain("id date NOT NULL");
    expect(table("learning_records")).toContain("lo_id text");
  });

  it("carries the unique keys the monorepo's upserts and ON CONFLICT clauses name", () => {
    expect(table("tutors-connect-latest")).toContain("UNIQUE (course_id, student_id)");
    expect(table("calendar")).toContain("UNIQUE (id, studentid, courseid)");
    expect(table("learning_records")).toContain("UNIQUE (student_id, course_id, lo_id)");
    expect(table("tutors-connect-users")).toContain("github_id text PRIMARY KEY");
    expect(table("tutors-connect-courses")).toContain("course_id text PRIMARY KEY");
  });

  it("only creates, so a database that already has the tables is left alone", () => {
    expect(sql).not.toMatch(/\b(DROP|ALTER|INSERT|TRUNCATE)\b/);
    expect(sql.match(/CREATE TABLE /g)).toHaveLength(sql.match(/CREATE TABLE IF NOT EXISTS /g)!.length);
  });
});
