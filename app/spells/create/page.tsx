"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { SpellForm } from "@/components/spells/SpellForm";

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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Custom Spell</h1>
        <p className="text-muted-foreground mt-2">
          Add a new spell to your Shadowdark campaign
        </p>
      </div>
      <SpellForm mode="create" />
    </div>
  );
}
