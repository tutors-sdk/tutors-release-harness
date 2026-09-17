import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { COMPOSE_FILE, ROOT, imagesFor, urlsFor } from "../src/stack.ts";
import { loadMutants } from "../src/mutants.ts";

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
});

describe("compose.harness.yaml", () => {
  const compose = parse(readFileSync(COMPOSE_FILE, "utf8"), { merge: true }) as { services: Record<string, Record<string, unknown>> };

  it("has both sides for every app plus the shared course fixture", () => {
    expect(Object.keys(compose.services).sort()).toEqual(["catalogue-a", "catalogue-b", "course", "live-a", "live-b", "reader-a", "reader-b"]);
  });

  it("the two sides differ only in image and port", () => {
    for (const app of ["reader", "catalogue", "live"]) {
      const a = compose.services[`${app}-a`]!;
      const b = compose.services[`${app}-b`]!;
      const strip = (s: Record<string, unknown>) => {
        const { image: _i, ports: _p, environment, ...rest } = s;
        const { ORIGIN: _o, ...env } = environment as Record<string, unknown>;
        return { ...rest, environment: env };
      };
      expect(strip(a)).toEqual(strip(b));
    }
  });

  it("apps are hardened the way production runs them", () => {
    for (const name of ["reader-a", "reader-b", "catalogue-a", "live-b"]) {
      const s = compose.services[name]!;
      expect(s.read_only).toBe(true);
      expect(s.cap_drop).toEqual(["ALL"]);
      expect(s.healthcheck).toBeDefined();
    }
  });

  it("urls match the compose ports", () => {
    expect(urlsFor("a")).toEqual({ reader: "http://localhost:3100", catalogue: "http://localhost:3101", live: "http://localhost:3102", courseId: "localhost:8080" });
    expect(urlsFor("b").reader).toBe("http://localhost:3200");
  });
});

describe("mutants.yaml", () => {
  it("lists six mutants with expected artefacts and a wrap.mjs case for each", () => {
    const mutants = loadMutants();
    expect(mutants).toHaveLength(6);
    const wrap = readFileSync(resolve(ROOT, "mutants", "wrap.mjs"), "utf8");
    for (const m of mutants) expect(wrap, `wrap.mjs handles ${m.name}`).toContain(`"${m.name}"`);
  });
});
