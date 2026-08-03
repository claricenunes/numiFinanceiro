"use client";

import { Reveal } from "@/components/common/motion/Reveal";
import { Accordion, AccordionItem } from "@/components/common/Accordion";

const FAQS = [
  {
    question: "Is my financial data secure?",
    answer: "Yes. Bank connections use read-only, encrypted access, and your data is never sold or shared with third parties.",
  },
  {
    question: "Do I need to connect a bank account to use Numi?",
    answer: "No — you can track everything manually if you prefer. Bank sync is optional and just saves you the data entry.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, there's no lock-in contract. You can cancel or downgrade your plan whenever you like, directly from your account settings.",
  },
  {
    question: "Which currencies does Numi support?",
    answer: "Numi supports multiple currencies per account, so you can track finances across countries without manual conversion.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes — the Starter plan is free forever and covers the essentials: budgeting, categories, and a monthly summary.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "You can export everything before cancelling. We keep your data for a short grace period afterward in case you change your mind.",
  },
];

export function FAQSection() {
  return (
    <section className="px-4 py-24 lg:py-32 max-w-3xl mx-auto">
      <Reveal className="text-center mb-12">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--numi-landing-tagline)" }}>FAQ</p>
        <h2 className="text-3xl lg:text-4xl font-bold leading-tight" style={{ color: "var(--numi-landing-heading)" }}>
          Questions, answered
        </h2>
      </Reveal>

      <Reveal delay={0.05}>
        <Accordion>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} question={faq.question}>
              {faq.answer}
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
