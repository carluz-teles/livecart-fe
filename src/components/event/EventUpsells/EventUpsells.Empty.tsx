"use client"

import { Gift, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EventUpsellsEmptyProps {
  onAddUpsell: () => void
}

export function EventUpsellsEmpty({ onAddUpsell }: EventUpsellsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Gift className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Nenhum upsell configurado</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Configure ofertas especiais que serão exibidas no checkout do carrinho.
        Upsells ajudam a aumentar o ticket médio das vendas.
      </p>
      <Button onClick={onAddUpsell}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Primeiro Upsell
      </Button>
    </div>
  )
}
