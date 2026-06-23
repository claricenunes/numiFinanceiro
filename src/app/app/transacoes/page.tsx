import type { Metadata } from "next";
import { mockAllTransactions } from "@/lib/mock-data";
import { TransactionView } from "./TransactionView";

export const metadata: Metadata = { title: "Transações" };

export default function TransacoesPage() {
  return <TransactionView transactions={mockAllTransactions} />;
}
