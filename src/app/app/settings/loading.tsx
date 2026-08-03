export default function SettingsLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <div className="h-7 w-40 rounded-lg animate-pulse mb-8" style={{ background: "rgba(22, 50, 31, 0.08)" }} />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-8">
          <div className="h-3 w-24 rounded animate-pulse mb-3" style={{ background: "rgba(22, 50, 31, 0.08)" }} />
          <div className="h-24 rounded-2xl animate-pulse" style={{ background: "#FFFFFF", border: "1px solid rgba(22, 50, 31, 0.08)" }} />
        </div>
      ))}
    </div>
  );
}
