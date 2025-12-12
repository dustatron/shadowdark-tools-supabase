import { createClient } from "@/lib/supabase/server";
import { AdventureListDetail } from "@/components/adventure-lists/AdventureListDetail";
import { notFound, redirect } from "next/navigation";

export default async function AdventureListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch list details
  const { data: list, error: listError } = await supabase
    .from("adventure_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (listError || !list) {
    notFound();
  }

  // Check permissions
  if (!list.is_public && (!user || list.user_id !== user.id)) {
    // Check if admin
    if (user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        redirect("/adventure-lists");
      }
    } else {
      redirect("/login");
    }
  }

  // Fetch items
  const { data: items, error: itemsError } = await supabase.rpc(
    "get_adventure_list_items",
    { list_uuid: id },
  );

  if (itemsError) {
    console.error("Error fetching list items:", itemsError);
    // We can still show the list details even if items fail to load
  }

  // Group items by type
  const groupedItems = {
    monsters: items?.filter((i: any) => i.item_type === "monster") || [],
    spells: items?.filter((i: any) => i.item_type === "spell") || [],
    magic_items: items?.filter((i: any) => i.item_type === "magic_item") || [],
    equipment: items?.filter((i: any) => i.item_type === "equipment") || [],
  };

  const isOwner = user?.id === list.user_id;

  return (
    <div className="container mx-auto py-8">
      <AdventureListDetail list={list} items={groupedItems} isOwner={isOwner} />
    </div>
  );
}
