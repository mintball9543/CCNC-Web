import { Skeleton } from "@/components/ui/feedback";

export function BoardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="불러오는 중">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
