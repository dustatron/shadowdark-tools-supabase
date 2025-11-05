"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";

interface RootProviderProps {
  children: ReactNode;
  initialSession?: any;
}

export function RootProvider({ children, initialSession }: RootProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={initialSession}>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
