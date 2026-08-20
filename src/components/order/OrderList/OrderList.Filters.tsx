"use client"

import { use } from "react"
import { Package, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { OrderFilters } from "@/components/shared/Filters"
import { useProduct } from "@/hooks/product"
import { OrderListContext } from "./OrderListContext"

export function OrderListFilters() {
  const ctx = use(OrderListContext)
  if (!ctx) return null

  return (
    <div className="flex flex-col gap-2">
      <SearchRow />
      <ProductFilterChip />
    </div>
  )
}

function SearchRow() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { search, filters } = ctx.state
  const { setSearch, setFilters } = ctx.actions

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por @cliente ou #1247..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <OrderFilters filters={filters} onChange={setFilters} />
    </div>
  )
}

/**
 * Chip do filtro por produto (deep-link /orders?product=... do modal do
 * produto). Sem ele o filtro seria invisível: a lista encolheria e o lojista
 * não saberia por quê, nem teria como limpar.
 */
function ProductFilterChip() {
  const ctx = use(OrderListContext)
  const productId = ctx?.state.filters.productId
  const { data: product } = useProduct(productId)
  if (!ctx || !productId) return null
  const { filters } = ctx.state
  const { setFilters } = ctx.actions

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1.5 py-1 pl-2 pr-1 font-normal">
        <Package className="h-3.5 w-3.5" />
        <span>
          Com o produto{" "}
          <span className="font-medium">{product?.name ?? "…"}</span>
        </span>
        <button
          type="button"
          aria-label="Remover filtro de produto"
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setFilters({ ...filters, productId: undefined })}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </Badge>
    </div>
  )
}
