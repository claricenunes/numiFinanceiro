import {
  Landmark, PiggyBank, CreditCard, Wallet, TrendingUp, Handshake,
  BarChart3, Building2, Banknote, Package, Bitcoin,
  Target, Home, Plane, Car, BookOpen, Laptop, Gem, Baby, Palmtree,
  ShieldCheck, GraduationCap, Dumbbell, Guitar, Globe,
  type LucideIcon,
} from "lucide-react";

export const ACCOUNT_TYPE_ICON: Record<string, LucideIcon> = {
  checking:    Landmark,
  savings:     PiggyBank,
  credit_card: CreditCard,
  cash:        Wallet,
  investment:  TrendingUp,
  joint:       Handshake,
};

export const ASSET_TYPE_ICON: Record<string, LucideIcon> = {
  stock:        TrendingUp,
  etf:          BarChart3,
  fii:          Building2,
  fixed_income: Landmark,
  crypto:       Bitcoin,
  cash:         Banknote,
};

export const DEFAULT_ICON: LucideIcon = Package;

export const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  target:      Target,
  home:        Home,
  plane:       Plane,
  car:         Car,
  book:        BookOpen,
  laptop:      Laptop,
  ring:        Gem,
  baby:        Baby,
  beach:       Palmtree,
  money:       PiggyBank,
  shield:      ShieldCheck,
  graduation:  GraduationCap,
  fitness:     Dumbbell,
  music:       Guitar,
  world:       Globe,
};

export const GOAL_ICON_KEYS = Object.keys(GOAL_ICON_MAP);
