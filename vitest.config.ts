import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // No retries anywhere in this project: the harness exists to make flakiness visible.
    retry: 0,
    testTimeout: 20_000
  }
});
