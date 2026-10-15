import type { SideCapture } from "../types.ts";

/**
 * What to check when a journey or page is slower on b (since 1.38.0). Timing is informing: it never fails a release,
 * so its hunk has to tell the reader what to look at instead. The advice is read from the two captures, not guessed:
 * requests one side made in the journey and the other did not (a new request the page does not wait for can still hold
 * a capture open, which is how the reader's keepalive POST to /api/live/activity once read as a 23s sign-in), the pages whose first byte moved most,
 * then the steps that tell a real slowdown from a measured one.
 */
export function timingAdvice(a: SideCapture, b: SideCapture, scope: string, kind: "journey" | "page"): string[] {
  const out: string[] = [];
  const pagesOf = (c: SideCapture) => c.journeys.filter((j) => !j.error).flatMap((j) => (kind === "journey" ? (j.journey === scope ? j.pages : []) : j.pages.filter((p) => p.pageKey === scope)));
  const pa = pagesOf(a);
  const pb = pagesOf(b);
  const requests = (ps: typeof pa) => new Set(ps.flatMap((p) => p.network.map((n) => `${n.method} ${n.url.split("?")[0]}`)));
  const ra = requests(pa);
  const rb = requests(pb);
  const added = [...rb].filter((r) => !ra.has(r)).sort();
  const gone = [...ra].filter((r) => !rb.has(r)).sort();
  const list = (xs: string[]) => xs.slice(0, 5).join(", ") + (xs.length > 5 ? ` and ${xs.length - 5} more` : "");
  if (added.length) out.push(`Requests b makes here that a does not: ${list(added)}. Check these first: a request that is slow, or that the browser never reports finished, holds the page open.`);
  if (gone.length) out.push(`Requests a makes here that b does not: ${list(gone)}.`);
  if (kind === "journey") {
    const ttfb = (ps: typeof pa) => {
      const by = new Map<string, number[]>();
      for (const p of ps) if (p.timing.ttfbMs >= 0) by.set(p.pageKey, [...(by.get(p.pageKey) ?? []), p.timing.ttfbMs]);
      return by;
    };
    const ta = ttfb(pa);
    const tb = ttfb(pb);
    const moved = [...ta]
      .filter(([k]) => tb.has(k))
      .map(([k, xs]) => ({ k, ma: median(xs), mb: median(tb.get(k)!) }))
      .filter((m) => m.mb - m.ma >= 50)
      .sort((x, y) => y.mb - y.ma - (x.mb - x.ma));
    if (moved.length) out.push(`Pages whose first byte moved most: ${moved.slice(0, 3).map((m) => `${m.k} ${Math.round(m.ma)}ms → ${Math.round(m.mb)}ms`).join(", ")}. A slower first byte is the server; the rest is the browser.`);
    else out.push("No page's first byte moved by 50ms or more, so the time is spent in the browser: script, rendering, or a request the page waits on.");
  }
  out.push(`Rerun it alone to confirm: \`harness run --mode any-two --a <a> --b <b> --journey ${kind === "journey" ? scope : "<the journey>"} --runs 5\`, and compare each page's network waterfall in the kept report.`);
  out.push("Then try it by hand on both builds. If people would notice, find the change in the PRs named beside it and fix or claim it; if they would not, the harness is timing a wait no one sees, and that is a harness fix.");
  return out;
}

function median(xs: number[]): number {
  const s = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}
