import type { Metadata } from "next";
import { LandingContent } from "@/components/landing/LandingContent";

export const metadata: Metadata = {
  title: "Numi — Gestão financeira pessoal",
};

export default function LandingPage() {
  return <LandingContent />;
}
