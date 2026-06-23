import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { UserProfileSync } from "./UserProfileSync";
import type { UserProfile } from "@/types/database";

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Dev bypass: render layout without auth when Supabase isn't configured yet
  if (!isSupabaseConfigured) {
    return (
      <div className="flex h-dvh overflow-hidden" style={{ background: "#0B1020" }}>
        <Sidebar userName="Dev" userAvatar={undefined} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" id="main-content">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Cast explícito: stub de Database não propaga tipos via .from() até o Supabase CLI gerar os tipos reais
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: UserProfile | null; error: unknown };

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "#0B1020" }}>
      <Sidebar
        userName={profile?.full_name ?? user.email}
        userAvatar={profile?.avatar_url}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        <main
          className="flex-1 overflow-y-auto pb-20 lg:pb-0"
          id="main-content"
        >
          {children}
        </main>
      </div>

      <BottomNav />

      {/* Sincroniza o perfil no Zustand client-side */}
      {profile && <UserProfileSync profile={profile} />}
    </div>
  );
}
