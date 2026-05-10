import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <section className="container-luxe pt-12 pb-8">
        <div className="flex flex-wrap items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="container-luxe pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border border-border space-y-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="container-luxe pb-24">
        <div className="flex gap-1 border-b border-border mb-8 hidden md:flex">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 mr-2" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-4 w-32 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between p-4 bg-secondary/20">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

