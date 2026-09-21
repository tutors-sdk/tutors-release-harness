import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { APPS, QUAY_IMAGE_TEMPLATE, appOf, dockerRef, imageRepo, imagesFor, isBuildable, isRegistryRef, kindImageName, parseRef, specFor } from "../src/image-ref.ts";
import { ROOT, sideSpec } from "../src/stack.ts";
import { manifestsFor } from "../src/substrate/kind.ts";

const D1 = `sha256:${"1".repeat(64)}`;
const D2 = `sha256:${"2".repeat(64)}`;
const D3 = `sha256:${"3".repeat(64)}`;
const D4 = `sha256:${"4".repeat(64)}`;

describe("image prefix: bare prefix or {app} template", () => {
  it("a bare prefix keeps meaning <prefix>/<app>, the monorepo's local compose build", () => {
    expect(imageRepo("tutors", "reader")).toBe("tutors/reader");
    expect(imageRepo("registry.example:5000/team/", "live")).toBe("registry.example:5000/team/live");
    expect(imagesFor("local", "tutors")).toEqual({ reader: "tutors/reader:local", catalogue: "tutors/catalogue:local", live: "tutors/live:local", time: "tutors/time:local" });
  });

  it("a template puts the app wherever {app} is: Quay has no nested repositories", () => {
    expect(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE)).toEqual({
      reader: "quay.io/tutors-sdk/tutors-reader:16.2.0",
      catalogue: "quay.io/tutors-sdk/tutors-catalogue:16.2.0",
      live: "quay.io/tutors-sdk/tutors-live:16.2.0",
      time: "quay.io/tutors-sdk/tutors-time:16.2.0"
    });
    expect(imagesFor("16.3.0-rc.1", QUAY_IMAGE_TEMPLATE).reader).toBe("quay.io/tutors-sdk/tutors-reader:16.3.0-rc.1");
    expect(imagesFor("sha-1a2b3c4", QUAY_IMAGE_TEMPLATE).live).toBe("quay.io/tutors-sdk/tutors-live:sha-1a2b3c4");
  });

  it("refuses an empty prefix and any placeholder other than {app}", () => {
    expect(() => imageRepo("", "reader")).toThrow(/empty/);
    expect(() => imageRepo("quay.io/x/tutors-{APP}", "reader")).toThrow(/only placeholder is \{app\}/);
  });

  it("one image given, the others take the prefix — under a template too", () => {
    expect(imagesFor("quay.io/tutors-sdk/tutors-reader:16.2.0", QUAY_IMAGE_TEMPLATE)).toEqual(imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE));
    expect(imagesFor("quay.io/someone/tutors-catalogue:pr-12", QUAY_IMAGE_TEMPLATE)).toEqual({
      reader: "quay.io/tutors-sdk/tutors-reader:pr-12",
      catalogue: "quay.io/someone/tutors-catalogue:pr-12",
      live: "quay.io/tutors-sdk/tutors-live:pr-12",
      time: "quay.io/tutors-sdk/tutors-time:pr-12"
    });
    expect(imagesFor("quay.io/tutors-sdk/tutors-time:pr-12", QUAY_IMAGE_TEMPLATE).time).toBe("quay.io/tutors-sdk/tutors-time:pr-12");
    // A mutant names no app: nothing is replaced, exactly as before.
    expect(imagesFor("tutors-harness/mutant-route-500:latest", QUAY_IMAGE_TEMPLATE).reader).toBe("quay.io/tutors-sdk/tutors-reader:latest");
  });

  it("knows which app a reference names", () => {
    expect(appOf("tutors/reader:1", "tutors")).toBe("reader");
    expect(appOf(`quay.io/tutors-sdk/tutors-live@${D1}`, QUAY_IMAGE_TEMPLATE)).toBe("live");
    expect(appOf(`quay.io/tutors-sdk/tutors-time@${D1}`, QUAY_IMAGE_TEMPLATE)).toBe("time");
    expect(appOf("tutors/time:local", "tutors")).toBe("time");
    expect(appOf("tutors-harness/mutant-dropped-header:latest", "tutors")).toBeUndefined();
    expect(appOf("example.com/misreader:1", "tutors")).toBeUndefined();
  });
});

