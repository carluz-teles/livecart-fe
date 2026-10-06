"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrderDetailContext, type OrderDetailContextValue } from "@/components/order/OrderDetail/OrderDetailContext"
import { OrderDetailWaitlist } from "@/components/order/OrderDetail/OrderDetail.Waitlist"
import { OrderDetailUpsell } from "@/components/order/OrderDetail/OrderDetail.Upsell"
import { OrderDetailAddItemSheet } from "@/components/order/OrderDetail/OrderDetail.AddItemSheet"

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [added, setAdded] = useState("")
  const context = {
    state: { order: { id: "order", waitlist: [{
      id: "waiting", productName: "Produto em espera", productImage: "https://images.example.test/waiting.jpg",
      keyword: "1000", quantity: 1, unitPrice: 1000, position: 1, status: "waiting",
    }] } },
  } as OrderDetailContextValue
  return <QueryClientProvider client={client}>
    <OrderDetailContext value={context}>
      <OrderDetailWaitlist />
      <OrderDetailUpsell />
      <OrderDetailAddItemSheet productIdsNoPedido={[]} onAdd={async id => { setAdded(id) }} />
      <output aria-label="Produto adicionado">{added}</output>
    </OrderDetailContext>
  </QueryClientProvider>
}
