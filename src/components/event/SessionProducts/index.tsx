"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldHint } from "@/components/shared/FieldHint"
import { SESSION_PRODUCTS_COPY } from "@/lib/event-copy"
import { useSessionProducts, useAddSessionProduct } from "@/hooks/event"

import { SessionProductsTable } from "./SessionProducts.Table"
import { SessionProductsEmpty } from "./SessionProducts.Empty"
import { SessionProductsProductPicker } from "./SessionProducts.ProductPicker"

interface SessionProductsProps {
  eventId: string
  sessionId: string
}

/**
 * O que UMA transmissão pode vender.
 *
 * A lista é da transmissão e só dela: não existe lista de campanha, e nada é
 * copiado de uma transmissão para outra. Lista vazia é uma resposta, não uma
 * lacuna — significa "vende qualquer produto da loja", que é o caso normal da
 * live. Por isso o estado vazio explica a regra em vez de só oferecer um botão.
 */
export function SessionProducts({ eventId, sessionId }: SessionProductsProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const { data: products, isLoading } = useSessionProducts(eventId, sessionId)
  const addProduct = useAddSessionProduct(eventId, sessionId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const list = products ?? []
  const hasProducts = list.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          {hasProducts
            ? SESSION_PRODUCTS_COPY.restricted(list.length)
            : SESSION_PRODUCTS_COPY.open}
          <FieldHint text={SESSION_PRODUCTS_COPY.hint} />
        </p>
        {/* O picker abre no lugar da lista, não numa segunda gaveta por cima
            desta: gaveta sobre gaveta esconde justamente o que o lojista
            precisa ver enquanto escolhe — o que já está liberado. */}
        {!isPickerOpen && (
          <Button size="sm" className="shrink-0" onClick={() => setIsPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {SESSION_PRODUCTS_COPY.add}
          </Button>
        )}
      </div>

      {isPickerOpen ? (
        <SessionProductsProductPicker
          existingProductIds={list.map((p) => p.productId)}
          onAddProduct={(productId) => addProduct.mutate({ productId })}
          onClose={() => setIsPickerOpen(false)}
          isPending={addProduct.isPending}
        />
      ) : hasProducts ? (
        <SessionProductsTable products={list} eventId={eventId} sessionId={sessionId} />
      ) : (
        <SessionProductsEmpty onAddProduct={() => setIsPickerOpen(true)} />
      )}
    </div>
  )
}

// Re-export sub-components for compound pattern.
// `SessionProducts.Sheet` NÃO entra aqui de propósito: a gaveta importa este
// arquivo, e registrá-la fecharia um ciclo de imports.
SessionProducts.Table = SessionProductsTable
SessionProducts.Empty = SessionProductsEmpty
SessionProducts.ProductPicker = SessionProductsProductPicker
