import { Skeleton } from "@/components/common/Skeleton";

export default function ContasLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`rounded-2xl p-4 ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}
            style={{ background: "#131929", border: "1px solid #1E2D45" }}
          >
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <Skeleton className="h-3 w-24 mb-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#131929", border: "1px solid #1E2D45" }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-28 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1.5" />
              <Skeleton className="h-8 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
