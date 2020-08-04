import { RequestError } from "@octokit/request-error";

export function isRateLimitError(error: RequestError) {
  if (error.status !== 403) {
    return false;
  }

  /* istanbul ignore if */
  if (!error.headers) {
    return false;
  }

  return error.headers["x-ratelimit-remaining"] === "0";
}
