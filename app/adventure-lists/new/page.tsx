import { AdventureListForm } from "@/components/adventure-lists/AdventureListForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewAdventureListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8">
      <AdventureListForm mode="create" />
    </div>
  );
}
