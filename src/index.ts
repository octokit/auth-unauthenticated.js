import { auth } from "./auth.js";
import { hook } from "./hook.js";
import type { StrategyInterface, Options, Authentication } from "./types.js";

export type Types = {
  StrategyOptions: Options;
  AuthOptions: never;
  Authentication: Authentication;
};

export const createUnauthenticatedAuth: StrategyInterface =
  function createUnauthenticatedAuth(options: Options) {
    if (!options || !options.reason) {
      throw new Error(
        "[@octokit/auth-unauthenticated] No reason passed to createUnauthenticatedAuth",
      );
    }

    return Object.assign(auth.bind(null, options.reason), {
      hook: hook.bind(null, options.reason),
    });
  };
