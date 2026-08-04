"use client";

const DEFAULT_COLORS = ["#34D399", "#38BDF8", "#FBBF24", "#F97316", "#8B5CF6", "#EC4899", "#EF4444", "#64748B"];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  label?: string;
}

export function ColorPicker({ value, onChange, colors = DEFAULT_COLORS, label }: ColorPickerProps) {
  return (
    <div>
      {label && <label className="text-xs font-medium text-[var(--numi-text-2)] mb-2 block">{label}</label>}
      <div className="flex gap-2 flex-wrap">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={c}
            className="w-7 h-7 rounded-full transition-transform"
            style={{
              background: c,
              outline: value === c ? `2px solid ${c}` : "2px solid transparent",
              outlineOffset: 2,
              transform: value === c ? "scale(1.15)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
