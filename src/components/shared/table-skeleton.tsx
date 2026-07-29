import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/** Skeleton para páginas de listado mientras cargan los datos. */
export function TableSkeleton({ filas = 6 }: { filas?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-9 w-full max-w-xs" />
      <Card className="divide-y divide-border overflow-hidden">
        {Array.from({ length: filas }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </Card>
    </div>
  );
}
