import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** "interactive" adds hover lift + border warm-up — use for clickable cards. */
  variant?: "default" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

const PADDING: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 lg:p-8",
};

export function Card({ children, variant = "default", padding = "md", className = "", ...rest }: CardProps) {
  const interactive = variant === "interactive" ? "glass-card-interactive" : "";
  return (
    <div className={`glass-card ${interactive} ${PADDING[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
