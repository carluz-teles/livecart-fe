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
  const { search, filters, showBlockedOnly } = ctx.state
  const { setSearch, setFilters, setShowBlockedOnly } = ctx.actions

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          aria-label="Buscar clientes"
          placeholder="Buscar @perfil ou e-mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button
        variant={showBlockedOnly ? "default" : "outline"}
        size="sm"
        aria-pressed={showBlockedOnly}
        onClick={() => setShowBlockedOnly(!showBlockedOnly)}
        className={cn(
          "gap-1.5",
          showBlockedOnly &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        )}
      >
        <Ban className="h-4 w-4" />
        Bloqueados
      </Button>
      <CustomerFilters filters={filters} onChange={setFilters} />
    </div>
  )
}
