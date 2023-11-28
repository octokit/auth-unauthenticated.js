import type { Authentication } from "./types.js";

export async function auth(reason: string): Promise<Authentication> {
  return {
    type: "unauthenticated",
    reason,
  };
}
