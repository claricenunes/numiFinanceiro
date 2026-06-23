import { Skeleton } from "@/components/common/Skeleton";

export default function InvestimentosLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <Skeleton className="h-7 w-36 mb-5" />

      {/* Portfolio summary */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-9 w-40 mb-2" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Allocation */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <Skeleton className="h-48 w-48 rounded-full shrink-0" />
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-3 w-16 mb-3" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
