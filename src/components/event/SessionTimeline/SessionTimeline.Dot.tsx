"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"
import type { EventSession } from "@/types/event.types"

interface SessionDotProps {
  session: EventSession
  sessionNumber: number
  isLast: boolean
  onClick?: () => void
}

const STATUS_COLORS = {
  active: "bg-primary border-primary",
  live: "bg-primary border-primary",
  ended: "bg-muted-foreground/30 border-muted-foreground/50",
  scheduled: "bg-amber-400 border-amber-500",
  cancelled: "bg-muted-foreground/20 border-muted-foreground/30",
} as const

export function SessionDot({ session, sessionNumber, isLast, onClick }: SessionDotProps) {
  const isActive = session.status === "active" || session.status === "live"
  const colorClass = STATUS_COLORS[session.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.ended

  // Calculate duration
  const getDuration = () => {
    if (!session.startedAt) return null

    const start = new Date(session.startedAt)
    const end = session.endedAt ? new Date(session.endedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(mins / 60)

    if (hours > 0) {
      return `${hours}h ${mins % 60}min`
    }
    return `${mins}min`
  }

  const duration = getDuration()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
            {/* Dot with line */}
            <div className="relative flex items-center">
              {/* Connection line before (except first) */}
              {sessionNumber > 1 && (
                <div className="absolute right-full w-8 h-0.5 bg-border" />
              )}

              {/* The dot */}
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110",
                  colorClass,
                  isActive && "ring-4 ring-primary/20"
                )}
              >
                {isActive ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
                  </span>
                ) : (
                  <span className="text-xs font-medium text-white">{sessionNumber}</span>
                )}
              </div>

              {/* Connection line after (except last) */}
              {!isLast && (
                <div className="absolute left-full w-8 h-0.5 bg-border" />
              )}
            </div>

            {/* Label below */}
            <div className="flex flex-col items-center text-center">
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                S{sessionNumber}
              </span>
              {duration && (
                <span className="text-[10px] text-muted-foreground">{duration}</span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Sessao {sessionNumber}</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              {session.startedAt && (
                <p>Inicio: {formatDateTime(session.startedAt)}</p>
              )}
              {session.endedAt && (
                <p>Fim: {formatDateTime(session.endedAt)}</p>
              )}
              <p>{session.totalComments} comentarios | {session.totalCarts} carrinhos</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
