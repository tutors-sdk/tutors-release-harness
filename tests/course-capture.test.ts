/**
 * `harness course capture|verify|serve` (since 1.29.0, docs/course-capture.md): a live course onto disk, pinned by
 * sha256, and served back. The network is a fake fetch here, except the last block, which captures the committed
 * fixture course over real HTTP from fixtures/course-server/serve.mjs.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { courseAssets, normalisePath } from "../src/course/assets.ts";
import { captureCourse, INDEX, MANIFEST, type CaptureOptions, type CourseManifest, type FetchLike } from "../src/course/capture.ts";
import { courseCommand, CourseUsageError, servedDir } from "../src/course/command.ts";
import { linkedCourse, parseCourseRef } from "../src/course/ref.ts";
import { verifyCapture } from "../src/course/verify.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = () => mkdtempSync(join(tmpdir(), "harness-course-"));
const sha = (b: Uint8Array | string) => createHash("sha256").update(b).digest("hex");

describe("parseCourseRef: where the reader would read a course", () => {
  it("a reader URL, a reader path, a Netlify host, a bare id and a local host", () => {
    const portfolio = { id: "wit-hdip-comp-sci-2024", origin: "https://wit-hdip-comp-sci-2024.netlify.app" };
    expect(parseCourseRef("https://tutors.dev/course/wit-hdip-comp-sci-2024")).toEqual(portfolio);
    expect(parseCourseRef("https://tutors.dev/course/wit-hdip-comp-sci-2024/")).toEqual(portfolio);
    expect(parseCourseRef("https://tutors.dev/course/wit-hdip-comp-sci-2024?x=1")).toEqual(portfolio);
    expect(parseCourseRef("/course/wit-hdip-comp-sci-2024")).toEqual(portfolio);
    expect(parseCourseRef("wit-hdip-comp-sci-2024")).toEqual(portfolio);
    expect(parseCourseRef("wit-hdip-comp-sci-2024.netlify.app")).toEqual(portfolio);
    expect(parseCourseRef("https://wit-hdip-comp-sci-2024.netlify.app/tutors.json")).toEqual(portfolio);
    expect(parseCourseRef("http://localhost:8080")).toEqual({ id: "localhost:8080", origin: "http://localhost:8080" });
    expect(parseCourseRef("localhost:8080")).toEqual({ id: "localhost:8080", origin: "http://localhost:8080" });
    expect(parseCourseRef("courses.example.org")).toEqual({ id: "courses.example.org", origin: "https://courses.example.org" });
  });

  it("refuses what is not a course", () => {
    expect(() => parseCourseRef("")).toThrow(/empty/);
    expect(() => parseCourseRef("https://tutors.dev/")).toThrow(/not a course/);
    expect(() => parseCourseRef("no spaces please")).toThrow(/not a course id/);
  });

  it("linkedCourse: a web learning object's Tutors course, and nothing else", () => {
    expect(linkedCourse("/course/full-stack-2-2024")?.id).toBe("full-stack-2-2024");
    expect(linkedCourse("https://tutors.dev/course/wit-hip-comp-sci-2024-sem-2-calendar")?.id).toBe("wit-hip-comp-sci-2024-sem-2-calendar");
    expect(linkedCourse("https://databases-2024.netlify.app/")?.origin).toBe("https://databases-2024.netlify.app");
    for (const other of ["https://github.com/tutors-sdk", "https://setu.slack.com", "mailto:x@y", "", undefined]) expect(linkedCourse(other)).toBeUndefined();
  });
});

/** A course with each way the generator names a file, and the things a capture must not fetch. */
const COURSE = {
  route: "/",
  type: "course",
  title: " A Course",
  img: "https://{{COURSEURL}}/course.png",
  contentMd: "Welcome ![](https://example.org/elsewhere.png) and https://github.com/x/archive/refs/heads/main.zip",
  properties: { portfolio: false },
  los: [
    {
      route: "/topic/{{COURSEURL}}/unit-1",
      type: "unit",
      img: "",
      los: [
        {
          route: "/topic/{{COURSEURL}}/unit-1/topic-01",
          type: "topic",
          img: "https://{{COURSEURL}}/unit-1/topic-01/topic.png",
          los: [
            { route: "/talk/{{COURSEURL}}/unit-1/topic-01/talk-1", type: "talk", img: "https://{{COURSEURL}}/unit-1/topic-01/talk-1/talk.png", pdf: "https://{{COURSEURL}}/unit-1/topic-01/talk-1/slides.pdf" },
            { route: "/archive/{{COURSEURL}}/unit-1/topic-01/archive", type: "archive", archiveFile: "code.zip" },
            {
              route: "/lab/{{COURSEURL}}/unit-1/topic-01/book-lab",
              type: "lab",
              img: "https://{{COURSEURL}}/unit-1/topic-01/book-lab/img/main.png",
              summary: "## Prerequisites",
              los: [
                { route: "/lab/{{COURSEURL}}/unit-1/topic-01/book-lab/Step-01", type: "step", contentMd: "See ![a](img/shot%201.png) and ![b](./img/b.png).\n\n::video[src=\"img/demo.mp4\"]::" },
                { route: "/lab/{{COURSEURL}}/unit-1/topic-01/book-lab/Step-02", type: "step", contentMd: "Get [the code](archives/start.zip). <img src=\"img/c.svg\">. Escape ![](../../../../../etc/passwd.png)" }
              ]
            },
            { route: "/note/{{COURSEURL}}/unit-1/topic-01/note-1", type: "note", contentMd: "![](img/n.png)." },
            { route: "/web/{{COURSEURL}}/unit-1/topic-01/web-1", type: "web" }
          ]
        },
        { route: "/course/child-course", type: "web", img: "https://{{COURSEURL}}/unit-1/web-2/web.png" },
        { route: "https://tutors.dev/course/child-course", type: "web" },
        { route: "https://tutors.dev/course/second-course", type: "web" },
        { route: "https://github.com/tutors-sdk", type: "web" }
      ]
    }
  ]
};

