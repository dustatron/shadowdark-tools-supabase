"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Info } from "lucide-react";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateSpellPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login with return URL
        router.push(
          "/auth/login?redirect=" + encodeURIComponent("/spells/create"),
        );
      } else {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect, so don't render anything
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Custom Spell</h1>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The spell creation form is not yet implemented. This page is reserved
          for future development.
        </AlertDescription>
      </Alert>
      {/* TODO: Add SpellCreateEditForm component when available */}
      {/* <SpellCreateEditForm mode="create" /> */}
    </div>
  );
}
