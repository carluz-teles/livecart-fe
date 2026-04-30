"use client"

import { use } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderListContext } from "./OrderListContext"

export function OrderListPagination() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { pagination, totalPages, total, isLoading } = ctx.state
  const { setPage } = ctx.actions

  if (totalPages <= 1) return null

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, total)

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-foreground">
        {isLoading ? "Carregando..." : `${start}–${end} de ${total} pedidos`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(pagination.page - 1)}
          disabled={pagination.page <= 1 || isLoading}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm tabular-nums">
          {pagination.page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(pagination.page + 1)}
          disabled={pagination.page >= totalPages || isLoading}
        >
          Próxima
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
