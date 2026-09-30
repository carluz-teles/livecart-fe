"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { CatalogClient } from "../../../../src/app/cart/[token]/catalog/CatalogClient"
import { CheckoutClient } from "../../../../src/app/cart/[token]/CheckoutClient"
import { TooltipProvider } from "../../../../src/components/ui/tooltip"
import { cart, catalog } from "../../fixtures/cart-edit"

export default function Page() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [checkout, setCheckout] = useState(false)
  return <QueryClientProvider client={client}><TooltipProvider>
    <button onClick={() => setCheckout(true)}>Abrir checkout de teste</button>
    {checkout ? <CheckoutClient token={cart.token} initialCart={cart} /> : <CatalogClient token={cart.token} eventId={cart.event.id} initialCart={cart} initialCatalog={catalog} />}
    <Toaster />
  </TooltipProvider></QueryClientProvider>
}
