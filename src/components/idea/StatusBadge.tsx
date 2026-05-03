import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getIdeaStatusMeta } from "@/lib/idea-meta"
import type { IdeaStatus } from "@/types/idea.types"

interface StatusBadgeProps {
  status: IdeaStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = getIdeaStatusMeta(status)
  return (
    <Badge
      variant="outline"
      className={cn("border font-medium", meta.badgeClass, className)}
    >
      {meta.label}
    </Badge>
  )
}
