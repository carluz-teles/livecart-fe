"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Package, AlertCircle, Layers, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchERPProducts } from "@/hooks/integration"
import { formatCurrency } from "@/lib/format"
import { getERPSearchErrorMessage } from "@/lib/api-errors"
import type { ERPProduct } from "@/types"
import { ProductFormERPVariantPicker } from "./ProductFormERPVariantPicker"

interface ProductFormERPSearchProps {
  integrationId: string
  onSelect: (product: ERPProduct) => void
  // Called after a parent (variant-bearing) product is imported via the
  // dedicated /import endpoint. The flat-product path continues to use
  // onSelect to pre-fill the form for review.
  onImported?: () => void
}

export function ProductFormERPSearch({
  integrationId,
  onSelect,
  onImported,
}: ProductFormERPSearchProps) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pickerParent, setPickerParent] = useState<ERPProduct | null>(null)
  const { data, isLoading, isError, error } = useSearchERPProducts(integrationId, search)

  const products = data?.products ?? []
  const selectedProduct = products.find((p) => p.id === selectedId)
  const showResults = search.length >= 2

  const isVariantParent = (p: ERPProduct) =>
    p.isParent === true && (p.variants?.length ?? 0) > 0

  function handleSelect(product: ERPProduct) {
    // Produto já no catálogo: não permite selecionar/reimportar.
    if (product.alreadyImported) return
    if (isVariantParent(product)) {
      // Parents skip the form pre-fill flow — they need a separate picker
      // to choose which variants to bring in.
      setPickerParent(product)
      setSelectedId(null)
      return
    }
    setSelectedId(product.id === selectedId ? null : product.id)
  }

  function handleConfirm() {
    if (selectedProduct) {
      onSelect(selectedProduct)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, SKU ou código de barras..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedId(null)
          }}
          className="pl-9"
        />
      </div>

      {showResults && (
        <div className="rounded-lg border bg-card">
          {isLoading && <SearchSkeleton />}

          {isError && (
            <div className="flex items-start gap-3 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{getERPSearchErrorMessage(error)}</span>
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum produto encontrado para &ldquo;{search}&rdquo;
              </p>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <ul className="max-h-[320px] overflow-y-auto divide-y">
              {products.map((product) => {
                const parent = isVariantParent(product)
                const imported = product.alreadyImported === true
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(product)}
                      disabled={imported}
                      aria-disabled={imported}
                      title={imported ? "Produto já cadastrado no catálogo" : undefined}
                      className={`flex w-full items-center gap-3 p-3 text-left transition-colors ${
                        imported
                          ? "cursor-not-allowed opacity-60"
                          : "hover:bg-accent"
                      } ${
                        selectedId === product.id && !parent
                          ? "bg-accent ring-1 ring-inset ring-primary"
                          : ""
                      }`}
                    >
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-10 w-10 shrink-0 rounded-md object-cover bg-muted"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          {imported && (
                            <Badge
                              variant="secondary"
                              className="h-5 shrink-0 gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Já cadastrado
                            </Badge>
                          )}
                          {parent && !imported && (
                            <Badge variant="secondary" className="h-5 shrink-0 gap-1 text-[10px]">
                              <Layers className="h-3 w-3" />
                              {product.variants?.length} variantes
                            </Badge>
                          )}
                        </div>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground font-mono">
                            SKU: {product.sku}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-sm font-semibold">
                        {formatCurrency(product.price)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {data?.hasMore && (
            <p className="border-t px-3 py-2 text-xs text-muted-foreground text-center">
              Mostrando {products.length} de {data.totalCount} resultados. Refine sua busca.
            </p>
          )}
        </div>
      )}

      {selectedProduct && (
        <Button type="button" className="w-full" onClick={handleConfirm}>
          Criar Produto
        </Button>
      )}

      <ProductFormERPVariantPicker
        open={!!pickerParent}
        onOpenChange={(open) => {
          if (!open) setPickerParent(null)
        }}
        parent={pickerParent}
        integrationId={integrationId}
        onImported={() => {
          setPickerParent(null)
          onImported?.()
        }}
      />
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
