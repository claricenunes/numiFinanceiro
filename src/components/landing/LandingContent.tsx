"use client";

import { LandingHeader } from "./LandingHeader";
import { Hero } from "./Hero";
import { FeatureMarqueeSection } from "./FeatureMarqueeSection";
import { AnimatedHeroBackground } from "./AnimatedHeroBackground";
import { ResourcesSection } from "./ResourcesSection";
import { HorizontalStatementSection } from "./HorizontalStatementSection";
import { CTASection } from "./CTASection";
import { AnalyticsScrollSection } from "./AnalyticsScrollSection";
import { PricingSection } from "./PricingSection";
import { FinalCTASection } from "./FinalCTASection";
import { Footer } from "./Footer";

export function LandingContent() {
  return (
    <div className="numi-ambient-bg">
      <div className="numi-hero-band relative">
        <AnimatedHeroBackground />
        <LandingHeader />
        <Hero />
        <FeatureMarqueeSection />
      </div>
      <ResourcesSection />
      <HorizontalStatementSection />
      <CTASection />
      <AnalyticsScrollSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
