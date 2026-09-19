import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { journeys, type JourneySet } from "../traffic/journeys/journeys.ts";
import { loadClaims } from "./claims/schema.ts";
import { exitCodeFor } from "./gate.ts";
import { ensureImages } from "./images.ts";
import { runMutants } from "./mutants.ts";
import { compareFromCaptures, defaultRunOptions, loadCapture, run } from "./run.ts";
import { imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import { kindDown, kindRollout, kindSide, kindUp } from "./substrate/kind.ts";
import { MODES, SUBSTRATES, type Mode, type Substrate } from "./types.ts";
import { harnessInfo } from "./version.ts";

const USAGE = `tutors-release-harness

  harness run --mode <mode> --a <ref> --b <ref> [options]
      Start both stacks, capture, compare, claim, gate, report.
      --mode        ${MODES.join(" | ")}
      --a, --b      a tag (16.2.0), one app's image (tutors/reader:16.2.0, mutant images),
                    reader=..,catalogue=..,live=..; for migration mode a git ref or dir:<path>
      --substrate   compose (default) | kind
      --image-prefix  registry/namespace for bare tags (default: tutors, or HARNESS_IMAGE_PREFIX)
      --claims      claims.yaml for release mode
      --noise       noise-status.json (or its directory) from a recent A/A run; "skip" waives it, loudly
      --runs        journey repetitions per side; 3+ enables statistical timing (default 1)
      --set         journey sets, comma separated: fixture,auth,reference (default all three)
      --journey     run only this journey (repeatable)
      --load        k6 after the journeys on each side: "<rate>x<duration>", e.g. 20x30s
      --now         frozen clock, ISO instant (default ${defaultRunOptions().now})
      --out         output root (default ./out)
      --no-screenshots, --no-axe, --no-focus, --keep, --no-stack
      post-deploy:  --recorded <release run dir> --production reader=URL,catalogue=URL,live=URL
      migration:    --snapshot <pg_dump file>
      upgrade:      --upgrade-seconds 45 --upgrade-rate 20

  harness compare --dir <run dir> --mode <mode> [--claims f] [--noise f]
      Re-run normalise/compare/claim/gate on captures already on disk.

  harness images ensure --a <ref> --b <ref> [--ref-a git-ref] [--ref-b git-ref]
      Pull each side's images, or build them from the monorepo ref when the registry lacks them.
  harness stack up|down --a <ref> --b <ref>
  harness kind up|down|rollout --a <ref> --b <ref>
  harness mutants --base <ref> [--out dir]
      Build every mutant from the base reader image and prove the harness catches each.
  harness journeys
  harness version [--json]
      Harness version, git sha and the contract version (docs/contract.md).
`;

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

function mode(value: string | undefined): Mode {
  if (!value || !(MODES as readonly string[]).includes(value)) fail(`--mode must be one of ${MODES.join(", ")}`);
  return value as Mode;
}

function substrate(value: string | undefined): Substrate {
  if (!value) return "compose";
  if (!(SUBSTRATES as readonly string[]).includes(value)) fail(`--substrate must be one of ${SUBSTRATES.join(", ")}`);
  return value as Substrate;
}

function parseLoad(value: string | undefined): { rate: number; duration: string } | undefined {
  if (!value) return undefined;
  const m = /^(\d+)x(\d+[smh])$/.exec(value);
  if (!m) fail(`--load takes <rate>x<duration>, e.g. 20x30s`);
  return { rate: Number(m[1]), duration: m[2]! };
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
      substrate: { type: "string" },
      "image-prefix": { type: "string" },
      "ref-a": { type: "string" },
      "ref-b": { type: "string" },
      claims: { type: "string" },
      noise: { type: "string" },
      runs: { type: "string" },
      set: { type: "string" },
      journey: { type: "string", multiple: true },
      load: { type: "string" },
      now: { type: "string" },
      out: { type: "string" },
      dir: { type: "string" },
      masks: { type: "string" },
      recorded: { type: "string" },
      production: { type: "string" },
      snapshot: { type: "string" },
      "upgrade-seconds": { type: "string" },
      "upgrade-rate": { type: "string" },
      "noise-max-age-days": { type: "string" },
      screenshots: { type: "boolean", default: true },
      axe: { type: "boolean", default: true },
      focus: { type: "boolean", default: true },
      keep: { type: "boolean", default: false },
      stack: { type: "boolean", default: true },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false }
    },
    allowNegative: true
  });

  if (!command || values.help) {
    console.log(USAGE);
    return command ? 0 : 2;
  }
  if (command === "version") {
    const info = harnessInfo();
    console.log(values.json ? JSON.stringify(info) : `harness ${info.version} (${info.gitSha ?? "no git sha"}) · contract ${info.contractVersion}`);
    return 0;
  }

  const defaults = defaultRunOptions();
  const sets = values.set ? (values.set.split(",").map((s) => s.trim()) as JourneySet[]) : defaults.sets;
  for (const s of sets) if (!["fixture", "auth", "reference"].includes(s)) fail(`unknown journey set "${s}"`);
  const load = parseLoad(values.load);
  const common = {
    ...defaults,
    substrate: substrate(values.substrate),
    ...(values["image-prefix"] ? { imagePrefix: values["image-prefix"] } : {}),
    ...(values.out ? { outDir: resolve(values.out) } : {}),
    ...(values.now ? { now: values.now } : {}),
    ...(values.runs ? { runs: Number(values.runs) } : {}),
    ...(values.masks ? { masksFile: resolve(values.masks) } : {}),
    ...(values["noise-max-age-days"] ? { noiseMaxAgeDays: Number(values["noise-max-age-days"]) } : {}),
    ...(load ? { load } : {}),
    ...(values.recorded ? { recorded: resolve(values.recorded) } : {}),
    ...(values.production ? { production: values.production } : {}),
    ...(values.snapshot ? { snapshot: resolve(values.snapshot) } : {}),
    upgrade: { seconds: Number(values["upgrade-seconds"] ?? defaults.upgrade.seconds), rate: Number(values["upgrade-rate"] ?? defaults.upgrade.rate) },
    sets,
    journeys: values.journey ?? [],
    screenshots: values.screenshots,
    axe: values.axe,
    focusStops: values.focus ? defaults.focusStops : 0,
    keep: values.keep,
    noStack: !values.stack
  };

  switch (command) {
    case "run": {
      const m = mode(values.mode);
      if (m !== "post-deploy" && (!values.a || !values.b)) fail("run needs --a and --b");
      const outcome = await run({
        ...common,
        mode: m,
        a: values.a ?? "recorded",
        b: values.b ?? "production",
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
        substrate: common.substrate,
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
    case "images": {
      if (positionals[0] !== "ensure") fail("images ensure --a <ref> --b <ref>");
      if (!values.a || !values.b) fail("images ensure needs --a and --b");
      const ok = ensureImages([
        { spec: values.a, ...(values["ref-a"] ? { ref: values["ref-a"] } : {}) },
        { spec: values.b, ...(values["ref-b"] ? { ref: values["ref-b"] } : {}) }
      ], common.imagePrefix, common.log);
      return ok ? 0 : 1;
    }
    case "stack": {
      const action = positionals[0];
      if (!values.a || !values.b) fail("stack needs --a and --b");
      const a = sideSpec("a", imagesFor(values.a, common.imagePrefix));
      const b = sideSpec("b", imagesFor(values.b, common.imagePrefix));
      if (action === "up") stackUp(a, b, common.now, { profiles: ["upgrade"] });
      else if (action === "down") stackDown(a, b, common.now);
      else fail("stack up|down");
      return 0;
    }
    case "kind": {
      const action = positionals[0];
      if (action === "down") {
        kindDown(common.log);
        return 0;
      }
      if (!values.a || !values.b) fail("kind up|rollout need --a and --b");
      const a = kindSide(sideSpec("a", imagesFor(values.a, common.imagePrefix)));
      const b = kindSide(sideSpec("b", imagesFor(values.b, common.imagePrefix)));
      if (action === "up") kindUp(a, b, common.now, common.log);
      else if (action === "rollout") {
        const ok = await kindRollout(a, b, common.now, { rate: common.upgrade.rate, seconds: common.upgrade.seconds, outDir: common.outDir, log: common.log });
        return ok ? 0 : 1;
      } else fail("kind up|down|rollout");
      return 0;
    }
    case "mutants": {
      if (!values.base) fail("mutants needs --base <reader image or tag>");
      const ok = await runMutants({ ...common, base: values.base });
      return ok ? 0 : 1;
    }
    case "journeys":
      for (const j of journeys) console.log(`${j.name.padEnd(34)} set=${j.set.padEnd(9)} ${j.anonymous ? "anonymous" : "signed-in"}`);
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
