"use client"

import Image from "next/image"
import { PartyPopper, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { PublicCheckoutWaitlistItem } from "@/types"

interface CheckoutPromotionBannerProps {
  /** Notified waitlist entries — promoted products that just opened up for
   *  this buyer because the previous holder dropped out. Waiting entries
   *  belong in CheckoutWaitlistSection and are filtered out by the caller. */
  items: PublicCheckoutWaitlistItem[]
}

export function CheckoutPromotionBanner({ items }: CheckoutPromotionBannerProps) {
  if (items.length === 0) return null

  const single = items.length === 1
  const product = items[0]

  return (
    <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 shadow-sm shadow-emerald-100/40 animate-in fade-in-0 slide-in-from-top-2 duration-500">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
          <PartyPopper className="h-5 w-5" />
          <span className="absolute -inset-1 animate-ping rounded-xl bg-emerald-400/30" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Boas notícias
            </p>
            <h3 className="text-sm font-semibold leading-snug text-gray-900">
              {single
                ? `${product.productName} liberou pra você`
                : `${items.length} produtos da sua fila liberaram`}
            </h3>
          </div>

          <p className="text-sm leading-relaxed text-gray-600">
            {single ? (
              <>
                O cliente anterior desistiu, então o item já entrou no seu
                pedido. É só finalizar a compra como sempre — pagando, a
                unidade fica garantida.
              </>
            ) : (
              <>
                Os clientes anteriores desistiram e os itens já entraram no
                seu pedido. Finalize a compra pra garantir todos.
              </>
            )}
          </p>

          {!single && (
            <ul className="space-y-2 pt-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-emerald-100/80 bg-white/70 p-2.5"
                >
                  <ProductThumb image={item.productImage} name={item.productName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity}× já adicionado ao pedido
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductThumb({
  image,
  name,
}: {
  image: string | null
  name: string
}) {
  if (!image) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
        <Package className="h-4 w-4" />
      </div>
    )
  }
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
      <Image src={image} alt={name} fill sizes="40px" className="object-cover" />
    </div>
  )
}
