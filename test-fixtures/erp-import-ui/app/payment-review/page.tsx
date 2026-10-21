"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrderDetailContext, type OrderDetailContextValue } from "@/components/order/OrderDetail/OrderDetailContext"
import { OrderDetailERPRetryBanner } from "@/components/order/OrderDetail/OrderDetail.ERPRetryBanner"
import { OrderDetailPayment } from "@/components/order/OrderDetail/OrderDetail.Payment"
import { OrderDetailWorkflow } from "@/components/order/OrderDetail/OrderDetail.Workflow"
import { CheckoutClient } from "@/app/cart/[token]/CheckoutClient"
import { checkoutKeys } from "@/hooks/checkout/useCheckoutCart"
import type { OrderDetail } from "@/types"
import { cart } from "../../fixtures/cart-edit"
import "@/app/globals.css"

const review: NonNullable<OrderDetail["erpPaymentReview"]> = {
  externalOrderId: "erp-order", reason: "installments_unverified",
  paidCents: 17040, orderTotalCents: 37150,
  detectedAt: "2026-10-12T12:00:00Z", checkedAt: "2026-10-21T12:00:00Z",
}

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [paid, setPaid] = useState(17040)
  const [financialReview, setFinancialReview] = useState<OrderDetail["erpPaymentReview"]>(review)
  const [checkout, setCheckout] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const value = {
    state: { order: {
      id: "order", status: "checkout", paymentStatus: "paid", paidAt: "2026-10-12T12:00:00Z",
      expiresAt: "2026-10-13T12:00:00Z", paidTotalCents: paid, payableAmount: paid,
      waitlistedAmount: 0, totalAmount: paid, paymentMethod: "erp_manual",
      erpPaymentReview: financialReview,
      erpFinalisation: { status: "done", attemptsCount: 1, canRetry: false },
    } },
  } as OrderDetailContextValue

  return <QueryClientProvider client={client}>
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <fieldset disabled={!ready} className="flex flex-wrap gap-3">
      <button onClick={() => { setPaid(17040); setFinancialReview(review) }}>Pedido 1210</button>
      <button onClick={() => { setPaid(32340); setFinancialReview({ ...review, paidCents: 32340, orderTotalCents: 35480 }) }}>Pedido 1237</button>
      <button onClick={() => setFinancialReview({ ...review, paidCents: undefined, orderTotalCents: undefined })}>Valores não verificados</button>
      <button onClick={() => setFinancialReview({ ...review, orderTotalCents: review.paidCents })}>Valores iguais</button>
      <button onClick={() => setFinancialReview({ ...review, reason: "total_below_paid", orderTotalCents: 16040 })}>Total menor</button>
      <button onClick={() => setFinancialReview(undefined)}>Conciliação confirmada</button>
      <button onClick={() => setCheckout(true)}>Abrir checkout ativo</button>
      </fieldset>
      {checkout ? <>
        <button onClick={() => client.invalidateQueries({ queryKey: checkoutKeys.cart("refetch-merged") })}>Atualizar checkout</button>
        <CheckoutClient token="refetch-merged" initialCart={{ ...cart, token: "refetch-merged", allowEdit: false }} />
      </> : <OrderDetailContext value={value}>
        <OrderDetailWorkflow />
        <section id="order-erp"><OrderDetailERPRetryBanner /></section>
        <section id="order-payment"><OrderDetailPayment /></section>
      </OrderDetailContext>}
    </main>
  </QueryClientProvider>
}
