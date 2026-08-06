export default function InsightsLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <div className="h-7 w-28 rounded-lg animate-pulse mb-1" style={{ background: "var(--numi-border)" }} />
      <div className="h-4 w-48 rounded animate-pulse mb-6" style={{ background: "var(--numi-border)" }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card h-16 animate-pulse" />
        ))}
      </div>
      <div className="glass-card h-10 animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
