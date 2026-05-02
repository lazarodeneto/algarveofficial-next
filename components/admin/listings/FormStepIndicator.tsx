import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormStep } from "@/types/listing";

interface FormStepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export function FormStepIndicator({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
}: FormStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps.includes(index);
          const isPast = index < currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 transition-all",
                  "hover:bg-muted/50",
                  isActive && "bg-muted/70"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-primary/20 text-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="text-left">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden lg:block">
                    {step.description}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-px flex-1",
                    isPast || isCompleted ? "bg-primary/50" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep]?.label}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
