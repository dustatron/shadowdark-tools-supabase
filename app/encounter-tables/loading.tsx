import { Skeleton } from "@/components/primitives/skeleton";
import { Card, CardContent, CardHeader } from "@/components/primitives/card";

export default function EncounterTablesLoading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
