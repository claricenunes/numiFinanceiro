import type { Metadata } from "next";
import { FadeIn } from "@/components/common/FadeIn";
import { ChatView } from "@/components/chat/ChatView";

export const metadata: Metadata = { title: "Assistant" };

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;

  return (
    <FadeIn className="px-4 py-5 lg:px-8 lg:py-6 max-w-5xl mx-auto">
      <ChatView initialSessionId={session ?? null} />
    </FadeIn>
  );
}