describe("courseAssets: the files tutors.json makes the reader load from the course host", () => {
  const found = courseAssets(COURSE);
  const paths = found.assets.map((a) => a.path);

  it("absolute placeholders, archives, and markdown's img/ and archives/ relative to the lab or note", () => {
    expect(paths).toEqual(
      [
        "course.png",
        "unit-1/topic-01/archive/code.zip",
        "unit-1/topic-01/book-lab/archives/start.zip",
        "unit-1/topic-01/book-lab/img/b.png",
        "unit-1/topic-01/book-lab/img/c.svg",
        "unit-1/topic-01/book-lab/img/demo.mp4",
        "unit-1/topic-01/book-lab/img/main.png",
        "unit-1/topic-01/book-lab/img/shot 1.png",
        "unit-1/topic-01/note-1/img/n.png",
        "unit-1/topic-01/talk-1/slides.pdf",
        "unit-1/topic-01/talk-1/talk.png",
        "unit-1/topic-01/topic.png",
        "unit-1/web-2/web.png"
      ].sort((a, b) => a.localeCompare(b))
    );
  });

  it("never another host's file, a GitHub archive, or a path out of the course root", () => {
    expect(paths.some((p) => p.includes("elsewhere") || p.includes("refs") || p.includes("passwd"))).toBe(false);
    expect(normalisePath("a/../../x.png")).toBeUndefined();
    expect(normalisePath("img/")).toBeUndefined();
    expect(normalisePath("a/./b//c.png?v=1#x")).toBe("a/b/c.png");
  });

  it("linked Tutors courses once each, in order; counts per type", () => {
    expect(found.links.map((l) => l.id)).toEqual(["child-course", "second-course"]);
    expect(found.types).toMatchObject({ course: 1, unit: 1, topic: 1, lab: 1, step: 2, web: 5, archive: 1, note: 1, talk: 1 });
  });
});

/** A fake web: url -> status and body; a function answers per call (for a retry). */
function fakeWeb(routes: Record<string, number | string | Uint8Array | (() => Response)>) {
  const calls: string[] = [];
  const fetch: FetchLike = async (url) => {
    calls.push(url);
    const r = routes[url];
    if (r === undefined) return new Response("not found", { status: 404 });
    if (typeof r === "function") return r();
    if (typeof r === "number") return new Response("no", { status: r });
    return new Response(typeof r === "string" ? r : new Blob([r as Uint8Array<ArrayBuffer>]), { status: 200 });
  };
  return { fetch, calls };
}

