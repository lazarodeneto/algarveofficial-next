import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

export const APP_QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

export function createAppQueryClient() {
  return new QueryClient(APP_QUERY_CLIENT_CONFIG);
}
