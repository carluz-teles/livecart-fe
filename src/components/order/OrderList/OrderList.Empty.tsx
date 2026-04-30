import { ShoppingCart } from "lucide-react"

export function OrderListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-medium">Nenhum pedido por aqui ainda</p>
      <p className="text-sm text-muted-foreground">
        Quando seus clientes finalizarem compras na live, eles aparecem aqui.
      </p>
    </div>
  )
}
