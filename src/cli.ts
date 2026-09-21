import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { journeys, type JourneySet } from "../traffic/journeys/journeys.ts";
import { loadClaims } from "./claims/schema.ts";
import { appendFileSync } from "node:fs";
import { parseOverride, exitCodeForReport } from "./override.ts";
import { EXIT_CANNOT_JUDGE, ImageTrustError, ensureImages, fileLedger, realExec, resolveSideProvenance, trustPolicyFromEnv } from "./images.ts";
import { runMutants } from "./mutants.ts";
import { compareFromCaptures, defaultRunOptions, loadCapture, run } from "./run.ts";
import { imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import { kindDown, kindRollout, kindSide, kindUp } from "./substrate/kind.ts";
import { MODES, SUBSTRATES, type Mode, type Substrate } from "./types.ts";
import { harnessInfo } from "./version.ts";
import { UsageError, doctorCommand, guardCommand, localCommand, noiseCommand, overrideCommand, recordAppliedOverride } from "./local/cli.ts";
import { defaultNoise } from "./local/noise-store.ts";

const USAGE = `tutors-release-harness

  harness run --mode <mode> --a <ref> --b <ref> [options]
      Start both stacks, capture, compare, claim, gate, report.
      --mode        ${MODES.join(" | ")}
      --a, --b      a tag (16.2.0), one app's image (tutors/reader:16.2.0, mutant images),
                    reader=REF,catalogue=REF,live=REF (each REF may be pinned: repo@sha256:…);
                    for migration mode a git ref or dir:<path>
      --substrate   compose (default) | kind
      --image-prefix  where bare tags live (default: tutors, or HARNESS_IMAGE_PREFIX): a prefix
                    (tutors -> tutors/reader:TAG) or a template with {app}
                    (quay.io/tutors-sdk/tutors-{app} -> quay.io/tutors-sdk/tutors-reader:TAG)
      --allow-unsigned  judge registry images whose cosign signature could not be verified
                    (or HARNESS_ALLOW_UNSIGNED=1). Local work only; the report records it.
      --claims      claims.yaml for release mode
      --claim-max-hunks  flag a claim that covers more than this many hunks (default 10, or HARNESS_CLAIM_MAX_HUNKS); reported, never gates
      --noise       noise-status.json (or its directory) from a recent A/A run; "skip" waives it, loudly;
                    "none" does not look. Release and post-deploy mode without it read the latest status from the
                    local noise store (HARNESS_HOME/noise, see harness noise)
      --require-verified  noise mode: write the status DEGRADED unless every image on both sides was pulled and
                    signature-verified in this run (the nightly sets it); the gate never trusts a degraded status
      --override-reason, --override-by  accept a FAIL and say so: the verdict stays FAIL, the run exits 0, and the
                    report records who overrode it and why (both required together; reason 20+ characters)
      --runs        journey repetitions per side; 3+ enables statistical timing (default 1)
      --set         journey sets, comma separated: fixture,auth,reference (default all three)
      --journey     run only this journey (repeatable)
      --load        k6 after the journeys on each side: "<rate>x<duration>", e.g. 20x30s
      --now         frozen clock, ISO instant (default ${defaultRunOptions().now})
      --out         output root (default ./out)
      --no-screenshots, --no-axe, --no-focus, --keep, --no-stack
      --no-runtime  do not collect container posture (identity, capabilities, read-only root, limits)
      --startup-restarts  restarts per app to sample startup time from (default 5; 0 switches it off).
                    Fewer than timing.minRuns (normalise/masks.yaml) is reported, not judged; raise it, never retry.
      post-deploy:  --recorded <release run dir> --production reader=URL,catalogue=URL,live=URL
      migration:    --snapshot <pg_dump file>
      upgrade:      --upgrade-seconds 45 --upgrade-rate 20

  harness compare --dir <run dir> --mode <mode> [--claims f] [--noise f]
      Re-run normalise/compare/claim/gate on captures already on disk.

  harness images ensure --a <ref> --b <ref> [--ref-a git-ref] [--ref-b git-ref] [--allow-unsigned] [--image-cache dir]
      Per image: use it if local; else pull it and verify its cosign signature by digest
      (HARNESS_COSIGN_IDENTITY, HARNESS_COSIGN_ISSUER override who must have signed it);
      else, for a bare tag, build it from the monorepo ref. Exit 1 when an image cannot be
      obtained; exit 2 when a registry image is unsigned, wrongly signed, or cosign is missing.
      --image-cache  a directory kept between runs: refreshed from images pulled and verified in this run,
                    and used (recorded as provenance "cached", a degraded run) only when the registry cannot be reached.
  harness stack up|down --a <ref> --b <ref>
  harness kind up|down|rollout --a <ref> --b <ref>
  harness mutants --base <ref> [--out dir]
      Build every mutant from the base reader image and prove the harness catches each.
  harness journeys
  harness version [--json]
      Harness version, git sha and the contract version (docs/contract.md).

  harness doctor [--for nightly,gate,mutants,watch,kind] [--port-offset n] [--json]
      What this machine lacks to run the harness, and how to install it (Windows, macOS, Linux). Read-only.
      Exit 0 ready (warnings allowed), 1 something a run needs is missing, 2 usage.
  harness noise record --status <noise run dir | noise-status.json> [--report f] [--tag T] [--store dir] [--run-url u] [--summary f] [--masks f]
      Append tonight's A/A to the noise store (the local \`noise\` branch): status, history, summary. Exit 1 when the ratchet is broken.
  harness noise status [--store dir] [--noise-max-age-days 7] [--require] [--json]
      Does the latest status license a FAIL (clean, verified, fresh)? --require exits 1 when it does not.
  harness noise history [--store dir] [--last n] [--json]
      The ratchet, the clean streak and the last nights.
  harness guard masks|engine|all --base <ref>
      The PR guards of CI against a local ref: masks land in their own PR; an engine, mask, journey, gate or mutant
      change needs a version bump. Exit 1 on a violation, 2 when the ref does not exist.
  harness override list [--since <date>] [--json]
      The local, append-only record of every FAIL a person overrode.
  harness local nightly [--tag T] [--runs 3] [--load 20x30s] [--image-cache dir] [--store dir] [--no-record]
  harness local gate --a <production tag> --b <candidate tag> [--claims f] [--runs 3] [--only release|migration|upgrade]
                     [--migrations-a ref] [--migrations-b ref] [--override-reason r --override-by who]
  harness local mutants [--base T]
  harness local watch [--recorded <release run dir>] [--production reader=URL,catalogue=URL,live=URL] [--interval 15m] [--once]
      Each is what its workflow does, as one command, from the same harness commands (--dry-run prints them).
      All take --port-offset <n> to move the compose stack's host ports beside a stack of your own.
      A run holds a lock: one per machine at a time.
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

/** --startup-restarts <n>: restarts per app to sample startup time from; 0 switches it off. */
function startupRestarts(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) fail("--startup-restarts takes a whole number, 0 or more (0 switches startup time off)");
  return n;
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
      "claim-max-hunks": { type: "string" },
      "override-reason": { type: "string" },
      "override-by": { type: "string" },
      "image-cache": { type: "string" },
      "startup-restarts": { type: "string" },
      tag: { type: "string" },
      only: { type: "string" },
      "migrations-a": { type: "string" },
      "migrations-b": { type: "string" },
      store: { type: "string" },
      status: { type: "string" },
      report: { type: "string" },
      "run-url": { type: "string" },
      summary: { type: "string" },
      interval: { type: "string" },
      "port-offset": { type: "string" },
      for: { type: "string" },
      last: { type: "string" },
      since: { type: "string" },
      screenshots: { type: "boolean", default: true },
      axe: { type: "boolean", default: true },
      focus: { type: "boolean", default: true },
      runtime: { type: "boolean", default: true },
      keep: { type: "boolean", default: false },
      stack: { type: "boolean", default: true },
      "allow-unsigned": { type: "boolean", default: false },
      "require-verified": { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      once: { type: "boolean", default: false },
      require: { type: "boolean", default: false },
      record: { type: "boolean", default: true },
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
  let override: ReturnType<typeof parseOverride>;
  try {
    override = parseOverride(values["override-reason"], values["override-by"]);
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  const claimMaxHunks = values["claim-max-hunks"] === undefined ? defaults.claimMaxHunks : Number(values["claim-max-hunks"]);
  if (!Number.isInteger(claimMaxHunks) || claimMaxHunks < 1) fail("--claim-max-hunks takes a positive integer");
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
    claimMaxHunks,
    requireVerified: values["require-verified"],
    ...(override ? { override } : {}),
    ...(values.recorded ? { recorded: resolve(values.recorded) } : {}),
    ...(values.production ? { production: values.production } : {}),
    ...(values.snapshot ? { snapshot: resolve(values.snapshot) } : {}),
    upgrade: { seconds: Number(values["upgrade-seconds"] ?? defaults.upgrade.seconds), rate: Number(values["upgrade-rate"] ?? defaults.upgrade.rate) },
    sets,
    journeys: values.journey ?? [],
    screenshots: values.screenshots,
    axe: values.axe,
    focusStops: values.focus ? defaults.focusStops : 0,
    runtime: values.runtime,
    startupRestarts: startupRestarts(values["startup-restarts"], defaults.startupRestarts),
    keep: values.keep,
    noStack: !values.stack,
    allowUnsigned: values["allow-unsigned"]
  };

  /** --noise, or the latest status in the local store for the modes that consult one (release, post-deploy). */
  const noise = (m: Mode) => defaultNoise(m, values.noise, common.log);

  /** A side for the hand-driven commands, under the same rule as `run`: no unverified registry image is started. */
  const trustedSide = (name: "a" | "b", spec: string) => {
    const side = sideSpec(name, imagesFor(spec, common.imagePrefix));
    side.provenance = resolveSideProvenance(side.images, { exec: realExec, ledger: fileLedger(), policy: trustPolicyFromEnv(process.env, common.allowUnsigned), log: common.log });
    return side;
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
        ...(noise(m) ? { noise: noise(m)! } : {})
      });
      printOutcome(outcome.report.verdict, outcome.report.reasons, outcome.files);
      recordAppliedOverride(outcome.report, outcome.outDir);
      return exitCodeForReport(outcome.report);
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
        claimMaxHunks: common.claimMaxHunks,
        requireVerified: common.requireVerified,
        ...(common.override ? { override: common.override } : {}),
        now: common.now,
        runs: common.runs,
        log: common.log,
        ...(noise(mode(values.mode)) ? { noise: noise(mode(values.mode))! } : {})
      });
      printOutcome(outcome.report.verdict, outcome.report.reasons, outcome.files);
      recordAppliedOverride(outcome.report, outcome.outDir);
      return exitCodeForReport(outcome.report);
    }
    case "images": {
      if (positionals[0] !== "ensure") fail("images ensure --a <ref> --b <ref>");
      if (!values.a || !values.b) fail("images ensure needs --a and --b");
      const result = ensureImages(
        [
          { spec: values.a, ...(values["ref-a"] ? { ref: values["ref-a"] } : {}) },
          { spec: values.b, ...(values["ref-b"] ? { ref: values["ref-b"] } : {}) }
        ],
        common.imagePrefix,
        { log: common.log, policy: trustPolicyFromEnv(process.env, common.allowUnsigned), ...(values["image-cache"] ? { cacheDir: resolve(values["image-cache"]) } : {}) }
      );
      // For workflows: `image_cache=used|refreshed|none`, so the cache is saved only when it was refreshed.
      if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `image_cache=${result.cache}\n`);
      return result.exitCode;
    }
    case "stack": {
      const action = positionals[0];
      if (!values.a || !values.b) fail("stack needs --a and --b");
      if (action !== "up" && action !== "down") fail("stack up|down");
      const a = action === "up" ? trustedSide("a", values.a) : sideSpec("a", imagesFor(values.a, common.imagePrefix));
      const b = action === "up" ? trustedSide("b", values.b) : sideSpec("b", imagesFor(values.b, common.imagePrefix));
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
      if (action !== "up" && action !== "rollout") fail("kind up|down|rollout");
      const a = kindSide(trustedSide("a", values.a));
      const b = kindSide(trustedSide("b", values.b));
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
    case "doctor":
      return doctorCommand(values);
    case "noise":
      return noiseCommand(positionals[0], values);
    case "guard":
      return guardCommand(positionals[0], values);
    case "override":
      return overrideCommand(positionals[0], values);
    case "local":
      return localCommand(positionals[0], values);
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
    // Could not judge: said plainly, without a stack trace, same exit class as any harness error.
    if (error instanceof ImageTrustError) {
      console.error(`cannot judge: ${error.message}`);
      process.exit(EXIT_CANNOT_JUDGE);
    }
    // A usage error of the local commands: the message, not a stack.
    if (error instanceof UsageError) {
      console.error(error.message);
      process.exit(2);
    }
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exit(2);
  }
);
