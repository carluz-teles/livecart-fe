"use client"

import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EventWhitelistEmptyProps {
  onAddProduct: () => void
}

export function EventWhitelistEmpty({ onAddProduct }: EventWhitelistEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Nenhum produto configurado</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Quando a whitelist está vazia, todos os produtos da loja podem ser vendidos neste evento.
        Adicione produtos para restringir as vendas apenas aos itens selecionados.
      </p>
      <Button onClick={onAddProduct}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Primeiro Produto
      </Button>
    </div>
  )
}
