import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your Dungeon Exchange account to manage your monsters, spells, and encounters.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  // Check if user is already authenticated
  const session = await getServerSession();

  if (session?.user) {
    // User is already logged in, redirect to adventure lists
    redirect("/adventure-lists");
  }

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
