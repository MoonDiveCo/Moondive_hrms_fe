"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/reactQueryClient";

export default function ReactQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
