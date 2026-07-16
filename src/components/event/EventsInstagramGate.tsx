"use client"

import Link from "next/link"
import { Instagram } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useInstagramConnected } from "@/hooks/integration"

interface EventsInstagramGateProps {
  children: React.ReactNode
}

// Blocks the Events area until an Instagram account is connected: the page is
// blurred and inert behind a modal that explains why and where to go.
//
// The modal is deliberately not dismissable — this is a gate, not a nudge, and
// a dismissed modal would leave an unexplained blur. To avoid trapping anyone,
// it always offers two ways out: connect, or go back to the dashboard.
export function EventsInstagramGate({ children }: EventsInstagramGateProps) {
  const { isConnected, isLoading, isError } = useInstagramConnected()

  // Render the page untouched while we don't know yet, and if the check itself
  // fails — flashing a wrong gate at someone who IS connected is worse than
  // letting the page through (creating an event still needs a live session).
  if (isLoading || isError || isConnected) return <>{children}</>

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
          <DialogHeader className="space-y-4">
            {/* Instagram's own gradient: the one loud element, and it earns the
                noise by naming exactly what's missing. */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-left">
              Conecte o Instagram para criar eventos
            </DialogTitle>
            <DialogDescription className="text-left leading-relaxed">
              Os eventos leem os comentários das suas lives e publicações no
              Instagram e transformam em pedidos. Sem uma conta conectada, não há
              de onde receber os pedidos.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Voltar ao painel</Link>
            </Button>
            <Button asChild>
              <Link href="/settings/integrations">Conectar Instagram</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
