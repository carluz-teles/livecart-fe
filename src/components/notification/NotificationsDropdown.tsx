"use client"

import Link from "next/link"
import { useState } from "react"
import { Bell, MessageSquare, CornerDownRight, Tag, Check, RotateCcw, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/notification"
import { formatRelativeTime } from "@/lib/format"
import { formatStatusChange, getIdeaStatusMeta } from "@/lib/idea-meta"
import { cn } from "@/lib/utils"
import type { InboxNotification } from "@/types/notification-inbox.types"

interface NotificationsDropdownProps {
  unreadCount: number
}

const TYPE_ICON: Record<InboxNotification["type"], typeof MessageSquare> = {
  idea_comment: MessageSquare,
  idea_reply: CornerDownRight,
  idea_status_change: Tag,
  order_cancellation_reverted: RotateCcw,
  erp_resync_finished: RefreshCw,
}

function buildText(n: InboxNotification): string {
  const numberRef = n.ideaNumber ? `#${n.ideaNumber}` : "uma ideia"
  switch (n.type) {
    case "idea_comment": {
      const actor = n.actorName ?? "Alguém"
      return `${actor} comentou na sua ideia ${numberRef}`
    }
    case "idea_reply": {
      const actor = n.actorName ?? "Alguém"
      return `${actor} respondeu um comentário em ${numberRef}`
    }
    case "erp_resync_finished": {
      const synced = (n.payload?.synced as number) ?? 0
      const failed = (n.payload?.failed as number) ?? 0
      const plural = synced === 1 ? "produto" : "produtos"
      // O número de falhas só aparece quando existe: "e 0 falharam" é ruído que
      // faz o lojista procurar problema onde não houve.
      return failed > 0
        ? `Sincronização com o ERP concluída: ${synced} ${plural} atualizados, ${failed} falharam`
        : `Sincronização com o ERP concluída: ${synced} ${plural} atualizados`
    }
    case "order_cancellation_reverted": {
      const shortId = n.payload?.short_id as number | undefined
      const orderRef = shortId ? `#${shortId}` : "um pedido"
      return `Pedido ${orderRef} foi cancelado, mas o comprador pagou — o pedido voltou a valer`
    }
    case "idea_status_change": {
      const oldStatus = (n.payload?.old_status as string) ?? ""
      const newStatus = (n.payload?.new_status as string) ?? ""
      if (oldStatus && newStatus) {
        return `Ideia ${numberRef} mudou ${formatStatusChange(oldStatus, newStatus)}`
      }
      const meta = getIdeaStatusMeta(newStatus)
      return `Ideia ${numberRef} mudou para ${meta.label}`
    }
    default:
      return `Atualização em ${numberRef}`
  }
}

export function NotificationsDropdown({ unreadCount }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useNotifications({
    pagination: { page: 1, limit: 15 },
  })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const items = data?.data ?? []
  const hasUnread = unreadCount > 0

  function handleClick(n: InboxNotification) {
    if (!n.readAt) {
      markRead.mutate(n.id)
    }
    setOpen(false)
    if (n.cartId) {
      router.push(`/orders/${n.cartId}`)
      return
    }
    if (n.ideaId) {
      const hash = n.commentId ? `#comment-${n.commentId}` : ""
      router.push(`/ideas/${n.ideaId}${hash}`)
      return
    }
    if (n.type === "erp_resync_finished") {
      router.push("/products")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label={
            hasUnread
              ? `Notificações, ${unreadCount} não lidas`
              : "Notificações"
          }
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0">
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notificações</p>
            <p className="text-xs text-muted-foreground">
              {hasUnread ? `${unreadCount} não lidas` : "Você está em dia"}
            </p>
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Marcar todas como lidas
            </Button>
          )}
        </header>
        <Separator />

        <ScrollArea className="max-h-[420px]">
          {isLoading ? (
            <div className="p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-sm text-destructive">
              Não foi possível carregar.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => refetch()}
              >
                Tentar de novo
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Sem notificações por enquanto.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell
                const text = buildText(n)
                const unread = !n.readAt
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
                        unread && "bg-primary/5",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug line-clamp-2">{text}</p>
                        {n.ideaTitle && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {n.ideaTitle}
                          </p>
                        )}
                        <time
                          dateTime={n.createdAt}
                          className="mt-1 block text-xs text-muted-foreground"
                        >
                          {formatRelativeTime(n.createdAt)}
                        </time>
                      </div>
                      {unread && (
                        <span
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                          aria-label="Não lida"
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button asChild variant="ghost" size="sm" className="w-full justify-center text-xs" onClick={() => setOpen(false)}>
            <Link href="/ideas">Abrir o canal de ideias</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
