import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { SideCapture } from "../src/types.ts";
import { capture } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);

/** What Playwright's ariaSnapshot renders for the footer: text and roles, no attributes (so no data-tutors-build). */
function footer(version: string, message = "Tutors is open source"): string {
  return ["- contentinfo:", `  - link "Tutors v:${version}":`, "    - /url: https://tutors.dev", `    - paragraph: Tutors v:${version}`, `  - paragraph: ${message}`].join("\n");
}

function withAria(side: "a" | "b", aria: string): SideCapture {
  const c = capture(side);
  c.journeys[0]!.pages[0]!.aria = `${c.journeys[0]!.pages[0]!.aria}\n${aria}`;
  return c;
}

function withFocus(side: "a" | "b", stops: string[]): SideCapture {
  const c = capture(side);
  c.journeys[0]!.pages[0]!.focus = stops;
  return c;
}

/** The keyboard walk of a page in the 16.2.1 -> 16.2.2 release run: the footer link is a stop. */
const stops = (version: string, extra: string[] = []) => ['a "Live"', ...extra, `a "Tutors v:${version}"`, 'a "Open Learning Web Toolkit"'];

function diff(a: SideCapture, b: SideCapture) {
  return compareCaptures(normalise(a, masks, "release").capture, normalise(b, masks, "release").capture, masks);
}

describe("footer-tutors-version mask", () => {
  it("is narrow: dom and keyboard order only, keyed on the label, with a reason", () => {
    const m = masks.masks.find((x) => x.id === "footer-tutors-version")!;
    expect(m.artefact).toEqual(["dom", "focus"]);
    expect(m.modes).toBeUndefined();
    expect(m.pattern).toContain("Tutors v:");
    expect(m.reason.length).toBeGreaterThanOrEqual(20);
  });

  it("A/A: identical footers produce nothing", () => {
    expect(diff(withAria("a", footer("16.2.0")), withAria("b", footer("16.2.0")))).toEqual([]);
  });

  it("planted: a different release version in the footer is NOT flagged, and the mask reports a hit", () => {
    expect(diff(withAria("a", footer("16.2.0")), withAria("b", footer("16.3.0")))).toEqual([]);
    expect(diff(withAria("a", footer("16.2.0")), withAria("b", footer("16.3.0-rc.1+build.7")))).toEqual([]);
    const { hits } = normalise(withAria("a", footer("16.2.0")), masks, "release");
    expect(hits["footer-tutors-version"]).toBe(2);
  });

  it("must still flag: other footer text changing next to the version", () => {
    const hunks = diff(withAria("a", footer("16.2.0")), withAria("b", footer("16.3.0", "Tutors is closed source")));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "dom", severity: "fail" });
    expect(hunks[0]!.detail).toContain("Tutors is closed source");
    expect(hunks[0]!.detail).not.toContain("16.3.0");
  });

  it("must still flag: another version-like string elsewhere on the page", () => {
    const a = withAria("a", `${footer("16.2.0")}\n- main:\n  - paragraph: Requires Node 22.1.0`);
    const b = withAria("b", `${footer("16.3.0")}\n- main:\n  - paragraph: Requires Node 22.2.0`);
    const hunks = diff(a, b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.detail).toContain("22.2.0");
  });

  it("must still flag: the label itself changing, or the footer's version disappearing", () => {
    expect(diff(withAria("a", footer("16.2.0")), withAria("b", footer("16.2.0").replaceAll("Tutors v:", "Tutors ver:")))).not.toEqual([]);
    expect(diff(withAria("a", footer("16.2.0")), withAria("b", footer("")))).not.toEqual([]);
  });

  it("keyboard order: a different release version on the footer stop is NOT flagged", () => {
    expect(diff(withFocus("a", stops("16.2.1")), withFocus("b", stops("16.2.2")))).toEqual([]);
    const { hits } = normalise(withFocus("a", stops("16.2.1")), masks, "release");
    expect(hits["footer-tutors-version"]).toBeGreaterThanOrEqual(1);
  });

  it("keyboard order must still flag: a stop added, or the version stop gone", () => {
    const added = diff(withFocus("a", stops("16.2.1")), withFocus("b", stops("16.2.2", ['a "Prerequisites"'])));
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ artefact: "focus", severity: "fail" });
    expect(added[0]!.detail).toContain("Prerequisites");
    expect(added[0]!.detail).not.toContain("16.2.2");
    expect(diff(withFocus("a", stops("16.2.1")), withFocus("b", ['a "Live"', 'a "Open Learning Web Toolkit"']))).not.toEqual([]);
  });
});
