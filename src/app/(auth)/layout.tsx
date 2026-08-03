import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/common/motion/PageTransition";
import { AnimatedHeroBackground } from "@/components/landing/AnimatedHeroBackground";

/**
 * Same cream hero-band gradient + drifting blobs as the landing's Hero,
 * so login/register/etc. read as the next step of that same page rather
 * than a dropped-in generic auth screen from the app's own (cool-gray)
 * design system.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="numi-hero-band relative min-h-dvh flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <AnimatedHeroBackground />

      <Link
        href="/"
        className="absolute left-4 top-4 sm:left-8 sm:top-8 z-10 inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-75 transition-opacity"
        style={{ color: "var(--numi-landing-heading)" }}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to home
      </Link>

      <Link href="/" className="relative z-10 mb-8 leading-none">
        <span
          className="text-5xl"
          style={{ color: "var(--numi-landing-heading)", fontFamily: "var(--font-logo)" }}
        >
          numi
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-[440px] numi-landing-auth-card p-8 sm:p-10">
        <PageTransition>{children}</PageTransition>
      </div>

      <p className="relative z-10 mt-8 text-xs" style={{ color: "var(--numi-landing-tagline)" }}>
        © {new Date().getFullYear()} Numi · Your financial life, organized.
      </p>
    </div>
  );
}
