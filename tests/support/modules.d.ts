// The fixture stubs are plain ESM JavaScript; this is what the tests import from them.
declare module "*/identity/stub.mjs" {
  import type { IncomingMessage, ServerResponse } from "node:http";
  export const USERS: Record<"student" | "enrolled" | "lecturer" | "owner" | "admin", { id: number; login: string; name: string; email: string; avatar_url: string }>;
  export function handler(req: IncomingMessage, res: ServerResponse): void;
}
