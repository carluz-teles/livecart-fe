import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckoutHeader } from "./CheckoutHeader"
import type { PublicCheckoutCart } from "@/types"

interface CheckoutExpiredScreenProps {
  cart: PublicCheckoutCart
}

export function CheckoutExpiredScreen({ cart }: CheckoutExpiredScreenProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <CheckoutHeader storeName={cart.store.name} logoUrl={cart.store.logoUrl} />
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md animate-in fade-in-0 slide-in-from-bottom-4 border-amber-100 shadow-xl shadow-amber-100/50 duration-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-amber-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                <Clock className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">Carrinho Expirado</h2>
            <p className="mt-2 text-center text-gray-500 max-w-xs">
              O tempo para finalizar esta compra acabou. Entre em contato com a loja para solicitar um novo carrinho.
            </p>

            <div className="mt-8 w-full max-w-xs">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loja</span>
                  <span className="font-medium text-gray-900">{cart.store.name}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comprador</span>
                  <span className="font-medium text-gray-900">@{cart.platformHandle}</span>
                </div>
                {cart.summary.totalItems > 0 && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Itens no carrinho</span>
                      <span className="font-medium text-gray-900">{cart.summary.totalItems}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
