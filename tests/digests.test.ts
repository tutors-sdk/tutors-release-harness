import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DigestError, parseDigests, pinImages } from "../src/digests.ts";
import { APPS, QUAY_IMAGE_TEMPLATE, imagesFor } from "../src/image-ref.ts";

const d = (n: number) => `sha256:${String(n).repeat(64)}`;
const ROOT = resolve(import.meta.dirname, "..");

describe("parsing the digests of a dispatch", () => {
  it("reads the JSON a workflow expression makes of the payload, and the app=digest form a person types", () => {
    const all = Object.fromEntries(APPS.map((app, i) => [app, d(i + 1)]));
    expect(parseDigests(JSON.stringify(all), "x")).toEqual(all);
    expect(parseDigests(APPS.map((app, i) => `${app}=${d(i + 1)}`).join(","), "x")).toEqual(all);
    expect(parseDigests(` reader = ${d(1)} , live=${d(2)} `, "x")).toEqual({ reader: d(1), live: d(2) });
  });

  it("no digests is undefined, never an error: an old dispatch has none", () => {
    for (const none of [undefined, "", "  ", "null", "{}"]) expect(parseDigests(none, "x"), JSON.stringify(none)).toBeUndefined();
  });

  it("refuses what is not a digest, an app that is not the harness's, and anything that is not an object", () => {
    expect(() => parseDigests(`{"reader":"sha256:abc"}`, "--a-digests")).toThrow(/--a-digests: the digest of reader must be sha256: followed by 64 lowercase hex/);
    expect(() => parseDigests(`{"reader":"sha256:${"A".repeat(64)}"}`, "x")).toThrow(DigestError);
    expect(() => parseDigests(`{"reader":42}`, "x")).toThrow(/must be sha256:/);
    expect(() => parseDigests(`{"database":"${d(1)}"}`, "x")).toThrow(new RegExp(`unknown app "database" \\(the apps are ${APPS.join(", ")}\\)`));
    expect(() => parseDigests(`["${d(1)}"]`, "x")).toThrow(/expected an object/);
    expect(() => parseDigests(`{"reader":`, "x")).toThrow(/not valid JSON/);
    expect(() => parseDigests(`reader`, "x")).toThrow(/is not app=sha256/);
  });

  it("accepts every app the harness has and names none of them itself", () => {
    // whatever APPS holds today (or holds tomorrow) is accepted
    for (const app of APPS) expect(parseDigests(`{"${app}":"${d(3)}"}`, "x")).toEqual({ [app]: d(3) });
  });
});

describe("pinning references", () => {
  const images = imagesFor("16.2.0", QUAY_IMAGE_TEMPLATE);

  it("A/A: no digests changes nothing", () => {
    expect(pinImages(images, undefined)).toBe(images);
  });

  it("planted: a digest makes repo:tag@digest, keeps the tag for the report, and leaves the other apps alone", () => {
    const pinned = pinImages(images, { reader: d(1) });
    expect(pinned.reader).toBe(`quay.io/tutors-sdk/tutors-reader:16.2.0@${d(1)}`);
    expect(pinned.catalogue).toBe(images.catalogue);
  });

  it("must not flag: the same digest given twice, once in the spec and once in the digests", () => {
    const spec = Object.fromEntries(APPS.map((app) => [app, `${images[app]}@${d(1)}`]));
    const both = pinImages(spec as typeof images, Object.fromEntries(APPS.map((app) => [app, d(1)])));
    for (const app of APPS) expect(both[app]).toBe(`${images[app]}@${d(1)}`);
  });

  it("a digest that contradicts the one already in the reference is refused, in either direction", () => {
    const spec = { ...images, reader: `${images.reader}@${d(1)}` };
    expect(() => pinImages(spec, { reader: d(2) }, "--b-digests")).toThrow(/--b-digests: reader is given as .* the digest for it is sha256:2{64}: they name different images/);
  });
});

describe("through the process: digests are validated before anything else runs, with no Docker", () => {
  const cli = (...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8" });

  it("a bad digest is a message and exit 2, for run and for images ensure", () => {
    for (const args of [["images", "ensure", "--a", "16.2.0", "--b", "16.3.0", "--b-digests", "reader=nope"], ["run", "--mode", "release", "--a", "1", "--b", "2", "--a-digests", `{"reader":"x"}`]]) {
      const r = cli(...args);
      expect(r.status, args.join(" ")).toBe(2);
      expect(r.stderr).toMatch(/digest of reader must be sha256:/);
      expect(r.stderr).not.toMatch(/at .*\.ts:\d+/);
    }
  });

  it("--deployed and its companions belong to post-deploy mode, and a deployed tag is a tag, never a path", () => {
    const wrongMode = cli("run", "--mode", "release", "--a", "1", "--b", "2", "--deployed", "16.3.0");
    expect(wrongMode.status).toBe(2);
    expect(wrongMode.stderr).toMatch(/belong to --mode post-deploy/);
    const traversal = cli("run", "--mode", "post-deploy", "--deployed", "../../etc/passwd");
    expect(traversal.status).toBe(2);
    expect(traversal.stderr).toMatch(/--deployed takes the tag that was deployed/);
  });
});
