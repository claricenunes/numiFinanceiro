"use client";

import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/common/motion/Reveal";

export function FinalCTASection() {
  return (
    <section className="px-4 py-24 lg:py-32">
      <Reveal className="max-w-3xl mx-auto glass-card p-10 lg:p-16 flex flex-col items-center text-center gap-6">
        <Image
          src="/mascot/personagem1.png"
          alt="Numi mascot waving"
          width={1113}
          height={1414}
          className="w-20 h-auto select-none"
        />
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--numi-text)] max-w-lg leading-tight">
          Ready to actually understand your money?
        </h2>
        <p className="text-lg text-[var(--numi-text-2)] max-w-md">
          Start free, no credit card required. Set up your first budget in under five minutes.
        </p>
        <Link
          href="/register"
          className="btn-primary numi-landing-btn-primary"
          style={{ width: "auto", padding: "0.75rem 2.25rem" }}
        >
          Start for free
        </Link>
      </Reveal>
    </section>
  );
}
