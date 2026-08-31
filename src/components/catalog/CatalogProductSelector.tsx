"use client"

import { useMemo, useState } from "react"
import { Search, Package, Check, Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/hooks/product"
import { useSetCatalogProducts } from "@/hooks/catalog"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"
import type { CatalogProduct } from "@/types/catalog.types"

interface CatalogProductSelectorProps {
  catalogId: string
  // Products already in the catalog (ordered by position).
  initialProducts: CatalogProduct[]
}

// One row in either column. We only need enough to render + persist by id.
interface SelectableProduct {
  id: string
  name: string
  code: string
  price: number
  imageUrl: string | null
  stock: number
}

function fromProduct(p: Product): SelectableProduct {
  return {
    id: p.id,
    name: p.name,
    code: p.keyword,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
  }
}

function fromCatalogProduct(p: CatalogProduct): SelectableProduct {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
  }
}

/**
 * Two-column product picker for a catalog.
 *
 * The left column searches the store's active products; the right column is the
 * ordered selection. The selection lives in local state so the merchant can add
 * and remove freely, then persists as a full replace (array order = display
 * order) via PUT /catalogs/:id/products.
 */
export function CatalogProductSelector({
  catalogId,
  initialProducts,
}: CatalogProductSelectorProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  // Ordered selection. Seeded from the catalog's current products.
  const [selected, setSelected] = useState<SelectableProduct[]>(() =>
    initialProducts.map(fromCatalogProduct)
  )

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"] },
  })

  const setProducts = useSetCatalogProducts()

  const selectedIds = useMemo(() => new Set(selected.map((p) => p.id)), [selected])

  const available = useMemo(
    () => (productsData?.data ?? []).filter((p) => !selectedIds.has(p.id)),
    [productsData, selectedIds]
  )

  // A full replace has no meaning to compare against the server "position", so
  // we compare id-order against the initial snapshot to know if there's a diff.
  const isDirty = useMemo(() => {
    const before = initialProducts.map((p) => p.id).join(",")
    const now = selected.map((p) => p.id).join(",")
    return before !== now
  }, [initialProducts, selected])

  function addProduct(p: Product) {
    setSelected((prev) => [...prev, fromProduct(p)])
  }

  function removeProduct(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id))
  }

  function handleSave() {
    setProducts.mutate(
      { id: catalogId, productIds: selected.map((p) => p.id) },
      {
        onSuccess: () => {
          toast.success("Produtos do catálogo atualizados")
        },
        onError: (error) => {
          toast.error("Erro ao salvar produtos", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Escolha os produtos que fazem parte deste catálogo. A ordem à direita é
          a ordem de exibição.
        </p>
        <Button onClick={handleSave} disabled={!isDirty || setProducts.isPending}>
          {setProducts.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar produtos
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Available products */}
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Produtos disponíveis</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, keyword ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea
            className={cn(
              "h-[calc(100vh-360px)] min-h-[240px]",
              "[&_[data-radix-scroll-area-viewport]>div]:!block",
              "[&_[data-radix-scroll-area-viewport]>div]:!w-full"
            )}
          >
            <div className="space-y-2 pr-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
              ) : available.length === 0 ? (
                <EmptyHint
                  message={
                    search
                      ? "Nenhum produto encontrado para essa busca."
                      : "Todos os produtos ativos já estão no catálogo."
                  }
                />
              ) : (
                available.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={fromProduct(product)}
                    action="add"
                    onAction={() => addProduct(product)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Selected products */}
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">No catálogo</h3>
            <Badge variant="secondary">{selected.length}</Badge>
          </div>
          <ScrollArea
            className={cn(
              "h-[calc(100vh-360px)] min-h-[240px]",
              "[&_[data-radix-scroll-area-viewport]>div]:!block",
              "[&_[data-radix-scroll-area-viewport]>div]:!w-full"
            )}
          >
            <div className="space-y-2 pr-4">
              {selected.length === 0 ? (
                <EmptyHint message="Nenhum produto selecionado ainda. Adicione da coluna à esquerda." />
              ) : (
                selected.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    action="remove"
                    onAction={() => removeProduct(product.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

interface ProductRowProps {
  product: SelectableProduct
  action: "add" | "remove"
  onAction: () => void
}

function ProductRow({ product, action, onAction }: ProductRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
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
        <p className="break-words font-medium leading-snug">{product.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {product.code && (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {product.code}
            </code>
          )}
          <span aria-hidden>•</span>
          <span>{formatCurrency(product.price)}</span>
          <span aria-hidden>•</span>
          <span className={cn(product.stock <= 0 && "text-destructive")}>
            {product.stock} em estoque
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant={action === "add" ? "outline" : "ghost"}
        onClick={onAction}
        className="flex-shrink-0"
      >
        {action === "add" ? (
          <>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </>
        ) : (
          <>
            <X className="mr-1 h-4 w-4" />
            Remover
          </>
        )}
      </Button>
    </div>
  )
}

function RowSkeleton() {
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

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <Check className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
