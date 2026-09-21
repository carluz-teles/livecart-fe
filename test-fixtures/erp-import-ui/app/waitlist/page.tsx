"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EventForm } from "../../../../src/components/event/EventForm"
import { EventWindowForm } from "../../../../src/components/event/EventWindowForm"
import { CheckoutOrderSummary } from "../../../../src/components/checkout/CheckoutOrderSummary"
import { CheckoutPromotionBanner } from "../../../../src/components/checkout/CheckoutPromotionBanner"
import { CheckoutWaitlistSection } from "../../../../src/components/checkout/CheckoutWaitlistSection"
import { CheckoutClient } from "../../../../src/app/cart/[token]/CheckoutClient"
import { TooltipProvider } from "../../../../src/components/ui/tooltip"
import { formatCurrency } from "../../../../src/lib/format"
import type { Event } from "../../../../src/types/event.types"
import type { PublicCheckoutCart } from "../../../../src/types/cart.types"

const event = {
  id: "event-waitlist", title: "Campanha de reposição", scheduledAt: null,
  endsAt: "2026-12-22T18:00:00Z", waitlistNotifiedTtlMinutes: 0,
  cartExpirationMinutes: 7200, pixDiscountPercent: 0,
} as Event

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [closed, setClosed] = useState(false)
  if (closed) {
    return <QueryClientProvider client={client}><CheckoutClient token="closed-fixture" initialCart={{ purchaseClosed: true, paymentStatus: "paid" } as PublicCheckoutCart} /></QueryClientProvider>
  }
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <button onClick={() => setCreateOpen(true)}>Criar evento de teste</button>
        <button onClick={() => setEditOpen(true)}>Editar evento de teste</button>
        <button onClick={() => setClosed(true)}>Abrir compra encerrada</button>
        <EventForm open={createOpen} onOpenChange={setCreateOpen} />
        <EventWindowForm event={event} open={editOpen} onOpenChange={setEditOpen} />
        <CheckoutOrderSummary
          items={[{ id: "item", name: "Produto com preços preservados", quantity: 3, unitPrice: 9999, totalPrice: 5005, hasPendingWaitlist: true,
            priceLots: [
              { quantity: 3, waitlistedQuantity: 2, unitPrice: 1001, totalPrice: 1001 },
              { quantity: 2, waitlistedQuantity: 0, unitPrice: 2002, totalPrice: 4004 },
            ],
          }]}
          subtotal={5005} total={5005} totalItems={3} formatCurrency={formatCurrency}
          allowEdit onUpdateQuantity={() => { throw new Error("Não editar item com espera") }} onRemoveItem={() => { throw new Error("Não remover item com espera") }}
        />
        <CheckoutPromotionBanner items={[{ id: "promoted", productId: "p1", productName: "Produto liberado", productImage: null, unitPrice: 1001, quantity: 1, position: 1, status: "notified", expiresAt: "2020-01-01T00:00:00Z" }]} />
        <CheckoutWaitlistSection token="fixture" items={[{ id: "waiting", productId: "p1", productName: "Produto pendente", productImage: null, unitPrice: 1001, quantity: 2, position: 1, status: "waiting" }]} />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
