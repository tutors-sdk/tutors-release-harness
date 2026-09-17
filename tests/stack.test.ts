import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { COMPOSE_FILE, ROOT, externalSide, imagesFor, sideSpec, urlsFor } from "../src/stack.ts";
import { loadMutants } from "../src/mutants.ts";
import { kindSide, manifestsFor } from "../src/substrate/kind.ts";

describe("image references", () => {
  it("a bare tag expands to all three apps under the prefix", () => {
    expect(imagesFor("16.2.0", "tutors")).toEqual({ reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0" });
    expect(imagesFor("16.2.0", "ghcr.io/tutors-sdk/tutors").reader).toBe("ghcr.io/tutors-sdk/tutors/reader:16.2.0");
  });

  it("one app's full reference replaces that app only", () => {
    const images = imagesFor("tutors-harness/mutant-route-500:latest", "tutors");
    expect(images.catalogue).toBe("tutors/catalogue:latest");
    expect(images.reader).toBe("tutors/reader:latest");
    expect(imagesFor("tutors/reader:16.2.0", "tutors")).toEqual({ reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0" });
  });

  it("app=image pairs set each app and must be complete", () => {
    expect(imagesFor("reader=r:1,catalogue=c:1,live=l:1", "tutors")).toEqual({ reader: "r:1", catalogue: "c:1", live: "l:1" });
    expect(() => imagesFor("reader=r:1", "tutors")).toThrow(/missing catalogue, live/);
  });

  it("an external side takes live URLs and has no stubs", () => {
    const side = externalSide("b", "reader=https://tutors.dev/,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev", "reference-course.netlify.app");
    expect(side.external).toBe(true);
    expect(side.urls.reader).toBe("https://tutors.dev");
    expect(side.urls.readerAuth).toBeUndefined();
    expect(side.urls.persistence).toBeUndefined();
    expect(() => externalSide("b", "reader=https://x", "c")).toThrow(/missing catalogue, live/);
  });
});

describe("compose.harness.yaml", () => {
  const compose = parse(readFileSync(COMPOSE_FILE, "utf8"), { merge: true }) as { services: Record<string, Record<string, unknown>> };
  const apps = ["reader", "catalogue", "live", "reader-auth"];

  it("has both sides for every app, a persistence stub per side, and the shared fixtures", () => {
    const expected = [...apps.flatMap((app) => [`${app}-a`, `${app}-b`]), "persistence-a", "persistence-b", "course", "identity", "edge"].sort();
    expect(Object.keys(compose.services).sort()).toEqual(expected);
  });

  it("the two sides differ only in image, ports and the URLs that name the side", () => {
    for (const app of apps) {
      const a = compose.services[`${app}-a`]!;
      const b = compose.services[`${app}-b`]!;
      const strip = (s: Record<string, unknown>) => {
        const { image: _i, ports: _p, environment, depends_on: _d, ...rest } = s;
        const { ORIGIN: _o, PUBLIC_SUPABASE_URL: _s, HARNESS_PERSISTENCE_URL: _h, ...env } = environment as Record<string, unknown>;
        return { ...rest, environment: env };
      };
      expect(strip(a), app).toEqual(strip(b));
    }
  });

  it("apps are hardened the way production runs them", () => {
    for (const name of ["reader-a", "reader-b", "catalogue-a", "live-b", "reader-auth-a", "reader-auth-b"]) {
      const s = compose.services[name]!;
      expect(s.read_only).toBe(true);
      expect(s.cap_drop).toEqual(["ALL"]);
      expect(s.healthcheck).toBeDefined();
    }
  });

  it("the signed-in readers trust the test CA and resolve github.com to the identity stub", () => {
    for (const side of ["a", "b"]) {
      const s = compose.services[`reader-auth-${side}`]!;
      expect(s.extra_hosts).toContain("github.com:172.29.0.10");
      expect((s.environment as Record<string, string>).NODE_EXTRA_CA_CERTS).toBe("/harness/ca.pem");
      expect((s.environment as Record<string, string>).PUBLIC_SUPABASE_URL).toContain(`persistence-${side}.harness.test`);
    }
    expect((compose.services.identity!.networks as { default: { ipv4_address: string } }).default.ipv4_address).toBe("172.29.0.10");
  });

  it("the edge proxy is only part of the upgrade profile", () => {
    expect(compose.services.edge!.profiles).toEqual(["upgrade"]);
  });

  it("urls match the compose ports", () => {
    expect(urlsFor("a")).toEqual({
      reader: "http://localhost:3100",
      catalogue: "http://localhost:3101",
      live: "http://localhost:3102",
      readerAuth: "http://localhost:3103",
      persistence: "http://persistence-a.harness.test:8090",
      courseId: "localhost:8080"
    });
    expect(urlsFor("b").reader).toBe("http://localhost:3200");
    expect(urlsFor("b").persistence).toBe("http://persistence-b.harness.test:8091");
  });
});

describe("mutants.yaml", () => {
  it("lists eight mutants with expected artefacts and a wrap.mjs case for each", () => {
    const mutants = loadMutants();
    expect(mutants.map((m) => m.name)).toEqual(["dropped-header", "route-500", "console-error", "dom-note", "missing-alt", "slow-ssr", "anon-write", "focus-order"]);
    const wrap = readFileSync(resolve(ROOT, "mutants", "wrap.mjs"), "utf8");
    for (const m of mutants) expect(wrap, `wrap.mjs handles ${m.name}`).toContain(`"${m.name}"`);
  });
});

describe("kind side", () => {
  it("uses its own host ports and drops the compose-only stubs", () => {
    const side = kindSide(sideSpec("b", imagesFor("16.2.0", "tutors")));
    expect(side.urls).toEqual({ reader: "http://localhost:4200", catalogue: "http://localhost:4201", live: "http://localhost:4202", courseId: "localhost:8080" });
  });
});

describe("kind manifests", () => {
  const docs = manifestsFor("a", { name: "a", images: imagesFor("16.2.0", "tutors"), urls: urlsFor("a") }, "2026-09-16T09:05:00.000Z")
    .split(/^---$/m)
    .map((d) => parse(d) as Record<string, unknown>)
    .filter((d) => d && d.kind);

  it("enforce the restricted pod security standard on the namespace", () => {
    const ns = docs.find((d) => d.kind === "Namespace")!;
    expect((ns.metadata as { labels: Record<string, string> }).labels["pod-security.kubernetes.io/enforce"]).toBe("restricted");
  });

  it("carry the monorepo's security context on every container and publish the compose ports", () => {
    const deployments = docs.filter((d) => d.kind === "Deployment");
    expect(deployments).toHaveLength(3);
    for (const d of deployments) {
      const spec = (d.spec as { template: { spec: Record<string, unknown> } }).template.spec;
      const env = ((spec.containers as Record<string, unknown>[])[0]!.env as { name: string; value: string }[]).find((e) => e.name === "ORIGIN")!;
      expect(env.value).toMatch(/^http:\/\/localhost:410\d$/);
      const container = (spec.containers as Record<string, unknown>[])[0]!;
      expect((spec.securityContext as Record<string, unknown>).runAsNonRoot).toBe(true);
      expect((container.securityContext as Record<string, unknown>).readOnlyRootFilesystem).toBe(true);
      expect((container.securityContext as { capabilities: { drop: string[] } }).capabilities.drop).toEqual(["ALL"]);
      expect((container.securityContext as Record<string, unknown>).allowPrivilegeEscalation).toBe(false);
    }
    const services = docs.filter((d) => d.kind === "Service").map((d) => (d.spec as { ports: { nodePort: number }[] }).ports[0]!.nodePort);
    expect(services.sort()).toEqual([30100, 30101, 30102]);
  });
});
