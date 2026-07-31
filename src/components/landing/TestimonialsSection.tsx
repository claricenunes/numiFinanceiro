"use client";

import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

interface Testimonial {
  initials: string;
  color: string;
  name: string;
  role: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    initials: "JM",
    color: "#8FAE7C",
    name: "Jordan M.",
    role: "Freelance designer",
    quote: "I finally know exactly where my money goes every month. The savings goal tracker alone paid for the subscription.",
  },
  {
    initials: "AS",
    color: "#6E76A8",
    name: "Amara S.",
    role: "Product manager",
    quote: "Numi caught a subscription I'd forgotten about within the first week. It quietly pays for itself.",
  },
  {
    initials: "TK",
    color: "#E3A6AE",
    name: "Theo K.",
    role: "Small business owner",
    quote: "The dashboard is the first finance app I've used that I actually enjoy opening.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <p className="text-sm font-semibold mb-3" style={{ color: "#98BB8A" }}>Testimonials</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] max-w-2xl mx-auto leading-tight">
          People trust Numi with their money
        </h2>
      </Reveal>

      <StaggerGroup className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <StaggerItem key={t.name} className="glass-card p-6 flex flex-col gap-5">
            <p className="text-sm text-[var(--numi-text-2)] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3 mt-auto">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold text-white"
                style={{ background: t.color }}
                aria-hidden="true"
              >
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--numi-text)]">{t.name}</p>
                <p className="text-xs text-[var(--numi-text-3)]">{t.role}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
