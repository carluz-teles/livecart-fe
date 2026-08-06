"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SESSION_PRODUCTS_COPY } from "@/lib/event-copy"
import type { EventSession } from "@/types/event.types"

import { SessionProducts } from "./index"

const SESSION_TYPE_LABELS: Record<string, string> = {
  live: "Live",
  post: "Post",
  reel: "Reel",
  story: "Story",
}

/** "Story · 12/08, 19h" — o suficiente para o lojista saber em qual das
 *  transmissões da campanha ele está mexendo. Sem isto, quatro gavetas abertas
 *  a partir de quatro linhas parecem a mesma tela. */
function sessionLabel(session: EventSession): string {
  const type = SESSION_TYPE_LABELS[session.type] ?? session.type
  const when = session.startedAt ?? session.createdAt
  const parsed = when ? new Date(when) : null
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return `${type} · S${session.sequenceOrder}`
  }
  return `${type} · S${session.sequenceOrder} · ${format(parsed, "dd/MM, HH'h'", { locale: ptBR })}`
}

interface SessionProductsSheetProps {
  eventId: string
  /** A transmissão cuja lista está aberta. `null` fecha a gaveta. */
  session: EventSession | null
  onOpenChange: (open: boolean) => void
}

export function SessionProductsSheet({
  eventId,
  session,
  onOpenChange,
}: SessionProductsSheetProps) {
  return (
    <Sheet open={session !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{SESSION_PRODUCTS_COPY.title}</SheetTitle>
          <SheetDescription>{session ? sessionLabel(session) : ""}</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {session && (
            <SessionProducts
              eventId={eventId}
              sessionId={session.id}
              sessionType={session.type}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
