"use client";

import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/common/motion/Reveal";
import { AIOrb } from "@/components/mascot/AIOrb";
import type { OrbStatus } from "@/components/mascot/orbStatus";
import type { Insight } from "@/lib/supabase/queries/insights";

interface Props {
  firstName: string;
  orbStatus: OrbStatus;
  statusMessage: string;
  highlight?: Insight;
}

export function DashboardGreeting({ firstName, orbStatus, statusMessage, highlight }: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Reveal
      className="relative overflow-hidden rounded-[2rem] px-6 py-7 lg:px-9 lg:py-9"
      style={{ background: "var(--numi-landing-nav-bg)" }}
    >
      {/* Signature brand texture — echoes the landing's drifting blobs, static here for a calm "home base" feel */}
      <div
        className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "var(--numi-landing-accent)", opacity: 0.16, filter: "blur(60px)" }}
      />
      <div
        className="absolute -bottom-28 left-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "var(--numi-landing-tagline)", opacity: 0.12, filter: "blur(70px)" }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: "var(--numi-landing-nav-muted)" }}>
            {today}
          </p>
          <h1
            className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--numi-landing-nav-text)" }}
          >
            Hi{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--numi-landing-nav-muted)" }}>{statusMessage}</p>
        </div>

        {highlight && (
          <div className="flex items-start gap-3 max-w-lg lg:text-right lg:flex-row-reverse">
            <span
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--numi-landing-accent) 22%, transparent)", color: "var(--numi-landing-accent)" }}
            >
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-white">
                Numi AI
              </p>
              <p className="text-sm font-medium leading-snug" style={{ color: "var(--numi-landing-nav-text)" }}>
                {highlight.title}. {highlight.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        <AIOrb status={orbStatus} size={28} />
        <span className="text-xs" style={{ color: "var(--numi-landing-nav-muted)" }}>
          Numi is watching your accounts and will flag anything that needs attention.
        </span>
      </div>
    </Reveal>
  );
}
