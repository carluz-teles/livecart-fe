"use client"

import { Card, CardContent } from "@/components/ui/card"

// Placeholder until the notes feature ships with backend persistence (planned
// for a follow-up PR). Renders a typographic empty state in the same dialect
// as the order list empty state to signal "intentional, not broken".
export function OrderDetailNotesTab() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <span
          aria-hidden="true"
          className="font-mono text-7xl font-light leading-none tracking-tighter text-muted-foreground/30"
        >
          ∅
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
          Notas internas
        </span>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Em breve você poderá registrar observações privadas sobre este
          pedido — combinados com o cliente, motivos de devolução, anotações
          de despacho. Visíveis apenas para a equipe da loja.
        </p>
      </CardContent>
    </Card>
  )
}
