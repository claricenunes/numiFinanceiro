"use client";

import { motion, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { type MouseEvent } from "react";
import { DashboardPreview } from "./DashboardPreview";

export const FRAME_WIDTH = 300;
export const FRAME_HEIGHT = 620;
export const SCREEN_INSET = 12;
export const SCREEN_RADIUS = 52;
const SCREEN_WIDTH = FRAME_WIDTH - SCREEN_INSET * 2;
const CONTENT_WIDTH = 375; // largura mobile "real" do app
// Escala fixa por largura — a tela funciona como um viewport de verdade:
// mostra só o trecho de cima do dashboard na escala correta, e corta o
// resto (overflow: hidden), exatamente como um app aberto num iPhone real.
// Nada de "encolher a página inteira pra caber".
const SCALE = SCREEN_WIDTH / CONTENT_WIDTH;

interface PhoneMockupProps {
  /** 0 = interface nítida, 1 = totalmente dissolvida em branco (usado durante o zoom cinematográfico). */
  dissolve?: MotionValue<number>;
}

export function PhoneMockup({ dissolve }: PhoneMockupProps) {
  // Tilt sutil acompanhando o mouse — único movimento próprio do aparelho.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 140, damping: 18, mass: 0.4 });
  const springRotateY = useSpring(rotateY, { stiffness: 140, damping: 18, mass: 0.4 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 6);
    rotateX.set(-py * 4);
  }

  function handleMouseLeave() {
    rotateY.set(0);
    rotateX.set(0);
  }

  // Hooks sempre chamados incondicionalmente: usa um MotionValue parado em 0
  // quando nenhuma dissolução é passada (fora do contexto do zoom).
  const fallbackDissolve = useMotionValue(0);
  const effectiveDissolve = dissolve ?? fallbackDissolve;

  return (
    // Responsivo: encolhe em telas estreitas via transform (mantém tudo
    // proporcional e centralizado, sem recalcular nenhuma medida interna).
    <div
      id="landing-phone-root"
      className="shrink-0 scale-[0.62] sm:scale-75 lg:scale-100"
      style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, perspective: 1400 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          borderRadius: SCREEN_RADIUS,
          background: "linear-gradient(155deg, #1e293b 0%, #0f172a 55%, #020617 100%)",
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,0.06), 0 40px 70px -25px rgba(15,23,42,0.4), 0 12px 28px -12px rgba(15,23,42,0.28)",
          willChange: "transform",
        }}
        className="relative"
      >
        {/* Botões laterais */}
        <div className="absolute -left-[2px] top-[140px] w-[3px] h-9 rounded-r-sm" style={{ background: "#0f172a" }} />
        <div className="absolute -left-[2px] top-[188px] w-[3px] h-14 rounded-r-sm" style={{ background: "#0f172a" }} />
        <div className="absolute -left-[2px] top-[256px] w-[3px] h-14 rounded-r-sm" style={{ background: "#0f172a" }} />
        <div className="absolute -right-[2px] top-[184px] w-[3px] h-20 rounded-l-sm" style={{ background: "#0f172a" }} />

        {/* Dynamic Island */}
        <div
          className="absolute top-[12px] left-1/2 -translate-x-1/2 rounded-full z-20"
          style={{ width: 100, height: 30, background: "#000", transform: "translateZ(22px)" }}
        />

        {/* Tela — viewport real: overflow:hidden, conteúdo ancorado no topo
            na escala correta. Mostra só o que caberia, corta o resto. */}
        <div
          className="absolute overflow-hidden"
          style={{ inset: SCREEN_INSET, borderRadius: SCREEN_RADIUS - 10, background: "var(--numi-bg)" }}
        >
          <motion.div
            style={{ scale: SCALE, transformOrigin: "top left", width: CONTENT_WIDTH }}
          >
            <DashboardPreview />
          </motion.div>

          {/* Dissolução em branco: some com a interface antes do zoom máximo */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: "#FFFFFF", opacity: effectiveDissolve }}
          />
        </div>
      </motion.div>
    </div>
  );
}
