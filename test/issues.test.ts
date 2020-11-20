import { request } from "@octokit/request";
import fetchMock, { MockMatcherFunction } from "fetch-mock";

import { createUnauthenticatedAuth } from "../src/index";

test("https://github.com/octokit/auth-unauthenticated.js/issues/29", async () => {
  const requestMock = request.defaults({
    headers: {
      "user-agent": "test",
    },
    request: {
      fetch: fetchMock
        .sandbox()
        .postOnce("path:/app-manifests/123/conversions", {
          status: 201,
          body: { id: 1 },
        }),
    },
  });

  const { hook } = createUnauthenticatedAuth({ reason: "test" });
  const { data } = await hook(
    requestMock,
    "POST /app-manifests/{code}/conversions",
    {
      code: 123,
    }
  );

  expect(data).toStrictEqual({ id: 1 });
});
