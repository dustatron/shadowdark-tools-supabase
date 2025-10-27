"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";

interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
