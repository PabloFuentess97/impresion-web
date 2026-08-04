import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarioLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-[620px] w-full rounded-xl" />
    </div>
  );
}
