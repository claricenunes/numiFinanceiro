export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12"
         style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.06) 0%, #0B1020 55%)" }}>
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 mb-8 group">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <span className="w-3 h-3 rounded-full bg-[#34D399] block" />
        </span>
        <span className="text-xl font-semibold text-[#F1F5F9] tracking-tight">Numi</span>
      </a>

      {/* Card */}
      <div className="w-full max-w-[400px] glass-card p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-[#475569]">
        © {new Date().getFullYear()} Numi · Sua vida financeira, organizada.
      </p>
    </div>
  );
}
