"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For getting your finances organized.",
    features: ["1 connected account", "Basic budgeting", "Spending categories", "Monthly summary"],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    description: "For serious savers and planners.",
    features: ["Unlimited accounts", "Savings goals", "Bill reminders", "Investment overview", "Priority support"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "$24",
    period: "/ month",
    description: "For managing multiple entities.",
    features: ["Everything in Pro", "Multiple workspaces", "Team access", "Exportable reports", "Dedicated support"],
  },
];

export function PricingSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Pricing</p>
        <h2 className="text-3xl lg:text-4xl font-bold max-w-2xl mx-auto leading-tight" style={{ color: "var(--numi-landing-heading)" }}>
          Simple plans, no surprises
        </h2>
      </Reveal>

      <StaggerGroup className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {PLANS.map((plan) => (
          <StaggerItem
            key={plan.name}
            className={plan.highlighted ? "glass-card p-8 lg:p-9 flex flex-col gap-6 lg:scale-105" : "glass-card p-8 lg:p-9 flex flex-col gap-6"}
            style={
              plan.highlighted
                ? {
                    border: "1.5px solid var(--numi-landing-accent)",
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--numi-landing-accent) 6%, var(--numi-elevated)) 0%, var(--numi-elevated) 100%)",
                    boxShadow: "0 25px 60px -20px color-mix(in srgb, var(--numi-landing-accent) 45%, transparent)",
                  }
                : undefined
            }
          >
            {plan.highlighted && (
              <span
                className="text-xs font-semibold w-fit px-2.5 py-1 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--numi-landing-accent) 15%, transparent)",
                  color: "var(--numi-landing-accent)",
                }}
              >
                Most popular
              </span>
            )}

            <div>
              <p className="text-base font-semibold text-[var(--numi-text)] mb-1">{plan.name}</p>
              <p className="text-sm text-[var(--numi-text-2)]">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[var(--numi-text)]">{plan.price}</span>
              <span className="text-sm text-[var(--numi-text-3)]">{plan.period}</span>
            </div>

            <ul className="flex flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--numi-landing-accent)" }} strokeWidth={2.5} aria-hidden="true" />
                  <span className="text-sm text-[var(--numi-text-2)]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className={
                plan.highlighted
                  ? "numi-pill-btn numi-pill-btn-accent numi-cta-bounce"
                  : "numi-pill-btn numi-pill-btn-outline-dark"
              }
              style={{ width: "100%", marginTop: "auto" }}
            >
              Get started
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
