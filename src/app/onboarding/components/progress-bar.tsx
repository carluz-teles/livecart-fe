import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  name: string
  description: string
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex-1">
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-4 h-0.5",
                  step.id < currentStep ? "bg-primary" : "bg-muted"
                )}
                aria-hidden="true"
              />
            )}
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                      ? "border-2 border-primary bg-background text-primary"
                      : "border-2 border-muted bg-background text-muted-foreground"
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </span>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
