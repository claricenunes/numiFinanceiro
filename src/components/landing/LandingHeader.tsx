"use client";

import Link from "next/link";
import { FadeIn } from "@/components/common/FadeIn";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

/**
 * Floating pill navbar (dark-green, rounded-full) — mirrors the
 * "capsule nav on pastel background" pattern, restyled with Numi's
 * own wordmark and color system instead of a copied brand.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-6 z-50 w-full px-4 lg:px-6">
      <FadeIn className="max-w-[1500px] mx-auto">
        <div className="numi-pill-nav h-[92px] lg:h-[104px] px-7 lg:px-10 flex items-center justify-between gap-6 shadow-lg shadow-black/10">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" className="shrink-0 flex items-center">
              <span
                className="text-5xl lg:text-6xl leading-none"
                style={{ color: "var(--numi-landing-nav-muted)", fontFamily: "var(--font-logo)" }}
              >
                numi
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-[var(--numi-landing-nav-text)] hover:opacity-80 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <Link href="/register" className="numi-pill-btn numi-pill-btn-outline hidden sm:inline-flex text-lg px-6 py-3">
              See pricing
            </Link>
            <Link href="/login" className="numi-pill-btn numi-pill-btn-outline text-lg px-6 py-3">
              Log in
            </Link>
            <Link href="/register" className="numi-pill-btn numi-pill-btn-accent text-lg px-6 py-3">
              Sign up
            </Link>
          </div>
        </div>
      </FadeIn>
    </header>
  );
}
