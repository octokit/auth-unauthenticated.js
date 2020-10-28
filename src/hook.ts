import { RequestError } from "@octokit/request-error";

import {
  AnyResponse,
  EndpointDefaults,
  EndpointOptions,
  RequestInterface,
  RequestParameters,
  Route,
} from "./types";
import { isRateLimitError } from "./is-rate-limit-error";
import { isAbuseLimitError } from "./is-abuse-limit-error";

const MUTATING_METHODS = ["DELETE", "PATCH", "POST", "PUT"];

export async function hook(
  reason: string,
  request: RequestInterface,
  route: Route | EndpointOptions,
  parameters?: RequestParameters
): Promise<AnyResponse> {
  const endpoint: EndpointDefaults = request.endpoint.merge(
    route as string,
    parameters
  );

  if (MUTATING_METHODS.includes(endpoint.method)) {
    throw new RequestError(
      `"${endpoint.method} ${endpoint.url}" is not permitted due to lack of authentication. Reason: ${reason}`,
      403,
      {
        request: request.endpoint.parse(endpoint),
      }
    );
  }

  return request(endpoint as EndpointOptions).catch((error) => {
    if (error.status === 404) {
      error.message = `Not found. May be due to lack of authentication. Reason: ${reason}`;
    }

    if (isRateLimitError(error)) {
      error.message = `API rate limit exceeded. This maybe caused by the lack of authentication. Reason: ${reason}`;
    }

    if (isAbuseLimitError(error)) {
      error.message = `You have triggered an abuse detection mechanism. This maybe caused by the lack of authentication. Reason: ${reason}`;
    }

    throw error;
  });
}
