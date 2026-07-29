"use client"

import { use } from "react"
import { Ban, Clock, RotateCcw } from "lucide-react"

import { formatDateTime } from "@/lib/format"

import { OrderDetailContext } from "./OrderDetailContext"

// Estado terminal do pedido, dito em uma frase logo no topo. O selo no cabeçalho
// diz O QUE aconteceu; aqui dizemos o que isso SIGNIFICA — para onde foi o
// estoque, se o link ainda paga, o que ainda dá para fazer. Sem isso o lojista
// precisa deduzir a consequência a partir de uma palavra.
//
// Some no caminho feliz: pedido vivo não renderiza nada.
export function OrderDetailStatusBanner() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  // Cancelamento revertido pelo pagamento vem primeiro: o pedido está PAGO e
  // vivo, mas o lojista precisa entender por que ele reapareceu depois de ter
  // sido cancelado — é o caso que mais gera dúvida.
  if (order.cancellationRevertedAt) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 print:hidden"
      >
        <RotateCcw
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Cancelamento revertido — o comprador pagou
          </p>
          <p className="text-sm text-muted-foreground">
            Este pedido foi cancelado, mas o pagamento entrou assim mesmo em{" "}
            {formatDateTime(order.cancellationRevertedAt)} e o pedido voltou a
            valer: o estoque foi retomado e o pedido seguiu para o ERP
            normalmente. Para devolver o dinheiro, faça o estorno pelo provedor
            de pagamento.
          </p>
        </div>
      </div>
    )
  }

  if (order.status !== "cancelled" && order.status !== "expired") return null

  const cancelled = order.status === "cancelled"
  const Icon = cancelled ? Ban : Clock

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 print:hidden"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {cancelled
            ? "Pedido cancelado pela loja"
            : "Pedido expirado sem pagamento"}
        </p>
        <p className="text-sm text-muted-foreground">
          {cancelled
            ? "O estoque dos itens voltou para o catálogo e a reserva no ERP foi estornada."
            : "O prazo de pagamento acabou. O estoque dos itens voltou para o catálogo e a reserva no ERP foi estornada."}{" "}
          O link do cliente não aceita mais pagamento — ele vê que o carrinho foi{" "}
          {cancelled ? "cancelado pela loja" : "encerrado por tempo"}.
          {cancelled &&
            " Para vender de novo, peça que ele comente na live outra vez."}
        </p>
      </div>
    </div>
  )
}
