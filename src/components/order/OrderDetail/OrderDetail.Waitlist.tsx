"use client"

import { use } from "react"
import Image from "next/image"
import { Hourglass, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { OrderWaitlistItem } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"

// Fila de espera do pedido, do lado do lojista.
//
// A compradora vê a mesma lista no checkout ("Aguardando estoque") e a fonte é
// a mesma, de propósito: quando ela liga perguntando "e a minha bolsa?", o que
// o lojista lê aqui é palavra por palavra o que ela está vendo na tela dela.
//
// Estes produtos NÃO são pagáveis nem despacháveis — por isso vivem fora da
// tabela de itens, e não apenas como uma linha cinza dentro dela.
export function OrderDetailWaitlist() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  const fila = (order.waitlist ?? []).filter((item) => item.status === "waiting")
  if (fila.length === 0) return null

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Hourglass className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          Aguardando estoque ({fila.length})
        </CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Estes produtos estavam esgotados quando a cliente pediu. Não entram no
          total nem no envio. Pagar os disponíveis encerra esta espera; os
          pendentes exigem um novo pedido. Produtos já liberados estão no carrinho
          e seguem o prazo dele. VIP mantém a espera sem expiração.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {fila.map((item) => (
          <WaitlistRow key={item.id} item={item} />
        ))}
      </CardContent>
    </Card>
  )
}

interface WaitlistRowProps {
  item: OrderWaitlistItem
}

function WaitlistRow({ item }: WaitlistRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background/60 p-3">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.productName}</p>
        <p className="font-mono text-xs text-muted-foreground">{item.keyword}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm tabular-nums">
          {item.quantity} un · {formatCurrency(item.unitPrice)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.position > 1 ? `${item.position}ª da fila` : "Próxima da fila"}
        </p>
      </div>
    </div>
  )
}
