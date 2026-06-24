import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastContainer } from "@/components/common/ToastContainer";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { UserProfileSync } from "./UserProfileSync";
import { QuickAddModal } from "@/components/common/QuickAddModal";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import type { UserProfile } from "@/types/database";

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex h-dvh overflow-hidden" style={{ background: "#0B1020" }}>
        <Sidebar userName="Dev" userAvatar={undefined} notifCount={0} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" id="main-content">
            {children}
          </main>
        </div>
        <BottomNav />
        <MobileDrawer />
        <QuickAddModal />
        <ToastContainer />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, notifRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single() as unknown as Promise<{ data: UserProfile | null; error: unknown }>,
    supabase.from("financial_events").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);

  const profile = profileRes.data;
  const notifCount = notifRes.count ?? 0;

  // Redirect new users to onboarding
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname === "/app/onboarding";

  if (profile && profile.onboarding_step < 4 && !isOnboarding) {
    redirect("/app/onboarding");
  }

  // Full-screen layout for onboarding (no sidebar/header)
  if (isOnboarding) {
    return (
      <div className="min-h-dvh" style={{ background: "#0B1020" }}>
        {children}
        {profile && <UserProfileSync profile={profile} />}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "var(--numi-bg)" }}>
      <Sidebar
        userName={profile?.full_name ?? user.email}
        userAvatar={profile?.avatar_url}
        notifCount={notifCount}
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

      {profile && <UserProfileSync profile={profile} />}
      <ThemeProvider initialTheme={profile?.theme ?? "dark"} />

      <MobileDrawer />
      <QuickAddModal />
      <ToastContainer />
    </div>
  );
}
