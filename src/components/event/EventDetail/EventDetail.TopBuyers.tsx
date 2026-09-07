"use client"

import { QueryFeedback } from "@/components/shared/QueryFeedback"
import { use } from "react"
import { TopBuyers } from "@/components/analytics/TopBuyers"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailTopBuyers({ limit = 5 }: { limit?: number }) {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { carts, cartsLoading, cartsError } = ctx.state

  return (
    <div className="flex flex-col gap-3">
      {cartsError && (
        <QueryFeedback
          title="Não foi possível atualizar os compradores do evento"
          stale={carts.length > 0}
          retry={ctx.actions.refresh}
        />
      )}
      {(!cartsError || carts.length > 0) && (
        <TopBuyers carts={carts} isLoading={cartsLoading} limit={limit} />
      )}
    </div>
  )
}
