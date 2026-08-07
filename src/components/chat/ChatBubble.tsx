"use client";

import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types/chat";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
        style={
          isUser
            ? { background: "var(--numi-border)", color: "var(--numi-text-2)" }
            : { background: "var(--numi-landing-heading)", color: "white" }
        }
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </span>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={
          isUser
            ? { background: "var(--numi-landing-heading)", color: "white" }
            : { background: "var(--numi-elevated)", border: "1px solid var(--numi-border)", color: "var(--numi-text)" }
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.content ? (
          <div className="chat-markdown">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <ThinkingDots />
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "var(--numi-text-3)", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
