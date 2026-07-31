"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Fixed landing header — the mascot sits centered (not a generic logo),
 * with sign-in/sign-up actions at the edges. Two equal `flex-1` side
 * columns keep the mascot truly centered regardless of each side's width.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F5EC]/90 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 h-16 lg:h-20 flex items-center justify-between lg:justify-center gap-3">
        <div className="hidden lg:block lg:flex-1" />

        <Link href="/" className="shrink-0 flex items-center gap-2">
          <Image
            src="/mascot/personagem2.png"
            alt="Numi"
            width={1113}
            height={1414}
            priority
            className="h-9 lg:h-14 w-auto select-none"
          />
          <span className="text-base lg:text-xl font-bold text-[var(--numi-text)] tracking-tight">Numi</span>
        </Link>

        <div className="flex items-center gap-3 lg:gap-6 lg:flex-1 lg:justify-end">
          <Link
            href="/login"
            className="text-sm lg:text-base font-medium text-[var(--numi-text)] underline decoration-transparent hover:decoration-current underline-offset-4 transition-[text-decoration-color] duration-200 whitespace-nowrap"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm lg:text-base font-semibold text-[#98BB8A] underline decoration-transparent hover:decoration-current underline-offset-4 transition-[text-decoration-color] duration-200 whitespace-nowrap"
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}
