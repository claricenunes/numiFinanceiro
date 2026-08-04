import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className = "", rows = 3, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--numi-text-2)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`input-base resize-none ${className}`}
        aria-invalid={!!error}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-[var(--numi-expense)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--numi-text-3)]">{hint}</p>
      ) : null}
    </div>
  );
});
