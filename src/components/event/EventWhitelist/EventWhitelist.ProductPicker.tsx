"use client"

import { useState } from "react"
import { Search, Plus, Package, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

interface EventWhitelistProductPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingProductIds: string[]
  onAddProduct: (productId: string) => void
  isPending: boolean
}

export function EventWhitelistProductPicker({
  open,
  onOpenChange,
  existingProductIds,
  onAddProduct,
  isPending,
}: EventWhitelistProductPickerProps) {
  const [search, setSearch] = useState("")
  const [addingProductId, setAddingProductId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"] },
  })

  const products = productsData?.data ?? []
  const availableProducts = products.filter(
    (p) => !existingProductIds.includes(p.id)
  )

  const handleAddProduct = (productId: string) => {
    setAddingProductId(productId)
    onAddProduct(productId)
  }

  // Reset state when sheet closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearch("")
      setAddingProductId(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Adicionar Produto</SheetTitle>
          <SheetDescription>
            Busque e selecione produtos para adicionar à whitelist do evento.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-2 pr-4">
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ProductPickerSkeleton key={i} />
                  ))}
                </>
              ) : availableProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? "Nenhum produto encontrado para essa busca"
                      : "Todos os produtos já estão na whitelist"}
                  </p>
                </div>
              ) : (
                availableProducts.map((product) => (
                  <ProductPickerItem
                    key={product.id}
                    product={product}
                    onAdd={() => handleAddProduct(product.id)}
                    isAdding={isPending && addingProductId === product.id}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface ProductPickerItemProps {
  product: Product
  onAdd: () => void
  isAdding: boolean
}

function ProductPickerItem({ product, onAdd, isAdding }: ProductPickerItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        "hover:bg-accent/50 transition-colors"
      )}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-12 w-12 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" title={product.name}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            {product.keyword}
          </code>
          <span>•</span>
          <span>{formatCurrency(product.price)}</span>
          <span>•</span>
          <span className={cn(product.stock <= 0 && "text-destructive")}>
            {product.stock} em estoque
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onAdd}
        disabled={isAdding}
        className="flex-shrink-0"
      >
        {isAdding ? (
          <Check className="h-4 w-4 animate-pulse" />
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </>
        )}
      </Button>
    </div>
  )
}

function ProductPickerSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <Skeleton className="h-12 w-12 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  )
}
