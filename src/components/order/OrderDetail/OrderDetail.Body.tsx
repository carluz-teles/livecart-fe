"use client"

import { use } from "react"
import { Facebook, Instagram, MessageCircle, Radio } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderDetail } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"
import { OrderDetailCustomer } from "./OrderDetail.Customer"
import { OrderDetailERPRetryBanner } from "./OrderDetail.ERPRetryBanner"
import { OrderDetailJoin } from "./OrderDetail.Join"
import { OrderDetailStatusBanner } from "./OrderDetail.StatusBanner"
import { OrderDetailHistory } from "./OrderDetail.History"
import { OrderDetailItems } from "./OrderDetail.Items"
import { OrderDetailLogistics } from "./OrderDetail.Logistics"
import { OrderDetailPayment } from "./OrderDetail.Payment"
import { OrderDetailQuoteDocument } from "./OrderDetail.QuoteDocument"
import { OrderDetailShipping } from "./OrderDetail.Shipping"
import { OrderDetailUpsell } from "./OrderDetail.Upsell"
import { OrderDetailWaitlist } from "./OrderDetail.Waitlist"

const PLATFORM_ICON: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
}

// Single-page layout — the previous tabs split (Pedido / Logística / Histórico)
// fragmented operations that the merchant scans together. Right rail keeps the
// post-live summary cards (Pagamento / Cliente / Entrega / Live), the main
// column unfolds vertically: items → checkout deltas → logística → histórico.
export function OrderDetailBody() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  return (
    <>
      {/* A tela é operação da lojista; o papel é documento para a cliente. São
          audiências diferentes, então a impressão troca um pelo outro em vez de
          fotografar o painel — banner de ERP e histórico interno não saem da
          loja. Ver OrderDetail.QuoteDocument. */}
      <OrderDetailQuoteDocument />

      <div className="flex flex-col gap-4 print:hidden">
      {/* High-priority banner: paid carts whose Tiny order failed to finalise.
          Lives above the grid so it's the first thing the merchant sees on
          opening the page — the action it surfaces (retry) blocks fulfilment. */}
      <OrderDetailERPRetryBanner />

      {/* Estado terminal (cancelado/expirado) ou cancelamento revertido pelo
          pagamento: explica a consequência antes de o lojista ler os cards. */}
      <OrderDetailStatusBanner />

      {/* Juntar pedidos acontece no ERP: um pedido só lá, com o conteúdo dos
          dois. Aqui eles seguem separados, e esta seção é o que torna o vínculo
          visível — sem ela o lojista trataria um dos dois como pedido solto e
          mandaria frete duplicado. */}
      <OrderDetailJoin />

      {/* Mobile stacks the rail above the items because those cards carry the
          highest-signal info post-live ("entrou dinheiro? quem é? pra onde vai?").
          Desktop reverts to natural main / aside flow. */}
      <div className="grid gap-4 lg:grid-cols-12">
        <main className="order-2 flex flex-col gap-4 lg:col-span-8 lg:order-none">
          <OrderDetailItems />
          {/* Logo abaixo dos itens: é a continuação da mesma pergunta ("o que
              ela pediu?"), e o que está em fila explica a diferença entre o que
              ela pediu e o que a tabela cobra. */}
          <OrderDetailWaitlist />
          <OrderDetailUpsell />
          <OrderDetailLogistics />
          <OrderDetailHistory />
        </main>
        <aside className="order-1 flex flex-col gap-4 lg:col-span-4 lg:order-none">
          <OrderDetailPayment />
          <OrderDetailCustomer />
          <OrderDetailShipping />
          <SummaryLiveCard order={order} />
        </aside>
      </div>
      </div>
    </>
  )
}

interface LiveCardProps {
  order: OrderDetail
}

function SummaryLiveCard({ order }: LiveCardProps) {
  const PlatformIcon = PLATFORM_ICON[order.livePlatform] ?? null
  const platformLabel =
    order.livePlatform.charAt(0).toUpperCase() + order.livePlatform.slice(1)
  const comments = order.comments ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Radio className="h-4 w-4" />
          Evento de origem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium leading-tight">
            {order.eventTitle || order.liveTitle || "Sem título"}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {PlatformIcon && (
              <PlatformIcon className="h-3 w-3" aria-hidden="true" />
            )}
            {platformLabel}
          </p>
        </div>

        {comments.length > 0 && (
          <div className={cn("space-y-2 border-t pt-3")}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              Comentários do cliente ({comments.length})
            </p>
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md bg-muted/40 px-2.5 py-1.5"
                >
                  <p className="text-sm leading-snug">{c.text}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {formatTime(c.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
