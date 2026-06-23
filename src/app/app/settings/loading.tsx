export default function SettingsLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <div className="h-7 w-40 rounded-lg bg-[#1E2D45] animate-pulse mb-8" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-8">
          <div className="h-3 w-24 rounded bg-[#1E2D45] animate-pulse mb-3" />
          <div className="h-24 rounded-2xl bg-[#131929] animate-pulse" />
        </div>
      ))}
    </div>
  );
}
