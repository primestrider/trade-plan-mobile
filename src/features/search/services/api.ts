import axiosInstance from "@/plugins/axios";
import type { CustomAxiosRequestConfig } from "@/shared/models";

import type { Stock } from "../models/api.model";

/**
 * Fetch every listed stock with its latest price.
 *
 * The whole exchange is under a thousand rows, so it is fetched once and
 * searched on the device rather than requested per keystroke. Market data is
 * public, so no session token is sent.
 *
 * Endpoint:
 * GET /api/stock/list
 *
 * @returns {Promise<Stock[]>} All stocks, sorted by code
 */
export const fetchStocks = async (): Promise<Stock[]> => {
  const config: CustomAxiosRequestConfig = {
    url: "/api/stock/list",
    method: "GET",
    meta: { requiresAuth: false },
  };

  const { data } = await axiosInstance.request<Stock[]>(config);
  return data;
};

/**
 * Fetch one stock's latest figures by its exchange code.
 *
 * Endpoint:
 * GET /api/stock/{code}
 *
 * @param {string} code - Exchange code, e.g. `BBCA`
 * @returns {Promise<Stock | null>} The stock, or `null` for an unknown code
 */
export const fetchStockByCode = async (code: string): Promise<Stock | null> => {
  const config: CustomAxiosRequestConfig = {
    url: `/api/stock/${encodeURIComponent(code)}`,
    method: "GET",
    meta: { requiresAuth: false },
  };

  const { data } = await axiosInstance.request<Stock | null>(config);
  return data;
};
