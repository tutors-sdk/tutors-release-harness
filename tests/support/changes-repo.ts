/**
 * A small monorepo in a temporary git repository, for `harness changes`: four releases of history (v1.0.0 to v1.0.4,
 * each touching apps/reader/src/hot.ts, which makes it a hotspot), then the release under test, v1.0.4..v1.1.0:
 *
 *   #10  squash, Ada (known)       hot.ts +20, shared.ts +1, root tests +12  -> churn −5 (reader 23 > 2 × 8), hotspot −3
 *   #11  merge, Newbie (first)     hot.ts +3, shared.ts +1, no tests         -> hotspot −10 (first), tests −10, unreviewed (floor)
 *   #12  squash, Bob (known)       model.ts +300, shared.ts +1, lock: foo 1 -> 2, bar new
 *                                                                            -> ownership −5 (the third author on shared.ts), tests −10, major bump −5
 *   direct commit, Ada             apps/live/README.md                       -> straight to main (floor), orphan diff −10 (Live, no entry)
 *   #13  merge of release/1.1.0    CHANGELOG.md, package.json                -> bookkeeping: nothing
 *   and CHANGELOG.md v1.1.0 names PR #99, which is not between the tags     -> orphan entry −10, on no PR
 *
 * Change risk: 100 − (8 + 20 + 20 + 10 + 10) = 32.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const ADA = { name: "Ada", email: "ada@example.org" };
export const BOB = { name: "Bob", email: "bob@example.org" };
export const NEWBIE = { name: "Newbie", email: "newbie@example.org" };

export function git(cwd: string, args: string[], who = ADA): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" } });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}

const numbered = (n: number, prefix = "line") => Array.from({ length: n }, (_, i) => `export const ${prefix}${i} = ${i};`).join("\n") + "\n";

function lock(deps: Record<string, string>): string {
  const lines = ["lockfileVersion: '9.0'", "", "importers:", "", "  .:", "    dependencies:"];
  for (const [name, v] of Object.entries(deps)) lines.push(`      ${name.startsWith("@") ? `'${name}'` : name}:`, `        specifier: ^${v}`, `        version: ${v}`);
  return `${lines.join("\n")}\n\npackages:\n\n  foo@${deps.foo}:\n    resolution: {integrity: x}\n`;
}

export const CHANGELOG_110 = `# Changelog

## Reader (\`tutors-reader\`)

### v1.1.0 (2026-09)

- Hot path faster (PR #10)
- Hot path fixed (PR #11)
- A feature that never merged (PR #99)

### v1.0.4 (2026-09)

- Older entry (PR #4)

## Shared Packages

### v1.1.0 (2026-09)

- The model grows (PR #12)

## Live (\`tutors-live\`)

### v1.0.0 (2026-08)

- First
`;

export function changesRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "harness-changes-"));
  const put = (path: string, text: string) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  const append = (path: string, text: string) => put(path, readFileSync(join(dir, path), "utf8") + text);
  const commit = (message: string, who = ADA) => {
    git(dir, ["add", "-A"], who);
    git(dir, ["commit", "-q", "-m", message], who);
  };
  git(dir, ["init", "-q", "-b", "main"]);
  put("apps/reader/src/hot.ts", numbered(4, "hot"));
  put("apps/live/src/live.ts", numbered(2, "live"));
  put("packages/jsr/model/src/model.ts", numbered(2, "model"));
  put("packages/jsr/model/src/shared.ts", numbered(1, "shared"));
  put("pnpm-lock.yaml", lock({ foo: "1.2.0" }));
  put("CHANGELOG.md", "# Changelog\n");
  put("package.json", '{ "version": "1.0.0" }\n');
  commit("initial");
  git(dir, ["tag", "v1.0.0"]);
  // four releases, each changing hot.ts by 4 lines (reader churn 4, so a median of 4); Bob is known from the second
  for (const n of [1, 2, 3, 4]) {
    put("apps/reader/src/hot.ts", numbered(4, `hot${n}_`));
    commit(`fix(reader): hot path, again (#${n})`, n === 2 ? BOB : ADA);
    git(dir, ["tag", `v1.0.${n}`]);
  }
  git(dir, ["tag", "v1.1.0-rc.0"]); // not a release: ignored by the history

  // #10: Ada, squash; tests at the root, which count for every package the PR changed
  append("apps/reader/src/hot.ts", numbered(20, "ten"));
  append("packages/jsr/model/src/shared.ts", "export const a = 1;\n");
  put("tests/unit/hot.test.ts", numbered(12, "t"));
  commit("feat(reader): hot path faster (#10)");

  // #11: Newbie's first contribution, merged from a branch with a merge commit
  git(dir, ["checkout", "-q", "-b", "newbie/fix"]);
  append("apps/reader/src/hot.ts", numbered(3, "eleven"));
  append("packages/jsr/model/src/shared.ts", "export const b = 2;\n");
  commit("fix: hot path", NEWBIE);
  git(dir, ["checkout", "-q", "main"]);
  git(dir, ["merge", "-q", "--no-ff", "-m", "Merge pull request #11 from newbie/fix\n\nfix(reader): hot path fixed", "newbie/fix"]);

  // #12: Bob, squash: 300 production lines and no test, a major bump and a new dependency
  append("packages/jsr/model/src/model.ts", numbered(300, "m"));
  append("packages/jsr/model/src/shared.ts", "export const c = 3;\n");
  put("pnpm-lock.yaml", lock({ foo: "2.0.1", bar: "0.3.0" }));
  commit("feat(model): the model grows (#12)", BOB);

  // straight to main
  put("apps/live/README.md", "Live.\n");
  commit("chore: tweak live");

  // #13: the release branch coming back
  git(dir, ["checkout", "-q", "-b", "release/1.1.0"]);
  put("CHANGELOG.md", CHANGELOG_110);
  put("package.json", '{ "version": "1.1.0" }\n');
  commit("chore: release 1.1.0");
  git(dir, ["checkout", "-q", "main"]);
  git(dir, ["merge", "-q", "--no-ff", "-m", "Merge pull request #13 from org/release/1.1.0\n\nRelease 1.1.0", "release/1.1.0"]);
  git(dir, ["tag", "v1.1.0"]);
  return dir;
}
