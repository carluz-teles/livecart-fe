"use client"

import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToggleVote } from "@/hooks/idea"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
  ideaId: string
  ideaNumber: number
  voteCount: number
  votedByMe: boolean
  isAuthor: boolean
  size?: "sm" | "lg"
}

export function VoteButton({
  ideaId,
  ideaNumber,
  voteCount,
  votedByMe,
  isAuthor,
  size = "sm",
}: VoteButtonProps) {
  const toggle = useToggleVote(ideaId)

  const button = (
    <Button
      type="button"
      variant={votedByMe ? "default" : "outline"}
      size={size === "lg" ? "default" : "sm"}
      disabled={isAuthor || toggle.isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isAuthor) toggle.mutate()
      }}
      aria-pressed={votedByMe}
      aria-label={`Votar na ideia número ${ideaNumber}`}
      className={cn(
        "gap-1.5 transition-colors",
        size === "lg" && "h-12 min-w-[88px] flex-col gap-0.5 px-4 py-2",
        votedByMe && "shadow-sm",
      )}
    >
      <ArrowUp className={cn("h-4 w-4", size === "lg" && "h-5 w-5")} />
      <span className={cn("tabular-nums", size === "lg" && "text-base font-semibold")}>
        {voteCount}
      </span>
    </Button>
  )

  if (!isAuthor) return button

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span wrapper so the disabled button still triggers the tooltip */}
          <span tabIndex={0}>{button}</span>
        </TooltipTrigger>
        <TooltipContent>Não é possível votar na própria ideia</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
