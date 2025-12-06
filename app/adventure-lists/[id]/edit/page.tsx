import { AdventureListForm } from "@/components/adventure-lists/AdventureListForm";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function EditAdventureListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: list, error } = await supabase
    .from("adventure_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !list) {
    notFound();
  }

  // Check ownership
  if (list.user_id !== user.id) {
    // Check if admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      redirect("/adventure-lists");
    }
  }

  return (
    <div className="container mx-auto py-8">
      <AdventureListForm
        mode="edit"
        initialValues={{
          ...list,
          // Ensure null values are handled correctly for the form
          description: list.description || "",
          notes: list.notes || "",
          image_url: list.image_url || "",
        }}
      />
    </div>
  );
}
