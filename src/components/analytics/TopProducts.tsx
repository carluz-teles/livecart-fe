"use client"

import { Package, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { EventSoldProduct } from "@/types/event.types"

interface TopProductsProps {
  products: EventSoldProduct[]
  isLoading?: boolean
  limit?: number
}

export function TopProducts({ products, isLoading, limit = 5 }: TopProductsProps) {
  const topProducts = products.slice(0, limit)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Top Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum produto vendido</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-6 w-6 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium truncate" title={product.name}>
                    {product.name}
                  </span>
                </div>
                <span className="text-sm tabular-nums text-muted-foreground shrink-0">
                  {product.totalQuantity} un
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
