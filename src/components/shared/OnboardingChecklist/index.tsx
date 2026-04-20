import { OnboardingChecklistTrigger } from "./OnboardingChecklist.Trigger"
import { OnboardingChecklistPopover } from "./OnboardingChecklist.Popover"
import { OnboardingChecklistItem } from "./OnboardingChecklist.Item"
import { OnboardingChecklistProgress } from "./OnboardingChecklist.Progress"

// Compound component pattern
export const OnboardingChecklist = {
  Trigger: OnboardingChecklistTrigger,
  Popover: OnboardingChecklistPopover,
  Item: OnboardingChecklistItem,
  Progress: OnboardingChecklistProgress,
}

// Also export individual components for direct imports
export { OnboardingChecklistTrigger } from "./OnboardingChecklist.Trigger"
export { OnboardingChecklistPopover } from "./OnboardingChecklist.Popover"
export { OnboardingChecklistItem } from "./OnboardingChecklist.Item"
export { OnboardingChecklistProgress } from "./OnboardingChecklist.Progress"
