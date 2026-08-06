export default function SettingsLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <div className="h-7 w-40 rounded-lg animate-pulse mb-8" style={{ background: "var(--numi-border)" }} />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-8">
          <div className="h-3 w-24 rounded animate-pulse mb-3" style={{ background: "var(--numi-border)" }} />
          <div className="glass-card h-24 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
