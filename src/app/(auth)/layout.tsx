export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 numi-ambient-bg">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 mb-8 group">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <span className="w-3 h-3 rounded-full bg-[var(--numi-income)] block" />
        </span>
        <span className="text-xl font-semibold text-[var(--numi-text)] tracking-tight">Numi</span>
      </a>

      {/* Card */}
      <div className="w-full max-w-[400px] glass-card p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-[var(--numi-text-3)]">
        © {new Date().getFullYear()} Numi · Sua vida financeira, organizada.
      </p>
    </div>
  );
}