describe("digest references", () => {
  it("parses repo, tag and digest, and a registry port is not a tag", () => {
    expect(parseRef(`quay.io/tutors-sdk/tutors-reader:16.2.0@${D1}`)).toEqual({ repo: "quay.io/tutors-sdk/tutors-reader", tag: "16.2.0", digest: D1 });
    expect(parseRef("localhost:5000/tutors/reader")).toEqual({ repo: "localhost:5000/tutors/reader" });
    expect(parseRef("localhost:5000/tutors/reader:rc")).toEqual({ repo: "localhost:5000/tutors/reader", tag: "rc" });
    expect(() => parseRef("quay.io/x/y@sha256:abc")).toThrow(/64 hex/);
    expect(() => parseRef("quay.io/x/y@md5:abc")).toThrow(/sha256/);
  });

  it("app=image pairs carry a digest per app, with or without a tag", () => {
    const spec = `reader=quay.io/tutors-sdk/tutors-reader:16.2.0@${D1},catalogue=quay.io/tutors-sdk/tutors-catalogue@${D2},live=quay.io/tutors-sdk/tutors-live@${D3},time=quay.io/tutors-sdk/tutors-time@${D4}`;
    const images = imagesFor(spec, QUAY_IMAGE_TEMPLATE);
    expect(images.reader).toBe(`quay.io/tutors-sdk/tutors-reader:16.2.0@${D1}`);
    expect(images.catalogue).toBe(`quay.io/tutors-sdk/tutors-catalogue@${D2}`);
    expect(images.time).toBe(`quay.io/tutors-sdk/tutors-time@${D4}`);
    expect(specFor(images)).toBe(spec);
    expect(imagesFor(specFor(images), "tutors")).toEqual(images);
    expect(() => imagesFor("reader=r@sha256:nope,catalogue=c:1,live=l:1", "tutors")).toThrow(/64 hex/);
    expect(() => imagesFor("reader=r:1,catalogue=c:1,live=l:1,time=t:1,moodle=m:1", "tutors")).toThrow(/unknown app moodle/);
  });

  it("app=image pairs must name reader, catalogue and live; time is optional and, left out, takes the reader's tag (a spec written for 1.2 keeps working)", () => {
    expect(() => imagesFor("reader=r:1,catalogue=c:1", "tutors")).toThrow(/must name reader, catalogue, live \(time is optional\); missing live/);
    expect(imagesFor("reader=tutors/reader:16.2.0,catalogue=tutors/catalogue:16.2.0,live=tutors/live:16.2.0", "tutors")).toEqual({
      reader: "tutors/reader:16.2.0",
      catalogue: "tutors/catalogue:16.2.0",
      live: "tutors/live:16.2.0",
      time: "tutors/time:16.2.0"
    });
    // the reader's tag, under a template and with a digest on the reader
    expect(imagesFor(`reader=quay.io/tutors-sdk/tutors-reader:16.2.0@${D1},catalogue=c:1,live=l:1`, QUAY_IMAGE_TEMPLATE).time).toBe("quay.io/tutors-sdk/tutors-time:16.2.0");
    // a reader pinned by digest alone: the first tag among the others is used
    expect(imagesFor(`reader=quay.io/tutors-sdk/tutors-reader@${D1},catalogue=quay.io/tutors-sdk/tutors-catalogue:16.2.0,live=l:1`, QUAY_IMAGE_TEMPLATE).time).toBe("quay.io/tutors-sdk/tutors-time:16.2.0");
    // no tag anywhere to take: refused, never guessed
    expect(() => imagesFor(`reader=quay.io/tutors-sdk/tutors-reader@${D1},catalogue=quay.io/tutors-sdk/tutors-catalogue@${D2},live=quay.io/tutors-sdk/tutors-live@${D3}`, QUAY_IMAGE_TEMPLATE)).toThrow(/no time=… given, and none of reader, catalogue, live carries a tag/);
  });

  it("refuses a digest on a bare tag: four apps cannot share one", () => {
    expect(() => imagesFor(`16.2.0@${D1}`, QUAY_IMAGE_TEMPLATE)).toThrow(/the apps have one digest each/);
  });

  it("one digest-pinned image with a tag lends the tag to the others; without a tag it is refused", () => {
    const images = imagesFor(`quay.io/tutors-sdk/tutors-reader:16.2.0@${D1}`, QUAY_IMAGE_TEMPLATE);
    expect(images.reader).toBe(`quay.io/tutors-sdk/tutors-reader:16.2.0@${D1}`);
    expect(images.live).toBe("quay.io/tutors-sdk/tutors-live:16.2.0");
    expect(() => imagesFor(`quay.io/tutors-sdk/tutors-reader@${D1}`, QUAY_IMAGE_TEMPLATE)).toThrow(/no tag for the other apps/);
  });

  it("docker, compose and kubectl are given the digest alone", () => {
    expect(dockerRef(`quay.io/tutors-sdk/tutors-reader:16.2.0@${D1}`)).toBe(`quay.io/tutors-sdk/tutors-reader@${D1}`);
    expect(dockerRef("tutors/reader:local")).toBe("tutors/reader:local");
  });

  it("kind gets a tag derived from the digest, because kind load carries tags only", () => {
    expect(kindImageName(`quay.io/tutors-sdk/tutors-reader:16.2.0@${D1}`)).toBe("quay.io/tutors-sdk/tutors-reader:16.2.0-sha256-111111111111");
    expect(kindImageName(`quay.io/tutors-sdk/tutors-reader@${D1}`)).toBe("quay.io/tutors-sdk/tutors-reader:sha256-111111111111");
    expect(kindImageName("tutors/reader:local")).toBe("tutors/reader:local");
    const images = imagesFor(`reader=quay.io/tutors-sdk/tutors-reader@${D1},catalogue=quay.io/tutors-sdk/tutors-catalogue@${D2},live=quay.io/tutors-sdk/tutors-live@${D3},time=quay.io/tutors-sdk/tutors-time@${D4}`, "tutors");
    const manifests = manifestsFor("a", sideSpec("a", images), "2026-09-16T09:05:00.000Z");
    expect(manifests).toContain("image: quay.io/tutors-sdk/tutors-reader:sha256-111111111111");
    expect(manifests).toContain("image: quay.io/tutors-sdk/tutors-time:sha256-444444444444");
    expect(manifests).not.toContain("@sha256:");
  });
});

