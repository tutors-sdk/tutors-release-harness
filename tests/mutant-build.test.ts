/**
 * The two image-level mutants (R5) and how they are built: through the injected
 * runner, so no test here starts Docker. What proves the harness catches them
 * is `pnpm harness mutants` (Docker, weekly); what is proved here is that they
 * are built the way mutants.yaml says, and that a base-swap that swapped nothing
 * is refused rather than passed off as a planted fault.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { diffManifest, diffSbom } from "../src/compare/image-static.ts";
import { packagesFromSpdx } from "../src/image-static/sbom.ts";
import type { Exec } from "../src/images.ts";
import { DEFAULT_ALT_BASE, MUTANT_KINDS, baseSwapDockerfile, buildMutantImage } from "../src/mutant-build.ts";
import { loadMutants } from "../src/mutants.ts";
import { DEFAULT_MASKS_FILE, loadMasks } from "../src/normalise/masks.ts";
import { D, manifest, spdx, staticSide, withStatic } from "./support/image-static.ts";

const ROOT = resolve(import.meta.dirname, "..");
const BASE = "quay.io/tutors-sdk/tutors-reader:16.2.0";
const CONFIG = { WorkingDir: "/app", User: "1001", Entrypoint: null, Cmd: ["node", "build/index.js"], ExposedPorts: { "3000/tcp": {} }, Env: ["NODE_ENV=production", "PATH=/usr/local/bin:/usr/bin", "GREETING=cost $5"] };

function docker(layersAfter: string[], opts: { failBuild?: boolean } = {}) {
  const calls: string[][] = [];
  const written: Record<string, string> = {};
  const exec: Exec = (cmd, args) => {
    calls.push([cmd, ...args]);
    if (cmd !== "docker") throw new Error(`unexpected ${cmd}`);
    if (args[0] === "build") return opts.failBuild ? { status: 1, stdout: "", stderr: "boom" } : { status: 0, stdout: "sha256:x\n", stderr: "" };
    if (args[0] === "image" && args[1] === "inspect") {
      const ref = args.at(-1)!;
      return { status: 0, stdout: JSON.stringify({ Config: CONFIG, RootFS: { Layers: ref === BASE ? [D("b"), D("c")] : layersAfter } }), stderr: "" };
    }
    throw new Error(`unexpected docker ${args.join(" ")}`);
  };
  const files = { write: (name: string, content: string) => ((written[name] = content), `/tmp/${name}`) };
  return { exec, calls, written, ctx: { exec, files, mutantsDir: "/repo/mutants", altBase: DEFAULT_ALT_BASE, log: () => {} } };
}

describe("mutants.yaml", () => {
  it("lists ten mutants: the eight edge faults, then the two that change what the image is", () => {
    const mutants = loadMutants();
    expect(mutants.map((m) => `${m.name}:${m.kind}:${m.expect.join("+")}`)).toEqual([
      "dropped-header:edge:headers",
      "route-500:edge:network+dom",
      "console-error:edge:console",
      "dom-note:edge:dom",
      "missing-alt:edge:axe",
      "slow-ssr:edge:timing",
      "anon-write:edge:persistence",
      "focus-order:edge:focus",
      "base-swap:base-swap:image-manifest",
      "added-package:planted-package:sbom"
    ]);
    expect(mutants).toHaveLength(10);
    for (const m of mutants) expect(MUTANT_KINDS).toContain(m.kind);
  });

  it("every edge mutant has a wrap.mjs case, and every other kind has what it builds from", () => {
    const wrap = readFileSync(resolve(ROOT, "mutants", "wrap.mjs"), "utf8");
    for (const m of loadMutants().filter((m) => m.kind === "edge")) expect(wrap, `wrap.mjs handles ${m.name}`).toContain(`"${m.name}"`);
    expect(existsSync(resolve(ROOT, "mutants", "Dockerfile.planted-package"))).toBe(true);
    const planted = JSON.parse(readFileSync(resolve(ROOT, "mutants", "planted-package", "harness-planted-package", "package.json"), "utf8"));
    expect(planted).toMatchObject({ name: "harness-planted-package", version: "9.9.9" });
  });
});

describe("building a mutant", () => {
  it("an edge mutant is built exactly as before: the wrapper over the base", () => {
    const d = docker([]);
    expect(buildMutantImage({ name: "dropped-header", kind: "edge" }, BASE, "tutors-harness/mutant-dropped-header:latest", d.ctx)).toBe("tutors-harness/mutant-dropped-header:latest");
    expect(d.calls).toEqual([["docker", "build", "-q", "--build-arg", `BASE=${BASE}`, "-t", "tutors-harness/mutant-dropped-header:latest", "-f", join("/repo/mutants", "Dockerfile"), "--build-arg", "MUTANT=dropped-header", "/repo/mutants"]]);
  });

  it("the added-package mutant is the production image plus a COPY of one npm package, needing no root and no network", () => {
    const d = docker([]);
    buildMutantImage({ name: "added-package", kind: "planted-package" }, BASE, "img", d.ctx);
    expect(d.calls[0]).toEqual(["docker", "build", "-q", "--build-arg", `BASE=${BASE}`, "-t", "img", "-f", join("/repo/mutants", "Dockerfile.planted-package"), "/repo/mutants"]);
    const dockerfile = readFileSync(resolve(ROOT, "mutants", "Dockerfile.planted-package"), "utf8");
    expect(dockerfile).toMatch(/^FROM \$\{BASE\}$/m);
    expect(dockerfile).toMatch(/^COPY --chown=1001:0 planted-package\/ \.\/node_modules\/$/m);
    expect(dockerfile).not.toMatch(/^(USER|RUN|ENV|CMD|ENTRYPOINT)/m);
  });

  it("the base-swap mutant lays the production filesystem over another base and restates production's configuration, and nothing else", () => {
    const d = docker([D("e"), D("c")]);
    buildMutantImage({ name: "base-swap", kind: "base-swap" }, BASE, "img", d.ctx);
    expect(d.written["Dockerfile.base-swap"]).toBe(
      [
        `FROM ${BASE} AS production`,
        `FROM ${DEFAULT_ALT_BASE}`,
        "COPY --from=production / /",
        'ENV NODE_ENV="production"',
        'ENV PATH="/usr/local/bin:/usr/bin"',
        'ENV GREETING="cost \\$5"',
        "WORKDIR /app",
        "EXPOSE 3000/tcp",
        "USER 1001",
        'CMD ["node","build/index.js"]',
        ""
      ].join("\n")
    );
    expect(d.calls.find((c) => c[1] === "build")).toEqual(["docker", "build", "-q", "--build-arg", `BASE=${BASE}`, "-t", "img", "-f", "/tmp/Dockerfile.base-swap", "/repo/mutants"]);
    expect(baseSwapDockerfile(BASE, "debian:12", { ...CONFIG, Entrypoint: ["/tini", "--"] })).toContain('ENTRYPOINT ["/tini","--"]');
  });

  it("a base-swap that kept the production base's lowest layer is refused, not passed off as a mutant", () => {
    const d = docker([D("b"), D("c")]);
    expect(() => buildMutantImage({ name: "base-swap", kind: "base-swap" }, BASE, "img", d.ctx)).toThrow(/shares its lowest layer.*HARNESS_MUTANT_ALT_BASE/);
  });

  it("a failed build is an error with the tail of docker's stderr", () => {
    expect(() => buildMutantImage({ name: "added-package", kind: "planted-package" }, BASE, "img", docker([], { failBuild: true }).ctx)).toThrow(/mutant added-package exited 1: boom/);
  });
});

describe("what the harness must say about each image-level mutant (the unit-level stand-in for the Docker run)", () => {
  const masks = loadMasks(DEFAULT_MASKS_FILE);

  it("a candidate built FROM a different base is attributed to image-manifest (scope <app>/base), on that app only", () => {
    const b = staticSide();
    b.reader.manifest = { ok: true, data: manifest({ bottomLayer: D("e") }) };
    const hunks = compareCaptures(withStatic("a", staticSide()), withStatic("b", b), masks).filter((h) => h.severity === "fail");
    expect(hunks.map((h) => `${h.artefact} ${h.scope}`)).toEqual(["image-manifest reader/base"]);
  });

  it("a candidate that adds a package is attributed to sbom (scope <app>/harness-planted-package), and to nothing else that fails", () => {
    const planted = { ...packagesFromSpdx(spdx([["express", "4.19.2"], ["openssl", "3.0.14"]])), "harness-planted-package@9.9.9": 1 };
    const b = staticSide({ packages: planted });
    const fails = compareCaptures(withStatic("a", staticSide()), withStatic("b", b), masks).filter((h) => h.severity === "fail");
    expect(new Set(fails.map((h) => h.artefact))).toEqual(new Set(["sbom"]));
    expect(fails.map((h) => h.scope)).toEqual(["reader/harness-planted-package", "catalogue/harness-planted-package", "live/harness-planted-package"]);
    expect(diffSbom("reader", { source: "generated", packages: packagesFromSpdx(spdx([["express", "4.19.2"], ["openssl", "3.0.14"]])) }, { source: "generated", packages: planted })[0]!.summary).toBe("reader: package added: harness-planted-package@9.9.9");
    // And the manifest engine says nothing about a package that is only on disk.
    expect(diffManifest("reader", manifest(), manifest())).toEqual([]);
  });
});
