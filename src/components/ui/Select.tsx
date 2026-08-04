import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, className = "", children, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--numi-text-2)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`input-base appearance-none pr-9 ${className}`}
          aria-invalid={!!error}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--numi-text-3)]"
        />
      </div>
      {error ? (
        <p className="text-xs text-[var(--numi-expense)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--numi-text-3)]">{hint}</p>
      ) : null}
    </div>
  );
});
