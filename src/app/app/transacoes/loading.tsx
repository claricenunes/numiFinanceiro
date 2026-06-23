import { Skeleton } from "@/components/common/Skeleton";

export default function TransacoesLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-4xl mx-auto">
      <Skeleton className="h-7 w-32 mb-5" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl p-3" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
            <Skeleton className="h-3 w-16 mx-auto mb-2" />
            <Skeleton className="h-5 w-24 mx-auto" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <Skeleton className="h-10 w-full rounded-xl mb-3" />
      <div className="flex gap-2 mb-3">
        {[80, 72, 80, 104].map((w, i) => (
          <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-xl mb-6" />

      {/* Groups */}
      {[0, 1, 2].map(g => (
        <div key={g} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex-1 h-px" style={{ background: "#1E2D45" }} />
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#131929", border: "1px solid #1E2D45" }}>
            {[0, 1, 2].map((r, idx) => (
              <div
                key={r}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: idx < 2 ? "1px solid #1E2D45" : "none" }}
              >
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1.5" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-20 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
