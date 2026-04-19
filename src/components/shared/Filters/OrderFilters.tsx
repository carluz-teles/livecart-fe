"use client"

import { useMemo } from "react"
import type { OrderFilters as OrderFiltersType } from "@/types/cart.types"
import {
  FilterPanel,
  FilterSection,
  FilterCheckboxGroup,
  FilterRange,
} from "./FilterPanel"

interface OrderFiltersProps {
  filters: OrderFiltersType
  onChange: (filters: OrderFiltersType) => void
}

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "checkout", label: "Aguardando Pagamento" },
  { value: "completed", label: "Completo" },
  { value: "expired", label: "Expirado" },
]

const paymentStatusOptions = [
  { value: "pending", label: "Aguardando" },
  { value: "paid", label: "Pago" },
  { value: "failed", label: "Falhou" },
  { value: "refunded", label: "Reembolsado" },
]

export function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.status && filters.status.length > 0) count++
    if (filters.paymentStatus && filters.paymentStatus.length > 0) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.totalMin !== undefined || filters.totalMax !== undefined) count++
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
      <FilterSection title="Status do Pedido">
        <FilterCheckboxGroup
          options={statusOptions}
          selected={filters.status || []}
          onChange={(values) =>
            onChange({
              ...filters,
              status: values.length > 0 ? (values as OrderFiltersType["status"]) : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection title="Status do Pagamento">
        <FilterCheckboxGroup
          options={paymentStatusOptions}
          selected={filters.paymentStatus || []}
          onChange={(values) =>
            onChange({
              ...filters,
              paymentStatus: values.length > 0
                ? (values as OrderFiltersType["paymentStatus"])
                : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection title="Valor Total">
        <FilterRange
          minValue={filters.totalMin}
          maxValue={filters.totalMax}
          onMinChange={(value) =>
            onChange({ ...filters, totalMin: value })
          }
          onMaxChange={(value) =>
            onChange({ ...filters, totalMax: value })
          }
          minPlaceholder="0,00"
          maxPlaceholder="999,99"
          prefix="R$"
          formatValue={formatPrice}
          parseValue={parsePrice}
        />
      </FilterSection>

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
