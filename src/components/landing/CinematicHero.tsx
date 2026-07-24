"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { RotatingWord } from "@/components/common/motion/RotatingWord";
import { PhoneMockup } from "./PhoneMockup";

// Escala final do zoom — constante, não medida. É generosa o bastante pra
// cobrir qualquer tela realista (mobile a ultrawide) partindo do tamanho de
// repouso do celular em qualquer breakpoint, então não precisa de nenhuma
// medição de DOM em runtime (essa era a causa raiz da fragilidade anterior:
// medir um elemento interno do dashboard, várias camadas de transform abaixo,
// só no mount/resize, o que dava valores errados sempre que algo ainda
// estivesse assentando na página nesse instante).
const ZOOM_SCALE = 13;

/**
 * Cenas 1-5. Texto e celular usam um flex layout normal (coluna no mobile,
 * linha no desktop) — o próprio navegador garante que nunca se sobrepõem,
 * em qualquer altura/largura de tela, sem precisar de faixas em % chutadas.
 * O celular tem seu próprio wrapper (`landing-scene-root`), que recebe o
 * `scale`/`transform-origin` do zoom — como é um transform puro, não afeta
 * o layout (o texto continua podendo "sair de quadro" livremente por cima).
 *
 * O zoom mira sempre o centro do próprio celular (`transformOrigin: "center"`)
 * — não atravessa o dashboard, só amplia a tela do aparelho até ela virar
 * branca (ver `PhoneMockup`'s `dissolve`), então não há necessidade de medir
 * nenhum elemento interno.
 */
export function CinematicHero() {
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22, mass: 0.6 });

  // A distância real de scroll-scrub de uma trilha com sticky é
  // (altura da trilha − altura da viewport), não a altura da trilha inteira
  // — por isso a trilha é 140vh (spot correto: 40vh de scrub, o suficiente
  // pra um scroll deliberado sem ficar longo).
  //
  // O zoom e a dissolução terminam cedo (0.75 e 0.4) — ao contrário da
  // versão anterior, que só terminava a escala em 0.88 e deixava ~55% da
  // trilha (a maior parte) com a tela já branca só continuando a crescer
  // sem nada de novo acontecendo, o que é onde a sensação de demora vinha.
  // Sobra só ~25% de trilha (a única pausa antes de soltar pra próxima
  // seção) — bem mais curto que antes.
  const scale = useTransform(smooth, [0.05, 0.75], [1, ZOOM_SCALE]);
  // A tela do celular vira branca bem antes do zoom acabar — nunca "se vê o
  // dashboard crescendo".
  const dissolve = useTransform(smooth, [0.08, 0.4], [0, 1]);
  // O texto sai de quadro cedo, por conta própria — sem opacidade, só saída física.
  const textY = useTransform(smooth, [0, 0.2], [0, -260]);
  const textScale = useTransform(smooth, [0, 0.2], [1, 0.8]);

  return (
    <div ref={trackRef} className="relative" style={{ height: "140vh" }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden flex items-center justify-center">
        {/* No mobile, o grupo (texto+celular) empilhado costuma ser mais alto
            que a viewport — centralizar verticalmente aí empurra o texto até
            quase encostar no topo. `justify-start` + `pt` fixo garante que o
            texto sempre tem o mesmo respiro no topo; se algo faltar espaço,
            é o celular (decorativo) que perde um pouco embaixo, não o texto. */}
        <div className="w-full h-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-4 lg:gap-16 px-4 pt-14 pb-6 lg:py-6">
          {/* Texto — flex normal, nunca sobrepõe o celular. Sai de quadro
              por conta própria (transform puro, não afeta layout). */}
          <motion.div
            style={{ y: textY, scale: textScale }}
            className="min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="flex items-center gap-2 mb-3 lg:mb-8">
              <span
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
              >
                <span className="w-4 h-4 rounded-full bg-[var(--numi-income)] block" />
              </span>
              <span className="text-xl lg:text-2xl font-bold text-[var(--numi-text)] tracking-tight">Numi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--numi-text)] max-w-md lg:max-w-2xl leading-tight mb-2 lg:mb-4">
              Sua vida financeira,{" "}
              <RotatingWord
                words={["organizada", "descomplicada", "sob controle", "inteligente"]}
                className="text-[var(--numi-income)]"
                suffix="."
              />
            </h1>
            <p className="text-base lg:text-lg text-[var(--numi-text-2)] max-w-sm lg:max-w-md mb-3 lg:mb-10">
              Um lugar só para contas, gastos, metas e investimentos. Sem planilha, sem confusão.
            </p>

            <div className="flex flex-row gap-2 lg:gap-3">
              <Link href="/register" className="btn-primary" style={{ width: "auto", padding: "0.6rem 1.4rem" }}>
                Começar grátis
              </Link>
              <Link href="/login" className="btn-outline" style={{ width: "auto", padding: "0.6rem 1.4rem" }}>
                Já tenho conta
              </Link>
            </div>
          </motion.div>

          {/* Celular — flex normal também; o scale/zoom é um transform puro
              por cima, não interfere no espaço que ele ocupa no layout. */}
          <motion.div
            id="landing-scene-root"
            className="shrink-0 min-h-0"
            // `willChange` promove esse elemento pra própria camada de
            // composição ANTES do scroll começar a mudar o scale — sem isso,
            // o navegador só percebe que precisa de uma camada própria no
            // meio da animação, e a promoção tardia (+ ter que re-rasterizar
            // o conteúdo inteiro do zero, gigante, no momento) é o que
            // causava as travadas perceptíveis durante o zoom.
            style={{ scale, transformOrigin: "center", willChange: "transform" }}
          >
            <PhoneMockup dissolve={dissolve} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
