import { createClient } from "@/lib/supabase/server";
import type { FinancialEvent } from "@/types/database";

export type Notification = Pick<
  FinancialEvent,
  | "id"
  | "type"
  | "severity"
  | "title"
  | "description"
  | "is_read"
  | "created_at"
  | "related_entity_type"
  | "related_entity_id"
>;

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("financial_events")
    .select("id,type,severity,title,description,is_read,created_at,related_entity_type,related_entity_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("financial_events")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
}

export async function createFinancialEvent(
  event: Omit<FinancialEvent, "id" | "created_at" | "is_read">
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("financial_events") as any).insert(event);
}
