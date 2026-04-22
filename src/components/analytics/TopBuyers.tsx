"use client"

import { Users, Crown } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { EventCart } from "@/types/event.types"

interface TopBuyersProps {
  carts: EventCart[]
  isLoading?: boolean
  limit?: number
}

export function TopBuyers({ carts, isLoading, limit = 5 }: TopBuyersProps) {
  // Sort carts by total value (descending) and take top N
  const topBuyers = [...carts]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Crown className="h-4 w-4 text-muted-foreground" />
          Top Compradores
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : topBuyers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum comprador</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topBuyers.map((cart, index) => (
              <div key={cart.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {cart.platformHandle.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate">
                    @{cart.platformHandle}
                  </span>
                  {cart.paymentStatus === "paid" && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-green-600 border-green-200 bg-green-50">
                      Pago
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium tabular-nums shrink-0">
                  {formatCurrency(cart.totalValue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
