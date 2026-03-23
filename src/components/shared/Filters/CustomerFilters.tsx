"use client"

import { useMemo } from "react"
import type { CustomerFilters as CustomerFiltersType } from "@/types/customer.types"
import {
  FilterPanel,
  FilterSection,
  FilterRange,
  FilterToggle,
} from "./FilterPanel"

interface CustomerFiltersProps {
  filters: CustomerFiltersType
  onChange: (filters: CustomerFiltersType) => void
}

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.hasOrders !== undefined) count++
    if (filters.orderCountMin !== undefined || filters.orderCountMax !== undefined) count++
    if (filters.totalSpentMin !== undefined || filters.totalSpentMax !== undefined) count++
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }, [filters])

  const handleClearAll = () => {
    onChange({})
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2).replace(".", ",")
  }

  const parsePrice = (value: string) => {
    const normalized = value.replace(",", ".")
    return Math.round(parseFloat(normalized) * 100)
  }

  return (
    <FilterPanel
      activeCount={activeCount}
      onClearAll={handleClearAll}
      title="Filtros"
    >
      <FilterSection title="Comportamento">
        <FilterToggle
          label="Apenas clientes com pedidos"
          checked={filters.hasOrders || false}
          onChange={(checked) =>
            onChange({ ...filters, hasOrders: checked || undefined })
          }
        />
      </FilterSection>

      <FilterSection title="Quantidade de Pedidos">
        <FilterRange
          minValue={filters.orderCountMin}
          maxValue={filters.orderCountMax}
          onMinChange={(value) =>
            onChange({ ...filters, orderCountMin: value })
          }
          onMaxChange={(value) =>
            onChange({ ...filters, orderCountMax: value })
          }
          minPlaceholder="0"
          maxPlaceholder="100"
        />
      </FilterSection>

      <FilterSection title="Valor Total Gasto">
        <FilterRange
          minValue={filters.totalSpentMin}
          maxValue={filters.totalSpentMax}
          onMinChange={(value) =>
            onChange({ ...filters, totalSpentMin: value })
          }
          onMaxChange={(value) =>
            onChange({ ...filters, totalSpentMax: value })
          }
          minPlaceholder="0,00"
          maxPlaceholder="9.999,99"
          prefix="R$"
          formatValue={formatPrice}
          parseValue={parsePrice}
        />
      </FilterSection>

      <FilterSection title="Período de Cadastro">
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
