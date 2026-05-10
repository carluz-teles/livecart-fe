"use client"

import { use } from "react"
import { ChevronDown, Plus, RotateCcw, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailActions() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event } = ctx.state
  const { setEndEventOpen, setCreateSessionOpen, setCrashRecoveryOpen } =
    ctx.actions

  // Ações só fazem sentido com evento ativo — finalizar/nova-sessão/crash-recovery
  // não se aplicam ao histórico.
  if (event.status !== "active") return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          Ações
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setCreateSessionOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova sessão
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCrashRecoveryOpen(true)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Crash recovery
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setEndEventOpen(true)}
          className="text-destructive focus:text-destructive"
        >
          <StopCircle className="mr-2 h-4 w-4" />
          Finalizar evento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
