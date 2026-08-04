"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-sm px-5 py-3 gap-2 rounded-xl",
};

const VARIANT: Record<Variant, { className: string; style?: CSSProperties }> = {
  primary: {
    className: "text-white hover:brightness-110 active:scale-[0.98]",
    style: { background: "var(--numi-landing-heading)" },
  },
  accent: {
    className: "hover:brightness-105 active:scale-[0.98]",
    style: { background: "var(--numi-landing-accent)", color: "var(--numi-landing-accent-text)" },
  },
  secondary: {
    className: "border hover:bg-[color-mix(in_srgb,var(--numi-text)_5%,transparent)] active:scale-[0.98]",
    style: { borderColor: "var(--numi-border)", color: "var(--numi-text)" },
  },
  ghost: {
    className: "text-[var(--numi-text-2)] hover:text-[var(--numi-text)] hover:bg-[color-mix(in_srgb,var(--numi-text)_5%,transparent)] active:scale-[0.98]",
  },
  danger: {
    className: "text-white hover:brightness-110 active:scale-[0.98]",
    style: { background: "var(--numi-expense)" },
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, icon, disabled, className = "", style, children, ...rest },
  ref
) {
  const v = VARIANT[variant];
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${SIZE_CLASS[size]} ${v.className} ${className}`}
      style={{ ...v.style, ...style }}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" size={size === "sm" ? 14 : 16} /> : icon}
      {children}
    </button>
  );
});
