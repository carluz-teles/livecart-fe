"use client"

import { useState } from "react"
import { ProductImage as Image } from "@/components/product/ProductImage"
import { Search, Package, AlertCircle, Layers, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useERPProductDetails } from "@/hooks/integration/useERPProductDetails"
import { useSearchERPProducts } from "@/hooks/integration"
import { formatCurrency } from "@/lib/format"
import { getERPSearchErrorMessage } from "@/lib/api-errors"
import type { ERPProduct } from "@/types"
import { ProductFormERPVariantPicker } from "./ProductFormERPVariantPicker"
import { useERPConectado } from "@/hooks/integration"

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
  // Sem gate de provider: em staging, onde o único ERP é o Bling, 100% das
  // renderizações deste bloco diziam "O Tiny enviou N imagens".
  const erp = useERPConectado()
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Imagem principal escolhida pelo lojista quando o Tiny devolve várias.
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { data, isLoading, isError, error, refetch } = useSearchERPProducts(integrationId, search)

  const products = data?.products ?? []
  const selectedPreview = products.find((p) => p.id === selectedId)
  // A barcode/exact SKU usually returns one item: load its photo and available
  // stock while the operator reviews it, without fetching every search result.
  const detailPreview = selectedPreview ?? (products.length === 1 && !products[0].alreadyImported ? products[0] : undefined)
  const details = useERPProductDetails(integrationId, detailPreview)
  const selectedProduct = selectedPreview?.detailsPending ? details.data : selectedPreview
  const imageProduct = selectedProduct ?? details.data
  const productImages = imageProduct?.imageUrls?.length
    ? imageProduct.imageUrls
    : imageProduct?.imageUrl ? [imageProduct.imageUrl] : []
  const mainImage = selectedImage ?? imageProduct?.imageUrl ?? productImages[0]
  const pickerParent = pickerOpen && selectedProduct?.isParent ? selectedProduct : null
  const showResults = search.length >= 2

  const isVariantParent = (p: ERPProduct) =>
    p.isParent === true && (p.variants?.length ?? 0) > 0

  function handleSelect(product: ERPProduct) {
    // Produto já no catálogo: não permite selecionar/reimportar.
    if (product.alreadyImported) return
    const nextId = product.id === selectedId ? null : product.id
    setPickerOpen(false)
    setSelectedId(nextId)
    // Ao selecionar, a imagem principal começa na default (a primeira do Tiny);
    // o lojista troca na galeria abaixo.
    setSelectedImage(
      nextId
        ? (details.data?.id === product.id ? selectedImage ?? details.data.imageUrl ?? details.data.imageUrls?.[0] : undefined)
          ?? product.imageUrl ?? product.imageUrls?.[0] ?? null
        : null
    )
  }

  function handleConfirm() {
    if (selectedProduct) {
      if (isVariantParent(selectedProduct)) {
        setPickerOpen(true)
        return
      }
      // Leva a imagem escolhida pelo lojista como principal do produto.
      onSelect({
        ...selectedProduct,
        imageUrl: selectedImage ?? selectedProduct.imageUrl,
      })
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
            setSelectedImage(null)
            setPickerOpen(false)
          }}
          className="pl-9"
        />
      </div>

      {showResults && (
        <div className="rounded-lg border bg-card">
          {isLoading && <><p role="status" className="px-3 pt-3 text-sm text-muted-foreground">Consultando produtos no {erp.nome}…</p><SearchSkeleton /></>}

          {isError && (
            <div className="flex items-start gap-3 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>{getERPSearchErrorMessage(error)}</p>
                <Button type="button" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
              </div>
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

          {/* A lista não tem scroll próprio: ela já vive dentro da área
              rolável do formulário, e um segundo overflow fazia aparecer duas
              barras de rolagem lado a lado quando o ERP retornava muitos
              produtos. */}
          {!isLoading && !isError && products.length > 0 && (
            <ul className="divide-y">
              {products.map((product) => {
                const rowDetails = details.data?.id === product.id ? details.data : undefined
                const imageUrl = rowDetails?.imageUrl ?? rowDetails?.imageUrls?.[0] ?? product.imageUrl ?? product.imageUrls?.[0]
                const parent = product.isParent === true
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
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          fallbackSources={rowDetails?.imageUrls ?? product.imageUrls}
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
                              {product.groupImported ? "Importação iniciada" : product.variants?.length ? `${product.variants.length} variantes` : "Com variantes"}
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
              Há mais resultados. Refine sua busca pelo nome, SKU ou código de barras.
            </p>
          )}
        </div>
      )}

      {detailPreview?.detailsPending && details.isFetching && (
        <p role="status" className="text-sm text-muted-foreground">Consultando foto e estoque disponível do produto…</p>
      )}
      {detailPreview?.detailsPending && details.isError && (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>{getERPSearchErrorMessage(details.error)}</p>
          <Button type="button" variant="outline" onClick={() => details.refetch()}>Tentar novamente</Button>
        </div>
      )}
      {imageProduct && productImages.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div>
            <p className="text-sm font-medium">Imagem principal</p>
            <p className="text-xs text-muted-foreground">
              {productImages.length === 1
                ? "Esta imagem será salva no LiveCart."
                : `O ${erp.nome} enviou ${productImages.length} imagens para este produto. Selecione qual será salva no LiveCart.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {productImages.map((url) => {
              const isSelected = mainImage === url
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedImage(url)}
                  aria-pressed={isSelected}
                  aria-label="Usar esta imagem como principal"
                  title="Usar esta imagem como principal"
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    isSelected
                      ? "border-primary ring-1 ring-primary"
                      : "border-transparent hover:border-muted-foreground/40"
                  }`}
                >
                  <Image
                    src={url}
                    alt="Imagem do produto"
                    width={64}
                    height={64}
                    unoptimized
                    className="h-full w-full object-cover bg-muted"
                  />
                  {isSelected && (
                    <span className="absolute right-0.5 top-0.5 rounded-full bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {imageProduct && productImages.length === 0 && (
        <p className="text-sm text-muted-foreground">O {erp.nome} não enviou uma imagem para este produto.</p>
      )}

      {selectedProduct && (
        <Button type="button" className="w-full" onClick={handleConfirm}>
          {isVariantParent(selectedProduct) ? "Escolher variantes" : "Criar Produto"}
        </Button>
      )}

      <ProductFormERPVariantPicker
        open={!!pickerParent}
        onOpenChange={(open) => {
          setPickerOpen(open)
        }}
        parent={pickerParent}
        integrationId={integrationId}
        onImported={() => {
          setPickerOpen(false)
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
