"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrderDetailContext, type OrderDetailContextValue } from "@/components/order/OrderDetail/OrderDetailContext"
import { OrderDetailERPRetryBanner } from "@/components/order/OrderDetail/OrderDetail.ERPRetryBanner"
import { IntegrationConnectionStatus } from "@/components/integration/IntegrationConnectionStatus"
import { ProductImage } from "@/components/product/ProductImage"
import { SessionMediaForm } from "@/components/event/SessionMediaForm"
import { Toaster } from "sonner"
import type { OrderDetail, Integration, EventSession } from "@/types"

const review: NonNullable<OrderDetail["erpPaymentReview"]> = {
  externalOrderId: "erp-order", reason: "total_below_paid",
  paidCents: 332107, orderTotalCents: 308727,
  detectedAt: "2026-09-30T12:00:00Z", checkedAt: "2026-09-30T12:00:00Z",
}
const integration: Integration = {
  id: "bling", storeId: "store", type: "erp", provider: "bling", status: "active",
  priority: 1, createdAt: "2026-09-01T12:00:00Z",
  metadata: { tokenRefreshFailure: { statusCode: 403, nextAttemptAt: "2026-09-30T13:00:00Z" } },
}

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [financialReview, setFinancialReview] = useState<OrderDetail["erpPaymentReview"]>(review)
  const [connected, setConnected] = useState(false)
  const [src, setSrc] = useState("https://images.example.test/denied.jpg")
  const [linkOpen, setLinkOpen] = useState(false)
  const value = {
    state: { order: { id: "order", paymentStatus: "paid", erpPaymentReview: financialReview } },
  } as OrderDetailContextValue
  return <QueryClientProvider client={client}>
    <OrderDetailContext value={value}><OrderDetailERPRetryBanner /></OrderDetailContext>
    <button onClick={() => setFinancialReview({ ...review, reason: "installments_unverified", paidCents: undefined, orderTotalCents: undefined })}>Exibir parcelas não verificadas</button>
    <button onClick={() => setFinancialReview(undefined)}>Receber conciliação confirmada</button>
    <IntegrationConnectionStatus integration={connected ? { ...integration, metadata: {} } : integration} />
    <button onClick={() => setConnected(true)}>Receber renovação confirmada</button>
    <div className="relative h-16 w-16"><ProductImage src={src} alt="Produto de teste" fill sizes="64px" /></div>
    <button onClick={() => setSrc("https://images.example.test/available.jpg")}>Atualizar URL da foto</button>
    <button onClick={() => setLinkOpen(true)}>Vincular mídia de teste</button>
    {linkOpen && <SessionMediaForm eventId="event" session={{ id: "session", type: "live", sequenceOrder: 1 } as EventSession} onOpenChange={setLinkOpen} />}
    <Toaster />
  </QueryClientProvider>
}
