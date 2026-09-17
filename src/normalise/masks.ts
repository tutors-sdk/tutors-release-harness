import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { ROOT } from "../stack.ts";
import { ARTEFACTS, MODES, type Mode, type PageCapture, type SideCapture } from "../types.ts";

const artefactList = z.union([z.enum(ARTEFACTS), z.array(z.enum(ARTEFACTS)).min(1)]).transform((v) => (Array.isArray(v) ? v : [v]));

export const MaskSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, "mask ids are kebab-case"),
    artefact: artefactList,
    reason: z.string().min(20, "a mask needs a reason a reviewer can weigh (20+ characters)"),
    /** Only apply in these modes (default: every mode). */
    modes: z.array(z.enum(MODES)).min(1).optional(),
    header: z.string().optional(),
    pattern: z.string().optional(),
    replace: z.string().optional(),
    /** network only: remove matching requests from the capture instead of rewriting their URL. */
    drop: z.boolean().optional(),
    series: z.string().optional(),
    key: z.string().optional()
  })
  .refine((m) => [m.header, m.pattern, m.series, m.key].filter((x) => x !== undefined).length === 1, {
    message: "a mask has exactly one of header, pattern, series, key"
  })
  .refine((m) => !m.drop || (m.pattern !== undefined && m.artefact.every((a) => a === "network")), {
    message: "drop applies to network pattern masks only"
  });

export const MasksFileSchema = z.object({
  masks: z.array(MaskSchema),
  screenshot: z.object({ maxDiffRatio: z.number().min(0).max(1), pixelThreshold: z.number().min(0).max(1) }),
  metrics: z.object({ deltaTolerance: z.number().min(0), deltaAbsolute: z.number().min(0) }),
  logs: z.object({ levelTolerance: z.number().min(0), requestIdDrop: z.number().min(0).max(1) }),
  timing: z.object({ minRuns: z.number().int().min(2), alpha: z.number().gt(0).lt(1), minEffect: z.number().min(0), minShiftMs: z.number().min(0) })
});

export type Mask = z.infer<typeof MaskSchema>;
export type MasksFile = z.infer<typeof MasksFileSchema>;
export type EngineConfig = Omit<MasksFile, "masks">;

export const DEFAULT_MASKS_FILE = resolve(ROOT, "normalise", "masks.yaml");

export function loadMasks(path: string = DEFAULT_MASKS_FILE): MasksFile {
  const parsed = MasksFileSchema.safeParse(parse(readFileSync(path, "utf8")));
  if (!parsed.success) {
    throw new Error(`${path} is not a valid masks file:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  const ids = parsed.data.masks.map((m) => m.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`${path}: duplicate mask id "${dup}"`);
  return parsed.data;
}

/** Counts of how many times each mask changed something. A zero here is a mask worth deleting. */
export type MaskHits = Record<string, number>;

function hit(hits: MaskHits, id: string, n = 1) {
  if (n > 0) hits[id] = (hits[id] ?? 0) + n;
}

/** `replace` may use $1, $2 … to keep parts of the match (e.g. an asset's name without its hash). */
function applyPattern(text: string, mask: Mask, hits: MaskHits): string {
  const re = new RegExp(mask.pattern!, "g");
  const count = (text.match(re) ?? []).length;
  if (!count) return text;
  hit(hits, mask.id, count);
  return text.replace(re, mask.replace ?? "{{masked}}");
}

function normalisePage(page: PageCapture, masks: Mask[], hits: MaskHits): PageCapture {
  let aria = page.aria;
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(page.headers)) headers[k.toLowerCase()] = v;
  let network = page.network.map((n) => ({ ...n }));
  let consoleEntries = page.console.map((c) => ({ ...c }));

  for (const mask of masks) {
    for (const artefact of mask.artefact) {
      if (artefact === "headers" && mask.header) {
        const name = mask.header.toLowerCase();
        if (name in headers) {
          delete headers[name];
          hit(hits, mask.id);
        }
      }
      if (artefact === "headers" && mask.pattern) {
        for (const [name, value] of Object.entries(headers)) headers[name] = applyPattern(value, mask, hits);
      }
      if (artefact === "dom" && mask.pattern) aria = applyPattern(aria, mask, hits);
      if (artefact === "network" && mask.pattern && mask.drop) {
        const re = new RegExp(mask.pattern);
        const kept = network.filter((n) => !re.test(n.url));
        hit(hits, mask.id, network.length - kept.length);
        network = kept;
      } else if (artefact === "network" && mask.pattern) {
        network = network.map((n) => ({ ...n, url: applyPattern(n.url, mask, hits) }));
      }
      if (artefact === "console" && mask.pattern) consoleEntries = consoleEntries.map((c) => ({ ...c, text: applyPattern(c.text, mask, hits) }));
    }
  }
  return { ...page, aria, headers, network, console: consoleEntries };
}

/** Apply every mask that applies in `mode` to a capture. Pure: returns a new capture and the hit counts. */
export function normalise(capture: SideCapture, file: MasksFile, mode?: Mode): { capture: SideCapture; hits: MaskHits } {
  const hits: MaskHits = {};
  const masks = file.masks.filter((m) => !m.modes || (mode !== undefined && m.modes.includes(mode)));
  for (const m of masks) hits[m.id] = 0;

  const journeys = capture.journeys.map((j) => ({ ...j, pages: j.pages.map((p) => normalisePage(p, masks, hits)) }));

  const seriesMasks = masks.filter((m) => m.series && m.artefact.includes("metrics")).map((m) => ({ id: m.id, re: new RegExp(m.series!) }));
  const dropSeries = (snapshot: SideCapture["metrics"]["before"]) =>
    Object.fromEntries(
      Object.entries(snapshot).map(([app, snap]) => {
        const series: Record<string, number> = {};
        for (const [name, value] of Object.entries(snap.series)) {
          const mask = seriesMasks.find((m) => m.re.test(name));
          if (mask) hit(hits, mask.id);
          else series[name] = value;
        }
        return [app, { series }];
      })
    );

  const keyMasks = masks.filter((m) => m.key && m.artefact.includes("logs"));
  const logs = Object.fromEntries(
    Object.entries(capture.logs).map(([app, summary]) => {
      const keys = summary.keys.filter((k) => {
        const mask = keyMasks.find((m) => m.key === k);
        if (mask) hit(hits, mask.id);
        return !mask;
      });
      return [app, { ...summary, keys }];
    })
  );

  return {
    capture: { ...capture, journeys, metrics: { before: dropSeries(capture.metrics.before), after: dropSeries(capture.metrics.after) }, logs },
    hits
  };
}
