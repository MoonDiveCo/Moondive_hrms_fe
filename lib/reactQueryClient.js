import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes (important)
      cacheTime: 30 * 60 * 1000,     // 30 minutes
      refetchOnWindowFocus: false,   // HRMS UX
      retry: 1,                      // avoid retry storms
    },
  },
});
