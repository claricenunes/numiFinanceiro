import type { CSSProperties } from "react";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ background: "rgba(30,45,69,0.6)", ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="h-3.5 w-24 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="glass-card p-5">
      <Skeleton className="h-4 w-36 mb-4" />
      <Skeleton style={{ height }} />
    </div>
  );
}
