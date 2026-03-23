"use client"

import { useMemo } from "react"
import type { LiveFilters as LiveFiltersType } from "@/types/live.types"
import {
  FilterPanel,
  FilterSection,
  FilterCheckboxGroup,
} from "./FilterPanel"

interface LiveFiltersProps {
  filters: LiveFiltersType
  onChange: (filters: LiveFiltersType) => void
}

const statusOptions = [
  { value: "scheduled", label: "Agendada" },
  { value: "live", label: "Ao Vivo" },
  { value: "ended", label: "Encerrada" },
  { value: "cancelled", label: "Cancelada" },
]

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
]

export function LiveFilters({ filters, onChange }: LiveFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.status && filters.status.length > 0) count++
    if (filters.platform && filters.platform.length > 0) count++
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
              status: values.length > 0 ? (values as LiveFiltersType["status"]) : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection title="Plataforma">
        <FilterCheckboxGroup
          options={platformOptions}
          selected={filters.platform || []}
          onChange={(values) =>
            onChange({
              ...filters,
              platform: values.length > 0 ? (values as LiveFiltersType["platform"]) : undefined,
            })
          }
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
