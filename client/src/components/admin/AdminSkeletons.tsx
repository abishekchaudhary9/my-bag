import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-border bg-background p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <div className="border border-border bg-background p-8 h-[400px]">
          <div className="flex justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="border border-border bg-background p-8 h-[400px]">
          <div className="space-y-2 mb-8">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex justify-center mb-8">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border border-border">
        <div className="bg-secondary/30 p-4 border-b border-border">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0">
            <div className="grid grid-cols-5 gap-4 items-center">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedbackSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-border p-6 space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