const PORTFOLIO = {
  route: "/",
  type: "course",
  title: " Portfolio",
  img: "https://{{COURSEURL}}/course.png",
  properties: { portfolio: true },
  los: [{ route: "/topic/{{COURSEURL}}/unit-1", type: "unit", los: [{ route: "/course/child", type: "web" }, { route: "/course/private", type: "web" }, { route: "/course/gone", type: "web" }] }]
};
const CHILD = {
  route: "/",
  type: "course",
  title: "Child",
  img: "https://{{COURSEURL}}/course.png",
  los: [
    { route: "/talk/{{COURSEURL}}/t", type: "talk", pdf: "https://{{COURSEURL}}/t/slides.pdf", img: "https://{{COURSEURL}}/t/missing.png" },
    { route: "/lab/{{COURSEURL}}/l", type: "lab", los: [{ type: "step", route: "/lab/{{COURSEURL}}/l/s1", contentMd: "![](img/big.png) ![](img/v.mp4) ![](img/flaky.png)" }] },
    { route: "/course/grandchild", type: "web" }
  ]
};

function web() {
  let flaky = 0;
  return fakeWeb({
    "https://portfolio.netlify.app/tutors.json": JSON.stringify(PORTFOLIO),
    "https://portfolio.netlify.app/course.png": "PNG-portfolio",
    "https://child.netlify.app/tutors.json": JSON.stringify(CHILD),
    "https://child.netlify.app/course.png": "PNG-child",
    "https://child.netlify.app/t/slides.pdf": "%PDF-1.4",
    "https://child.netlify.app/l/img/big.png": new Uint8Array(3 * 1024 * 1024),
    "https://child.netlify.app/l/img/v.mp4": "video",
    "https://child.netlify.app/l/img/flaky.png": () => (flaky++ === 0 ? new Response("busy", { status: 503 }) : new Response("PNG-flaky")),
    "https://private.netlify.app/tutors.json": 403,
    "https://grandchild.netlify.app/tutors.json": JSON.stringify({ ...CHILD, title: "Grandchild", los: [] })
  });
}

const options = (out: string, fetch: FetchLike, extra: Partial<CaptureOptions> = {}): CaptureOptions => ({
  course: parseCourseRef("https://tutors.dev/course/portfolio"),
  out,
  depth: 1,
  concurrency: 3,
  skipExt: [],
  dryRun: false,
  force: false,
  harnessVersion: "0.0.0-test",
  fetch,
  now: () => new Date("2026-10-08T08:00:00Z"),
  backoffMs: 1,
  ...extra
});

