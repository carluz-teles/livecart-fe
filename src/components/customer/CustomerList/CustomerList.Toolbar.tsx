"use client"

import { use } from "react"
import { Ban, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomerFilters } from "@/components/shared/Filters"
import { cn } from "@/lib/utils"
import { CustomerListContext } from "./CustomerListContext"

export function CustomerListToolbar() {
  const ctx = use(CustomerListContext)
  if (!ctx) return null
  const { search, filters, showBlockedOnly, blockedHandles } = ctx.state
  const { setSearch, setFilters, setShowBlockedOnly } = ctx.actions

  const blockedCount = blockedHandles.size

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
      <Button
        variant={showBlockedOnly ? "default" : "outline"}
        size="sm"
        onClick={() => setShowBlockedOnly(!showBlockedOnly)}
        className={cn(
          "gap-1.5",
          showBlockedOnly && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        )}
      >
        <Ban className="h-4 w-4" />
        Bloqueados
        {blockedCount > 0 && (
          <span
            className={cn(
              "ml-1 rounded-full px-1.5 text-xs font-medium tabular-nums",
              showBlockedOnly ? "bg-destructive-foreground/20" : "bg-muted",
            )}
          >
            {blockedCount}
          </span>
        )}
      </Button>
      <CustomerFilters filters={filters} onChange={setFilters} />
    </div>
  )
}
