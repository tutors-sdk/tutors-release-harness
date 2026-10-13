import type { RealtimeCost } from "../types.ts";

/**
 * The reader's Supabase Realtime cost, per page (since 1.36.0). Pure: the browser collector (src/collectors/browser.ts)
 * feeds it Playwright's request and websocket events, and tests feed it strings.
 *
 * On 13 Oct 2026 the reader joined a Realtime channel per course and every page view was delivered to every classmate,
 * which overran the project's Realtime quota. Readers are now publish-only: a page view is one HTTP POST to
 * `/realtime/v1/api/broadcast`, and only Tutors Live dashboards and shared whiteboards open a socket. What is counted:
 *
 *   broadcasts  POSTs to a path containing `/realtime/v1/api/broadcast`
 *   sockets     WebSockets opened to a URL containing `/realtime/v1/websocket`
 *   framesSent  frames the page sent on those sockets, except Phoenix control frames
 *
 * Control frames are `phx_join`, `phx_leave`, `heartbeat` and `access_token`: the socket's own upkeep, sent on timers or
 * once per channel, whose count depends on how long a page stayed open rather than on what the reader did. Joining is
 * already what `sockets` reports. Everything else is a data frame: a broadcast or presence push (text,
 * `[join_ref, ref, topic, event, payload]` in protocol 2.0.0, `{ topic, event, payload, ref }` in 1.0.0) and every
 * binary frame (protocol 2.0.0 sends user broadcasts as binary). A text frame that is not Phoenix JSON is counted as data.
 */
export const BROADCAST_PATH = "/realtime/v1/api/broadcast";
export const SOCKET_PATH = "/realtime/v1/websocket";
export const CONTROL_EVENTS: ReadonlySet<string> = new Set(["phx_join", "phx_leave", "heartbeat", "access_token"]);

export const emptyRealtime = (): RealtimeCost => ({ broadcasts: 0, sockets: 0, framesSent: 0 });

/** A request that publishes over Realtime's HTTP broadcast endpoint. */
export function isBroadcast(method: string, url: string): boolean {
  return method.toUpperCase() === "POST" && pathOf(url).includes(BROADCAST_PATH);
}

/** A WebSocket to Supabase Realtime. */
export function isRealtimeSocket(url: string): boolean {
  return pathOf(url).includes(SOCKET_PATH);
}

/** The Phoenix event a text frame carries, or undefined when it is not Phoenix JSON. */
export function phoenixEvent(text: string): string | undefined {
  let message: unknown;
  try {
    message = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (Array.isArray(message)) return typeof message[3] === "string" ? message[3] : undefined;
  if (message && typeof message === "object" && typeof (message as { event?: unknown }).event === "string") return (message as { event: string }).event;
  return undefined;
}

/** A frame that is not socket upkeep: see the module comment. */
export function isDataFrame(payload: string | Buffer): boolean {
  if (typeof payload !== "string") return true;
  const event = phoenixEvent(payload);
  return event === undefined || !CONTROL_EVENTS.has(event);
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split(/[?#]/)[0] ?? url;
  }
}
