import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = "", ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--numi-text-2)]">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={`input-base ${className}`} aria-invalid={!!error} {...rest} />
      {error ? (
        <p className="text-xs text-[var(--numi-expense)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--numi-text-3)]">{hint}</p>
      ) : null}
    </div>
  );
});
