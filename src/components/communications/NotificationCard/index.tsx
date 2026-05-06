"use client"

import { ChevronRight } from "lucide-react"

import { NotificationCardRoot } from "./NotificationCard.Root"
import { NotificationCardIcon } from "./NotificationCard.Icon"
import { NotificationCardStatus } from "./NotificationCard.Status"
import { NotificationCardContent } from "./NotificationCard.Content"
import { NotificationCardMeta } from "./NotificationCard.Meta"

import type { CommunicationCard } from "@/hooks/communications"

interface NotificationCardProps {
  card: CommunicationCard
  onClick?: () => void
}

function NotificationCard({ card, onClick }: NotificationCardProps) {
  return (
    <NotificationCardRoot onClick={onClick} active={card.enabled}>
      <div className="flex items-start gap-4 p-5">
        <NotificationCardIcon Icon={card.Icon} />
        <NotificationCardContent
          title={card.title}
          description={card.description}
          status={
            <NotificationCardStatus status={card.enabled ? "active" : "paused"} />
          }
          meta={<NotificationCardMeta triggerLabel={card.triggerLabel} />}
        />
        <ChevronRight className="h-4 w-4 self-center shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </NotificationCardRoot>
  )
}

NotificationCard.Root = NotificationCardRoot
NotificationCard.Icon = NotificationCardIcon
NotificationCard.Status = NotificationCardStatus
NotificationCard.Content = NotificationCardContent
NotificationCard.Meta = NotificationCardMeta

export { NotificationCard }
