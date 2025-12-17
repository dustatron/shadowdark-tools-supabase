import { EquipmentClient } from "./EquipmentClient";
import {
  parseFiltersFromSearchParams,
  parsePaginationFromSearchParams,
} from "@/lib/types/equipment";
import { createClient } from "@/lib/supabase/server";

interface EquipmentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EquipmentPage({
  searchParams,
}: EquipmentPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialFilters = parseFiltersFromSearchParams(params);
  const initialPagination = parsePaginationFromSearchParams(params);

  return (
    <EquipmentClient
      initialFilters={initialFilters}
      initialPagination={initialPagination}
      currentUserId={user?.id}
    />
  );
}
