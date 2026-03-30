"use client"

import { useMemo } from "react"
import type { EventFilters as EventFiltersType } from "@/types/event.types"
import {
  FilterPanel,
  FilterSection,
  FilterCheckboxGroup,
} from "@/components/shared/Filters/FilterPanel"

interface EventFiltersProps {
  filters: EventFiltersType
  onChange: (filters: EventFiltersType) => void
}

const statusOptions = [
  { value: "active", label: "Ao Vivo" },
  { value: "ended", label: "Finalizado" },
]

export function EventFilters({ filters, onChange }: EventFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.status && filters.status.length > 0) count++
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
      <FilterSection title="Status">
        <FilterCheckboxGroup
          options={statusOptions}
          selected={filters.status || []}
          onChange={(values) =>
            onChange({
              ...filters,
              status: values.length > 0 ? (values as EventFiltersType["status"]) : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection title="Periodo">
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
            <label className="text-sm text-muted-foreground mb-1 block">Ate</label>
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
