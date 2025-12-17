import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your Dungeon Exchange account to manage your monsters, spells, and encounters.",
  robots: {
    index: false,
    follow: false,
  },
};

// Client-side LoginForm handles redirect if user is already logged in
export default function Page() {
  return (
    <div className="flex min-h-svh w-full justify-center p-2 md:p-5">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
