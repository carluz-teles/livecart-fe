"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventWhitelist, useAddToWhitelist } from "@/hooks/event"

import { EventWhitelistTable } from "./EventWhitelist.Table"
import { EventWhitelistEmpty } from "./EventWhitelist.Empty"
import { EventWhitelistProductPicker } from "./EventWhitelist.ProductPicker"

interface EventWhitelistProps {
  eventId: string
}

export function EventWhitelist({ eventId }: EventWhitelistProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const { data: whitelistProducts, isLoading } = useEventWhitelist(eventId)
  const addToWhitelist = useAddToWhitelist(eventId)

  const existingProductIds = whitelistProducts?.map((p) => p.productId) ?? []

  const handleAddProduct = (productId: string) => {
    addToWhitelist.mutate({ productId })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos do Evento</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const hasProducts = whitelistProducts && whitelistProducts.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos da campanha</CardTitle>
              <CardDescription>
                {/* Lista vazia libera o catálogo inteiro — é o comportamento
                    padrão, porque a maioria dos lojistas fala o código durante
                    a transmissão em vez de configurar produto. A sessão nova
                    HERDA esta lista; sem a herança, criar uma sessão zeraria a
                    barreira do evento inteiro pela regra de união. */}
                {hasProducts
                  ? `${whitelistProducts.length} produto(s) liberado(s). Toda sessão nova desta campanha herda esta lista.`
                  : "Sem produtos configurados, todos os produtos da loja são aceitos em qualquer sessão desta campanha."}
              </CardDescription>
            </div>
            <Button onClick={() => setIsPickerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasProducts ? (
            <EventWhitelistTable
              products={whitelistProducts}
              eventId={eventId}
            />
          ) : (
            <EventWhitelistEmpty onAddProduct={() => setIsPickerOpen(true)} />
          )}
        </CardContent>
      </Card>

      <EventWhitelistProductPicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        existingProductIds={existingProductIds}
        onAddProduct={handleAddProduct}
        isPending={addToWhitelist.isPending}
      />
    </div>
  )
}

// Re-export sub-components for compound pattern
EventWhitelist.Table = EventWhitelistTable
EventWhitelist.Empty = EventWhitelistEmpty
EventWhitelist.ProductPicker = EventWhitelistProductPicker
