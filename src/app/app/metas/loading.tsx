import { Skeleton } from "@/components/common/Skeleton";

export default function MetasLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="flex gap-2 mb-6">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="flex flex-col gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl p-5" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 w-32 mb-3" />
                <Skeleton className="h-1.5 w-full rounded-full mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
