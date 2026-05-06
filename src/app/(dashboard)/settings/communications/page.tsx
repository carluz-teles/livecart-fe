"use client"

import Link from "next/link"

import { Skeleton } from "@/components/ui/skeleton"
import { NotificationCard } from "@/components/communications/NotificationCard"
import { useCommunications } from "@/hooks/communications"

export default function CommunicationsPage() {
  const { isLoading, cards } = useCommunications()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comunicações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mensagens automáticas que sua loja envia pelo Instagram em cada
            momento da jornada do cliente.
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Instagram conectado
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight">Modelos de mensagem</h2>
        <span className="font-mono text-xs text-muted-foreground">{cards.length} tipos</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[110px] w-full rounded-xl" />
          <Skeleton className="h-[110px] w-full rounded-xl" />
          <Skeleton className="h-[110px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {cards.map((card) => (
            <Link key={card.type} href={`/settings/communications/${card.type}`}>
              <NotificationCard card={card} onClick={() => undefined} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

