/**
 * The bash that runs scripts/build-images.sh and scripts/fetch-migrations.sh.
 *
 * `bash` on the PATH, unless HARNESS_BASH names one. On Windows the first `bash`
 * on PATH is often C:\Windows\System32\bash.exe (or the WindowsApps stub): WSL's
 * launcher, which cannot read D:\ paths and, without a distribution installed,
 * fails outright. Set HARNESS_BASH to Git Bash's ("C:\Program Files\Git\bin\bash.exe");
 * `harness doctor` says when that is the case.
 */
export const bashCommand = (env: NodeJS.ProcessEnv = process.env): string => env.HARNESS_BASH?.trim() || "bash";
