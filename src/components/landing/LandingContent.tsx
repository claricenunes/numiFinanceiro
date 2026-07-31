"use client";

import { LandingHeader } from "./LandingHeader";
import { Hero } from "./Hero";
import { FeaturesSection } from "./FeaturesSection";
import { DashboardShowcaseSection } from "./DashboardShowcaseSection";
import { AnalyticsSection } from "./AnalyticsSection";
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
      <LandingHeader />
      <Hero />
      <FeaturesSection />
      <DashboardShowcaseSection />
      <AnalyticsSection />
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
