import { RequestError } from "@octokit/request-error";

export function isRateLimitError(error: RequestError) {
  if (error.status !== 403) {
    return false;
  }

  /* v8 ignore next 3 */
  if (!error.response) {
    return false;
  }

  return error.response.headers["x-ratelimit-remaining"] === "0";
}