describe("captureCourse", () => {
  it("captures the course and, to --depth, the courses it links: byte for byte, with every sha256", async () => {
    const out = tmp();
    const { fetch, calls } = web();
    const index = await captureCourse(options(out, fetch, { maxFileBytes: 1024 * 1024, skipExt: ["MP4"] }));

    expect(index.courses.map((c) => [c.id, c.status, c.depth])).toEqual([
      ["portfolio", "captured", 0],
      ["child", "captured", 1],
      ["private", "not-public", 1],
      ["gone", "not-found", 1]
    ]);
    // depth 1: the grandchild is linked but not followed
    expect(calls.some((u) => u.includes("grandchild"))).toBe(false);

    const child = JSON.parse(readFileSync(join(out, "child", MANIFEST), "utf8")) as CourseManifest;
    expect(child.course).toEqual({ id: "child", origin: "https://child.netlify.app", reader: "https://tutors.dev/course/child", title: "Child" });
    expect(child.capturedAt).toBe("2026-10-08T08:00:00.000Z");
    expect(child.files.map((f) => f.path)).toEqual(["course.png", "l/img/flaky.png", "t/slides.pdf"]);
    expect(child.missing).toEqual([{ path: "t/missing.png", from: "/talk/{{COURSEURL}}/t", status: 404 }]);
    expect(child.skipped.map((s) => [s.path, s.reason])).toEqual([
      ["l/img/big.png", "larger than --max-file-mb"],
      ["l/img/v.mp4", "--skip-ext mp4"]
    ]);
    expect(child.links).toEqual([{ id: "grandchild", origin: "https://grandchild.netlify.app" }]);
    // tutors.json is the host's bytes, not a re-serialisation
    expect(readFileSync(join(out, "child", "tutors.json"), "utf8")).toBe(JSON.stringify(CHILD));
    expect(child.tutorsJson.sha256).toBe(sha(JSON.stringify(CHILD)));
    expect(readFileSync(join(out, "child", "l", "img", "flaky.png"), "utf8")).toBe("PNG-flaky");
    expect(existsSync(join(out, "child", "l", "img", "big.png"))).toBe(false);

    const written = JSON.parse(readFileSync(join(out, INDEX), "utf8"));
    expect(written).toEqual(index);
    expect(written.courses[1]).toMatchObject({ dir: "child", linkedFrom: "portfolio", files: 3, missing: 1, skipped: 2 });
  });

  it("--depth 0 is the course alone; --dry-run reads tutors.json and writes nothing", async () => {
    const alone = tmp();
    const index = await captureCourse(options(alone, web().fetch, { depth: 0 }));
    expect(index.courses.map((c) => c.id)).toEqual(["portfolio"]);

    const dry = join(tmp(), "never");
    const { fetch, calls } = web();
    const plan = await captureCourse(options(dry, fetch, { dryRun: true }));
    expect(existsSync(dry)).toBe(false);
    expect(calls.every((u) => u.endsWith("/tutors.json"))).toBe(true);
    expect(plan.courses.find((c) => c.id === "child")).toMatchObject({ status: "captured", files: 6 });
  });

  it("refuses to write over a course folder unless --force", async () => {
    const out = tmp();
    mkdirSync(join(out, "portfolio"));
    writeFileSync(join(out, "portfolio", "mine.txt"), "keep");
    await expect(captureCourse(options(out, web().fetch, { depth: 0 }))).rejects.toThrow(/not empty: pass --force/);
    await captureCourse(options(out, web().fetch, { depth: 0, force: true }));
    expect(existsSync(join(out, "portfolio", "mine.txt"))).toBe(false);
  });

  it("a host that is not a course: not JSON (a sign-in page), or JSON that is not a course", async () => {
    const out = tmp();
    const html = fakeWeb({ "https://portfolio.netlify.app/tutors.json": "<html>sign in</html>" });
    expect((await captureCourse(options(out, html.fetch))).courses[0]).toMatchObject({ status: "not-a-course" });
    const topic = fakeWeb({ "https://portfolio.netlify.app/tutors.json": JSON.stringify({ type: "topic" }) });
    expect((await captureCourse(options(tmp(), topic.fetch))).courses[0]!.detail).toMatch(/a topic, not a course/);
  });
});

