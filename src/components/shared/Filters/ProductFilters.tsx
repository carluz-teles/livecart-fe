"use client"

import { useMemo } from "react"
import type { ProductFilters as ProductFiltersType } from "@/types/product.types"
import {
  FilterPanel,
  FilterSection,
  FilterCheckboxGroup,
  FilterRange,
  FilterToggle,
} from "./FilterPanel"

interface ProductFiltersProps {
  filters: ProductFiltersType
  onChange: (filters: ProductFiltersType) => void
}

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
]

const sourceOptions = [
  { value: "manual", label: "Manual" },
  { value: "bling", label: "Bling" },
  { value: "tiny", label: "Tiny" },
  { value: "shopify", label: "Shopify" },
]

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.status && filters.status.length > 0) count++
    if (filters.externalSource && filters.externalSource.length > 0) count++
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++
    if (filters.stockMin !== undefined || filters.stockMax !== undefined) count++
    if (filters.hasLowStock) count++
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
      <FilterSection title="Status">
        <FilterCheckboxGroup
          options={statusOptions}
          selected={filters.status || []}
          onChange={(values) =>
            onChange({
              ...filters,
              status: values.length > 0 ? (values as ProductFiltersType["status"]) : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection title="Origem">
        <FilterCheckboxGroup
          options={sourceOptions}
          selected={filters.externalSource || []}
          onChange={(values) =>
            onChange({
              ...filters,
              externalSource: values.length > 0
                ? (values as ProductFiltersType["externalSource"])
                : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection title="Preço">
        <FilterRange
          minValue={filters.priceMin}
          maxValue={filters.priceMax}
          onMinChange={(value) =>
            onChange({ ...filters, priceMin: value })
          }
          onMaxChange={(value) =>
            onChange({ ...filters, priceMax: value })
          }
          minPlaceholder="0,00"
          maxPlaceholder="999,99"
          prefix="R$"
          formatValue={formatPrice}
          parseValue={parsePrice}
        />
      </FilterSection>

      <FilterSection title="Estoque">
        <FilterRange
          minValue={filters.stockMin}
          maxValue={filters.stockMax}
          onMinChange={(value) =>
            onChange({ ...filters, stockMin: value })
          }
          onMaxChange={(value) =>
            onChange({ ...filters, stockMax: value })
          }
          minPlaceholder="0"
          maxPlaceholder="100"
        />
        <div className="mt-3">
          <FilterToggle
            label="Apenas com estoque baixo (5 ou menos)"
            checked={filters.hasLowStock || false}
            onChange={(checked) =>
              onChange({ ...filters, hasLowStock: checked || undefined })
            }
          />
        </div>
      </FilterSection>
    </FilterPanel>
  )
}
