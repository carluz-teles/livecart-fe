"use client"

import { useMemo } from "react"
import type { OrderFilters as OrderFiltersType } from "@/types/cart.types"
import { FilterPanel, FilterSection } from "./FilterPanel"

interface OrderFiltersProps {
  filters: OrderFiltersType
  onChange: (filters: OrderFiltersType) => void
}

// Status do Pedido and Status do Pagamento were intentionally removed: the
// triage tabs above the table cover those buckets and a sheet checkbox there
// would silently lose to the tab's pre-set filters at query time. Period
// remains because it's orthogonal to every tab and merchants frequently scope
// to "this live" or "this week".
export function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }, [filters])

  const handleClearAll = () => {
    onChange({})
  }

  return (
    <FilterPanel
      activeCount={activeCount}
      onClearAll={handleClearAll}
      title="Filtros"
    >
      <FilterSection title="Período">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">De</label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                onChange({ ...filters, dateFrom: e.target.value || undefined })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Até</label>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) =>
                onChange({ ...filters, dateTo: e.target.value || undefined })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      </FilterSection>
    </FilterPanel>
  )
}
