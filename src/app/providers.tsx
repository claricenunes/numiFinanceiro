"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // 1 min — dados financeiros não mudam em tempo real
            gcTime: 5 * 60 * 1000,       // 5 min cache
            retry: 1,
            refetchOnWindowFocus: false,  // não refetch ao trocar de aba
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
