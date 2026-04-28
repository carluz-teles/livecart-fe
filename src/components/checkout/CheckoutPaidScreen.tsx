import { CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckoutHeader } from "./CheckoutHeader"
import type { PublicCheckoutCart } from "@/types"

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

interface CheckoutPaidScreenProps {
  cart: PublicCheckoutCart
}

export function CheckoutPaidScreen({ cart }: CheckoutPaidScreenProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <CheckoutHeader storeName={cart.store.name} logoUrl={cart.store.logoUrl} />
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md animate-in fade-in-0 slide-in-from-bottom-4 border-emerald-100 shadow-xl shadow-emerald-100/50 duration-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-emerald-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">Pagamento Confirmado!</h2>
            <p className="mt-2 text-center text-gray-500 max-w-xs">
              Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
            </p>

            <div className="mt-8 w-full max-w-xs">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loja</span>
                  <span className="font-medium text-gray-900">{cart.store.name}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(cart.summary.subtotal)}
                  </span>
                </div>
                {cart.paidAt && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pago em</span>
                      <span className="font-medium text-gray-900">
                        {new Date(cart.paidAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Compra realizada com sucesso</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
