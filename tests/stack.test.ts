import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { APPS } from "../src/image-ref.ts";
import { COMPOSE_FILE, externalSide, imagesFor, sideSpec, urlsFor } from "../src/stack.ts";
import { kindSide, manifestsFor } from "../src/substrate/kind.ts";

describe("image references", () => {
  it("a bare tag expands to all four apps under the prefix", () => {
    expect(imagesFor("16.2.0", "tutors")).toEqual({ reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0", time: "tutors/time:16.2.0" });
    expect(imagesFor("16.2.0", "quay.io/tutors-sdk/tutors-{app}").reader).toBe("quay.io/tutors-sdk/tutors-reader:16.2.0");
  });

  it("one app's full reference replaces that app only", () => {
    const images = imagesFor("tutors-harness/mutant-route-500:latest", "tutors");
    expect(images.catalogue).toBe("tutors/catalogue:latest");
    expect(images.reader).toBe("tutors/reader:latest");
    expect(imagesFor("tutors/reader:16.2.0", "tutors")).toEqual({ reader: "tutors/reader:16.2.0", catalogue: "tutors/catalogue:16.2.0", live: "tutors/live:16.2.0", time: "tutors/time:16.2.0" });
  });

  it("app=image pairs set each app and must be complete", () => {
    expect(imagesFor("reader=r:1,catalogue=c:1,live=l:1,time=t:1", "tutors")).toEqual({ reader: "r:1", catalogue: "c:1", live: "l:1", time: "t:1" });
    expect(() => imagesFor("reader=r:1", "tutors")).toThrow(/missing catalogue, live/);
  });

  it("an external side takes live URLs and has no stubs", () => {
    const side = externalSide("b", "reader=https://tutors.dev/,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev", "reference-course.netlify.app");
    expect(side.external).toBe(true);
    expect(side.urls.reader).toBe("https://tutors.dev");
    expect(side.urls.readerAuth).toBeUndefined();
    expect(side.urls.persistence).toBeUndefined();
    expect(() => externalSide("b", "reader=https://x", "c")).toThrow(/missing catalogue, live/);
    // time is optional: a HARNESS_PRODUCTION_URLS written for 1.2 keeps working, and names no image for it
    expect(side.urls.time).toBeUndefined();
    expect(side.images.time).toBe("-");
    const withTime = externalSide("b", "reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev,time=https://time.tutors.dev/", "c");
    expect(withTime.urls.time).toBe("https://time.tutors.dev");
    expect(withTime.images.time).toBe("external:https://time.tutors.dev/");
  });
});

describe("compose.harness.yaml", () => {
  const compose = parse(readFileSync(COMPOSE_FILE, "utf8"), { merge: true }) as { services: Record<string, Record<string, unknown>> };
  const apps = [...APPS, "reader-auth"];

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

  it("every app the monorepo ships is in the stack, on both sides: the harness's APPS and compose agree", () => {
    for (const app of APPS) {
      expect(compose.services[`${app}-a`], `${app}-a`).toBeDefined();
      expect(compose.services[`${app}-b`], `${app}-b`).toBeDefined();
    }
    expect([...APPS]).toEqual(["reader", "catalogue", "live", "time"]);
  });

  it("time is run exactly as catalogue and live are: same hardening, healthcheck and environment, only the image and the port differ", () => {
    const strip = (s: Record<string, unknown>) => {
      const { image: _i, ports: _p, environment, ...rest } = s;
      const { ORIGIN: _o, ...env } = environment as Record<string, unknown>;
      return { ...rest, environment: env };
    };
    for (const side of ["a", "b"]) {
      expect(strip(compose.services[`time-${side}`]!), side).toEqual(strip(compose.services[`live-${side}`]!));
      expect(strip(compose.services[`time-${side}`]!), side).toEqual(strip(compose.services[`catalogue-${side}`]!));
      // the app listens on 3000 in its container, like the others; the host port is the one the harness reads
      expect(compose.services[`time-${side}`]!.ports).toEqual([`\${TIME_PORT_${side.toUpperCase()}:-${side === "a" ? 3104 : 3204}}:3000`]);
      expect(compose.services[`time-${side}`]!.image).toBe(`\${TIME_IMAGE_${side.toUpperCase()}:-tutors/time:local}`);
    }
  });

  it("no host port is published twice", () => {
    const published = Object.values(compose.services).flatMap((s) => ((s.ports as string[] | undefined) ?? []).map((p) => /^"?\$\{[A-Z_]+:-(\d+)\}/.exec(p)?.[1]));
    expect(published.filter(Boolean).length).toBeGreaterThan(8);
    expect(new Set(published).size).toBe(published.length);
  });

  it("apps are hardened the way production runs them", () => {
    for (const name of ["reader-a", "reader-b", "catalogue-a", "live-b", "time-a", "time-b", "reader-auth-a", "reader-auth-b"]) {
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
      time: "http://localhost:3104",
      readerAuth: "http://localhost:3103",
      persistence: "http://persistence-a.harness.test:8090",
      courseId: "localhost:8080"
    });
    expect(urlsFor("b").reader).toBe("http://localhost:3200");
    expect(urlsFor("b").time).toBe("http://localhost:3204");
    expect(urlsFor("b").persistence).toBe("http://persistence-b.harness.test:8091");
  });
});

// The mutants catalogue (ten: eight edge faults and two image-level ones) is tested in tests/mutant-build.test.ts.

describe("kind side", () => {
  it("uses its own host ports and drops the compose-only stubs", () => {
    const side = kindSide(sideSpec("b", imagesFor("16.2.0", "tutors")));
    expect(side.urls).toEqual({ reader: "http://localhost:4200", catalogue: "http://localhost:4201", live: "http://localhost:4202", time: "http://localhost:4203", courseId: "localhost:8080" });
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
    expect(deployments).toHaveLength(4);
    expect(deployments.map((d) => (d.metadata as { name: string }).name)).toEqual([...APPS]);
    for (const d of deployments) {
      const spec = (d.spec as { template: { spec: Record<string, unknown> } }).template.spec;
      const env = ((spec.containers as Record<string, unknown>[])[0]!.env as { name: string; value: string }[]).find((e) => e.name === "ORIGIN")!;
      expect(env.value).toMatch(/^http:\/\/localhost:410[0-3]$/);
      const container = (spec.containers as Record<string, unknown>[])[0]!;
      expect((spec.securityContext as Record<string, unknown>).runAsNonRoot).toBe(true);
      expect((container.securityContext as Record<string, unknown>).readOnlyRootFilesystem).toBe(true);
      expect((container.securityContext as { capabilities: { drop: string[] } }).capabilities.drop).toEqual(["ALL"]);
      expect((container.securityContext as Record<string, unknown>).allowPrivilegeEscalation).toBe(false);
    }
    const services = docs.filter((d) => d.kind === "Service").map((d) => (d.spec as { ports: { nodePort: number }[] }).ports[0]!.nodePort);
    expect(services.sort()).toEqual([30100, 30101, 30102, 30103]);
  });

  it("time is a Deployment with the same probes, ports and origin as the others, and its own NodePort", () => {
    const time = docs.find((d) => d.kind === "Deployment" && (d.metadata as { name: string }).name === "time")!;
    const container = ((time.spec as { template: { spec: { containers: Record<string, unknown>[] } } }).template.spec.containers)[0]!;
    expect(container.image).toBe("tutors/time:16.2.0");
    expect((container.env as { name: string; value: string }[]).find((e) => e.name === "ORIGIN")!.value).toBe("http://localhost:4103");
    for (const probe of ["startupProbe", "livenessProbe", "readinessProbe"]) expect((container[probe] as { httpGet: { path: string } }).httpGet.path, probe).toBe("/healthz/live");
    const service = docs.find((d) => d.kind === "Service" && (d.metadata as { name: string }).name === "time")!;
    expect((service.spec as { ports: { nodePort: number }[]; selector: Record<string, string> }).selector).toEqual({ "app.kubernetes.io/name": "tutors-time" });
  });

  it("kind-config.yaml publishes every NodePort the manifests use, for both sides", () => {
    const config = parse(readFileSync(new URL("../deploy/kind/kind-config.yaml", import.meta.url), "utf8")) as { nodes: { extraPortMappings: { containerPort: number; hostPort: number }[] }[] };
    const mapped = config.nodes[0]!.extraPortMappings.map((m) => [m.containerPort, m.hostPort]).sort();
    expect(mapped).toEqual([[30100, 4100], [30101, 4101], [30102, 4102], [30103, 4103], [30200, 4200], [30201, 4201], [30202, 4202], [30203, 4203]]);
  });
});
