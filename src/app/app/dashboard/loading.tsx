import { CardSkeleton, ChartSkeleton, Skeleton } from "@/components/common/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="col-span-2 lg:col-span-3"><CardSkeleton /></div>
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
          <CardSkeleton /><CardSkeleton />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={220} />
        </div>

        {/* Metas + Transações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={180} />
          <ChartSkeleton height={180} />
        </div>
      </div>
    </div>
  );
}
