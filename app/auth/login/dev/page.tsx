import { DevLoginForm } from "@/components/dev-login-form";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dev Login",
  description: "Developer login page with Okta and Cognito options",
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
          <DevLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
