import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./OnboardingWizard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bem-vindo ao Numi" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("onboarding_step, full_name")
    .eq("id", user.id)
    .single() as { data: { onboarding_step: number; full_name: string } | null; error: unknown };

  if (profile && profile.onboarding_step >= 4) {
    redirect("/app/dashboard");
  }

  return (
    <OnboardingWizard
      initialStep={profile?.onboarding_step ?? 0}
      userName={profile?.full_name ?? ""}
    />
  );
}
