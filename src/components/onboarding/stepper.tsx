import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="mb-8 flex items-center" role="list" aria-label="Onboarding progress">
      {steps.map((label, index) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              role="listitem"
              aria-current={index === currentStep ? "step" : undefined}
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs font-medium",
                index < currentStep &&
                  "border-primary bg-primary text-primary-foreground",
                index === currentStep &&
                  "border-primary text-primary",
                index > currentStep &&
                  "border-input text-muted-foreground",
              )}
            >
              {index < currentStep ? (
                <Check className="size-3.5" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                index === currentStep
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 mb-4 h-px flex-1",
                index < currentStep ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
