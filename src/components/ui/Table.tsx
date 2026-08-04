import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ className = "", ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--numi-border)" }}>
      <table className={`w-full text-sm border-collapse ${className}`} {...rest} />
    </div>
  );
}

export function Thead({ className = "", ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`bg-[color-mix(in_srgb,var(--numi-text)_3%,transparent)] ${className}`} {...rest} />;
}

export function Tbody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({ className = "", ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-t transition-colors hover:bg-[color-mix(in_srgb,var(--numi-text)_3%,transparent)] ${className}`}
      style={{ borderColor: "var(--numi-border)" }}
      {...rest}
    />
  );
}

export function Th({ className = "", ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-left text-xs font-semibold uppercase tracking-wide text-[var(--numi-text-3)] px-4 py-3 ${className}`}
      {...rest}
    />
  );
}

export function Td({ className = "", ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-[var(--numi-text)] ${className}`} {...rest} />;
}
