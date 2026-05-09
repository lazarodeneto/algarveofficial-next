import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

export const APP_QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

export function createAppQueryClient() {
  return new QueryClient(APP_QUERY_CLIENT_CONFIG);
}
