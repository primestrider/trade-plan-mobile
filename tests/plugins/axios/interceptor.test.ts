import axios, {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";

import { setupInterceptors } from "@/plugins/axios/interceptor";
import {
  registerSessionHandlers,
  resetSessionHandlers,
} from "@/plugins/axios/session";
import { mmkvStorage } from "@/plugins/mmkv";
import type { ApiError, CustomAxiosRequestConfig } from "@/shared/models";

/** Captures the config the adapter was handed, after interceptors ran. */
let seenConfig: InternalAxiosRequestConfig | undefined;

function instanceWith(adapter: AxiosAdapter) {
  const instance = axios.create({ adapter });
  setupInterceptors(instance);
  return instance;
}

/** An adapter that always succeeds, recording what it was asked to send. */
const okAdapter: AxiosAdapter = (config) => {
  seenConfig = config;

  return Promise.resolve({
    data: { ok: true },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
};

/** An adapter that fails the way the given error describes. */
function failingAdapter(makeError: (config: InternalAxiosRequestConfig) => AxiosError): AxiosAdapter {
  return (config) => Promise.reject(makeError(config));
}

function authorizationHeader(): unknown {
  return seenConfig?.headers?.Authorization;
}

beforeEach(() => {
  seenConfig = undefined;
  mmkvStorage.clearAll();
  resetSessionHandlers();
});

describe("axios request interceptor", () => {
  it("attaches the stored access token", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-123",
      refreshSession: jest.fn(),
    });

    await instanceWith(okAdapter).request({ url: "/products" });

    expect(authorizationHeader()).toBe("Bearer token-123");
  });

  it("sends no Authorization header when nothing is stored", async () => {
    await instanceWith(okAdapter).request({ url: "/products" });

    expect(authorizationHeader()).toBeUndefined();
  });

  it("treats a request as authenticated when meta is absent", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-123",
      refreshSession: jest.fn(),
    });

    await instanceWith(okAdapter).request({ url: "/products" });

    expect(authorizationHeader()).toBe("Bearer token-123");
  });

  it("skips the token when the caller opts out", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-123",
      refreshSession: jest.fn(),
    });

    const config: CustomAxiosRequestConfig = {
      url: "/auth/login",
      method: "POST",
      meta: { requiresAuth: false },
    };

    await instanceWith(okAdapter).request(config);

    expect(authorizationHeader()).toBeUndefined();
  });

  it("attaches the token when the caller opts in explicitly", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-123",
      refreshSession: jest.fn(),
    });

    const config: CustomAxiosRequestConfig = {
      url: "/me",
      meta: { requiresAuth: true },
    };

    await instanceWith(okAdapter).request(config);

    expect(authorizationHeader()).toBe("Bearer token-123");
  });

  it("passes a successful response through untouched", async () => {
    const response = await instanceWith(okAdapter).request({ url: "/products" });

    expect(response.data).toEqual({ ok: true });
    expect(response.status).toBe(200);
  });
});

