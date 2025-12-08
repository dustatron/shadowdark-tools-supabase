"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { SpellForm } from "@/src/components/spells/SpellForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditSpellPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditSpellPage({ params }: EditSpellPageProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [spell, setSpell] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login with return URL
        router.push(
          "/auth/login?redirect=" +
            encodeURIComponent(`/spells/${resolvedParams.slug}/edit`),
        );
        return;
      }

      setIsAuthenticated(true);

      // Load spell data
      const { data: spellData, error: spellError } = await supabase
        .from("user_spells")
        .select("*")
        .eq("slug", resolvedParams.slug)
        .single();

      if (spellError || !spellData) {
        setError("Spell not found or you don't have permission to edit it");
        setIsChecking(false);
        return;
      }

      // Check ownership
      if (spellData.user_id !== user.id) {
        setError("You don't have permission to edit this spell");
        setIsChecking(false);
        return;
      }

      // Parse JSONB classes field if needed
      const parsedSpell = {
        ...spellData,
        classes:
          typeof spellData.classes === "string"
            ? JSON.parse(spellData.classes)
            : spellData.classes,
      };

      setSpell(parsedSpell);
      setIsChecking(false);
    };

    loadData();
  }, [params, router]);

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
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!spell) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Loading spell data...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Spell</h1>
        <p className="text-muted-foreground mt-2">
          Update {spell.name} for your Shadowdark campaign
        </p>
      </div>
      <SpellForm mode="edit" initialData={spell} />
    </div>
  );
}
