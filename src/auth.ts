import { Authentication } from "./types";

export async function auth(reason: string): Promise<Authentication> {
  return {
    type: "unauthenticated",
    reason,
  };
}
