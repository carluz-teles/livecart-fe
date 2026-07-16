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
import { useStoreSetup, type StoreRequirement } from "@/hooks/integration"

interface StoreSetupGateProps {
  // What this area lets the merchant do, completing "Falta um passo para ___".
  // e.g. "criar eventos", "receber pedidos".
  purpose: string
  children: React.ReactNode
}

// Each requirement states what it is and why selling doesn't work without it.
// The payment one names no gateway on purpose — any supported one satisfies it.
const REQUIREMENT_COPY: Record<
  StoreRequirement,
  { icon: React.ComponentType<{ className?: string }>; label: string; why: string }
> = {
  instagram: {
    icon: Instagram,
    label: "Conta do Instagram conectada",
    why: "É por onde os pedidos chegam e as mensagens são enviadas.",
  },
  payment: {
    icon: CreditCard,
    label: "Meio de pagamento ativo",
    why: "É como seus clientes pagam o carrinho no checkout.",
  },
}

// Blocks an area until the store can both receive and charge for orders: the
// page is blurred and inert behind a modal listing exactly what's missing —
// one reason, or both — in the merchant's words.
//
// The modal is deliberately not dismissable (a dismissed one would leave an
// unexplained blur) but always offers two ways out, so nobody gets trapped.
export function StoreSetupGate({ purpose, children }: StoreSetupGateProps) {
  const { missing, isLoading, isError } = useStoreSetup()

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
                ? `Faltam dois passos para ${purpose}`
                : `Falta um passo para ${purpose}`}
            </DialogTitle>
            <DialogDescription className="text-left leading-relaxed">
              Sem isso, as suas lives não viram venda. Falta configurar:
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3">
            {missing.map((item) => {
              const { icon: Icon, label, why } = REQUIREMENT_COPY[item]
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
