"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { CreditCard, Instagram } from "lucide-react"

import { Button } from "@/components/ui/button"
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
// page is blurred and inert behind a card listing exactly what's missing —
// one reason, or both — in the merchant's words.
//
// Deliberately NOT a modal: it renders inside the content area, so the sidebar
// and header stay usable and the merchant can navigate away freely. A
// full-screen dialog would block the whole app to state a local rule.
//
// Enforced ONLY in production: staging and local run E2E with simulated
// webhooks (no real Instagram account or live payment), so the gate would
// block every test event there.
const GATE_ENFORCED = process.env.NEXT_PUBLIC_APP_ENV === "production"

export function StoreSetupGate({ purpose, children }: StoreSetupGateProps) {
  const { missing, isLoading, isError } = useStoreSetup()

  // Let the page through while we don't know yet, and if the check itself
  // fails — flashing a wrong gate at a fully configured store is worse than
  // letting it through.
  const blocked = GATE_ENFORCED && !isLoading && !isError && missing.length > 0

  // `inert` takes the blurred page out of the tab order and the a11y tree.
  // pointer-events-none alone would still let keyboard users land inside it.
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = contentRef.current
    if (!el || !blocked) return
    el.setAttribute("inert", "")
    return () => el.removeAttribute("inert")
  }, [blocked])

  if (!blocked) return <>{children}</>

  return (
    <div className="relative min-h-[60vh]">
      <div
        ref={contentRef}
        aria-hidden="true"
        className="pointer-events-none select-none opacity-60 blur-sm"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">
              {missing.length > 1
                ? `Faltam dois passos para ${purpose}`
                : `Falta um passo para ${purpose}`}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sem isso, as suas lives não viram venda. Falta configurar:
            </p>
          </div>

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

          <Button asChild className="w-full">
            <Link href="/settings/integrations">Ir para integrações</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