describe("axios response interceptor", () => {
  it("prefers the server's own message", async () => {
    const instance = instanceWith(
      failingAdapter((config) =>
        new AxiosError("Request failed", "ERR_BAD_REQUEST", config, {}, {
          data: { message: "Invalid credentials" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        }),
      ),
    );

    const error: ApiError = await instance
      .request({ url: "/auth/login" })
      .catch((rejected) => rejected);

    expect(error).toEqual({
      message: "Invalid credentials",
      status: 401,
      data: { message: "Invalid credentials" },
      isNetworkError: false,
    });
  });

  it("falls back to the Axios message when the body carries none", async () => {
    const instance = instanceWith(
      failingAdapter((config) =>
        new AxiosError("Request failed with status code 500", "ERR_BAD_RESPONSE", config, {}, {
          data: {},
          status: 500,
          statusText: "Server Error",
          headers: {},
          config,
        }),
      ),
    );

    const error: ApiError = await instance
      .request({ url: "/products" })
      .catch((rejected) => rejected);

    expect(error.message).toBe("Request failed with status code 500");
    expect(error.status).toBe(500);
    expect(error.isNetworkError).toBe(false);
  });

  it("flags a request that never reached the server", async () => {
    const instance = instanceWith(
      failingAdapter((config) =>
        // A request object but no response — offline, DNS failure, timeout.
        new AxiosError("Network Error", "ERR_NETWORK", config, {}),
      ),
    );

    const error: ApiError = await instance
      .request({ url: "/products" })
      .catch((rejected) => rejected);

    expect(error).toEqual({
      message: "Network Error",
      isNetworkError: true,
    });
  });

  it("reports a request that failed before being sent", async () => {
    const instance = instanceWith(
      failingAdapter((config) => new AxiosError("Bad config", "ERR_BAD_OPTION", config)),
    );

    const error: ApiError = await instance
      .request({ url: "/products" })
      .catch((rejected) => rejected);

    expect(error).toEqual({
      message: "Bad config",
      isNetworkError: false,
    });
  });

  it("never leaks a raw AxiosError to the caller", async () => {
    const instance = instanceWith(
      failingAdapter((config) => new AxiosError("Network Error", "ERR_NETWORK", config, {})),
    );

    const error = await instance.request({ url: "/products" }).catch((rejected) => rejected);

    expect(error).not.toBeInstanceOf(AxiosError);
  });
});

/** An adapter that answers 401 once, then succeeds. */
function unauthorizedThenOk(): AxiosAdapter {
  let served = 0;

  return (config) => {
    served += 1;
    seenConfig = config;

    if (served === 1) {
      return Promise.reject(
        new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, {
          data: { message: "Token expired" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        }),
      );
    }

    return Promise.resolve({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
  };
}

/** An adapter that answers 401 every single time. */
const alwaysUnauthorized: AxiosAdapter = (config) =>
  Promise.reject(
    new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, {
      data: { message: "Token expired" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
    }),
  );

describe("axios session handling", () => {
  afterEach(() => {
    resetSessionHandlers();
  });

  it("attaches the token the handlers provide", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-from-session",
      refreshSession: jest.fn(),
    });

    await instanceWith(okAdapter).request({ url: "/me" });

    expect(authorizationHeader()).toBe("Bearer token-from-session");
  });

  it("refreshes once and retries the request on 401", async () => {
    const refreshSession = jest.fn().mockResolvedValue("token-2");
    registerSessionHandlers({
      getAccessToken: () => "token-1",
      refreshSession,
    });

    const response = await instanceWith(unauthorizedThenOk()).request({ url: "/me" });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(response.data).toEqual({ ok: true });
  });

  it("does not refresh a request that opted out of auth", async () => {
    const refreshSession = jest.fn();
    registerSessionHandlers({ getAccessToken: () => "token-1", refreshSession });

    const config: CustomAxiosRequestConfig = {
      url: "/auth/login",
      method: "POST",
      meta: { requiresAuth: false },
    };

    await instanceWith(alwaysUnauthorized)
      .request(config)
      .catch((rejected) => rejected);

    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("gives up after one retry rather than looping", async () => {
    const refreshSession = jest.fn().mockResolvedValue("token-2");
    registerSessionHandlers({ getAccessToken: () => "token-1", refreshSession });

    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(error.status).toBe(401);
  });

  it("rejects with the normalized error when the refresh fails", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-1",
      refreshSession: jest.fn().mockResolvedValue(null),
    });

    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(error).toEqual({
      message: "Token expired",
      status: 401,
      data: { message: "Token expired" },
      isNetworkError: false,
    });
  });

  it("rejects with the normalized error when the refresh rejects", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-1",
      refreshSession: jest.fn().mockRejectedValue(new Error("refresh endpoint is down")),
    });

    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(error).toEqual({
      message: "Token expired",
      status: 401,
      data: { message: "Token expired" },
      isNetworkError: false,
    });
  });

  it("behaves exactly as before when no handlers are registered", async () => {
    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(error.status).toBe(401);
    expect(authorizationHeader()).toBeUndefined();
  });
});
