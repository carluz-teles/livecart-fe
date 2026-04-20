import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingTask } from "@/hooks/useOnboardingStatus"

interface OnboardingChecklistItemProps {
  task: OnboardingTask
  onNavigate?: () => void
}

export function OnboardingChecklistItem({
  task,
  onNavigate,
}: OnboardingChecklistItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-2 py-2 transition-colors",
        task.completed
          ? "opacity-70"
          : task.href
            ? "hover:bg-accent cursor-pointer"
            : ""
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-none",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {!task.completed && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {task.description}
          </p>
        )}
      </div>

      {/* Arrow for incomplete tasks with links */}
      {!task.completed && task.href && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  )

  // If task is incomplete and has a link, wrap in Link
  if (!task.completed && task.href) {
    return (
      <Link href={task.href} onClick={onNavigate}>
        {content}
      </Link>
    )
  }

  return content
}
