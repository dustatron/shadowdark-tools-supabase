import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/primitives/alert";
import { EditSpellClient } from "./EditSpellClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditSpellPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/spells/${slug}/edit`)}`,
    );
  }

  // Fetch spell
  const { data: spell, error } = await supabase
    .from("user_spells")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !spell) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Spell not found or you don&apos;t have permission to edit it
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check ownership
  if (spell.user_id !== user.id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to edit this spell
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Parse JSONB classes field if needed
  const spellData = {
    ...spell,
    classes:
      typeof spell.classes === "string"
        ? JSON.parse(spell.classes)
        : spell.classes,
  };

  return <EditSpellClient spell={spellData} />;
}
