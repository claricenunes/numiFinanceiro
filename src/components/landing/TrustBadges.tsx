import { ShieldCheck, Lock, Landmark, Sparkles } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

const BADGES = [
  { icon: Lock, label: "End-to-end encryption" },
  { icon: Landmark, label: "Open Finance compatible" },
  { icon: ShieldCheck, label: "Privacy-first by design" },
  { icon: Sparkles, label: "AI-powered insights" },
];

/**
 * Trust strip in the same slot as a logo bar — but Numi has no real
 * customer logos to show (personal-finance app, not B2B), so this
 * shows genuine product guarantees instead of fabricated endorsements.
 */
export function TrustBadges() {
  return (
    <div className="px-4 pt-14 lg:pt-20 pb-14 lg:pb-16">
      <StaggerGroup className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center lg:justify-between gap-x-10 gap-y-4">
        {BADGES.map(({ icon: Icon, label }) => (
          <StaggerItem key={label} className="flex items-center gap-2" style={{ color: "var(--numi-landing-tagline)" }}>
            <Icon size={18} strokeWidth={2} />
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
