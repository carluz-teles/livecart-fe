"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventUpsells, useAddUpsell } from "@/hooks/event"

import { EventUpsellsList } from "./EventUpsells.List"
import { EventUpsellsEmpty } from "./EventUpsells.Empty"
import { EventUpsellsForm } from "./EventUpsells.Form"

interface EventUpsellsProps {
  eventId: string
}

export function EventUpsells({ eventId }: EventUpsellsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data: upsells, isLoading } = useEventUpsells(eventId)
  const addUpsell = useAddUpsell(eventId)

  const existingProductIds = upsells?.map((u) => u.productId) ?? []

  const handleAddUpsell = (payload: { productId: string; discountPercent: number; messageTemplate?: string }) => {
    addUpsell.mutate(payload, {
      onSuccess: () => setIsFormOpen(false),
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upsells do Evento</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const hasUpsells = upsells && upsells.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upsells do Evento</CardTitle>
              <CardDescription>
                {hasUpsells
                  ? `${upsells.length} upsell(s) configurado(s)`
                  : "Ofertas especiais exibidas no checkout do carrinho"}
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Upsell
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasUpsells ? (
            <EventUpsellsList upsells={upsells} eventId={eventId} />
          ) : (
            <EventUpsellsEmpty onAddUpsell={() => setIsFormOpen(true)} />
          )}
        </CardContent>
      </Card>

      <EventUpsellsForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        existingProductIds={existingProductIds}
        onSubmit={handleAddUpsell}
        isPending={addUpsell.isPending}
      />
    </div>
  )
}

// Re-export sub-components for compound pattern
EventUpsells.List = EventUpsellsList
EventUpsells.Empty = EventUpsellsEmpty
EventUpsells.Form = EventUpsellsForm
