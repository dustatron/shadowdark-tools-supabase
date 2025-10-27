"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";

interface RootProviderProps {
  children: ReactNode;
  initialSession?: any;
}

export function RootProvider({ children, initialSession }: RootProviderProps) {
  return (
    <AuthProvider initialSession={initialSession}>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
