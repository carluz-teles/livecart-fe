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

  // Crash recovery é de transmissão ao vivo — só faz sentido onde existe live
  // para reconectar. A espécie sai das sessões da campanha, não de event.type
  // (coluna removida pela 000119).
  const kind = getEventKind(event)

  // "Nova sessão" NÃO é ação de live: é a ação que faz o evento ser
  // guarda-chuva. Ela vivia sob `!kind.isPublicationOnly` junto com o crash
  // recovery, então a campanha nascida de post — que é o que três dos quatro
  // caminhos de criação produziam — ficava sem nenhum jeito de receber outra
  // transmissão. E ficava de fora também em campanha AGENDADA, que é
  // exatamente o caso "marco a Semana Black hoje e penduro a live depois".
  const canAddSession = event.status === "active" || event.status === "scheduled"

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
        {canAddSession && (
          <DropdownMenuItem onClick={() => setCreateSessionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova sessão
          </DropdownMenuItem>
        )}
        {event.status === "active" && kind.hasLive && (
          <DropdownMenuItem onClick={() => setCrashRecoveryOpen(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Crash recovery
          </DropdownMenuItem>
        )}
        {(canAddSession || (event.status === "active" && kind.hasLive)) && (
          <DropdownMenuSeparator />
        )}
        {event.status === "active" && (
          <DropdownMenuItem
            onClick={() => setEndEventOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            {/* "Encerrar promoção" era o rótulo de quando um evento de post
                era uma promoção avulsa. Fechar a campanha é uma coisa só,
                tenha ela live, post ou os dois. */}
            Finalizar evento
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
