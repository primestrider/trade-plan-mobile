import type { AxiosRequestConfig } from "axios";

/**
 * Axios config with a `meta` channel for cross-cutting request concerns.
 *
 * `requiresAuth` defaults to true when absent — an endpoint that must stay
 * anonymous (sign-in, public catalogues) has to opt out explicitly, so a new
 * endpoint is authenticated by mistake rather than public by mistake.
 */
export type CustomAxiosRequestConfig<Data = unknown> = AxiosRequestConfig<Data> & {
  meta?: {
    requiresAuth?: boolean;
    /**
     * Internal. Set by the response interceptor on a request it has already
     * retried after refreshing, so a still-401 retry stops instead of looping.
     * Callers never set this.
     */
    _retried?: boolean;
  };
};

/** The envelope most of our own endpoints answer with. */
export type ApiResponse<ResponseData = null> = {
  status: boolean;
  message: string;
  data: ResponseData | null;
};

/**
 * What the response interceptor hands to callers instead of a raw
 * `AxiosError`, so screens never reach into `error.response.data` themselves.
 */
export type ApiError = {
  message: string;
  /** Absent when the request never reached the server. */
  status?: number;
  data?: unknown;
  /** True when the server was never reached — offline, DNS, timeout. */
  isNetworkError: boolean;
};

export type PaginationRequest = {
  page: number;
  limit: number;
  search?: string;
};

export type PaginationResponse = {
  page: number;
  limit: number;
  total: number;
  total_page: number;
};
