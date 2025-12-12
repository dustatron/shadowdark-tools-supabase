import { Skeleton } from "@/components/primitives/skeleton";
import { Card, CardContent } from "@/components/primitives/card";

export default function MonsterDetailLoading() {
  return (
    <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
      {/* Back button */}
      <Skeleton className="h-10 w-40 mb-6" />

      <div className="flex flex-col gap-6">
        {/* Header Card */}
        <Card className="shadow-sm border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Skeleton className="h-9 w-64 mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ability Scores Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-16 mx-auto mb-2" />
                  <Skeleton className="h-8 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attacks Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>

        {/* Abilities Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </CardContent>
        </Card>

        {/* Ownership Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
