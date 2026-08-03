"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/common/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/common/motion/Stagger";

interface Resource {
  category: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

const RESOURCES: Resource[] = [
  {
    category: "Budgeting",
    title: "5 simple habits that save you money every month",
    description: "Small daily changes can make a surprisingly big impact on your finances.",
    image: "https://images.unsplash.com/photo-1709880945165-d2208c6ad2ec?w=800&q=80&auto=format&fit=crop",
    alt: "Calculator next to a laptop on a desk",
  },
  {
    category: "AI Insights",
    title: "How Numi helps you understand your spending",
    description: "Personalized financial insights powered by AI.",
    image: "https://images.unsplash.com/photo-1759752394755-1241472b589d?w=800&q=80&auto=format&fit=crop",
    alt: "Hands typing on a laptop showing a data dashboard",
  },
  {
    category: "Investing",
    title: "Investing for beginners without the jargon",
    description: "Learn the basics before making your first investment.",
    image: "https://images.unsplash.com/photo-1745270917449-c2e2c5806586?w=800&q=80&auto=format&fit=crop",
    alt: "Stock market chart showing an upward trend",
  },
];

export function ResourcesSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center mb-16">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>Resources</p>
        <h2 className="text-3xl lg:text-4xl font-bold max-w-2xl mx-auto leading-tight" style={{ color: "var(--numi-landing-heading)" }}>
          Our latest news, thoughts, and guides.
        </h2>
      </Reveal>

      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {RESOURCES.map((resource) => (
          <StaggerItem
            key={resource.title}
            className="group glass-card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.2)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden shrink-0">
              <Image
                src={resource.image}
                alt={resource.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>

            <div className="p-6 flex flex-col gap-2">
              <p className="text-xs font-semibold" style={{ color: "var(--numi-landing-tagline)" }}>
                {resource.category}
              </p>
              <h3 className="text-base font-semibold leading-snug" style={{ color: "var(--numi-landing-heading)" }}>
                {resource.title}
              </h3>
              <p className="text-sm text-[var(--numi-text-2)] leading-relaxed mb-2">{resource.description}</p>

              <Link
                href="#"
                className="group/link inline-flex items-center gap-1.5 text-sm font-semibold w-fit"
                style={{ color: "var(--numi-landing-tagline)" }}
              >
                Read article
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
