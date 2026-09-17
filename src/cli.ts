import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { journeys } from "../traffic/journeys/journeys.ts";
import { loadClaims } from "./claims/schema.ts";
import { exitCodeFor } from "./gate.ts";
import { runMutants } from "./mutants.ts";
import { compareFromCaptures, defaultRunOptions, loadCapture, run } from "./run.ts";
import { imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import { MODES, type Mode } from "./types.ts";

const USAGE = `tutors-release-harness

  harness run --mode <mode> --a <ref> --b <ref> [options]
      Start both stacks, capture, compare, claim, gate, report.
      --mode        ${MODES.join(" | ")}
      --a, --b      a tag (16.2.0), one app's image (tutors/reader:16.2.0, mutant images),
                    or reader=..,catalogue=..,live=..
      --image-prefix  registry/namespace for bare tags (default: tutors, or HARNESS_IMAGE_PREFIX)
      --claims      claims.yaml for release mode
      --noise       noise-status.json (or its directory) from a recent A/A run; "skip" waives it, loudly
      --runs        journey repetitions per side; 3+ enables statistical timing (default 1)
      --journey     run only this journey (repeatable)
      --now         frozen clock, ISO instant (default ${defaultRunOptions().now})
      --out         output root (default ./out)
      --no-screenshots, --no-axe, --keep, --no-stack

  harness compare --dir <run dir> --mode <mode> [--claims f] [--noise f]
      Re-run normalise/compare/claim/gate on captures already on disk.

  harness stack up|down --a <ref> --b <ref>
  harness mutants --base <ref> [--out dir] [--runs n]
      Build every mutant from the base reader image and prove the harness catches each.
  harness journeys
`;

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

function mode(value: string | undefined): Mode {
  if (!value || !(MODES as readonly string[]).includes(value)) fail(`--mode must be one of ${MODES.join(", ")}`);
  return value as Mode;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      mode: { type: "string" },
      a: { type: "string" },
      b: { type: "string" },
      base: { type: "string" },
      "image-prefix": { type: "string" },
      claims: { type: "string" },
      noise: { type: "string" },
      runs: { type: "string" },
      journey: { type: "string", multiple: true },
      now: { type: "string" },
      out: { type: "string" },
      dir: { type: "string" },
      masks: { type: "string" },
      "noise-max-age-days": { type: "string" },
      screenshots: { type: "boolean", default: true },
      axe: { type: "boolean", default: true },
      keep: { type: "boolean", default: false },
      stack: { type: "boolean", default: true },
      help: { type: "boolean", short: "h", default: false }
    },
    allowNegative: true
  });

  if (!command || values.help) {
    console.log(USAGE);
    return command ? 0 : 2;
  }

  const defaults = defaultRunOptions();
  const common = {
    ...defaults,
    ...(values["image-prefix"] ? { imagePrefix: values["image-prefix"] } : {}),
    ...(values.out ? { outDir: resolve(values.out) } : {}),
    ...(values.now ? { now: values.now } : {}),
    ...(values.runs ? { runs: Number(values.runs) } : {}),
    ...(values.masks ? { masksFile: resolve(values.masks) } : {}),
    ...(values["noise-max-age-days"] ? { noiseMaxAgeDays: Number(values["noise-max-age-days"]) } : {}),
    journeys: values.journey ?? [],
    screenshots: values.screenshots,
    axe: values.axe,
    keep: values.keep,
    noStack: !values.stack
  };

  switch (command) {
    case "run": {
      if (!values.a || !values.b) fail("run needs --a and --b");
      const outcome = await run({
        ...common,
        mode: mode(values.mode),
        a: values.a,
        b: values.b,
        ...(values.claims ? { claimsFile: resolve(values.claims) } : {}),
        ...(values.noise ? { noise: values.noise } : {})
      });
      printOutcome(outcome.report.verdict, outcome.report.reasons, outcome.files);
      return exitCodeFor(outcome.report.verdict);
    }
    case "compare": {
      if (!values.dir) fail("compare needs --dir <run directory containing a/ and b/>");
      const dir = resolve(values.dir);
      const outcome = compareFromCaptures({
        mode: mode(values.mode),
        captureDir: dir,
        a: loadCapture(dir, "a"),
        b: loadCapture(dir, "b"),
        claims: values.claims ? loadClaims(resolve(values.claims)) : [],
        masksFile: common.masksFile,
        noiseMaxAgeDays: common.noiseMaxAgeDays,
        now: common.now,
        runs: common.runs,
        log: common.log,
        ...(values.noise ? { noise: values.noise } : {})
      });
      printOutcome(outcome.report.verdict, outcome.report.reasons, outcome.files);
      return exitCodeFor(outcome.report.verdict);
    }
    case "stack": {
      const action = positionals[0];
      if (!values.a || !values.b) fail("stack needs --a and --b");
      const a = sideSpec("a", imagesFor(values.a, common.imagePrefix));
      const b = sideSpec("b", imagesFor(values.b, common.imagePrefix));
      if (action === "up") stackUp(a, b, common.now);
      else if (action === "down") stackDown(a, b, common.now);
      else fail("stack up|down");
      return 0;
    }
    case "mutants": {
      if (!values.base) fail("mutants needs --base <reader image or tag>");
      const ok = await runMutants({ ...common, base: values.base });
      return ok ? 0 : 1;
    }
    case "journeys":
      for (const j of journeys) console.log(j.name);
      return 0;
    default:
      fail(`unknown command "${command}"\n${USAGE}`);
  }
}

function printOutcome(verdict: string, reasons: string[], files: { json: string; html: string; md: string }) {
  console.log("");
  console.log(`verdict: ${verdict.toUpperCase()}`);
  for (const r of reasons) console.log(`  - ${r}`);
  console.log(`report: ${files.html}`);
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exit(2);
  }
);
