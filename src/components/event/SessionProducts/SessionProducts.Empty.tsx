"use client"

import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SESSION_PRODUCTS_COPY } from "@/lib/event-copy"

interface SessionProductsEmptyProps {
  onAddProduct: () => void
}

/**
 * Lista vazia é a configuração PADRÃO e válida — o caso da live que vende
 * qualquer coisa. Este estado diz a regra em uma linha para o lojista não achar
 * que a transmissão está quebrada ou que ele perdeu o que configurou.
 */
export function SessionProductsEmpty({ onAddProduct }: SessionProductsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium">{SESSION_PRODUCTS_COPY.emptyTitle}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {SESSION_PRODUCTS_COPY.emptyBody}
      </p>
      <Button onClick={onAddProduct}>
        <Plus className="mr-2 h-4 w-4" />
        {SESSION_PRODUCTS_COPY.addFirst}
      </Button>
    </div>
  )
}
