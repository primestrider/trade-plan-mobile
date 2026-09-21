import axios from "axios";

import { setupInterceptors } from "./interceptor";

/**
 * Pre-configured Axios instance.
 * Base URL is set via the `EXPO_PUBLIC_API_URL` environment variable.
 */
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

setupInterceptors(axiosInstance);

export default axiosInstance;
