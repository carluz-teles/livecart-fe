"use client"

import { use } from "react"
import { ChevronDown, Pencil, Plus, RotateCcw, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getEventKind } from "@/lib/event-kind"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailActions() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state
  const { setEndEventOpen, setCreateSessionOpen, setCrashRecoveryOpen, setEditEventOpen } =
    ctx.actions

  // Ações só fazem sentido com evento ativo. Editar a janela é a exceção: um
  // evento agendado é justamente onde ajustar a data ainda vale a pena.
  if (event.status === "ended") return null

  // Sessão nova / crash recovery são de transmissão ao vivo. A espécie sai das
  // sessões da campanha, não de event.type (coluna removida pela 000119).
  const kind = getEventKind(event)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          Ações
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setEditEventOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar campanha
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {event.status === "active" && !kind.isPublicationOnly && (
          <>
            <DropdownMenuItem onClick={() => setCreateSessionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova sessão
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCrashRecoveryOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Crash recovery
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {event.status === "active" && (
          <DropdownMenuItem
            onClick={() => setEndEventOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            {kind.isPublicationOnly ? "Encerrar promoção" : "Finalizar evento"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
