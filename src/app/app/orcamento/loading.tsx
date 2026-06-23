import { Skeleton } from "@/components/common/Skeleton";

export default function OrcamentoLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Overall card */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-36 mb-1" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <Skeleton className="h-3 w-28 mb-3" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
