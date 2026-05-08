"use client"

import { use } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CustomerFilters } from "@/components/shared/Filters"
import { CustomerListContext } from "./CustomerListContext"

export function CustomerListToolbar() {
  const ctx = use(CustomerListContext)
  if (!ctx) return null
  const { search, filters } = ctx.state
  const { setSearch, setFilters } = ctx.actions

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por @handle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <CustomerFilters filters={filters} onChange={setFilters} />
    </div>
  )
}
