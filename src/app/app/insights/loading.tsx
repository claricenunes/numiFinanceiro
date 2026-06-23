export default function InsightsLoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <div className="h-7 w-28 rounded-lg bg-[#1E2D45] animate-pulse mb-1" />
      <div className="h-4 w-48 rounded bg-[#1E2D45] animate-pulse mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[#131929] animate-pulse" />
        ))}
      </div>
      <div className="h-10 rounded-xl bg-[#131929] animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#131929] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
