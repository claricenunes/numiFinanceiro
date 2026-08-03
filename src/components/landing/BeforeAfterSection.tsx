"use client";

import Link from "next/link";
import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

const BEFORE = [
  "Scattered, out-of-date spreadsheets",
  "You find out you overspent only at month's end",
  "Goals become just a number, with no real plan",
];

const AFTER = [
  "Everything in one place, updating itself",
  "Alerts before a problem happens",
  "A clear plan to hit every goal",
];

export function BeforeAfterSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-5xl mx-auto">
      <Reveal className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold max-w-xl mx-auto leading-tight" style={{ color: "var(--numi-landing-heading)" }}>
          Your money works with you
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaggerGroup className="glass-card p-6 lg:p-8 flex flex-col gap-4" style={{ border: "1px solid rgba(239,68,68,0.18)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--numi-expense)" }}>❌ Before</p>
          {BEFORE.map((item) => (
            <StaggerItem key={item} className="flex items-start gap-2.5">
              <span className="text-sm shrink-0" style={{ color: "var(--numi-expense)" }}>−</span>
              <p className="text-sm text-[var(--numi-text-2)] leading-relaxed">{item}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <StaggerGroup className="glass-card p-6 lg:p-8 flex flex-col gap-4" style={{ border: "1px solid rgba(16,185,129,0.22)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--numi-income)" }}>After</p>
          {AFTER.map((item) => (
            <StaggerItem key={item} className="flex items-start gap-2.5">
              <span className="text-sm shrink-0" style={{ color: "var(--numi-income)" }}>✓</span>
              <p className="text-sm text-[var(--numi-text)] leading-relaxed">{item}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <Reveal className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
        <Link
          href="/register"
          className="numi-pill-btn numi-pill-btn-dark numi-cta-bounce"
          style={{ padding: "0.75rem 2rem" }}
        >
          Start for free
        </Link>
        <Link href="/login" className="numi-pill-btn numi-pill-btn-outline-dark" style={{ padding: "0.75rem 2rem" }}>
          I have an account
        </Link>
      </Reveal>
    </section>
  );
}
