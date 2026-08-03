"use client"

import { useState } from "react"
import { Search, Plus, Package, Check, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import { SESSION_PRODUCTS_COPY } from "@/lib/event-copy"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

interface SessionProductsProductPickerProps {
  existingProductIds: string[]
  onAddProduct: (productId: string) => void
  onClose: () => void
  isPending: boolean
}

/**
 * Escolher os produtos que esta transmissão libera.
 *
 * É um painel dentro da gaveta, não uma segunda gaveta: a lista de produtos da
 * transmissão já abre numa gaveta, e empilhar outra por cima esconderia o que o
 * lojista precisa consultar enquanto escolhe.
 */
export function SessionProductsProductPicker({
  existingProductIds,
  onAddProduct,
  onClose,
  isPending,
}: SessionProductsProductPickerProps) {
  const [search, setSearch] = useState("")
  const [addingProductId, setAddingProductId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"] },
  })

  const products = productsData?.data ?? []
  const availableProducts = products.filter((p) => !existingProductIds.includes(p.id))

  const handleAddProduct = (productId: string) => {
    setAddingProductId(productId)
    onAddProduct(productId)
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">{SESSION_PRODUCTS_COPY.pickerHelp}</p>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={onClose}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-340px)]">
        <div className="space-y-2 pr-4">
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <ProductPickerSkeleton key={i} />
              ))}
            </>
          ) : availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Nenhum produto encontrado para essa busca"
                  : SESSION_PRODUCTS_COPY.pickerExhausted}
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
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        "transition-colors hover:bg-accent/50"
      )}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-12 w-12 flex-shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium" title={product.name}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
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
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Skeleton className="h-12 w-12 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  )
}
