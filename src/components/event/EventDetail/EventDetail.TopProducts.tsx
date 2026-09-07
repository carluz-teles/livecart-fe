"use client"

import { QueryFeedback } from "@/components/shared/QueryFeedback"
import { use } from "react"
import { TopProducts } from "@/components/analytics/TopProducts"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailTopProducts({ limit = 5 }: { limit?: number }) {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { products, productsLoading, productsError } = ctx.state

  return (
    <div className="flex flex-col gap-3">
      {productsError && (
        <QueryFeedback
          title="Não foi possível atualizar os produtos vendidos"
          stale={products.length > 0}
          retry={ctx.actions.refresh}
        />
      )}
      {(!productsError || products.length > 0) && (
        <TopProducts
          products={products}
          isLoading={productsLoading}
          limit={limit}
        />
      )}
    </div>
  )
}
