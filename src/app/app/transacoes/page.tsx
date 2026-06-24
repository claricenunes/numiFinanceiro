import type { Metadata } from "next";
import { getTransactions } from "@/lib/supabase/queries/transactions";
import { parsePeriodFromParams } from "@/lib/utils/date";
import { TransactionView } from "./TransactionView";

export const metadata: Metadata = { title: "Transações" };

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; pt?: string }>;
}) {
  const { from, to, pt } = await searchParams;
  const period = parsePeriodFromParams(from, to, pt);

  const transactions = await getTransactions(200, { startDate: period.startDate, endDate: period.endDate });
  return <TransactionView transactions={transactions} />;
}
