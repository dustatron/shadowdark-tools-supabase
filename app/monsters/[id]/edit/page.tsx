"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MonsterCreateEditForm } from "@/components/monsters/MonsterCreateEditForm";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/primitives/alert";

export default function EditMonsterPage() {
  const params = useParams();
  const router = useRouter();
  const monsterId = params?.id as string;

  const [monster, setMonster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (monsterId) {
      fetchMonster();
    }
  }, [monsterId]);

  const fetchMonster = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if user is authenticated
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`/api/monsters/${monsterId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Monster not found");
        } else {
          setError("Failed to load monster");
        }
        return;
      }

      const data = await response.json();

      // Check if user owns this monster
      if (data.user_id !== user.id) {
        setError("You can only edit your own monsters");
        return;
      }

      setMonster(data);
    } catch (err) {
      console.error("Error fetching monster:", err);
      setError("An error occurred while loading the monster");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Monster</h1>
      {monster && (
        <MonsterCreateEditForm
          mode="edit"
          initialData={{ ...monster, id: monsterId }}
          onCancel={() => router.push(`/monsters/${monsterId}`)}
        />
      )}
    </div>
  );
}
