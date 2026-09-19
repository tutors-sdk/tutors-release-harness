import { z } from "zod";
import type { NoiseStatus } from "./types.ts";
import { SCHEMA_VERSION } from "./version.ts";

/**
 * noise-status.json: what a noise (A/A) run leaves behind for the gate. The
 * gate trusts it with the right to fail a release, so a file that is not
 * exactly this shape is refused rather than read generously.
 */
export const NoiseStatusSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION).optional(),
  ranAt: z.iso.datetime(),
  clean: z.boolean(),
  hunks: z.number().int().min(0)
});

export function parseNoiseStatus(text: string, source = "noise-status.json"): NoiseStatus {
  const parsed = NoiseStatusSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(`${source} is not a valid noise status:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  const { schemaVersion, ...rest } = parsed.data;
  return { ...(schemaVersion === undefined ? {} : { schemaVersion }), ...rest };
}
