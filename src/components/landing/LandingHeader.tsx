"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

/**
 * Floating pill navbar (dark-green, rounded-full) — mirrors the
 * "capsule nav on pastel background" pattern, restyled with Numi's
 * own wordmark and color system instead of a copied brand.
 *
 * Deliberately no mount/entrance animation here — this header must
 * stay visible for the entire page (above every other section,
 * including the GSAP-pinned ones further down), and a JS-driven
 * fade/slide-in is one more thing that could theoretically get stuck
 * at its initial (invisible) state. Always-rendered at full opacity is
 * more important than a subtle entrance effect for a persistent nav.
 *
 * `fixed`, not `sticky` — this component lives nested inside the hero
 * band (kept there so the peach gradient shows through behind it,
 * instead of a flat-cream seam), but `sticky` only stays docked while
 * its own containing block (the hero band, only as tall as Hero +
 * marquee) is in view — past that point it scrolls away with the rest
 * of the page. `fixed` pins to the viewport itself regardless of which
 * ancestor it's nested inside, so it stays put for the whole page.
 */
export function LandingHeader() {
  return (
    <header className="fixed top-6 inset-x-0 z-[100] w-full px-4 lg:px-6">
      <div className="max-w-[1500px] mx-auto">
        <div className="numi-pill-nav h-[64px] sm:h-[92px] lg:h-[104px] px-4 sm:px-7 lg:px-10 flex items-center justify-between gap-3 sm:gap-6 shadow-lg shadow-black/10">
          <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
            <Link href="/" className="shrink-0 flex items-center">
              <span
                className="text-2xl sm:text-5xl lg:text-6xl leading-none"
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

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Link href="/register" className="numi-pill-btn numi-pill-btn-outline hidden sm:inline-flex text-lg px-6 py-3">
              See pricing
            </Link>
            <Link href="/login" className="numi-pill-btn numi-pill-btn-outline text-xs sm:text-lg px-3 py-2 sm:px-6 sm:py-3">
              Log in
            </Link>
            <Link href="/register" className="numi-pill-btn numi-pill-btn-accent text-xs sm:text-lg px-3 py-2 sm:px-6 sm:py-3">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
