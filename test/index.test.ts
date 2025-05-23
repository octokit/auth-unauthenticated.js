import { test, expect } from "vitest";
import { request } from "@octokit/request";
import fetchMock from "fetch-mock";

import { createUnauthenticatedAuth } from "../src/index.ts";

test("README example", async () => {
  const auth = createUnauthenticatedAuth({
    reason:
      "Handling an installation.deleted event (The app's access has been revoked)",
  });
  const authentication = await auth();

  expect(authentication).toEqual({
    type: "unauthenticated",
    reason:
      "Handling an installation.deleted event (The app's access has been revoked)",
  });
});

test("no reason", async () => {
  try {
    // @ts-ignore
    const auth = createUnauthenticatedAuth();
    throw new Error("Should not resolve");
  } catch (error: any) {
    expect(error.message).toMatch(
      /No reason passed to createUnauthenticatedAuth/i,
    );
  }
});

test('auth.hook(request, "GET /repos/octocat/hello-world")', async () => {
  const expectedRequestHeaders = {
    accept: "application/vnd.github.v3+json",
    "user-agent": "test",
  };

  const matchGetUser: fetchMock.MockMatcherFunction = (request) => {
    expect(request.url).toEqual(
      "https://api.github.com/repos/octocat/hello-world",
    );

    const headersObject = mock.callHistory.calls()[0].options.headers!;
    expect(headersObject).toStrictEqual(expectedRequestHeaders);

    return true;
  };

  const mock = fetchMock.createInstance();

  mock.getOnce(matchGetUser, {
    status: 200,
    body: {
      id: 123,
    },
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
  const { data } = await hook(requestMock, "GET /repos/octocat/hello-world");

  expect({ ...data }).toStrictEqual({ id: 123 });
});

test('auth.hook(request, "GET /repos/octocat/hello-world") returns 404', async () => {
  const expectedRequestHeaders = {
    accept: "application/vnd.github.v3+json",
    "user-agent": "test",
  };

  const matchGetUser: fetchMock.MockMatcherFunction = (request) => {
    expect(request.url).toEqual(
      "https://api.github.com/repos/octocat/hello-world",
    );

    const headersObject = mock.callHistory.calls()[0].options.headers!;
    expect(headersObject).toStrictEqual(expectedRequestHeaders);

    return true;
  };

  const mock = fetchMock.createInstance();
  mock.getOnce(matchGetUser, {
    status: 404,
    body: {
      message: "Not Found",
    },
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

  try {
    // Call the hook with the requestMock
    await hook(requestMock, "GET /repos/octocat/hello-world");
    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe(
      "Not found. May be due to lack of authentication. Reason: test",
    );
  }
});

test('auth.hook(request, "GET /repos/octocat/hello-world") returns rate limit response', async () => {
  const expectedRequestHeaders = {
    accept: "application/vnd.github.v3+json",
    "user-agent": "test",
  };

  const matchGetUser: fetchMock.MockMatcherFunction = (request) => {
    expect(request.url).toEqual(
      "https://api.github.com/repos/octocat/hello-world",
    );

    const headersObject = mock.callHistory.calls()[0].options.headers!;
    expect(headersObject).toStrictEqual(expectedRequestHeaders);

    return true;
  };

  const mock = fetchMock.createInstance().getOnce(matchGetUser, {
    status: 403,
    headers: {
      "x-ratelimit-remaining": 0,
    },
    body: {
      message:
        "API rate limit exceeded for xxx.xxx.xxx.xxx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
    },
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

  try {
    await hook(requestMock, "GET /repos/octocat/hello-world");
    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe(
      "API rate limit exceeded. This maybe caused by the lack of authentication. Reason: test",
    );
  }
});

test('auth.hook(request, "GET /repos/octocat/hello-world") returns rate limit response', async () => {
  const expectedRequestHeaders = {
    accept: "application/vnd.github.v3+json",
    "user-agent": "test",
  };

  const matchGetUser: fetchMock.MockMatcherFunction = (request) => {
    expect(request.url).toEqual(
      "https://api.github.com/repos/octocat/hello-world",
    );

    const headersObject = mock.callHistory.calls()[0].options.headers!;
    expect(headersObject).toStrictEqual(expectedRequestHeaders);

    return true;
  };

  const mock = fetchMock.createInstance().getOnce(matchGetUser, {
    status: 403,
    body: {
      message:
        "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.",
    },
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

  try {
    await hook(requestMock, "GET /repos/octocat/hello-world");
    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe(
      "You have triggered an abuse detection mechanism. This maybe caused by the lack of authentication. Reason: test",
    );
  }
});

test('auth.hook(request, "PATCH /repos/octocat/hello-world") with 401 response', async () => {
  const mock = fetchMock
    .createInstance()
    .patchOnce("path:/repos/octocat/hello-world", 401);
  const requestMock = request.defaults({
    headers: {
      "user-agent": "test",
    },
    request: {
      fetch: mock.fetchHandler,
    },
  });

  const { hook } = createUnauthenticatedAuth({ reason: "test" });

  try {
    await hook(requestMock, "PATCH /repos/octocat/hello-world");
    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe(
      'Unauthorized. "PATCH /repos/octocat/hello-world" failed most likely due to lack of authentication. Reason: test',
    );
  }
});

test('auth.hook(request, "GET /repos/octocat/hello-world") does not swallow non-request related errors', async () => {
  const mock = fetchMock
    .createInstance()
    .get("path:/repos/octocat/hello-world", {
      status: 500,
      body: {
        message: "unrelated",
      },
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

  try {
    await hook(requestMock, "GET /repos/octocat/hello-world");
    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe("unrelated");
  }
});

test('auth.hook(request, "POST /repos/octocat/hello-world/issues/123/comments") with 403 response', async () => {
  const mock = fetchMock
    .createInstance()
    .postOnce("path:/repos/octocat/hello-world/issues/123/comments", {
      status: 403,
      body: {
        message: "You cannot comment on locked issues",
      },
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

  try {
    await hook(
      requestMock,
      "POST /repos/octocat/hello-world/issues/123/comments",
    );

    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe(
      "You cannot comment on locked issues. May be caused by lack of authentication (test).",
    );
  }
});

test("500 response", async () => {
  const mock = fetchMock.createInstance().getOnce("path:/", 500);

  const requestMock = request.defaults({
    headers: {
      "user-agent": "test",
    },
    request: {
      fetch: mock.fetchHandler,
    },
  });

  const { hook } = createUnauthenticatedAuth({ reason: "test" });

  try {
    await hook(requestMock, "GET /");

    throw new Error("should not resolve");
  } catch (error: any) {
    expect(error.message).toBe("");
  }
});
