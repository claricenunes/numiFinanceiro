import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Numi — Gestão financeira pessoal",
};

export default function LandingPage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-4 text-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.08) 0%, #0B1020 55%)",
      }}
    >
      <div className="flex items-center gap-2 mb-10">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(52,211,153,0.15)",
            border: "1px solid rgba(52,211,153,0.3)",
          }}
        >
          <span className="w-4 h-4 rounded-full bg-[#34D399] block" />
        </span>
        <span className="text-2xl font-bold text-[#F1F5F9] tracking-tight">Numi</span>
      </div>

      <h1 className="text-4xl lg:text-5xl font-bold text-[#F1F5F9] max-w-2xl leading-tight mb-4">
        Sua vida financeira,{" "}
        <span style={{ color: "#34D399" }}>organizada</span>.
      </h1>
      <p className="text-lg text-[#94A3B8] max-w-md mb-10">
        Um lugar só para contas, gastos, metas e investimentos. Sem planilha, sem confusão.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/register"
          className="btn-primary"
          style={{ width: "auto", padding: "0.75rem 2rem" }}
        >
          Começar grátis
        </Link>
        <Link
          href="/login"
          className="btn-outline"
          style={{ width: "auto", padding: "0.75rem 2rem" }}
        >
          Já tenho conta
        </Link>
      </div>
    </main>
  );
}
