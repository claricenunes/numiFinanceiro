"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/common/motion/Reveal";
import { DrawnDonutChart } from "./DrawnDonutChart";

const INSIGHTS = [
  { icon: "🍔", text: "Você gastou 18% a mais em restaurantes este mês", direction: "left" as const },
  { icon: "📈", text: "Sua economia subiu 3 meses seguidos", direction: "right" as const },
  { icon: "🎯", text: "Faltam R$ 320 para bater a meta da viagem", direction: "left" as const },
];

// O gráfico (DrawnDonutChart) termina de se desenhar (incluindo os rótulos
// de nome/percentual) por volta de 2s depois de entrar na tela — o título
// só aparece depois disso, como se nascesse dele, não junto.
const CHART_DONE = 2.0;
// Só depois que o gráfico já está visível é que as cores do fundo voltam.
const COLOR_RETURN_DELAY = CHART_DONE + 0.2;

/**
 * Cenas 6-8. A seção nasce com um fundo branco sólido por cima do gradiente
 * ambiente da página — a mesma superfície branca em que a Hero termina o
 * zoom. O desenho do gráfico (DrawnDonutChart) acontece sobre esse branco;
 * só depois que ele termina é que o branco se dissolve, revelando aos poucos
 * o fundo colorido por trás. Título e insights nascem em seguida.
 *
 * Tanto o branco quanto o gráfico e os textos usam `whileInView` com
 * `once: false` (ou o prop `once={false}` do `Reveal`) — toda vez que o
 * usuário volta a rolar até aqui, a sequência inteira recomeça do zero.
 */
export function ChartRevealSection() {
  return (
    <section className="relative px-4 pt-6 pb-20 lg:pt-8 lg:pb-28 max-w-2xl mx-auto flex flex-col items-center">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#FFFFFF" }}
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 0 }}
        viewport={{ once: false, margin: "0px" }}
        transition={{ duration: 0.7, delay: COLOR_RETURN_DELAY, ease: "easeInOut" }}
      />

      <DrawnDonutChart />

      <Reveal delay={CHART_DONE} once={false} className="text-center mt-10 mb-12">
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

      <div className="flex flex-col gap-3 w-full max-w-md">
        {INSIGHTS.map((insight, i) => (
          <Reveal
            key={insight.text}
            direction={insight.direction}
            delay={CHART_DONE + 0.35 + i * 0.1}
            once={false}
            className="glass-card p-4 flex items-center gap-3"
          >
            <span className="text-xl shrink-0">{insight.icon}</span>
            <p className="text-sm text-[var(--numi-text)] leading-snug">{insight.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
