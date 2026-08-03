"use client";

import Link from "next/link";
import { Reveal } from "@/components/common/motion/Reveal";

/**
 * The closing "brand moment" of the page — a dark-green card (the same
 * `--numi-landing-nav-bg` as the header) bookends the experience: the
 * header opens the page in this color, this section closes it, with the
 * coral accent button as the one pop of color, matching how it's used
 * everywhere else on a dark surface (Hero's overlay CTA, header's own
 * "Sign up").
 */
export function FinalCTASection() {
  return (
    <section className="px-4 py-24 lg:py-32">
      <Reveal className="max-w-3xl mx-auto rounded-[2.5rem] p-10 lg:p-16 flex flex-col items-center text-center gap-6 bg-[var(--numi-landing-nav-bg)]">
        <h2
          className="text-3xl lg:text-4xl font-bold max-w-lg leading-tight"
          style={{ color: "var(--numi-landing-nav-text)" }}
        >
          Ready to actually understand your money?
        </h2>
        <p className="text-lg max-w-md" style={{ color: "var(--numi-landing-nav-muted)" }}>
          Start free, no credit card required. Set up your first budget in under five minutes.
        </p>
        <Link
          href="/register"
          className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce"
          style={{ padding: "0.75rem 2.25rem" }}
        >
          Start for free
        </Link>
      </Reveal>
    </section>
  );
}
