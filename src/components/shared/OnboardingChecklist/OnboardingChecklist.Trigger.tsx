"use client"

import { useState } from "react"
import { Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { OnboardingChecklistPopover } from "./OnboardingChecklist.Popover"
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus"
import { cn } from "@/lib/utils"

export function OnboardingChecklistTrigger() {
  const [open, setOpen] = useState(false)
  const status = useOnboardingStatus()

  // Don't show if onboarding is complete
  if (!status.isLoading && status.isComplete) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 px-2",
            !status.isComplete && "text-primary hover:text-primary"
          )}
        >
          <Target className="h-4 w-4" />
          {!status.isLoading && (
            <span className="text-xs font-medium">
              {status.completedCount}/{status.totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <OnboardingChecklistPopover
          status={status}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
