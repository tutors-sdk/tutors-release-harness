import type { Hunk, PageCapture, RealtimeCost, SideCapture } from "../types.ts";
import { hunkId, pagePairs, type PagePair } from "./pages.ts";

/**
 * The reader's Supabase Realtime cost per page view (since 1.36.0). On 13 Oct 2026 the reader joined a Realtime channel
 * per course and broadcast every page view to every classmate, so the project's message count grew with the square of a
 * class and overran its quota. Readers are now publish-only (tutors-sdk/tutors-mono-repo#474): a page view is an HTTP
 * POST to `/realtime/v1/api/broadcast`, and only Tutors Live dashboards and shared whiteboards open a socket. The
 * collector counts, per page, the broadcasts, the Realtime sockets opened and the data frames sent on them
 * (src/collectors/realtime.ts). Two rules, on reader pages only (page keys `reader:`, `reader-auth:`, `reference:`):
 *
 *   <page key>/websocket   absolute: a reader page opened a Realtime websocket on b. A socket is a subscription, and a
 *                          subscribed reader is delivered every classmate's page view; the stub never fans out, so the
 *                          socket is what the harness can see of that cost. Ends "(production too)" when a's same page
 *                          opened one as well, or "(new on b)", as the policy family's findings do; like theirs, an
 *                          A/A of an image that opens one reports it.
 *   <app>/messages         regression: b's Realtime messages per reader page view (broadcasts plus data frames, over the
 *                          pages both sides reached, every run) are more than a's. Fewer is information.
 *
 * No threshold, and so no mask: one more message across a run is the regression this exists to see. A page view's
 * broadcast is made when the reader records the view; heartbeats and joins, which run on timers or once per channel, are
 * not counted, and counts are summed over a whole run so a message landing in the next page's window still counts once.
 * A side whose capture predates 1.36.0 carries no counts: when only one side has them, one info `collection` hunk says
 * no comparison was possible. The check ships **informing** (src/compare/levels.ts): reported, never gates.
 */
export const READER_APPS: readonly string[] = ["reader", "reader-auth", "reference"];

const appOf = (pageKey: string) => pageKey.split(":")[0] ?? pageKey;
const isReaderPage = (p: Pick<PageCapture, "pageKey">) => READER_APPS.includes(appOf(p.pageKey));
const messages = (r: RealtimeCost) => r.broadcasts + r.framesSent;
const perView = (n: number, views: number) => String(Math.round((n / views) * 100) / 100);

export function realtime(a: SideCapture, b: SideCapture): Hunk[] {
  const hunks: Hunk[] = [];
  const pairs = pagePairs(a, b, undefined).filter((p) => isReaderPage(p));
  const has = (side: "a" | "b") => pairs.some((p) => p[side].realtime !== undefined);
  if (has("a") !== has("b")) {
    const side = has("a") ? "a" : "b";
    hunks.push({ id: hunkId("realtime", "collection"), artefact: "realtime", scope: "collection", severity: "info", summary: `Realtime cost was collected on ${side} only (a capture recorded before 1.36.0 has none); no comparison was possible` });
  }

  // 1. Readers are publish-only: a socket on a reader page is a finding whatever a did.
  const socketOnA = new Set(pairs.filter((p) => (p.a.realtime?.sockets ?? 0) > 0).map((p) => p.pageKey));
  const seen = new Set<string>();
  for (const pair of pairs) {
    const rb = pair.b.realtime;
    if (!rb || rb.sockets === 0 || seen.has(pair.pageKey)) continue;
    seen.add(pair.pageKey);
    const tail = socketOnA.has(pair.pageKey) ? " (production too)" : pair.a.realtime ? " (new on b)" : "";
    hunks.push({
      id: hunkId("realtime", `${pair.pageKey}/websocket`),
      artefact: "realtime",
      scope: `${pair.pageKey}/websocket`,
      path: pair.path,
      severity: "fail",
      summary: `${pair.pageKey}: a reader page opened a Realtime websocket on b (${rb.sockets} socket(s), ${rb.framesSent} data frame(s) sent); readers must be publish-only${tail}`
    });
  }

  // 2. Messages per reader page view, per app, over the pages both sides reached with counts on both.
  const byApp = new Map<string, PagePair[]>();
  for (const pair of pairs) if (pair.a.realtime && pair.b.realtime) byApp.set(appOf(pair.pageKey), [...(byApp.get(appOf(pair.pageKey)) ?? []), pair]);
  for (const [app, list] of byApp) {
    const sum = (side: "a" | "b", f: (r: RealtimeCost) => number) => list.reduce((n, p) => n + f(p[side].realtime!), 0);
    const ma = sum("a", messages);
    const mb = sum("b", messages);
    if (ma === mb) continue;
    const views = list.length;
    const how = `(broadcasts a ${sum("a", (r) => r.broadcasts)} / b ${sum("b", (r) => r.broadcasts)}, socket data frames a ${sum("a", (r) => r.framesSent)} / b ${sum("b", (r) => r.framesSent)}, over ${views} page view(s))`;
    const rose = mb > ma;
    hunks.push({
      id: hunkId("realtime", `${app}/messages`),
      artefact: "realtime",
      scope: `${app}/messages`,
      severity: rose ? "fail" : "info",
      summary: `${app}: Realtime messages per reader page view ${rose ? "rose" : "fell"}: a ${perView(ma, views)} / b ${perView(mb, views)} per reader page ${how}`
    });
  }
  return hunks;
}
