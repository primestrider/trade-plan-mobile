import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { getSessionHandlers } from "./session";
import type { ApiError, CustomAxiosRequestConfig } from "@/shared/models";

/**
 * Turns any Axios failure into one predictable shape.
 *
 * Screens get `message` / `status` / `isNetworkError` and never have to guess
 * whether the truth is in `error.response`, `error.request`, or `error.message`.
 */
function toApiError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as { message?: string } | undefined;

    return {
      message: data?.message ?? error.message,
      status: error.response.status,
      data: error.response.data,
      isNetworkError: false,
    };
  }

  // The request went out but nothing came back: offline, DNS, or timed out.
  if (error.request) {
    return {
      message: error.message,
      isNetworkError: true,
    };
  }

  // Failed before the request was even sent — a bad config.
  return {
    message: error.message,
    isNetworkError: false,
  };
}

/** Whether a 401 on this request is worth trying to recover from. */
function isRecoverable(error: AxiosError): boolean {
  if (error.response?.status !== 401) return false;

  const config = error.config as CustomAxiosRequestConfig | undefined;
  if (!config) return false;

  // An anonymous endpoint's 401 is about the request, not the session — and
  // this is also what stops the refresh call itself from recursing.
  if (config.meta?.requiresAuth === false) return false;

  // Already retried once. A second 401 means refreshing did not help.
  return config.meta?._retried !== true;
}

/**
 * Installs the shared request/response behaviour on an Axios instance.
 *
 * Kept apart from the instance itself so the policy is readable and testable
 * on its own, and so a second instance (a different host, say) can opt into
 * the same rules.
 *
 * @example
 * const instance = axios.create({ baseURL });
 * setupInterceptors(instance);
 */
export function setupInterceptors(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { meta } = config as CustomAxiosRequestConfig;

      // Authenticated unless the caller opts out, so forgetting `meta` errs
      // toward sending the token rather than silently dropping it.
      if (meta?.requiresAuth === false) return config;

      const token = getSessionHandlers()?.getAccessToken();
      if (token) config.headers.set("Authorization", `Bearer ${token}`);

      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const handlers = getSessionHandlers();

      if (!handlers || !isRecoverable(error)) {
        return Promise.reject(toApiError(error));
      }

      // `SessionHandlers` is a public seam: our own implementation always
      // resolves (to a token or to null), but a swapped-in one could reject.
      // Either way the session could not be renewed, so both collapse to the
      // same outcome — the caller gets the normalized error for the original
      // 401, never a raw rejection reason.
      let token: string | null;
      try {
        token = await handlers.refreshSession();
      } catch {
        return Promise.reject(toApiError(error));
      }

      // The session is gone. `refreshSession` has already dealt with that;
      // the caller still gets the failure it was waiting for.
      if (!token) return Promise.reject(toApiError(error));

      const config = error.config as CustomAxiosRequestConfig;

      // Annotated rather than passed as a literal: `request()` takes a plain
      // `AxiosRequestConfig`, and excess-property checking would reject `meta`
      // on a fresh object literal.
      const retried: CustomAxiosRequestConfig = {
        ...config,
        meta: { ...config.meta, _retried: true },
      };

      return axiosInstance.request(retried);
    },
  );
}
