"use client"

import { useState } from "react"
import { Search, Package, Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useProducts } from "@/hooks/product"
import { useDebounce } from "@/hooks/shared"
import { formatCurrency } from "@/lib/format"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

interface EventUpsellsFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingProductIds: string[]
  onSubmit: (payload: { productId: string; discountPercent: number; messageTemplate?: string }) => void
  isPending: boolean
}

export function EventUpsellsForm({
  open,
  onOpenChange,
  existingProductIds,
  onSubmit,
  isPending,
}: EventUpsellsFormProps) {
  const [step, setStep] = useState<"select" | "configure">("select")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState("")
  const [discountPercent, setDiscountPercent] = useState("10")
  const [messageTemplate, setMessageTemplate] = useState("")

  const debouncedSearch = useDebounce(search, 300)

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch,
    filters: { status: ["active"] },
  })

  const products = productsData?.data ?? []
  const availableProducts = products.filter(
    (p) => !existingProductIds.includes(p.id)
  )

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setStep("configure")
  }

  const handleSubmit = () => {
    if (!selectedProduct) return

    const discount = parseInt(discountPercent, 10)
    if (isNaN(discount) || discount < 1 || discount > 99) return

    onSubmit({
      productId: selectedProduct.id,
      discountPercent: discount,
      messageTemplate: messageTemplate.trim() || undefined,
    })
  }

  const handleBack = () => {
    setStep("select")
    setSelectedProduct(null)
  }

  // Reset state when sheet closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep("select")
      setSelectedProduct(null)
      setSearch("")
      setDiscountPercent("10")
      setMessageTemplate("")
    }
    onOpenChange(newOpen)
  }

  const discountedPrice = selectedProduct
    ? Math.round(selectedProduct.price * (1 - parseInt(discountPercent || "0", 10) / 100))
    : 0

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {step === "select" ? "Selecionar Produto" : "Configurar Upsell"}
          </SheetTitle>
          <SheetDescription>
            {step === "select"
              ? "Escolha um produto para criar o upsell"
              : "Configure o desconto e a mensagem do upsell"}
          </SheetDescription>
        </SheetHeader>

        {step === "select" ? (
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
                      <ProductSkeleton key={i} />
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
                        : "Todos os produtos já são upsells"}
                    </p>
                  </div>
                ) : (
                  availableProducts.map((product) => (
                    <ProductSelectItem
                      key={product.id}
                      product={product}
                      onSelect={() => handleSelectProduct(product)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {selectedProduct && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Preço: {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount">
                  Desconto <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="99"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-24"
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  {selectedProduct && (
                    <span className="text-sm text-muted-foreground">
                      = {formatCurrency(discountedPrice)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Porcentagem de desconto sobre o preço original
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem promocional</Label>
                <Textarea
                  id="message"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Ex: Aproveite e leve também com desconto especial!"
                  className="min-h-[80px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Será exibida junto com o upsell no checkout.
                </p>
              </div>
            </div>

            <SheetFooter className="flex-row gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !discountPercent || parseInt(discountPercent, 10) < 1}
              >
                {isPending ? "Adicionando..." : "Adicionar Upsell"}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

interface ProductSelectItemProps {
  product: Product
  onSelect: () => void
}

function ProductSelectItem({ product, onSelect }: ProductSelectItemProps) {
  return (
    <div
      role="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer",
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
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <Skeleton className="h-12 w-12 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
