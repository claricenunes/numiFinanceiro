import type { Metadata } from "next";
import { getNotifications } from "@/lib/supabase/queries/notifications";
import { NotificationsView } from "./NotificationsView";
import { FadeIn } from "@/components/common/FadeIn";

export const metadata: Metadata = { title: "Notificações" };

export default async function NotificacoesPage() {
  const notifications = await getNotifications();

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-[#F1F5F9] mb-6">Notificações</h1>
      <NotificationsView notifications={notifications} />
    </FadeIn>
  );
}
