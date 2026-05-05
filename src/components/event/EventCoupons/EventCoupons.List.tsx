"use client"

import { Copy, MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Coupon } from "@/types"

interface EventCouponsListProps {
  coupons: Coupon[]
  onEdit: (c: Coupon) => void
  onToggleActive: (c: Coupon) => void
  onDelete: (c: Coupon) => void
  isMutating?: boolean
}

const TYPE_LABEL = {
  percent: "Percentual",
  fixed: "Valor fixo",
  free_shipping: "Frete grátis",
} as const

function describeValue(c: Coupon): string {
  switch (c.type) {
    case "percent":
      return `${(c.percentBps / 100).toFixed(c.percentBps % 100 === 0 ? 0 : 1)}% off`
    case "fixed":
      return `${formatCurrency(c.valueCents)} off`
    case "free_shipping":
      return "Frete grátis"
  }
}

function describeValidity(c: Coupon): string {
  if (!c.validFrom && !c.validUntil) return "Sem prazo"
  if (c.validFrom && c.validUntil) {
    return `${formatDate(c.validFrom)} → ${formatDate(c.validUntil)}`
  }
  if (c.validFrom) return `A partir de ${formatDate(c.validFrom)}`
  return `Até ${formatDate(c.validUntil!)}`
}

export function EventCouponsList({
  coupons,
  onEdit,
  onToggleActive,
  onDelete,
  isMutating,
}: EventCouponsListProps) {
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`Código ${code} copiado`)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-center">Usos</TableHead>
            <TableHead>Vigência</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((c) => {
            const isLimited = c.maxUses != null
            const isExhausted = isLimited && c.usedCount >= (c.maxUses ?? 0)
            return (
              <TableRow
                key={c.id}
                className={cn(!c.active && "opacity-60")}
                data-disabled={!c.active}
              >
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(c.code)}
                    aria-label={`Copiar código ${c.code}`}
                    translate="no"
                    className="group inline-flex items-center gap-1.5 rounded font-mono text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {c.code}
                    <Copy
                      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </button>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {TYPE_LABEL[c.type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium tabular-nums">
                    {describeValue(c)}
                  </span>
                  {c.minPurchaseCents > 0 && (
                    <p className="text-xs text-muted-foreground">
                      mín. {formatCurrency(c.minPurchaseCents)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm tabular-nums">
                    {c.usedCount}
                    <span className="text-muted-foreground">
                      /{isLimited ? c.maxUses : "∞"}
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {describeValidity(c)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {isExhausted ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Esgotado
                    </Badge>
                  ) : c.active ? (
                    <Badge variant="secondary">Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Mais ações"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(c)}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => onToggleActive(c)}
                        disabled={isMutating}
                      >
                        <Power className="mr-2 h-4 w-4" aria-hidden="true" />
                        {c.active ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onDelete(c)}
                        disabled={isMutating}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
