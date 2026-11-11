import type { FetchLike } from "../course/capture.ts";

/**
 * What a `jsr:` specifier in a lecturer's netlify.toml resolves to today (since 1.63.0, docs/validate-forecast.md).
 * Netlify runs `deno run -A jsr:@tutors/tutors-create@^5.4.0 validate && deno run -A jsr:@tutors/tutors` for every
 * course built from the standard template, so a specifier JSR cannot satisfy fails every such deploy, and a version
 * without the `validate` export fails it the same way.
 */

export interface JsrSpec {
  /** The specifier as written, e.g. jsr:@tutors/tutors-create@^5.4.0. */
  spec: string;
  scope: string;
  name: string;
  /** The range after the @; "" when the specifier names no version (Deno takes the latest). */
  range: string;
}

const SPEC = /jsr:@([a-z0-9-]+)\/([a-z0-9-]+)(?:@([~^]?[0-9][0-9.]*))?/g;

/** Every jsr: specifier in a text (a netlify.toml, or the source of the template that writes one), in order, once each. */
export function jsrSpecs(text: string): JsrSpec[] {
  const seen = new Set<string>();
  const out: JsrSpec[] = [];
  for (const m of text.matchAll(SPEC)) {
    if (seen.has(m[0])) continue;
    seen.add(m[0]);
    out.push({ spec: m[0], scope: m[1]!, name: m[2]!, range: m[3] ?? "" });
  }
  return out;
}

type Version = [number, number, number];

function parseVersion(v: string): Version | undefined {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
}

const cmp = (a: Version, b: Version) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/**
 * Whether a version satisfies a range the way Deno reads a jsr: specifier: "" any, "5" 5.x.x, "5.4" 5.4.x,
 * "5.4.0" exactly, "^5.4.0" >=5.4.0 <6.0.0 (<0.5.0 for ^0.4.0), "~5.4.0" >=5.4.0 <5.5.0. Pre-releases never match.
 */
export function satisfies(version: string, range: string): boolean {
  const v = parseVersion(version);
  if (!v) return false;
  if (range === "") return true;
  const op = range[0] === "^" || range[0] === "~" ? range[0] : "";
  const parts = range.slice(op.length).split(".").map(Number);
  if (parts.some((n) => !Number.isInteger(n))) return false;
  if (op === "" && parts.length < 3) return parts.every((n, i) => v[i] === n);
  const lo: Version = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  if (cmp(v, lo) < 0) return false;
  if (op === "") return cmp(v, lo) === 0;
  if (op === "~") return v[0] === lo[0] && v[1] === lo[1];
  return lo[0] > 0 ? v[0] === lo[0] : lo[1] > 0 ? v[0] === 0 && v[1] === lo[1] : cmp(v, lo) === 0;
}

/** The highest version that satisfies the range, as Deno picks it; undefined when none does. */
export function pick(versions: readonly string[], range: string): string | undefined {
  return versions
    .filter((v) => satisfies(v, range))
    .map((v) => ({ v, p: parseVersion(v)! }))
    .sort((a, b) => cmp(b.p, a.p))[0]?.v;
}

export interface JsrResolution {
  spec: string;
  /** The version Deno would run; undefined when JSR has none in range (or the package at all). */
  version?: string;
  /** JSR's latest version of the package, for the message. */
  latest?: string;
  /** For a specifier run as `<spec> validate`: whether that version exports ./validate. */
  hasValidate?: boolean;
  /** Why the specifier cannot run, in a sentence; undefined when it can. */
  problem?: string;
}

const meta = async (fetch: FetchLike, url: string): Promise<unknown> => {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
};

/** Asks jsr.io what a specifier resolves to, and, when `needsValidate`, whether that version has the validate command. */
export async function resolveJsr(spec: JsrSpec, fetch: FetchLike, needsValidate = false): Promise<JsrResolution> {
  const base = `https://jsr.io/@${spec.scope}/${spec.name}`;
  const pkg = (await meta(fetch, `${base}/meta.json`)) as { latest?: string; versions?: Record<string, { yanked?: boolean }> } | undefined;
  if (!pkg) return { spec: spec.spec, problem: `JSR has no package @${spec.scope}/${spec.name}` };
  const versions = Object.entries(pkg.versions ?? {})
    .filter(([, info]) => !info.yanked)
    .map(([v]) => v);
  const version = pick(versions, spec.range);
  const latest = pkg.latest;
  if (!version) return { spec: spec.spec, ...(latest ? { latest } : {}), problem: `JSR has no version of @${spec.scope}/${spec.name} in ${spec.range || "any range"} (latest ${latest ?? "none"})` };
  if (!needsValidate) return { spec: spec.spec, version, ...(latest ? { latest } : {}) };
  const exports = ((await meta(fetch, `${base}/${version}_meta.json`)) as { exports?: Record<string, string> } | undefined)?.exports ?? {};
  const hasValidate = "./validate" in exports;
  return {
    spec: spec.spec,
    version,
    ...(latest ? { latest } : {}),
    hasValidate,
    ...(hasValidate ? {} : { problem: `@${spec.scope}/${spec.name} ${version}, which ${spec.spec} resolves to, has no validate command` })
  };
}

/** The build command of a netlify.toml, or of the template source that writes one (`command = "..."`). */
export function buildCommand(text: string): string | undefined {
  return /^\s*command\s*=\s*"([^"]*)"/m.exec(text)?.[1];
}

export interface DeployCheck {
  command: string;
  specs: JsrResolution[];
  /** True when every specifier in the command resolves to a version that can run it. */
  ok: boolean;
}

/** Whether every jsr: specifier the standard build command runs exists on JSR, and the one run as `validate` has it. */
export async function checkDeployCommand(templateText: string, fetch: FetchLike): Promise<DeployCheck> {
  const command = buildCommand(templateText);
  if (command === undefined) throw new Error("the template has no build command (command = \"...\")");
  const specs: JsrResolution[] = [];
  for (const spec of jsrSpecs(command)) {
    const runsValidate = new RegExp(`${spec.spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+validate\\b`).test(command);
    specs.push(await resolveJsr(spec, fetch, runsValidate));
  }
  return { command, specs, ok: specs.every((s) => s.problem === undefined) };
}
