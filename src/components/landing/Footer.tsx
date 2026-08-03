"use client";

import Link from "next/link";
import Image from "next/image";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Product", links: ["Features", "Pricing", "Dashboard"] },
  { title: "Company", links: ["About", "Blog", "Contact"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
];

export function Footer() {
  return (
    <footer className="px-4 pt-16 pb-8 border-t border-black/5">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StaggerItem className="col-span-2 lg:col-span-1 flex items-center gap-2">
            <Image
              src="/mascot/personagem2.png"
              alt="Numi"
              width={1113}
              height={1414}
              className="h-9 w-auto select-none"
            />
            <span className="text-base font-bold text-[var(--numi-text)]">Numi</span>
          </StaggerItem>

          {COLUMNS.map((column) => (
            <StaggerItem key={column.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[var(--numi-text)]">{column.title}</p>
              {column.links.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-[var(--numi-text-2)] hover:text-[var(--numi-landing-tagline)] transition-colors w-fit"
                >
                  {link}
                </Link>
              ))}
            </StaggerItem>
          ))}
        </StaggerGroup>

        <p className="text-xs text-[var(--numi-text-3)]">
          &copy; {new Date().getFullYear()} Numi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
