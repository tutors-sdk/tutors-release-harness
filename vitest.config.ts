import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // No retries anywhere in this project: the harness exists to make flakiness visible.
    retry: 0,
    testTimeout: 20_000,
    // `pnpm test:coverage` (TESTING.md). The thresholds are a floor that only ratchets up: a couple of points under what was
    // measured, so a change that drops coverage fails, and a change that raises it can raise the floor.
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        // Declarations only: nothing in them executes.
        "src/types.ts",
        "src/image-static/types.ts",
        "src/migration/backend.ts",
        // The entry point: tests run it as a child process (help, flag errors, `version --json`), which this worker's v8
        // coverage cannot see. The logic behind each command lives in modules that are measured.
        "src/cli.ts",
        // The real probes behind `harness doctor` (docker, ports, disk on this machine); doctor.ts is tested through DoctorDeps.
        "src/local/doctor-real.ts",
        // Needs a live Postgres container; the migration mode is tested with a fake SchemaBackend.
        "src/migration/supabase-postgres.ts"
      ],
      // text-summary twice: once to the console, once to a file CI appends to the job summary.
      reporter: ["text-summary", ["text-summary", { file: "summary.txt" }], "json-summary", "html", "lcov"],
      reportsDirectory: "coverage",
      thresholds: { statements: 82, branches: 76, functions: 82, lines: 83 }
    }
  }
});
