import { CardSkeleton, ChartSkeleton, Skeleton } from "@/components/common/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        {/* Greeting */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-4 lg:flex-1">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="lg:flex-1 lg:max-w-md"><CardSkeleton /></div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="col-span-2 lg:col-span-4"><CardSkeleton /></div>
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>

        {/* Trend + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={180} />
          <ChartSkeleton height={180} />
        </div>

        {/* Insights */}
        <CardSkeleton />

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={220} />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>

        {/* Metas + Pagamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={180} />
          <ChartSkeleton height={180} />
        </div>

        {/* Investimentos + Saúde financeira */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={160} />
          <CardSkeleton />
        </div>

        {/* Ações rápidas */}
        <CardSkeleton />

        {/* Transações recentes */}
        <ChartSkeleton height={220} />
      </div>
    </div>
  );
}
