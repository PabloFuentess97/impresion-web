import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="space-y-4 p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
