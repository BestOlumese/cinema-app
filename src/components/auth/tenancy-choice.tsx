import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "independent" as const,
    title: "Independent cinema",
    description: "A single location.",
  },
  {
    value: "chain" as const,
    title: "Chain / Head office",
    description: "Multiple branches under one head office.",
  },
];

export function TenancyChoice({
  value,
  onChange,
}: {
  value: "independent" | "chain" | undefined;
  onChange: (value: "independent" | "chain") => void;
}) {
  return (
    <div role="radiogroup" aria-label="Cinema type" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md border p-3 text-left transition-colors",
            value === option.value
              ? "border-primary bg-accent"
              : "border-input hover:bg-muted",
          )}
        >
          <p className="text-sm font-medium text-foreground">
            {option.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {option.description}
          </p>
        </button>
      ))}
    </div>
  );
}
