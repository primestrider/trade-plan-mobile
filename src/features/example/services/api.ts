import axiosInstance from "@/plugins/axios";
import type { CustomAxiosRequestConfig } from "@/shared/models";

import type {
  DummyLoginRequest,
  DummyLoginResponse,
  DummyProduct,
  DummyProductListResponse,
  DummyRefreshResponse,
} from "../models/api.model";

/**
 * These examples read a public API, so the host is spelled out per request
 * rather than through `baseURL`. That keeps `EXPO_PUBLIC_API_URL` free for
 * your own backend while every call still passes through the shared instance
 * and its interceptors.
 *
 * A real feature would drop the host and use a relative path.
 */
const HOST = "https://dummyjson.com";

/** DummyJSON is public, so nothing here should carry the user's token. */
const anonymous = { requiresAuth: false } as const;

/**
 * Fetch one page of products.
 *
 * Endpoint:
 * GET /products?limit={limit}&skip={skip}
 */
export const fetchProducts = async (params: {
  limit: number;
  skip: number;
}): Promise<DummyProductListResponse> => {
  const config: CustomAxiosRequestConfig = {
    url: `${HOST}/products`,
    method: "GET",
    params,
    meta: anonymous,
  };

  const { data } = await axiosInstance.request<DummyProductListResponse>(config);
  return data;
};

/**
 * Search products by free text.
 *
 * Endpoint:
 * GET /products/search?q={query}&limit={limit}&skip={skip}
 */
export const searchProducts = async (params: {
  query: string;
  limit: number;
  skip: number;
}): Promise<DummyProductListResponse> => {
  const { query, ...pagination } = params;

  const config: CustomAxiosRequestConfig = {
    url: `${HOST}/products/search`,
    method: "GET",
    params: { q: query, ...pagination },
    meta: anonymous,
  };

  const { data } = await axiosInstance.request<DummyProductListResponse>(config);
  return data;
};

/**
 * Fetch a single product.
 *
 * Endpoint:
 * GET /products/{id}
 */
export const fetchProductById = async (id: number): Promise<DummyProduct> => {
  const config: CustomAxiosRequestConfig = {
    url: `${HOST}/products/${id}`,
    method: "GET",
    meta: anonymous,
  };

  const { data } = await axiosInstance.request<DummyProduct>(config);
  return data;
};

/**
 * Exchange credentials for a token pair.
 *
 * Endpoint:
 * POST /auth/login
 *
 * Opted out of auth explicitly: sending a stale token to the endpoint that
 * issues tokens is how you get a confusing 401 on a valid password.
 */
export const login = async (
  payload: DummyLoginRequest,
): Promise<DummyLoginResponse> => {
  const config: CustomAxiosRequestConfig<DummyLoginRequest> = {
    url: `${HOST}/auth/login`,
    method: "POST",
    data: payload,
    meta: anonymous,
  };

  const { data } = await axiosInstance.request<DummyLoginResponse>(config);
  return data;
};

/**
 * Exchange a refresh token for a new pair.
 *
 * Endpoint:
 * POST /auth/refresh
 *
 * Opted out of auth: the access token this is meant to replace is, by
 * definition, the one that just stopped working. Opting out is also what keeps
 * a failure here from recursing back into the refresh flow.
 */
export const refreshSession = async (
  refreshToken: string,
): Promise<DummyRefreshResponse> => {
  const config: CustomAxiosRequestConfig<{ refreshToken: string }> = {
    url: `${HOST}/auth/refresh`,
    method: "POST",
    data: { refreshToken },
    meta: anonymous,
  };

  const { data } = await axiosInstance.request<DummyRefreshResponse>(config);
  return data;
};
