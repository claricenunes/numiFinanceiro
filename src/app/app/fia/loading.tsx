export default function FIALoading() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full border-2 border-[#34D399] border-t-transparent animate-spin" />
        <div>
          <div className="h-5 w-48 rounded bg-[#1E2D45] animate-pulse mb-1" />
          <div className="h-3 w-36 rounded bg-[#1E2D45] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-[#131929] animate-pulse" />
        ))}
      </div>
      <div className="h-56 rounded-2xl bg-[#131929] animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-[#131929] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
