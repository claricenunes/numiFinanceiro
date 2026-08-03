"use client";

import { LandingHeader } from "./LandingHeader";
import { Hero } from "./Hero";
import { FeatureMarqueeSection } from "./FeatureMarqueeSection";
import { AnimatedHeroBackground } from "./AnimatedHeroBackground";
import { ResourcesSection } from "./ResourcesSection";
import { HorizontalStatementSection } from "./HorizontalStatementSection";
import { CTASection } from "./CTASection";
import { FeaturesSection } from "./FeaturesSection";
import { DashboardShowcaseSection } from "./DashboardShowcaseSection";
import { AnalyticsScrollSection } from "./AnalyticsScrollSection";
import { BeforeAfterSection } from "./BeforeAfterSection";
import { ProductivitySection } from "./ProductivitySection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
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
      <DashboardShowcaseSection />
      <FeaturesSection />
      <AnalyticsScrollSection />
      <BeforeAfterSection />
      <ProductivitySection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
