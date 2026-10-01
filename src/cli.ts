import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { journeys, type JourneySet } from "../traffic/journeys/journeys.ts";
import { loadClaims } from "./claims/schema.ts";
import { isUrl, loadRules } from "./claims/rules.ts";
import { InputFileError } from "./claims/input-error.ts";
import { appendFileSync } from "node:fs";
import { parseOverride, exitCodeForReport } from "./override.ts";
import { DigestError, parseDigests, pinImages } from "./digests.ts";
import { isTag } from "./release-record.ts";
import { EXIT_CANNOT_JUDGE, ImageTrustError, ensureImages, fileLedger, realExec, resolveSideProvenance, trustPolicyFromEnv } from "./images.ts";
import { runMutants } from "./mutants.ts";
import { compareFromCaptures, defaultRunOptions, loadA2Capture, loadCapture, run } from "./run.ts";
import { imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import { CLUSTER, kindDown, kindRollout, kindSide, kindUp } from "./substrate/kind.ts";
import { refuseLegacyCluster } from "./project.ts";
import { MODES, SUBSTRATES, type Mode, type Substrate } from "./types.ts";
import { harnessInfo } from "./version.ts";
import { helpFor, parseArgsErrorText } from "./local/usage.ts";
import { RequirementError, requirements } from "./not-collected.ts";
import { previewResolve } from "./ci/main-preview.ts";
import { UsageError, changesCommand, confidenceCommand, doctorCommand, glanceCommand, guardCommand, localCommand, noiseCommand, overrideCommand, pruneCommand, recordAppliedOverride, releaseCommand, reportsCommand, scoreboardCommand, scorecardCommand, vulnDbCommand, whyCommand, a3Command, readinessCommand } from "./local/cli.ts";
import { defaultNoise } from "./local/noise-store.ts";

const USAGE = `tutors-release-harness

  harness --help | -h | help [command]      this text; \`harness <command> --help\` prints that command's part of it
                                            (exit 0; \`harness\` with no arguments prints it and exits 2)

  harness run --mode <mode> --a <ref> --b <ref> [options]
      Start both stacks, capture, compare, claim, gate, report.
      --mode        ${MODES.join(" | ")}
      --a, --b      a tag (16.2.0), one app's image (tutors/reader:16.2.0, mutant images),
                    reader=REF,catalogue=REF,live=REF[,time=REF] (each REF may be pinned: repo@sha256:…;
                    time defaults to the prefix's time image at the reader's tag);
                    for migration mode a git ref or dir:<path>
      --substrate   compose (default) | kind
      --image-prefix  where bare tags live (default: tutors, or HARNESS_IMAGE_PREFIX): a prefix
                    (tutors -> tutors/reader:TAG) or a template with {app}
                    (quay.io/tutors-sdk/tutors-{app} -> quay.io/tutors-sdk/tutors-reader:TAG)
      --allow-unsigned  judge registry images whose cosign signature could not be verified
                    (or HARNESS_ALLOW_UNSIGNED=1). Local work only; the report records it.
      --a-digests, --b-digests  pin a side's images by digest (release dispatch: production_digests, candidate_digests):
                    a JSON object or reader=sha256:…,catalogue=sha256:…,live=sha256:… — the refs become repo:tag@sha256:…,
                    the pull is by digest, the signature is verified on it. Optional; without them a run is as in 1.2.0
      --claims      claims.yaml for release mode
      --rules       rules.json (a path, or a URL the runner can GET without credentials): the Rules a claim may name with
                    rule: "0031". A claim naming a rule that is not in it, or naming one with no --rules, is invalid (exit 2).
      --vex         the release's OpenVEX file (release/openvex.json beside claims.yaml): handed to the vulnerability
                    scanner on both sides (grype or trivy, --vex), so an advisory it says does not affect the release
                    is left out of vulns and the vulnerability ceiling. Checked first: an invalid one is exit 2
      --a2          release mode, compose: also start side a2, a second copy of side a's apps (four containers),
                    capture it once for dom, network, console, headers, axe and focus, and report a against a2 beside
                    the nightly A/A (in-run noise). Never changes the verdict
      --claim-max-hunks  flag a claim that covers more than this many hunks (default 10, or HARNESS_CLAIM_MAX_HUNKS); reported, never gates
      --noise       noise-status.json (or its directory) from a recent A/A run; "skip" waives it, loudly;
                    "none" does not look. Release and post-deploy mode without it read the latest status from the
                    local noise store (HARNESS_HOME/noise, see harness noise)
      --require-verified  noise mode: write the status DEGRADED unless every image on both sides was pulled and
                    signature-verified in this run (the nightly sets it); the gate never trusts a degraded status
      --override-reason, --override-by  accept a FAIL and say so: the verdict stays FAIL, the run exits 0, and the
                    report records who overrode it and why (both required together; reason 20+ characters)
      --runs        journey repetitions per side; timing needs 4+ to ever reach alpha 0.05, 5 recommended (default 1)
      --set         journey sets, comma separated: fixture,auth,reference (default all three)
      --journey     run only this journey (repeatable)
      --load        k6 after the journeys on each side: "<rate>x<duration>", e.g. 20x30s
      --now         frozen clock, ISO instant (default ${defaultRunOptions().now})
      --out         output root (default ./out)
      --no-screenshots, --no-axe, --no-focus, --keep, --no-stack
      --no-runtime  do not collect container posture (identity, capabilities, read-only root, limits)
      --startup-restarts  restarts per app to sample startup time from (default 5; 0 switches it off).
                    Fewer than timing.minRuns (normalise/masks.yaml) is reported, not judged; raise it, never retry.
      post-deploy:  --recorded <release run dir> --production reader=URL,catalogue=URL,live=URL[,time=URL]
                    [--deployed <tag> --deployed-digests <digests> --release-record <file|dir>]  what the deploy says it
                    deployed, compared with the release record of the judged candidate (HARNESS_HOME/releases without
                    --release-record); a difference, or no record, WARNS
      migration:    --snapshot <pg_dump file>
      upgrade:      --upgrade-seconds 45 --upgrade-rate 20

  harness compare --dir <run dir> --mode <mode> [--claims f] [--rules f] [--noise f]
      Re-run normalise/compare/claim/gate on captures already on disk.

  harness images ensure --a <ref> --b <ref> [--a-digests d] [--b-digests d] [--ref-a git-ref] [--ref-b git-ref] [--allow-unsigned] [--image-cache dir]
      Per image: use it if local; else pull it and verify its cosign signature by digest
      (HARNESS_COSIGN_IDENTITY, HARNESS_COSIGN_ISSUER override who must have signed it);
      else, for a bare tag, build it from the monorepo ref. Exit 1 when an image cannot be
      obtained; exit 2 when a registry image is unsigned, wrongly signed, or cosign is missing.
      --a-digests, --b-digests  pin by digest: pulled by digest, verified on it, and refused (exit 2) when the tag now resolves to
                    another digest; a pinned image is never built from source.
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
  harness vuln-db update|status [--json]
      The pinned vulnerability database (grype's), one directory for CI and this machine: HARNESS_VULN_DB_DIR, else
      HARNESS_HOME/vuln-db. update fetches it: the only place a database is ever updated, run it BEFORE a run (the scanner is
      never allowed to update during one). status says which database a scan would read, when it was built, how old it is
      and its checksum; exit 0 when usable, and, when it is not, 1 when the vulnerability artefact is required
      (HARNESS_REQUIRE_ARTEFACTS=vulns|static|all, or its alias HARNESS_REQUIRE_STATIC=1) and 0 without it. Not stable.
  harness noise record --status <noise run dir | noise-status.json> [--report f] [--tag T] [--store dir] [--run-url u] [--summary f] [--masks f]
      Append tonight's A/A to the noise store (the local \`noise\` branch): status, history, summary. Exit 1 when the ratchet is broken.
  harness noise status [--store dir] [--noise-max-age-days 7] [--require] [--json]
      Does the latest status license a FAIL (clean, verified, fresh)? --require exits 1 when it does not.
  harness noise history [--store dir] [--last n] [--json]
      The ratchet, the clean streak and the last nights.
  harness guard masks|engine|scoreboard|all --base <ref>
      The PR guards of CI against a local ref: masks land in their own PR; an engine, mask, journey, gate or mutant
      change needs a version bump; scoreboard/*.jsonl only gains lines (since 1.11.0). Exit 1 on a violation, 2 when
      the ref does not exist.
  harness override list [--since <date>] [--json]
      The local, append-only record of every FAIL a person overrode.
  harness reports keep --dir <run dir | report.json> [--store dir] [--run-url u] [--keep-last n] [--keep-days n] [--rules f]
                       [--migration <run dir>] [--upgrade <run dir>]
      Keep a run's report.json, report.md and report.html, and its scorecard, under <store>/reports/<ranAt>-<mode>/ and
      list it in <store>/reports/index.json, newest first, so it outlives the artifact. --keep-last drops older runs, but
      never one younger than --keep-days (since 1.16.0). Since 1.13.1 a release run scored beside it (confidence.json,
      changes.json) is kept with them, its report.md and report.html led by the Gate, the RCS and its band, the glance and
      the change risk per PR, as harness release leads its own. Since 1.16.0 --migration and --upgrade keep the run's
      rehearsals beside it (migration/, upgrade/), and the kept confidence.json links them there. Not stable.
  harness scorecard --report <run dir | report.json> [--rules rules.json] [--json]
      A 0-100 score with every deduction, the A/A normalness, EARS Rule -> diffs -> PRs, and at most five pages to test
      by hand. PRs come from a Rule's "prs" in rules.json and "PR #n" in claim reasons. Never changes a verdict. Not stable.
  harness preview resolve [--a <production>] [--b <candidate>] [--force]
      Main to RC: what main-preview.yml judges. Production is the reader overlay's newTag on the monorepo's main, the
      candidate sha-<short> of main's newest commit with signed images; a pair this harness version already judged (on the
      main-preview branch) is skipped unless --force. Writes production, candidate, sha, claims_url, skip to
      $GITHUB_OUTPUT. Exit 2 when it cannot decide. Not stable.
  harness prune [--out dir] [--older-than-days 14] [--keep-last 5] [--image-cache dir] [--image-cache-days 30] [--yes] [--json]
      Free disk: remove run directories under out/ that are older than --older-than-days AND not among the newest
      --keep-last of their mode, and an image cache saved more than --image-cache-days ago. A dry run unless --yes.
      Never touches HARNESS_HOME state (noise store, release records, override log), the newest release run that did
      not FAIL (what \`local watch\` compares production with), anything from the last 6 hours, or anything while a
      run or watch holds its lock (exit 2). Exit 1 when something could not be removed (in use).
  harness local nightly [--tag T] [--runs 5] [--load 20x30s] [--image-cache dir] [--store dir] [--no-record]
  harness local gate --a <production tag> --b <candidate tag> [--a-digests d] [--b-digests d] [--claims f] [--rules f] [--runs 5] [--only release|migration|upgrade]
                     [--migrations-a ref] [--migrations-b ref] [--override-reason r --override-by who]
  harness local mutants [--base T]
  harness local smoke [--tag T] [--only stacks|migration]
      The two-stacks smoke ci.yml runs: both stacks boot from one tag, one journey A/A, and the migration fixtures (the
      expanding one passes, the contracting one must be rejected). pnpm smoke is the same command.
  harness local compare [--a <tag>] [--b main] [--runs 3] [--load 20x30s | --no-load] [--claims f] [--strict] [--json]
      main against the last release, in one command. --a is the highest X.Y.Z present for all four apps on quay.io
      (else HARNESS_PRODUCTION_TAG, else exit 2: pass --a). Pulls and cosign-verifies both sides, builds nothing, runs the
      gate's release step, and prints the verdict, the counts and where report.html is. No claims unless --claims, so every
      difference is listed as unclaimed. An exploration, not a gate: exit 0 whenever a report was produced (whatever the
      verdict), 2 when it could not judge (no release found, an image missing or unverifiable, the run lock held), 1 for a
      harness fault; --strict makes the exit follow the verdict like \`local gate\`. pnpm compare is the same command;
      a fast look is pnpm compare --no-load --runs 1.
  harness local watch [--recorded <release run dir>] [--production reader=URL,catalogue=URL,live=URL] [--deployed <tag> [--deployed-digests d] [--release-record f]] [--interval 15m] [--once]
      Each is what its workflow does, as one command, from the same harness commands (--dry-run prints them).
      All take --port-offset <n> to move the compose stack's host ports beside a stack of your own.
      A run holds a lock: one per machine at a time.
  harness release --candidate <tag> [--baseline <tag|prod>] [--monorepo dir] [--claims f] [--rules f] [--fast] [--open] [--out dir] [--dry-run]
                  [--test-signal f] [--traceability f] [--change-risk f] [--post-deploy dir] [--scoreboard f]
      A pushed candidate to a report, asking nothing: resolve (the baseline, images ensure), noise (the local store's A/A
      when clean and at most 7 days old, else an A/A of the baseline, 3 runs), changes (harness changes in the monorepo
      checkout: changes.json, fed to the score's change risk; skipped without a checkout), release (3 runs,
      k6 20x30s, claims, rules), rehearse (migration, upgrade), score (confidence.json, as harness confidence), report,
      led by the Gate, then the RCS and its band, then the reviewer's glance (since 1.12.0). --baseline prod or none reads
      release/deployed.json in the monorepo checkout (--monorepo or HARNESS_MONOREPO_DIR), else HARNESS_PRODUCTION_TAG, else
      exit 2; --claims defaults to release/claims.yaml there. A stage that stops the line (images missing, a dirty A/A,
      a gate FAIL) says so and the next step; the report is written whatever happened, into
      out/<timestamp>-release-command/ (report.md, report.html, gate.md, gate.json, status.json as it goes). Ctrl-C takes
      the stacks down first. --fast: one run, no load, no rehearsals, no A/A; its report says it cannot be used for a go
      decision. --open opens report.html. After the score it appends the scoreboard line to HARNESS_HOME/scoreboard/releases.jsonl
      (--scoreboard <file> writes there instead; never into the checkout unasked; a --fast run is not appended), prints it
      and any run rule firing. Exit 0 pass or warn, 1 FAIL, 2 not judged or usage. Not stable.
  harness confidence --run <release run dir | report.json | harness release dir> [--migration dir] [--upgrade dir] [--json]
                     [--test-signal f] [--traceability f] [--change-risk f] [--post-deploy dir] [--scoreboard f] [--mutants f]
      The Release Confidence Score: writes confidence.json beside the run and prints the board. The Gate first, then the
      RCS (0-100, only when the Gate is PASS or WARN) and its band (Green >= 90, Amber 75-89, Red < 75), then eight
      dimensions, each with every point lost and where. A dimension without its input is "not measured" and left out of
      the mean; a breached floor caps the RCS at 74. The optional inputs are JSON files (docs/contract.md). Never changes
      a verdict or an exit code: exit 0 when written, 2 for an input it cannot read. --change-risk also takes a
      changes.json. Since 1.12.0 it also ranks the reviewer's glance into confidence.json (at most seven places to look,
      novelty x exposure; --scoreboard, default HARNESS_HOME/scoreboard/releases.jsonl, is the history). Since 1.18.0
      --test-signal also reads the monorepo's quality record (quality/<sha>.json) as it is, one with no packages being
      not measured, and --mutants <mutants.jsonl> joins the newest weekly mutants self-test as harnessMutants. Not stable.
  harness changes --a <tag> --b <tag> [--monorepo dir] [--history 6] [--changelog f] [--json] [--out file]
      What changed between two tags of the monorepo (git log A..B in the checkout: --monorepo or HARNESS_MONOREPO_DIR;
      16.2.2 finds v16.2.2), one risk line per PR: churn per app against its median over the last --history releases,
      hotspots (files changed in 3 of them), files with 3+ authors, orphan changes (CHANGELOG.md, or --changelog, the
      output of pnpm release:changelog --json), test lines per production line, approving reviews (GitHub, with
      GITHUB_TOKEN or GH_TOKEN), major dependency bumps. Change risk is 100 minus the sum of the PRs' deductions. A
      signal it cannot read is "not measured", never clean. --out writes changes.json. Advisory: exit 0 whatever it
      found, 2 for what it cannot read. Not stable.
  harness scoreboard append --run <harness release dir | confidence.json> [--file f] [--mutants f] [--tag T] [--run-url u] [--json]
  harness scoreboard trends [--file f] [--mutants f] [--noise-history f] [--site dir] [--json]
  harness scoreboard mutants --run <harness mutants --out dir | mutants.json> [--file f] [--run-url u] [--json]
      The release scoreboard: one line per release run in releases.jsonl (--file; default HARNESS_HOME/scoreboard/releases.jsonl),
      append-only: a re-run appends the same tag with the next run number, and nothing ever edits a line. append builds
      the line from a scored run (the Gate, the RCS and band, the eight dimensions, masks, claims, journeys, the latest
      mutants record, the per-PR risk lines of changes.json); a --fast run is refused. trends prints the six views (RCS
      with its bands, the dimensions, masks and never-fired masks, claims and stale claims, hotspot recurrence, per-file
      and per-contributor risk) and the run rules: three consecutive declines, or two of three releases below 75, in any
      dimension or the RCS, opens a kaizen item. Beside them the harness's health: mutants caught per week (mutants.jsonl
      beside the file, or --mutants), clean A/A nights and days since the last A/A failure (--noise-history, default the
      local noise store's). --site writes scoreboard.html and scoreboard.json into a directory. mutants records a
      self-test's mutants.json in mutants.jsonl. Advisory: exit 0 when done, 2 for what it cannot read. Not stable.
  harness glance mark --run <harness release dir> --item <n> --mark verified|disputed|escalated --by <name> [--note text] [--json]
  harness glance status --run <harness release dir> [--json]
      The reviewer's glance (SOP step 8, gemba): at most seven places to look, ranked by novelty x exposure in
      confidence.json, each linked to the hunk, the claim and the PR. mark records one of three per item in
      glance-marks.jsonl beside it and re-renders the glance in confidence.json, report.md, gate.md and report.html:
      verified (looked, agrees with the claim), disputed (becomes a new claim or a hold), escalated (becomes a 5 Whys).
      status prints the glance with its marks and whether an Amber release's glance is recorded verified (go only then).
      Marks never change the Gate or an exit code. mark: exit 0 when recorded, 2 for what it cannot use; status: exit 0
      always once --run is given (informational). Since 1.13.0 an escalated mark opens a 5 Whys stub in <dir>/kaizen/. Not stable.
  harness why --run <run dir | harness release dir> --finding <id> [--out kaizen/] [--tag T] [--scoreboard f] [--json]
  harness why check <file|dir...> [--json]
  harness why register [--dir kaizen] [--write] [--json]
      The 5 Whys (kaizen): from a finding to a countermeasure to the system, never to a person. why writes
      <out>/<date>-<tag>-<finding>.md with Why 1 answered from the run's own trace (the finding, artefact, journeys, the
      hunk's link, the nearest claim and why it did not cover, the PR with its files and churn, a first contribution as a
      fact, the glance rank and mark), Whys 2-5 blank, and the countermeasure constrained to seven kinds: mutant, journey,
      mask review, EARS spec, claim guidance, SOP change, glance rule. --finding: gate, band or rollback (a Gate FAIL, a Red
      band, a post-deploy FAIL), <rule>:<series> (three-declines:rcs, two-of-three-below-75:change-risk,
      countermeasures-rising; the scoreboard is --scoreboard, default HARNESS_HOME/scoreboard/releases.jsonl), a glance item
      (<kind>:<key> or glance:<n>), or a hunk id from report.json. A file already there is left as it is. check: every
      answer up to where the chain ends, no answer that is only "human error", carelessness or a person's name, the chain
      ending in a process or a tool, exactly one of the seven kinds (a mutant names its path under mutants/), an owner and
      a due date; exit 1 when one is not ready (a docs lint, never a release gate). register: the table of kaizen/README.md
      regenerated from the files (--write writes it; without, exit 1 when README.md is out of date) with the open and
      overdue counts. harness release opens one by itself for each trigger. Exit 2 for what it cannot read. Not stable.
  harness a3 --site <dir> [--kaizen kaizen/] [--noise-history f] [--scoreboard f] [--mutants f] [--github f | --fetch-github] [--json]
      The A3 Aggregator (since 1.14.0): one Lean A3 from every kept run under --site (each stream's reports/index.json and
      the reports beside it), the kaizen register, the noise history and, with --fetch-github (GITHUB_TOKEN or GH_TOKEN),
      the value stream workflows' history on GitHub. Writes a3.html and a3.json (and github.json when it asked GitHub)
      into --site: the Gate and the RCS as confidence.json has them, a value stream map, Paretos of the unclaimed
      differences, the line stops, the confidence lost and the change risk, the root cause questions with the 5 Whys that
      answer them, and the countermeasures, plan and follow-up. Since 1.18.0 the quality strip under the Gate: Speed,
      Metrics and Tests, within reason, look or not measured (--mutants, default mutants.jsonl beside --scoreboard, is the
      weekly self-test Tests reads). What it cannot read is said to be not measured. Advisory: never an input to the Gate,
      a verdict or an exit code. Exit 0 when written, 2 for what it cannot read. Not stable.
  harness readiness --site <dir> [--github f] [--mutants f] [--releases f | --fetch-releases] [--json]
      The overnight readiness page (since 1.17.0): one row per night (UTC) for the last ten nights, newest on top, from
      the Main to RC forecasts under --site (main-preview/reports/index.json and the reports beside it): the commit
      judged, the Gate, the unclaimed count, what is new and gone since the previous forecast, and links to the kept
      report and its rehearsals. A night that kept nothing is read from the workflow history (github.json in the site, as
      harness a3 --fetch-github writes it, or --github): unchanged since a commit (a skipped pair, in grey), did not run,
      or not known without it. Since 1.18.0 each row carries the quality marks (Speed, Metrics, Tests; --mutants is the
      weekly mutants record) and the latest forecast the whole strip. Since 1.19.0 the page leads with the release-size
      control chart: each past release of the monorepo in merged PRs, its XmR limits (centre, UCL, LCL; provisional
      under 10 releases), and the PRs on main not yet released against the WIP limit, named in words (below the centre
      line, a good time to release, release now), with the count night by night. --fetch-releases asks GitHub (GITHUB_TOKEN
      or GH_TOKEN) for the release sizes and writes releases.json into --site; --releases reads one. Writes
      readiness.html and readiness.json into --site. Advisory: never an input to the Gate, a verdict or an exit code. Exit 0 when written, 2 for what it cannot
      read. Not stable.
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
  const help = helpFor(argv, USAGE);
  if (help) {
    (help.code === 0 ? console.log : console.error)(help.text);
    return help.code;
  }
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
      rules: { type: "string" },
      vex: { type: "string" },
      a2: { type: "boolean" },
      "a-digests": { type: "string" },
      "b-digests": { type: "string" },
      deployed: { type: "string" },
      "deployed-digests": { type: "string" },
      "release-record": { type: "string" },
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
      "older-than-days": { type: "string" },
      "keep-last": { type: "string" },
      "keep-days": { type: "string" },
      "image-cache-days": { type: "string" },
      candidate: { type: "string" },
      baseline: { type: "string" },
      monorepo: { type: "string" },
      run: { type: "string" },
      migration: { type: "string" },
      upgrade: { type: "string" },
      "test-signal": { type: "string" },
      traceability: { type: "string" },
      "change-risk": { type: "string" },
      "post-deploy": { type: "string" },
      history: { type: "string" },
      changelog: { type: "string" },
      file: { type: "string" },
      mutants: { type: "string" },
      "noise-history": { type: "string" },
      site: { type: "string" },
      scoreboard: { type: "string" },
      item: { type: "string" },
      mark: { type: "string" },
      by: { type: "string" },
      note: { type: "string" },
      finding: { type: "string" },
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
      yes: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      "no-load": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      open: { type: "boolean", default: false },
      fast: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      write: { type: "boolean", default: false },
      kaizen: { type: "string" },
      github: { type: "string" },
      "fetch-github": { type: "boolean", default: false },
      // Since 1.19.0: harness readiness reads the monorepo's release sizes (--releases) or asks GitHub for them (--fetch-releases).
      releases: { type: "string" },
      "fetch-releases": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false }
    },
    allowNegative: true
  });

  if (command === "version") {
    const info = harnessInfo();
    console.log(values.json ? JSON.stringify(info) : `harness ${info.version} (${info.gitSha ?? "no git sha"}) · contract ${info.contractVersion}`);
    return 0;
  }

  // An unknown name in HARNESS_REQUIRE_ARTEFACTS would quietly require less than the operator meant: refuse it before anything runs.
  if (command === "run" || command === "compare" || command === "mutants") requirements(process.env);

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
  const aDigests = parseDigests(values["a-digests"], "--a-digests");
  const bDigests = parseDigests(values["b-digests"], "--b-digests");
  const common = {
    ...defaults,
    ...(aDigests ? { aDigests } : {}),
    ...(bDigests ? { bDigests } : {}),
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
    const side = sideSpec(name, pinImages(imagesFor(spec, common.imagePrefix), name === "a" ? aDigests : bDigests, `--${name}-digests`));
    side.provenance = resolveSideProvenance(side.images, { exec: realExec, ledger: fileLedger(), policy: trustPolicyFromEnv(process.env, common.allowUnsigned), log: common.log });
    return side;
  };

  switch (command) {
    case "run": {
      const m = mode(values.mode);
      if (m !== "post-deploy" && (!values.a || !values.b)) fail("run needs --a and --b");
      const deployed = parseDeployed(values.deployed, values["deployed-digests"], values["release-record"], m);
      const outcome = await run({
        ...common,
        ...(deployed ? { deployed } : {}),
        mode: m,
        a: values.a ?? "recorded",
        b: values.b ?? "production",
        ...(values.claims ? { claimsFile: resolve(values.claims) } : {}),
        ...(values.rules ? { rules: rulesWhere(values.rules) } : {}),
        ...(values.vex ? { vexFile: resolve(values.vex) } : {}),
        ...(values.a2 ? { a2: true } : {}),
        ...(noise(m) ? { noise: noise(m)! } : {})
      });
      printOutcome(outcome.report.verdict, outcome.report.reasons, outcome.files);
      recordAppliedOverride(outcome.report, outcome.outDir);
      return exitCodeForReport(outcome.report);
    }
    case "compare": {
      if (!values.dir) fail("compare needs --dir <run directory containing a/ and b/>");
      const dir = resolve(values.dir);
      const a2Capture = loadA2Capture(dir);
      const outcome = compareFromCaptures({
        mode: mode(values.mode),
        substrate: common.substrate,
        captureDir: dir,
        a: loadCapture(dir, "a"),
        b: loadCapture(dir, "b"),
        ...(a2Capture ? { a2: a2Capture } : {}),
        claims: values.claims ? loadClaims(resolve(values.claims), values.rules ? await loadRules(rulesWhere(values.rules)) : undefined) : [],
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
          { spec: values.a, ...(aDigests ? { digests: aDigests } : {}), ...(values["ref-a"] ? { ref: values["ref-a"] } : {}) },
          { spec: values.b, ...(bDigests ? { digests: bDigests } : {}), ...(values["ref-b"] ? { ref: values["ref-b"] } : {}) }
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
      // Before anything is inspected or started: a cluster called tutors-harness is not this checkout's to touch.
      try {
        refuseLegacyCluster(CLUSTER);
      } catch (e) {
        fail(e instanceof Error ? e.message : String(e));
      }
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
    case "vuln-db":
      return vulnDbCommand(positionals[0], values);
    case "noise":
      return noiseCommand(positionals[0], values);
    case "guard":
      return guardCommand(positionals[0], values);
    case "override":
      return overrideCommand(positionals[0], values);
    case "prune":
      return pruneCommand(values);
    case "reports":
      return reportsCommand(positionals[0], values);
    case "scorecard":
      return scorecardCommand(values);
    case "preview":
      if (positionals[0] !== "resolve") fail("preview resolve [--a <production>] [--b <candidate>] [--force]");
      return previewResolve(values);
    case "local":
      return localCommand(positionals[0], values);
    case "release":
      return releaseCommand(values);
    case "confidence":
      return confidenceCommand(values);
    case "changes":
      return changesCommand(values);
    case "scoreboard":
      return scoreboardCommand(positionals[0], values);
    case "glance":
      return glanceCommand(positionals[0], values);
    case "why":
      return whyCommand(positionals[0], positionals.slice(1), values);
    case "a3":
      return a3Command(values);
    case "readiness":
      return readinessCommand(values);
    case "journeys":
      for (const j of journeys) console.log(`${j.name.padEnd(34)} set=${j.set.padEnd(9)} ${j.anonymous ? "anonymous" : "signed-in"}`);
      return 0;
    default:
      fail(`unknown command "${command}"\n${USAGE}`);
  }
}

/** `--rules` is a URL as given, or a path from where the command was run. */
const rulesWhere = (where: string) => (isUrl(where) ? where : resolve(where));

/** `--deployed`, `--deployed-digests`, `--release-record`: post-deploy only. A tag names a file in the store, so it must be a tag and nothing else. */
function parseDeployed(tag: string | undefined, digests: string | undefined, record: string | undefined, m: Mode) {
  const production = tag?.trim() || undefined;
  const reported = parseDigests(digests, "--deployed-digests") ?? {};
  if (!production && !Object.keys(reported).length && !record) return undefined;
  if (m !== "post-deploy") fail("--deployed, --deployed-digests and --release-record belong to --mode post-deploy");
  if (production && !isTag(production)) fail(`--deployed takes the tag that was deployed (e.g. 16.3.0), not "${production}"`);
  return { ...(production ? { production } : {}), digests: reported, ...(record ? { record } : {}) };
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
    // A usage error of the local commands, or digests that are not digests: the message, not a stack.
    // A claims or rules file that cannot be used: which file, which claim, which field, what is wrong; no stack.
    if (error instanceof UsageError || error instanceof DigestError || error instanceof InputFileError || error instanceof RequirementError) {
      console.error(error.message);
      process.exit(2);
    }
    // A flag the command does not take, or one missing its value: the flag and where the usage is, not a Node stack.
    const flagError = parseArgsErrorText(error, process.argv.slice(2));
    if (flagError) {
      console.error(flagError);
      process.exit(2);
    }
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exit(2);
  }
);
