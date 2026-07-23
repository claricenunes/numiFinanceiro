"use client";

import Link from "next/link";
import { useRef } from "react";
import { RotatingWord } from "@/components/common/motion/RotatingWord";
import { PhoneMockup } from "./PhoneMockup";
import { HabitsSection } from "./HabitsSection";
import { BeforeAfterSection } from "./BeforeAfterSection";
import { ScrollOrb } from "./ScrollOrb";

export function LandingContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="numi-ambient-bg">
      <div className="max-w-6xl mx-auto flex items-start gap-8 px-4">
        <div className="flex-1 min-w-0">
          {/* ── Seção 1: Hero ───────────────────────────── */}
          <section className="min-h-dvh flex flex-col lg:flex-row items-center justify-center gap-10 py-16 lg:py-0">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center gap-2 mb-10">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
                >
                  <span className="w-4 h-4 rounded-full bg-[var(--numi-income)] block" />
                </span>
                <span className="text-2xl font-bold text-[var(--numi-text)] tracking-tight">Numi</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-[var(--numi-text)] max-w-2xl leading-tight mb-4">
                Sua vida financeira,{" "}
                <RotatingWord
                  words={["organizada", "descomplicada", "sob controle", "inteligente"]}
                  className="text-[var(--numi-income)]"
                  suffix="."
                />
              </h1>
              <p className="text-lg text-[var(--numi-text-2)] max-w-md mb-10">
                Um lugar só para contas, gastos, metas e investimentos. Sem planilha, sem confusão.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary" style={{ width: "auto", padding: "0.75rem 2rem" }}>
                  Começar grátis
                </Link>
                <Link href="/login" className="btn-outline" style={{ width: "auto", padding: "0.75rem 2rem" }}>
                  Já tenho conta
                </Link>
              </div>
            </div>

            <PhoneMockup />
          </section>

          {/* ── Seção 2 ──────────────────────────────────── */}
          <HabitsSection />

          {/* ── Seção 3 ──────────────────────────────────── */}
          <BeforeAfterSection />
        </div>

        <ScrollOrb containerRef={containerRef} />
      </div>
    </div>
  );
}
