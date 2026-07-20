import { getPasswordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-accent",
  "bg-success",
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label } = getPasswordStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted",
              i <= score && BAR_COLORS[score],
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
