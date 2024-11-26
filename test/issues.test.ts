import { test, expect } from "vitest";
import { request } from "@octokit/request";
import fetchMock from "fetch-mock";

import { createUnauthenticatedAuth } from "../src/index.ts";

test("https://github.com/octokit/auth-unauthenticated.js/issues/29", async () => {
  const mock = fetchMock
    .createInstance()
    .postOnce("path:/app-manifests/123/conversions", {
      status: 201,
      body: { id: 1 },
    });

  const requestMock = request.defaults({
    headers: {
      "user-agent": "test",
    },
    request: {
      fetch: mock.fetchHandler,
    },
  });

  const { hook } = createUnauthenticatedAuth({ reason: "test" });
  const { data } = await hook(
    requestMock,
    "POST /app-manifests/{code}/conversions",
    {
      code: 123,
    },
  );

  expect({ ...data }).toStrictEqual({ id: 1 });
});
