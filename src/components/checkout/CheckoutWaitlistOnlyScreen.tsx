"use client"

import { Hourglass, Instagram, ShoppingBag, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckoutHeader } from "./CheckoutHeader"
import { CheckoutWaitlistSection } from "./CheckoutWaitlistSection"
import { CheckoutExpirationTimer } from "./CheckoutExpirationTimer"
import type { PublicCheckoutCart } from "@/types"

interface CheckoutWaitlistOnlyScreenProps {
  cart: PublicCheckoutCart
  onRefresh: () => void
  refreshing: boolean
}

export function CheckoutWaitlistOnlyScreen({
  cart,
  onRefresh,
  refreshing,
}: CheckoutWaitlistOnlyScreenProps) {
  const handle = cart.platformHandle

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
      <CheckoutHeader storeName={cart.store.name} logoUrl={cart.store.logoUrl} />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 border-amber-100 shadow-xl shadow-amber-100/40 duration-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-amber-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <Hourglass className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
              Você está na fila de espera
            </h2>
            <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-gray-500">
              Os produtos que você pediu estavam esgotados no momento do
              pedido. Quando houver reposição, as unidades disponíveis entram
              no seu carrinho por ordem de chegada. Acompanhe por este link.
            </p>

            {handle && (
              <div className="mt-6 flex items-center gap-2 rounded-full border border-amber-100 bg-white px-4 py-2 text-xs text-amber-900 shadow-sm">
                <Instagram className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  Pedido de{" "}
                  <strong className="font-semibold">@{handle}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {cart.expiresAt && (
          <CheckoutExpirationTimer expiresAt={cart.expiresAt} onExpired={onRefresh} />
        )}

        <CheckoutWaitlistSection
          token={cart.token}
          items={cart.waitlistItems}
        />

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5 text-sm text-gray-600">
            <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex flex-col items-start gap-3 leading-relaxed">
              <p>
                {cart.expiresAt
                  ? "Sua espera acompanha o prazo do carrinho. Quando esse prazo terminar, será necessário fazer um novo pedido."
                  : "Acompanhe a disponibilidade neste carrinho. Quando um prazo for definido, ele aparecerá aqui; carrinhos VIP e sua espera não expiram."}
              </p>
              <Button variant="outline" size="sm" disabled={refreshing} onClick={onRefresh}>
                {refreshing ? "Atualizando..." : "Atualizar disponibilidade"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 pb-4 text-amber-700">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            Obrigado por comprar com a gente
          </span>
        </div>
      </div>
    </main>
  )
}
