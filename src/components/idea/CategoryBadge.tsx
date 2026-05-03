import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  label: string
  className?: string
}

export function CategoryBadge({ label, className }: CategoryBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("font-normal", className)}>
      {label}
    </Badge>
  )
}
