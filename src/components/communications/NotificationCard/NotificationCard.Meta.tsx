"use client"

import { MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"

interface NotificationCardMetaProps {
  triggerLabel: string
  className?: string
}

export function NotificationCardMeta({ triggerLabel, className }: NotificationCardMetaProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5" />
        Instagram DM
      </span>
      <span className="text-border">·</span>
      <span>{triggerLabel}</span>
    </div>
  )
}
