import { Loader2 } from "lucide-react"
import { OnboardingChecklistProgress } from "./OnboardingChecklist.Progress"
import { OnboardingChecklistItem } from "./OnboardingChecklist.Item"
import type { OnboardingStatus } from "@/hooks/useOnboardingStatus"

interface OnboardingChecklistPopoverProps {
  status: OnboardingStatus
  onClose?: () => void
}

export function OnboardingChecklistPopover({
  status,
  onClose,
}: OnboardingChecklistPopoverProps) {
  if (status.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress section */}
      <OnboardingChecklistProgress
        percentage={status.percentage}
        completedCount={status.completedCount}
        totalCount={status.totalCount}
      />

      {/* Divider */}
      <div className="border-t" />

      {/* Tasks list */}
      <div className="space-y-1">
        {status.tasks.map((task) => (
          <OnboardingChecklistItem
            key={task.id}
            task={task}
            onNavigate={onClose}
          />
        ))}
      </div>

      {/* Tip section */}
      {!status.isComplete && (
        <>
          <div className="border-t" />
          <p className="text-xs text-muted-foreground">
            Complete as tarefas para aproveitar ao máximo a plataforma.
          </p>
        </>
      )}
    </div>
  )
}
