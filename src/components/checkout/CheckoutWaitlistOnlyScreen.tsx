"use client"

import { Hourglass, Instagram, Mail, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckoutHeader } from "./CheckoutHeader"
import { CheckoutWaitlistSection } from "./CheckoutWaitlistSection"
import type { PublicCheckoutCart } from "@/types"

interface CheckoutWaitlistOnlyScreenProps {
  cart: PublicCheckoutCart
  onUpdated?: () => void
}

export function CheckoutWaitlistOnlyScreen({
  cart,
  onUpdated,
}: CheckoutWaitlistOnlyScreenProps) {
  const hasNotified = cart.waitlistItems.some((i) => i.status === "notified")
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
              {hasNotified
                ? "Sua vez chegou!"
                : "Você está na fila de espera"}
            </h2>
            <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-gray-500">
              {hasNotified ? (
                <>
                  Alguns produtos liberaram. Garanta o seu antes do tempo
                  acabar — saindo da fila, ele volta a ser oferecido para o
                  próximo da lista.
                </>
              ) : (
                <>
                  Os produtos que você pediu estavam esgotados no momento do
                  pedido. Vamos te avisar assim que liberar — sem fila dupla,
                  sem sorteio: ordem de chegada.
                </>
              )}
            </p>

            {handle && (
              <div className="mt-6 flex items-center gap-2 rounded-full border border-amber-100 bg-white px-4 py-2 text-xs text-amber-900 shadow-sm">
                <Instagram className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  Aviso vai pro Instagram{" "}
                  <strong className="font-semibold">@{handle}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <CheckoutWaitlistSection
          token={cart.token}
          items={cart.waitlistItems}
          onNotifiedExpired={onUpdated}
        />

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5 text-sm text-gray-600">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="leading-relaxed">
              Fique de olho no DM do Instagram. Quando seu produto liberar,
              você recebe um link pra finalizar a compra aqui mesmo.
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 pb-4 text-amber-700">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            Obrigado por participar da live
          </span>
        </div>
      </div>
    </main>
  )
}
