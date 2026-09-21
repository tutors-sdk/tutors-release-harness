/**
 * docs/monorepo/ holds reference copies of the two monorepo workflows the
 * harness depends on. The monorepo's own files are the source of truth, so
 * these tests do not compare the copies byte for byte; they hold the contract
 * points the harness relies on (names, tags, signing identity) to what the
 * harness actually does, so a copy that drifts from the code fails here, and
 * the naming decision (quay.io/tutors-sdk/tutors-<app>) cannot be half applied.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_COSIGN_IDENTITY, DEFAULT_COSIGN_ISSUER } from "../src/images.ts";
import { APPS, QUAY_IMAGE_TEMPLATE, imageRepo } from "../src/image-ref.ts";

const ROOT = resolve(import.meta.dirname, "..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");

const publish = read("docs/monorepo/publish-images.yml");
const dispatch = read("docs/monorepo/release-dispatch.yml");

/** The workflow file the default identity names, e.g. `image-build.yml`. */
const IDENTITY_WORKFLOW = /workflows\/([\w-]+\.yml)/.exec(DEFAULT_COSIGN_IDENTITY.replaceAll("\\", ""))![1]!;

describe("the naming decision: quay.io/tutors-sdk/tutors-<app>", () => {
  it("the default template expands to the repositories the publish workflow pushes", () => {
    const registry = /REGISTRY:\s*(\S+)/.exec(publish)![1]!;
    const namespace = /NAMESPACE:\s*(\S+)/.exec(publish)![1]!;
    expect(publish).toContain("${{ env.REGISTRY }}/${{ env.NAMESPACE }}/tutors-${{ matrix.app }}");
    const matrix = /app:\s*\[([^\]]+)\]/.exec(publish)![1]!.split(",").map((s) => s.trim());
    // The workflow builds `time` too; the harness stacks the three it compares.
    for (const app of APPS) {
      expect(matrix).toContain(app);
      expect(imageRepo(QUAY_IMAGE_TEMPLATE, app)).toBe(`${registry}/${namespace}/tutors-${app}`);
    }
  });

  it("the release-dispatch reference waits for the same repositories", () => {
    const prefix = /IMAGE_PREFIX:\s*(\S+)/.exec(dispatch)![1]!;
    for (const app of APPS) expect(`${prefix}${app}`).toBe(imageRepo(QUAY_IMAGE_TEMPLATE, app));
    expect(/IMAGE_WORKFLOW:\s*(\S+)/.exec(dispatch)![1]).toBe(IDENTITY_WORKFLOW);
  });

  it("no ghcr.io or nested tutors/<app> registry path survives anywhere the harness documents or configures images", () => {
    const files = ["README.md", "compose.harness.yaml", "TESTING.md", ...walk("docs"), ...walk("deploy"), ...walk("scripts"), ...walk(".github")];
    for (const file of files) {
      const text = read(file);
      expect(text, file).not.toMatch(/ghcr\.io/);
      expect(text, file).not.toMatch(/quay\.io\/[\w-]+\/tutors\/(reader|catalogue|live|time)/);
    }
  });
});

describe("the publish reference copy states what the harness verifies", () => {
  it("is named as the workflow the signing identity names, and says so", () => {
    expect(publish).toContain(`.github/workflows/${IDENTITY_WORKFLOW}`);
    // The header quotes the identity regular expression the harness enforces.
    expect(publish).toContain(DEFAULT_COSIGN_IDENTITY);
  });

  it("signs the pushed digest keyless, with an OIDC token, and proves the exact check the harness runs", () => {
    expect(publish).toMatch(/id-token:\s*write/);
    expect(publish).toMatch(/cosign sign --yes "\$IMAGE"/);
    expect(publish).toContain("@${{ steps.build.outputs.digest }}");
    expect(publish).toContain(DEFAULT_COSIGN_ISSUER);
    // `cosign verify --certificate-identity-regexp` in the workflow is the harness's default, with the repository filled in.
    const prove = /--certificate-identity-regexp '([^']+)'/.exec(publish)![1]!.replace("${{ github.repository }}", "tutors-sdk/tutors-mono-repo");
    expect(prove).toBe(DEFAULT_COSIGN_IDENTITY);
  });

  it("tags what docs/images.md says: sha, main, X.Y.Z, X.Y and latest only on a release tag", () => {
    expect(publish).toContain("type=sha,prefix=sha-,format=short");
    expect(publish).toContain("type=ref,event=branch");
    expect(publish).toContain("type=semver,pattern={{version}}");
    expect(publish).toContain("type=semver,pattern={{major}}.{{minor}}");
    expect(publish).toMatch(/type=raw,value=latest,enable=\$\{\{ startsWith\(github\.ref, 'refs\/tags\/v'\) && !contains\(github\.ref_name, '-'\) \}\}/);
    expect(publish).toContain("latest=false");
  });

  it("builds multi-arch and attaches an SPDX SBOM attestation", () => {
    expect(publish).toContain("linux/amd64,linux/arm64");
    expect(publish).toMatch(/cosign attest --yes --type spdxjson/);
  });
});

function walk(dir: string): string[] {
  return readdirSync(resolve(ROOT, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(resolve(ROOT, path)).isDirectory() ? walk(path) : [relative(".", path).replaceAll("\\", "/")];
  });
}
