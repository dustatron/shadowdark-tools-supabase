import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/primitives/alert";
import { EditMonsterClient } from "./EditMonsterClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMonsterPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch monster
  const { data: monster, error } = await supabase
    .from("user_monsters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !monster) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Monster not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check ownership
  if (monster.user_id !== user.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            You can only edit your own monsters
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Parse JSON fields
  const monsterData = {
    ...monster,
    attacks:
      typeof monster.attacks === "string"
        ? JSON.parse(monster.attacks)
        : monster.attacks,
    abilities:
      typeof monster.abilities === "string"
        ? JSON.parse(monster.abilities)
        : monster.abilities,
    tags:
      typeof monster.tags === "string"
        ? JSON.parse(monster.tags)
        : monster.tags,
  };

  return <EditMonsterClient monster={monsterData} />;
}
