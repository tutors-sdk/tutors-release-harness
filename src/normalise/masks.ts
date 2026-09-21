import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { ROOT } from "../stack.ts";
import { ARTEFACTS, MODES, type Mode, type NetworkEntry, type PageCapture, type SideCapture } from "../types.ts";
import { canonicalHeaderValue } from "./canonical.ts";
import { rewriteOrigins } from "./origins.ts";
import { redactPage, redactSecrets } from "./redact.ts";

const artefactList = z.union([z.enum(ARTEFACTS), z.array(z.enum(ARTEFACTS)).min(1)]).transform((v) => (Array.isArray(v) ? v : [v]));

/** The response headers a network entry keeps, and the field each is recorded in. */
const NETWORK_HEADERS = new Map<string, "contentType" | "cacheControl">([
  ["content-type", "contentType"],
  ["cache-control", "cacheControl"]
]);

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
    /**
     * network and console only: remove matching requests (by URL) or console entries (by text) from the
     * capture on both sides instead of rewriting them. For noise that varies in HOW MANY times it lands
     * (which a rewrite cannot hide, because a page's console list is compared as a set of messages that
     * is empty on one side and not on the other).
     */
    drop: z.boolean().optional(),
    series: z.string().optional(),
    key: z.string().optional()
  })
  .refine(
    (m) => {
      const kinds = [m.header, m.pattern, m.series, m.key].filter((x) => x !== undefined).length;
      // `header` may carry a `pattern`: the header is then dropped only when its value matches.
      return kinds === 1 || (kinds === 2 && m.header !== undefined && m.pattern !== undefined);
    },
    { message: "a mask has exactly one of header, pattern, series, key (a header mask may add a pattern that its value must match)" }
  )
  .refine((m) => !m.drop || (m.pattern !== undefined && m.header === undefined && m.artefact.every((a) => a === "network" || a === "console")), {
    message: "drop applies to network and console pattern masks only"
  })
  .refine((m) => m.header === undefined || m.artefact.every((a) => a === "headers" || a === "network"), {
    message: "a header mask applies to the headers and network artefacts only"
  })
  .refine((m) => m.header === undefined || !m.artefact.includes("network") || NETWORK_HEADERS.has(m.header.toLowerCase()), {
    message: "a network entry records only content-type and cache-control, so a header mask on network names one of those"
  });

export const MasksFileSchema = z.object({
  masks: z.array(MaskSchema),
  screenshot: z.object({ maxDiffRatio: z.number().min(0).max(1), pixelThreshold: z.number().min(0).max(1) }),
  metrics: z.object({ deltaTolerance: z.number().min(0), deltaAbsolute: z.number().min(0) }),
  logs: z.object({ levelTolerance: z.number().min(0), requestIdDrop: z.number().min(0).max(1) }),
  timing: z.object({ minRuns: z.number().int().min(2), alpha: z.number().gt(0).lt(1), minEffect: z.number().min(0), minShiftMs: z.number().min(0) }),
  // R5 (contract 1.2.0): startup time reuses timing's minRuns, alpha and minEffect; only the shift floor is its own.
  startup: z.object({ minShiftMs: z.number().min(0) }).default({ minShiftMs: 250 })
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

/** `content-type` and `cache-control` in one canonical form (src/normalise/canonical.ts), whichever side they came from. */
function canonicalNetworkEntry(n: NetworkEntry): NetworkEntry {
  return { ...n, contentType: canonicalHeaderValue("content-type", n.contentType), cacheControl: canonicalHeaderValue("cache-control", n.cacheControl) };
}

/** What normalisation is given besides the masks. */
export interface NormaliseOptions {
  /**
   * Origins of the system under test that count as `{{origin}}` on THIS side as well as on their own
   * (`externalOrigins()`); see src/normalise/origins.ts. Not a mask: structural, like the collector's own rewrite.
   */
  origins?: readonly string[];
}

function normalisePage(raw: PageCapture, masks: Mask[], hits: MaskHits, origins: readonly string[]): PageCapture {
  // Secret-shaped values first (src/normalise/redact.ts), so no later step, hunk or report ever holds one.
  const page = redactPage(raw);
  const own = (text: string) => rewriteOrigins(text, origins).text;
  let aria = own(page.aria);
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(page.headers)) headers[k.toLowerCase()] = canonicalHeaderValue(k, v);
  let network = page.network.map((n) => canonicalNetworkEntry({ ...n, url: own(n.url) }));
  let consoleEntries = page.console.map((c) => ({ ...c, text: own(c.text) }));

  for (const mask of masks) {
    for (const artefact of mask.artefact) {
      if (artefact === "headers" && mask.header) {
        const name = mask.header.toLowerCase();
        // With a `pattern`, only a value that matches it is dropped (against the canonical form).
        if (name in headers && (!mask.pattern || new RegExp(mask.pattern).test(headers[name]!))) {
          delete headers[name];
          hit(hits, mask.id);
        }
      }
      if (artefact === "network" && mask.header) {
        const field = NETWORK_HEADERS.get(mask.header.toLowerCase())!;
        const re = mask.pattern ? new RegExp(mask.pattern) : undefined;
        network = network.map((n) => {
          if (n[field] === "" || (re && !re.test(n[field]))) return n;
          hit(hits, mask.id);
          return { ...n, [field]: "" };
        });
      }
      if (artefact === "headers" && mask.pattern && !mask.header) {
        for (const [name, value] of Object.entries(headers)) headers[name] = applyPattern(value, mask, hits);
      }
      if (artefact === "dom" && mask.pattern) aria = applyPattern(aria, mask, hits);
      if (artefact === "network" && mask.pattern && !mask.header && mask.drop) {
        const re = new RegExp(mask.pattern);
        const kept = network.filter((n) => !re.test(n.url));
        hit(hits, mask.id, network.length - kept.length);
        network = kept;
      } else if (artefact === "network" && mask.pattern && !mask.header) {
        network = network.map((n) => ({ ...n, url: applyPattern(n.url, mask, hits) }));
      }
      if (artefact === "console" && mask.pattern && mask.drop) {
        const re = new RegExp(mask.pattern);
        const kept = consoleEntries.filter((c) => !re.test(c.text));
        hit(hits, mask.id, consoleEntries.length - kept.length);
        consoleEntries = kept;
      } else if (artefact === "console" && mask.pattern) {
        consoleEntries = consoleEntries.map((c) => ({ ...c, text: applyPattern(c.text, mask, hits) }));
      }
    }
  }
  return { ...page, path: own(page.path), aria, headers, network, console: consoleEntries };
}

/** Apply every mask that applies in `mode` to a capture. Pure: returns a new capture and the hit counts. */
export function normalise(capture: SideCapture, file: MasksFile, mode?: Mode, options: NormaliseOptions = {}): { capture: SideCapture; hits: MaskHits } {
  const origins = options.origins ?? [];
  const hits: MaskHits = {};
  const masks = file.masks.filter((m) => !m.modes || (mode !== undefined && m.modes.includes(mode)));
  for (const m of masks) hits[m.id] = 0;

  const journeys = capture.journeys.map((j) => ({ ...j, pages: j.pages.map((p) => normalisePage(p, masks, hits, origins)), ...(j.error !== undefined ? { error: rewriteOrigins(redactSecrets(j.error), origins).text } : {}) }));

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
