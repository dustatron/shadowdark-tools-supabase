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
    // User is already logged in, redirect to profile page
    // Try to get username_slug from user metadata or redirect to settings
    const usernameSlug = session.user.user_metadata?.username_slug;
    if (usernameSlug) {
      redirect(`/users/${usernameSlug}`);
    } else {
      redirect("/settings");
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
