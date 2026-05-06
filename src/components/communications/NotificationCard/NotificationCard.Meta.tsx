"use client"

import { Mail, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { NotificationChannel } from "@/lib/communications"

interface NotificationCardMetaProps {
  channel: NotificationChannel
  triggerLabel: string
  className?: string
}

const channelLabel: Record<NotificationChannel, { Icon: typeof Mail; label: string }> = {
  instagram_dm: { Icon: MessageCircle, label: "Instagram DM" },
  email: { Icon: Mail, label: "Email" },
}

export function NotificationCardMeta({
  channel,
  triggerLabel,
  className,
}: NotificationCardMetaProps) {
  const c = channelLabel[channel]
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <c.Icon className="h-3.5 w-3.5" />
        {c.label}
      </span>
      <span className="text-border">·</span>
      <span>{triggerLabel}</span>
    </div>
  )
}
