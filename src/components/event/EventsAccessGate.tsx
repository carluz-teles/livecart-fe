"use client"

import Link from "next/link"
import { CreditCard, Instagram } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEventsPrerequisites, type EventPrerequisite } from "@/hooks/event"

interface EventsAccessGateProps {
  children: React.ReactNode
}

// Each prerequisite states what it is and why an event can't work without it.
// The payment one names no gateway on purpose — the store can use any of them.
const PREREQUISITE_COPY: Record<
  EventPrerequisite,
  { icon: React.ComponentType<{ className?: string }>; label: string; why: string }
> = {
  instagram: {
    icon: Instagram,
    label: "Conta do Instagram conectada",
    why: "É de onde vêm os comentários que viram pedidos.",
  },
  payment: {
    icon: CreditCard,
    label: "Meio de pagamento ativo",
    why: "É como seus clientes pagam o carrinho no checkout.",
  },
}

// Blocks the Events area until the store can both receive and charge for
// orders: the page is blurred and inert behind a modal listing exactly what's
// missing — one reason, both, in the merchant's words.
//
// The modal is deliberately not dismissable (a dismissed one would leave an
// unexplained blur) but always offers two ways out, so nobody gets trapped.
export function EventsAccessGate({ children }: EventsAccessGateProps) {
  const { missing, isLoading, isError } = useEventsPrerequisites()

  // Render the page untouched while we don't know yet, and if the check itself
  // fails — flashing a wrong gate at a fully configured store is worse than
  // letting the page through.
  if (isLoading || isError || missing.length === 0) return <>{children}</>

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-60 blur-sm"
      >
        {children}
      </div>

      <Dialog open>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-left">
              {missing.length > 1
                ? "Faltam dois passos para criar eventos"
                : "Falta um passo para criar eventos"}
            </DialogTitle>
            <DialogDescription className="text-left leading-relaxed">
              Para um evento receber e cobrar pedidos, falta configurar:
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3">
            {missing.map((item) => {
              const { icon: Icon, label, why } = PREREQUISITE_COPY[item]
              return (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {why}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Voltar ao painel</Link>
            </Button>
            <Button asChild>
              <Link href="/settings/integrations">Ir para integrações</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
