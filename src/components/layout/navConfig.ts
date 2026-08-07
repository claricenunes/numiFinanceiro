import {
  LayoutGrid, Landmark, ArrowLeftRight, PieChart, Target, TrendingUp,
  Sparkles, Bot, MessageCircle, Bell, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/app/dashboard", icon: LayoutGrid }] },
  {
    label: "Manage",
    items: [
      { label: "Accounts", href: "/app/contas", icon: Landmark },
      { label: "Transactions", href: "/app/transacoes", icon: ArrowLeftRight },
      { label: "Budget", href: "/app/orcamento", icon: PieChart },
      { label: "Goals", href: "/app/metas", icon: Target },
      { label: "Investments", href: "/app/investimentos", icon: TrendingUp },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Assistant", href: "/app/chat", icon: MessageCircle },
      { label: "Insights", href: "/app/insights", icon: Sparkles },
      { label: "Financial AI", href: "/app/fia", icon: Bot },
    ],
  },
];

export const NOTIFICATIONS_ITEM: NavItem = { label: "Notifications", href: "/app/notificacoes", icon: Bell, badge: true };
