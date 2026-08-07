import type { AIProvider } from "./fia";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string | null;
  updatedAt: string;
}

export type ChatIntent =
  | "spending_by_category"
  | "top_expenses"
  | "income"
  | "savings"
  | "period_comparison"
  | "goals"
  | "recurring"
  | "budget"
  | "forecast"
  | "summary";

export interface ChatResponseMeta {
  intent: ChatIntent;
  aiProvider: AIProvider;
}
