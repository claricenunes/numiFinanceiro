"use client";

import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { useRef } from "react";

interface Slice {
  label: string;
  percent: number;
  color: string;
}

const SLICES: Slice[] = [
  { label: "Moradia",       percent: 35, color: "#F472B6" },
  { label: "Alimentação",   percent: 22, color: "#FB923C" },
  { label: "Lazer",         percent: 18, color: "#38BDF8" },
  { label: "Investimentos", percent: 15, color: "#34D399" },
  { label: "Outros",        percent: 10, color: "#A78BFA" },
];

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 78;
const STROKE = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DECEL = [0.16, 1, 0.3, 1] as const; // "expo-out" — desacelera bem no final
const RIBBON_STAGGER = 0.08;
const RIBBON_DURATION = 0.65;
const CROSSFADE = 0.3;
// Os rótulos (nome + %) entram logo depois que os arcos terminam — antes
// esse valor era um número solto que não acompanhava o resto do timing,
// deixando os textos aparecerem bem depois do gráfico já estar pronto.
const LABEL_START = 1.45;
const LABEL_STAGGER = 0.06;
const CENTER_DELAY = 1.0;
const IDLE_START = 2.2; // segundos — quando a vida contínua (rotação/respiração) começa

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + Math.cos(rad) * radius, y: CENTER + Math.sin(rad) * radius };
}

const EDGES = ["left", "right", "top", "bottom", "left"] as const;

function entryPoint(edge: (typeof EDGES)[number], i: number) {
  const jitter = (i % 2 === 0 ? -1 : 1) * 26;
  switch (edge) {
    case "left":   return { x: -50, y: CENTER + jitter };
    case "right":  return { x: SIZE + 50, y: CENTER + jitter };
    case "top":    return { x: CENTER + jitter, y: -50 };
    case "bottom": return { x: CENTER + jitter, y: SIZE + 50 };
  }
}

/**
 * Gráfico de rosca construído do zero — sem biblioteca de gráfico. Fitas
 * orgânicas entram de bordas diferentes, curvam, desaceleram e "encaixam"
 * (com um leve overshoot de escala) exatamente onde cada arco nasce; só
 * então o arco preciso do doughnut aparece por baixo, e a fita se dissolve.
 * Disparado toda vez que entra na tela (`whileInView`, `once: false`) — é
 * uma coreografia de tempo, não scrubada pelo scroll. Sempre que o usuário
 * volta a ver o gráfico (desce, sobe, desce de novo), a sequência inteira
 * recomeça do zero.
 *
 * A rotação de vida contínua usa um único valor de rotação compartilhado:
 * os arcos giram com ele, e cada legenda gira o mesmo tanto na direção
 * oposta — assim ela "orbita" corretamente junto do seu arco, mas o texto
 * nunca fica de lado. Em vez de nascer junto com o componente, ela é
 * reiniciada (do zero) toda vez que o gráfico entra na tela, e parada
 * quando sai — assim cada replay é sempre idêntico, não continua de onde
 * a rotação ficou rodando escondida em segundo plano.
 */
