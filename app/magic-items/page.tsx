import { createClient } from "@/lib/supabase/server";
import { MagicItemCard } from "@/components/magic-items/MagicItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
}

interface PageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function MagicItemsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchTerm = params.search;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("official_magic_items")
    .select("*")
    .order("name", { ascending: true });

  // Apply search filter if provided
  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    );
  }

  const { data: items, error } = await query;

  if (error) {
    console.error("Error fetching magic items:", error);
  }

  const magicItems = (items || []) as MagicItem[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Magic Items</h1>
          <p className="text-muted-foreground">
            Browse official Shadowdark magic items
          </p>
        </div>

        {/* Search Form */}
        <form method="GET" className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              name="search"
              placeholder="Search by name or description..."
              defaultValue={searchTerm}
              className="pl-10"
              data-testid="search-input"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Results Grid */}
        {magicItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {magicItems.map((item) => (
              <MagicItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No magic items found matching your search"
                : "No magic items found"}
            </p>
          </div>
        )}

        {/* Results Count */}
        {magicItems.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {magicItems.length} item{magicItems.length !== 1 ? "s" : ""}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        )}
      </div>
    </div>
  );
}
