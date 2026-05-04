"use client"

import { ChevronUp } from "lucide-react"
import { toast } from "sonner"

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

const AUTHOR_HINT = "Não é possível votar na própria ideia."
const AUTHOR_HINT_KEY = "ideas:authorVoteHintShown"

// Tooltip is hover/focus-only on touch devices, so the hint never lands on
// mobile. We surface a one-shot toast instead the first time an author taps
// their own tile in a session, and keep the desktop tooltip for sighted
// pointer users.
function showAuthorHintOnce() {
  if (typeof window === "undefined") return
  try {
    if (window.sessionStorage.getItem(AUTHOR_HINT_KEY) === "1") return
    window.sessionStorage.setItem(AUTHOR_HINT_KEY, "1")
  } catch {
    // sessionStorage unavailable (private mode, etc.) — fall through and toast every time.
  }
  toast.info(AUTHOR_HINT)
}

// Vertical, tile-shaped vote button (Canny / ProductHunt style): an upward
// chevron above a large count, with a clear filled state when the user has
// voted. The whole tile is the click target so the affordance reads as
// "click here to upvote" rather than "this is just a counter".
export function VoteButton({
  ideaId,
  ideaNumber,
  voteCount,
  votedByMe,
  isAuthor,
  size = "sm",
}: VoteButtonProps) {
  const toggle = useToggleVote(ideaId)

  const dims = size === "lg"
    ? "h-16 w-16 text-base"
    : "h-14 w-12 text-sm"

  const button = (
    <button
      type="button"
      disabled={toggle.isPending}
      aria-disabled={isAuthor}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isAuthor) {
          showAuthorHintOnce()
          return
        }
        toggle.mutate()
      }}
      aria-pressed={votedByMe}
      aria-label={`Votar na ideia número ${ideaNumber}`}
      className={cn(
        "group/vote inline-flex flex-col items-center justify-center gap-0.5 rounded-lg border transition-all",
        "select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        dims,
        votedByMe
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
        isAuthor && "cursor-not-allowed opacity-60 hover:border-border hover:bg-background hover:text-muted-foreground",
        toggle.isPending && "opacity-70",
      )}
    >
      <ChevronUp
        className={cn(
          "h-4 w-4 transition-transform",
          size === "lg" && "h-5 w-5",
          !isAuthor && "group-hover/vote:-translate-y-0.5",
          votedByMe && "translate-y-0",
        )}
        strokeWidth={2.5}
        aria-hidden="true"
      />
      <span className={cn("font-semibold tabular-nums leading-none", size === "lg" && "text-lg")}>
        {voteCount}
      </span>
    </button>
  )

  if (!isAuthor) return button

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-block">{button}</span>
        </TooltipTrigger>
        <TooltipContent>{AUTHOR_HINT}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