export function DrawnDonutChart() {
  const rotation = useMotionValue(0);
  const counterRotation = useTransform(rotation, (v) => -v);
  const rotationControls = useRef<AnimationPlaybackControls | null>(null);

  function startRotation() {
    rotationControls.current?.stop();
    rotation.set(0);
    rotationControls.current = animate(rotation, 360, {
      duration: 50,
      delay: IDLE_START,
      repeat: Infinity,
      ease: "linear",
    });
  }

  function stopRotation() {
    rotationControls.current?.stop();
  }

  const arcs = SLICES.reduce<{ items: Array<Slice & { startAngle: number; midAngle: number }>; cursor: number }>(
    (acc, slice) => {
      const startAngle = (acc.cursor / 100) * 360 - 90;
      const midAngle = startAngle + ((slice.percent / 100) * 360) / 2;
      acc.items.push({ ...slice, startAngle, midAngle });
      acc.cursor += slice.percent;
      return acc;
    },
    { items: [], cursor: 0 },
  ).items;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE, filter: "drop-shadow(0 12px 24px rgba(15,23,42,0.10))" }}
      // Respiração contínua — quase imperceptível (±0.2%).
      animate={{ scale: [1, 1.002, 0.998, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: IDLE_START }}
      onViewportEnter={startRotation}
      onViewportLeave={stopRotation}
      viewport={{ once: false, margin: "0px" }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 overflow-visible">
        {/* Fitas de entrada — não rotacionam (terminam e somem antes da rotação começar) */}
        {arcs.map((arc, i) => {
          const edge = EDGES[i];
          const entry = entryPoint(edge, i);
          const target = polar(arc.midAngle, RADIUS);
          const mx = (entry.x + target.x) / 2;
          const my = (entry.y + target.y) / 2;
          const dx = target.x - entry.x;
          const dy = target.y - entry.y;
          const perp = { x: -dy, y: dx };
          const len = Math.hypot(perp.x, perp.y) || 1;
          const bend = (i % 2 === 0 ? 1 : -1) * 46;
          const ctrl = { x: mx + (perp.x / len) * bend, y: my + (perp.y / len) * bend };
          const ribbonPath = `M ${entry.x},${entry.y} Q ${ctrl.x},${ctrl.y} ${target.x},${target.y}`;
          const ribbonDelay = i * RIBBON_STAGGER;

          return (
            <motion.g
              key={`ribbon-${arc.label}`}
              initial={{ scale: 0.86 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: false, margin: "0px" }}
              transition={{ type: "spring", stiffness: 130, damping: 9, delay: ribbonDelay }}
              style={{ transformOrigin: `${target.x}px ${target.y}px` }}
            >
              <motion.path
                d={ribbonPath}
                fill="none"
                stroke={arc.color}
                strokeWidth={6}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 5px ${arc.color}99)` }}
                initial={{ pathLength: 0, opacity: 0.95 }}
                whileInView={{ pathLength: 1, opacity: [0.95, 1, 0] }}
                viewport={{ once: false, margin: "0px" }}
                transition={{
                  pathLength: { duration: RIBBON_DURATION, delay: ribbonDelay, ease: DECEL },
                  opacity: { duration: RIBBON_DURATION + CROSSFADE, delay: ribbonDelay, times: [0, 0.7, 1], ease: "easeInOut" },
                }}
              />
            </motion.g>
          );
        })}

        {/* Arcos + pontos + brilho — giram juntos (rotação de vida contínua) */}
        <motion.g style={{ rotate: rotation, transformOrigin: `${CENTER}px ${CENTER}px` }}>
          {arcs.map((arc, i) => {
            const target = polar(arc.midAngle, RADIUS);
            const ribbonDelay = i * RIBBON_STAGGER;
            const arcDelay = ribbonDelay + RIBBON_DURATION - CROSSFADE * 0.5;

            return (
              <g key={`arc-${arc.label}`}>
                <motion.circle
                  cx={CENTER} cy={CENTER} r={RADIUS}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  transform={`rotate(${arc.startAngle} ${CENTER} ${CENTER})`}
                  style={{ filter: `drop-shadow(0 0 8px ${arc.color}55)` }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: arc.percent / 100, opacity: 1 }}
                  viewport={{ once: false, margin: "0px" }}
                  transition={{ duration: CROSSFADE + 0.15, delay: arcDelay, ease: DECEL }}
                />

                {/* Brilho ocasional percorrendo o segmento */}
                <motion.circle
                  cx={CENTER} cy={CENTER} r={RADIUS}
                  fill="none"
                  stroke="#fff"
                  strokeOpacity={0.5}
                  strokeWidth={STROKE * 0.35}
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE * 0.05} ${CIRCUMFERENCE}`}
                  transform={`rotate(${arc.startAngle} ${CENTER} ${CENTER})`}
                  initial={{ pathOffset: 0, opacity: 0 }}
                  animate={{ pathOffset: [0, arc.percent / 100], opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: 1.6,
                    delay: IDLE_START + 2 + i * 3.2,
                    repeat: Infinity,
                    repeatDelay: 9 + i * 1.5,
                    ease: "easeInOut",
                  }}
                />

                {/* Marcador no meio do arco: entra com leve overshoot, depois
                    pulsa devagar pra sempre — duas camadas, sem conflito de
                    propriedade entre a entrada e o loop contínuo. */}
                <motion.g
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, margin: "0px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: arcDelay + 0.25 }}
                  style={{ transformOrigin: `${target.x}px ${target.y}px` }}
                >
                  <motion.circle
                    cx={target.x} cy={target.y} r={4.5}
                    fill="#fff"
                    style={{ filter: `drop-shadow(0 0 4px ${arc.color})`, transformOrigin: `${target.x}px ${target.y}px` }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: IDLE_START + i * 0.4 }}
                  />
                </motion.g>
              </g>
            );
          })}
        </motion.g>
      </svg>

      {/* Total no centro — fixo, nunca gira */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "0px" }}
        transition={{ duration: 0.4, delay: CENTER_DELAY, ease: DECEL }}
      >
        <p className="text-xs text-[var(--numi-text-3)]">Este mês</p>
        <p className="text-lg font-bold text-[var(--numi-text)]">R$ 3.140</p>
      </motion.div>

      {/* Legendas: o container orbita junto dos arcos (mesma rotação), mas
          cada legenda contra-gira o mesmo tanto — orbita, mas o texto
          nunca fica de lado. */}
      <motion.div className="absolute inset-0" style={{ rotate: rotation }}>
        {arcs.map((arc, i) => {
          const pos = polar(arc.midAngle, RADIUS + STROKE + 24);
          return (
            <motion.div
              key={`label-${arc.label}`}
              className="absolute flex flex-col items-center text-center"
              style={{ left: pos.x, top: pos.y, x: "-50%", y: "-50%", rotate: counterRotation, width: 60 }}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "0px" }}
              transition={{ duration: 0.35, delay: LABEL_START + i * LABEL_STAGGER, ease: DECEL }}
            >
              <p className="text-[11px] font-semibold" style={{ color: arc.color }}>{arc.percent}%</p>
              <p className="text-[10px] text-[var(--numi-text-3)] leading-tight">{arc.label}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
