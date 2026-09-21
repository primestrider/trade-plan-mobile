import { QueryClient } from "@tanstack/react-query";

/**
 * Global React Query client with sensible defaults.
 * - Queries: 2 retries, 5min stale time, 30min garbage collection
 * - Mutations: no automatic retry
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
