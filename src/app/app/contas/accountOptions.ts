import { ACCOUNT_TYPE_ICON } from "@/lib/icons";

export type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment" | "joint";

export const TYPE_OPTIONS = [
  { value: "checking" as AccountType, label: "Checking", icon: ACCOUNT_TYPE_ICON.checking },
  { value: "savings" as AccountType, label: "Savings", icon: ACCOUNT_TYPE_ICON.savings },
  { value: "credit_card" as AccountType, label: "Credit Card", icon: ACCOUNT_TYPE_ICON.credit_card },
  { value: "cash" as AccountType, label: "Cash", icon: ACCOUNT_TYPE_ICON.cash },
  { value: "investment" as AccountType, label: "Investments", icon: ACCOUNT_TYPE_ICON.investment },
  { value: "joint" as AccountType, label: "Joint Account", icon: ACCOUNT_TYPE_ICON.joint },
];

export const ACCOUNT_COLORS = ["#34D399", "#38BDF8", "#FBBF24", "#F97316", "#8B5CF6", "#EC4899", "#EF4444", "#64748B"];
