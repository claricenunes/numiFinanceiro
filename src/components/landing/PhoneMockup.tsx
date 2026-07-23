"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { DashboardPreview } from "./DashboardPreview";

const FRAME_WIDTH = 296;
const FRAME_HEIGHT = 604;
const SCREEN_INSET = 10;
const SCREEN_WIDTH = FRAME_WIDTH - SCREEN_INSET * 2;
const CONTENT_WIDTH = 375; // largura mobile "real" do app — a prévia é renderizada nela e escalada pra caber na tela
const SCALE = SCREEN_WIDTH / CONTENT_WIDTH;

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function PhoneMockup() {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parallax de scroll: o celular se move mais devagar que o resto da página
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  // Tilt sutil acompanhando o mouse (eixo Y principal, leve eixo X de apoio)
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 140, damping: 18, mass: 0.4 });
  const springRotateY = useSpring(rotateY, { stiffness: 140, damping: 18, mass: 0.4 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 6); // ~-3° a 3°
    rotateX.set(-py * 4); // apoio sutil no eixo X
  }

  function handleMouseLeave() {
    rotateY.set(0);
    rotateX.set(0);
  }

  return (
    <div ref={wrapRef} className="relative mx-auto lg:mx-0" style={{ width: FRAME_WIDTH, perspective: 1400 }}>
      {/* Glow discreto atrás do aparelho */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.32) 0%, rgba(56,189,248,0.18) 45%, transparent 72%)",
          transform: "scale(1.6)",
        }}
      />

      {/* Sombra dinâmica e difusa, respira junto com o float */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -z-10 rounded-full"
        style={{
          bottom: -28,
          width: FRAME_WIDTH * 0.75,
          height: 28,
          background: "radial-gradient(ellipse, rgba(15,23,42,0.30) 0%, transparent 72%)",
          filter: "blur(14px)",
        }}
        animate={{ scaleX: [1, 0.86, 1], opacity: [0.55, 0.32, 0.55] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Camada 1: parallax de scroll */}
      <motion.div style={{ y: parallaxY }}>
        {/* Camada 2: floating contínuo (independente do scroll) */}
        <motion.div
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Camada 3: entrada (fade+scale) + tilt 3D pelo mouse */}
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.9, y: 32 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: "preserve-3d",
              width: FRAME_WIDTH,
              height: FRAME_HEIGHT,
            }}
            className="relative rounded-[52px] p-2.5"
          >
            <div
              className="relative w-full h-full rounded-[52px]"
              style={{
                background: "linear-gradient(155deg, #1e293b 0%, #0f172a 55%, #020617 100%)",
                boxShadow:
                  "inset 0 0 0 2px rgba(255,255,255,0.06), 0 40px 70px -25px rgba(15,23,42,0.4), 0 12px 28px -12px rgba(15,23,42,0.28)",
              }}
            >
              {/* Botões laterais */}
              <div className="absolute -left-[2px] top-[128px] w-[3px] h-9 rounded-r-sm" style={{ background: "#0f172a" }} />
              <div className="absolute -left-[2px] top-[172px] w-[3px] h-14 rounded-r-sm" style={{ background: "#0f172a" }} />
              <div className="absolute -left-[2px] top-[236px] w-[3px] h-14 rounded-r-sm" style={{ background: "#0f172a" }} />
              <div className="absolute -right-[2px] top-[168px] w-[3px] h-20 rounded-l-sm" style={{ background: "#0f172a" }} />

              {/* Tela */}
              <div
                className="absolute rounded-[42px] overflow-hidden"
                style={{ inset: SCREEN_INSET, background: "var(--numi-bg)" }}
              >
                {/* Conteúdo real do dashboard, escalado pra caber, com auto-scroll sutil */}
                <motion.div
                  style={{ width: CONTENT_WIDTH, transform: `scale(${SCALE})`, transformOrigin: "top left" }}
                  animate={{ y: [0, -190, -190, -380, -380, 0] }}
                  transition={{
                    duration: 16,
                    times: [0, 0.28, 0.42, 0.7, 0.84, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <DashboardPreview />
                </motion.div>

                {/* Brilho/reflexo percorrendo a tela ocasionalmente */}
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.28) 50%, transparent 58%)",
                  }}
                  initial={{ x: "-130%" }}
                  animate={{ x: ["-130%", "130%"] }}
                  transition={{ duration: 1.7, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                />
              </div>

              {/* Dynamic Island */}
              <div
                className="absolute top-[10px] left-1/2 -translate-x-1/2 rounded-full z-20"
                style={{ width: 96, height: 28, background: "#000", transform: "translateZ(22px)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
