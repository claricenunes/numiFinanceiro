"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChatBubble } from "./ChatBubble";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatInput } from "./ChatInput";
import { ChatSessionList } from "./ChatSessionList";
import type { ChatMessage, ChatSession } from "@/types/chat";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatView({ initialSessionId }: { initialSessionId: string | null }) {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(!!initialSessionId);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) setSessions(await res.json() as ChatSession[]);
    } catch {
      // Sidebar list is a convenience, not required for the chat itself to work.
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    if (initialSessionId) {
      fetch(`/api/chat/sessions/${initialSessionId}/messages`)
        .then((res) => (res.ok ? res.json() as Promise<ChatMessage[]> : Promise.reject()))
        .then(setMessages)
        .catch(() => setError("Could not load that conversation."))
        .finally(() => setMessagesLoading(false));
    }
    // Only meant to run once, against the id the page loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const selectSession = useCallback(async (id: string) => {
    if (id === sessionId || sending) return;
    setMobileListOpen(false);
    setSessionId(id);
    setError(null);
    setMessagesLoading(true);
    router.replace(`/app/chat?session=${id}`);
    try {
      const res = await fetch(`/api/chat/sessions/${id}/messages`);
      if (!res.ok) throw new Error();
      setMessages(await res.json() as ChatMessage[]);
    } catch {
      setError("Could not load that conversation.");
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [sessionId, sending, router]);

  const startNewConversation = useCallback(() => {
    if (sending) return;
    setMobileListOpen(false);
    setSessionId(null);
    setMessages([]);
    setError(null);
    router.replace("/app/chat");
  }, [sending, router]);

  const send = useCallback(async (question: string) => {
    const text = question.trim();
    if (!text || sending) return;

    setError(null);
    setInput("");
    setSending(true);

    const userMsg: ChatMessage = { id: newId(), role: "user", content: text, createdAt: new Date().toISOString() };
    const assistantId = newId();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Too many questions right now — try again in a bit.");
      }
      if (res.status === 404) {
        throw new Error("That conversation no longer exists — start a new one.");
      }
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // The server may have just created this session (first message of a
      // new conversation) — learn its id so follow-ups stay in it.
      const returnedSessionId = res.headers.get("X-Chat-Session-Id");
      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
        router.replace(`/app/chat?session=${returnedSessionId}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
      }

      if (!acc.trim()) {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: "I couldn't generate a response — please try rephrasing." } : m)));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setSending(false);
      // Picks up the server-assigned title (and reordering) for this session.
      fetchSessions();
    }
  }, [sessionId, sending, router, fetchSessions]);

  return (
    <>
      <PageHeader title="Assistant" />
      <div className="flex gap-4 h-[calc(100dvh-9.5rem)] lg:h-[calc(100dvh-8rem)]">
        <div className="hidden lg:block w-64 shrink-0">
          <ChatSessionList
            sessions={sessions}
            activeId={sessionId}
            loading={sessionsLoading}
            onSelect={selectSession}
            onNewConversation={startNewConversation}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="lg:hidden mb-2">
            <button
              type="button"
              onClick={() => setMobileListOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: "var(--numi-text-2)", background: "var(--numi-elevated)", border: "1px solid var(--numi-border)" }}
            >
              <MessageSquare size={13} />
              Conversations
            </button>
            <AnimatePresence initial={false}>
              {mobileListOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 max-h-64">
                    <ChatSessionList
                      sessions={sessions}
                      activeId={sessionId}
                      loading={sessionsLoading}
                      onSelect={selectSession}
                      onNewConversation={startNewConversation}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 pb-4">
            {messagesLoading ? (
              <div className="flex flex-col gap-3 py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--numi-elevated)" }} />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center text-center gap-4 h-full px-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span
                  className="flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{ background: "var(--numi-landing-heading)", color: "white" }}
                >
                  <Bot size={24} />
                </span>
                <div>
                  <p className="text-base font-semibold" style={{ color: "var(--numi-landing-heading)" }}>
                    Ask me anything about your finances
                  </p>
                  <p className="text-sm text-[var(--numi-text-3)] mt-1 max-w-sm">
                    I answer using your real data — transactions, budgets, goals and investments.
                  </p>
                </div>
                <div className="w-full max-w-lg mt-2">
                  <ChatSuggestions onPick={send} />
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-4 py-2">
                {messages.map((m) => (
                  <ChatBubble key={m.id} message={m} />
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-center mb-2" style={{ color: "var(--numi-expense)" }}>
              {error}
            </p>
          )}

          <ChatInput value={input} onChange={setInput} onSubmit={() => send(input)} disabled={sending} />
        </div>
      </div>
    </>
  );
}
