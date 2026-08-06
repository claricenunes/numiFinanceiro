import type { Metadata } from "next";
import { getNotifications } from "@/lib/supabase/queries/notifications";
import { NotificationsView } from "./NotificationsView";
import { FadeIn } from "@/components/common/FadeIn";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificacoesPage() {
  const notifications = await getNotifications();

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-2xl mx-auto">
      <PageHeader title="Notifications" />
      <NotificationsView notifications={notifications} />
    </FadeIn>
  );
}
