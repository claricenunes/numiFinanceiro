"use client";

import Link from "next/link";
import Image from "next/image";
import { RotatingWord } from "@/components/common/motion/RotatingWord";

/**
 * Illustrated mascot identity (the wallet character) rather than an
 * abstract data-viz treatment. Simple, fully static section — no
 * animation on the mascot itself.
 */
export function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center px-4 py-16">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--numi-text)] max-w-md lg:max-w-lg leading-tight mb-4">
            Your finances,{" "}
            <RotatingWord
              words={["organized", "simplified", "under control", "intelligent"]}
              className="text-[#98BB8A]"
              suffix="."
            />
          </h1>
          <p className="text-lg text-[var(--numi-text-2)] max-w-md mb-10">
            One place for accounts, spending, goals, and investments. No spreadsheets, no confusion.
          </p>

          <div className="flex flex-row gap-3">
            <Link
              href="/register"
              className="btn-primary numi-landing-btn-primary"
              style={{ width: "auto", padding: "0.6rem 1.4rem" }}
            >
              Start for free
            </Link>
            <Link href="/login" className="btn-outline" style={{ width: "auto", padding: "0.6rem 1.4rem" }}>
              I have an account
            </Link>
          </div>
        </div>

        <div className="shrink-0">
          <Image
            src="/mascot/personagem4.png"
            alt="Numi mascot waving"
            width={1189}
            height={1323}
            priority
            className="w-[240px] sm:w-[300px] lg:w-[380px] h-auto select-none pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
}
