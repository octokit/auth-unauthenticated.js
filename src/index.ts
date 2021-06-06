import { auth } from "./auth";
import { hook } from "./hook";
import { StrategyInterface, Options, Authentication } from "./types";

export type Types = {
  StrategyOptions: Options;
  AuthOptions: never;
  Authentication: Authentication;
};

export const createUnauthenticatedAuth: StrategyInterface =
  function createUnauthenticatedAuth(options: Options) {
    if (!options || !options.reason) {
      throw new Error(
        "[@octokit/auth-unauthenticated] No reason passed to createUnauthenticatedAuth"
      );
    }

    return Object.assign(auth.bind(null, options.reason), {
      hook: hook.bind(null, options.reason),
    });
  };
