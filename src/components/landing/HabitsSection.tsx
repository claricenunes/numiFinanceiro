"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/common/motion/Reveal";

const INSIGHTS = [
  { icon: "🍔", text: "Você gastou 18% a mais em restaurantes este mês", direction: "left" as const },
  { icon: "📈", text: "Sua economia subiu 3 meses seguidos", direction: "right" as const },
  { icon: "🎯", text: "Faltam R$ 320 para bater a meta da viagem", direction: "left" as const },
];

// Path decorativo (dado fictício) — mesma sensação de um gráfico de linha crescendo
const LINE_PATH = "M0,90 C40,85 60,60 100,65 C140,70 160,30 200,35 C240,40 260,10 300,15";

export function HabitsSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-5xl mx-auto">
      <Reveal className="text-center mb-12">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-info)" }}>
          Inteligência artificial
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] max-w-xl mx-auto leading-tight">
          A IA entende seus hábitos
        </h2>
        <p className="text-lg text-[var(--numi-text-2)] max-w-md mx-auto mt-3">
          O Numi observa seus padrões de gasto e economia — e te avisa antes que vire problema.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Gráfico se desenhando */}
        <Reveal direction="left" className="glass-card p-6">
          <p className="text-xs font-medium text-[var(--numi-text-3)] mb-4">Economia — últimos 6 meses</p>
          <svg viewBox="0 0 300 100" className="w-full h-32" fill="none">
            <motion.path
              d={LINE_PATH}
              stroke="var(--numi-income)"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </svg>
        </Reveal>

        {/* Mini cards de insight */}
        <div className="flex flex-col gap-3">
          {INSIGHTS.map((insight) => (
            <Reveal key={insight.text} direction={insight.direction} className="glass-card p-4 flex items-center gap-3">
              <span className="text-xl shrink-0">{insight.icon}</span>
              <p className="text-sm text-[var(--numi-text)] leading-snug">{insight.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
