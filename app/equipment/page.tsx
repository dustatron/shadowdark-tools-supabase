import { EquipmentClient } from "./EquipmentClient";
import {
  parseFiltersFromSearchParams,
  parsePaginationFromSearchParams,
} from "@/lib/types/equipment"; // Will create this type file

interface EquipmentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EquipmentPage({
  searchParams,
}: EquipmentPageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Parse filters and pagination from URL
  const initialFilters = parseFiltersFromSearchParams(params);
  const initialPagination = parsePaginationFromSearchParams(params);

  return (
    <EquipmentClient
      initialFilters={initialFilters}
      initialPagination={initialPagination}
    />
  );
}