describe("verify and the command", () => {
  it("verify: a fresh capture verifies; a changed or deleted file is drift", async () => {
    const out = tmp();
    await captureCourse(options(out, web().fetch, { depth: 1 }));
    expect(verifyCapture(out).map((c) => [c.id, c.problems])).toEqual([
      ["portfolio", []],
      ["child", []]
    ]);
    writeFileSync(join(out, "child", "course.png"), "PNG-chilD");
    writeFileSync(join(out, "child", "t", "slides.pdf"), "%PDF-1.4 and more");
    const drift = verifyCapture(join(out, "child"))[0]!;
    expect(drift.problems).toEqual(["course.png: sha256 differs from the capture", "t/slides.pdf: 17 bytes, captured 8"]);
    expect(() => verifyCapture(tmp())).toThrow(/not a course capture/);
  });

  it("courseCommand: exit 0 captured, 1 when the course cannot be read, --strict 1 when anything is missing; usage is CourseUsageError", async () => {
    const lines: string[] = [];
    const deps = (fetch: FetchLike) => ({ fetch, log: (l: string) => lines.push(l), harnessVersion: "0.0.0-test", now: () => new Date("2026-10-08T08:00:00Z"), backoffMs: 1 });
    const out = tmp();
    expect(await courseCommand("capture", { course: "https://tutors.dev/course/portfolio", out }, deps(web().fetch))).toBe(0);
    expect(lines.join("\n")).toMatch(/2 of 4 courses captured into/);
    expect(lines.join("\n")).toContain(`harness course serve --dir ${join(out, "portfolio")}`);
    expect(await courseCommand("capture", { course: "portfolio", out: tmp(), strict: true }, deps(web().fetch))).toBe(1);
    expect(await courseCommand("capture", { course: "nowhere", out: tmp() }, deps(fakeWeb({}).fetch))).toBe(1);
    expect(await courseCommand("verify", { dir: out }, deps(web().fetch))).toBe(0);
    writeFileSync(join(out, "portfolio", "course.png"), "x");
    expect(await courseCommand("verify", { dir: out }, deps(web().fetch))).toBe(1);

    const json: string[] = [];
    await courseCommand("capture", { course: "portfolio", out: tmp(), json: true, depth: "0" }, { ...deps(web().fetch), log: (l) => json.push(l) });
    expect(json).toHaveLength(1);
    expect(JSON.parse(json[0]!)).toMatchObject({ root: "portfolio", depth: 0 });

    for (const [sub, v, msg] of [
      ["fetch", {}, /capture, verify or serve/],
      ["capture", {}, /needs --course/],
      ["capture", { course: "x", depth: "-1" }, /--depth takes a whole number/],
      ["capture", { course: "x", "max-file-mb": "0" }, /--max-file-mb/],
      ["verify", {}, /needs --dir/],
      ["verify", { dir: tmp() }, /not a course capture/],
      ["serve", { dir: tmp() }, /no tutors.json/]
    ] as const) await expect(courseCommand(sub, v, deps(web().fetch))).rejects.toThrow(msg instanceof RegExp ? msg : /./);
    await expect(courseCommand("capture", {}, deps(web().fetch))).rejects.toBeInstanceOf(CourseUsageError);
  });

  it("servedDir: a course folder as it is, or the root course of a capture", async () => {
    const out = tmp();
    await captureCourse(options(out, web().fetch, { depth: 0 }));
    expect(servedDir(out)).toBe(join(out, "portfolio"));
    expect(servedDir(join(out, "portfolio"))).toBe(join(out, "portfolio"));
  });

  it("the CLI lists the command and says a usage error plainly (exit 2)", () => {
    const run = (args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8" });
    const help = run(["help", "course"]);
    expect(help.status).toBe(0);
    for (const sub of ["capture", "verify", "serve"]) expect(help.stdout).toContain(`harness course ${sub}`);
    const bad = run(["course", "capture"]);
    expect(bad.status).toBe(2);
    expect(bad.stderr.trim()).toBe("course capture needs --course <https://tutors.dev/course/<id> | id>");
  });
});

describe("over real HTTP: the committed fixture course, served by fixtures/course-server", () => {
  let server: ChildProcess;
  let port = 0;
  const fixture = join(ROOT, "fixtures", "course-server", "course");

  beforeAll(async () => {
    port = 20000 + Math.floor(Math.random() * 20000);
    server = spawn(process.execPath, [join(ROOT, "fixtures", "course-server", "serve.mjs"), fixture, String(port)], { stdio: ["ignore", "pipe", "inherit"] });
    await new Promise<void>((ready, failed) => {
      server.stdout!.on("data", (d: Buffer) => d.toString().includes("listening") && ready());
      server.on("exit", (code) => failed(new Error(`fixture server exited ${code}`)));
    });
  });
  afterAll(() => {
    server?.kill();
  });

  it("captures it with the real fetch, and the capture is the committed course", async () => {
    const out = tmp();
    const { fetch: _fake, ...real } = options(out, globalThis.fetch as FetchLike);
    const index = await captureCourse({ ...real, course: parseCourseRef(`http://localhost:${port}`) });
    expect(index.courses).toHaveLength(1);
    expect(index.courses[0]).toMatchObject({ id: `localhost:${port}`, status: "captured", dir: `localhost_${port}`, missing: 0 });
    const dir = join(out, `localhost_${port}`);
    expect(readFileSync(join(dir, "tutors.json"))).toEqual(readFileSync(join(fixture, "tutors.json")));
    expect(verifyCapture(out)[0]!.problems).toEqual([]);
  });
});
