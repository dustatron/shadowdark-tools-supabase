import { Skeleton } from "@/components/primitives/skeleton";
import { Card, CardContent, CardHeader } from "@/components/primitives/card";

export default function SpellsLoading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Spell grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
