import type { RunReport } from "../types.ts";

/**
 * The sides whose images are not the published, signature-verified ones: built
 * here from a monorepo git ref, pulled and judged unverified under
 * --allow-unsigned, or restored from the runner's image cache because the
 * registry was unreachable (\`cached\`: verified when saved, tag freshness not
 * confirmed this run). A run over such a side is not evidence about what ships,
 * so both reports say so at the very top, not only in the provenance table.
 */
export function loudProvenance(report: RunReport): { sides: ("a" | "b")[]; text: string } | undefined {
  const p = report.provenance;
  if (!p) return undefined;
  const sides = (["a", "b"] as const).filter((side) => Object.values(p[side]?.images ?? {}).some((info) => info.provenance === "pulled-unverified" || info.provenance === "built-from-ref" || info.provenance === "cached"));
  if (!sides.length) return undefined;
  const text = `Side ${sides.join(" and ")} did not run signature-verified registry images (${sides.map((side) => p[side]!.summary).join("; ")}). This run is not evidence about the images that ship.`;
  return { sides: [...sides], text };
}