describe("what may be pulled and what may be built", () => {
  it("only a reference with a registry host is a registry reference", () => {
    expect(isRegistryRef("quay.io/tutors-sdk/tutors-reader:16.2.0")).toBe(true);
    expect(isRegistryRef("localhost:5000/tutors/reader:rc")).toBe(true);
    expect(isRegistryRef("localhost/tutors/reader:rc")).toBe(true);
    expect(isRegistryRef("tutors/reader:local")).toBe(false);
    expect(isRegistryRef("tutors-harness/mutant-route-500:latest")).toBe(false);
    expect(isRegistryRef("reader:local")).toBe(false);
  });

  it("only a bare tag can fall back to a build from the monorepo ref", () => {
    expect(isBuildable("16.2.0")).toBe(true);
    expect(isBuildable("tutors/reader:16.2.0")).toBe(false);
    expect(isBuildable("reader=a:1,catalogue=b:1,live=c:1,time=d:1")).toBe(false);
  });
});

describe("scripts/build-images.sh", () => {
  const bash = (() => {
    const probe = spawnSync("bash", ["-c", "echo ok"], { encoding: "utf8" });
    return probe.status === 0 && probe.stdout.trim() === "ok";
  })();

  // No Docker, no git: --print-images only expands names. Skipped where there is no bash.
  it.skipIf(!bash)("names images exactly as imageRepo does, for a prefix and for a template", () => {
    for (const prefix of ["tutors", "registry.example:5000/team/", QUAY_IMAGE_TEMPLATE]) {
      const out = spawnSync("bash", ["scripts/build-images.sh", "--print-images", "16.2.0"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, HARNESS_IMAGE_PREFIX: prefix } });
      expect(out.status, out.stderr).toBe(0);
      const printed = Object.fromEntries(out.stdout.trim().split(/\r?\n/).map((line) => line.split("=") as [string, string]));
      expect(printed, prefix).toEqual(imagesFor("16.2.0", prefix));
      expect(Object.keys(printed)).toEqual([...APPS]);
    }
  });
});
