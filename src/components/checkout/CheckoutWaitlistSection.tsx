"use client"

import Image from "next/image"
import { Hourglass, Loader2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDropFromWaitlist } from "@/hooks/checkout"
import { cn } from "@/lib/utils"
import type { PublicCheckoutWaitlistItem } from "@/types"

interface CheckoutWaitlistSectionProps {
  token: string
  items: PublicCheckoutWaitlistItem[]
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function CheckoutWaitlistSection({
  token,
  items,
}: CheckoutWaitlistSectionProps) {
  const dropMutation = useDropFromWaitlist()

  // Only waiting entries belong in this section. Notified items are already
  // back in the cart as regular products and are surfaced via the dedicated
  // promotion banner at the top of the checkout — duplicating them here (with
  // a per-item timer that's actually just the global cart TTL) confused buyers.
  const waiting = items.filter((i) => i.status === "waiting")
  if (waiting.length === 0) return null

  return (
    <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-sm font-medium text-amber-900">
            Aguardando estoque
          </CardTitle>
        </div>
        <p className="text-xs leading-relaxed text-amber-800/80">
          Estes itens estavam esgotados quando você pediu. Você pode finalizar a
          compra apenas com os itens disponíveis acima — avisaremos no Instagram
          assim que liberar.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {waiting.map((item) => (
          <WaitingRow
            key={item.id}
            item={item}
            onDrop={() => {
              // Uma saída por vez: cada clique extra é outra requisição sobre a
              // mesma fila, e a segunda resposta sobrescreve a primeira.
              if (dropMutation.isPending) return
              dropMutation.mutate({ token, waitlistItemId: item.id })
            }}
            disabled={dropMutation.isPending}
            busy={dropMutation.variables?.waitlistItemId === item.id}
          />
        ))}
      </CardContent>
    </Card>
  )
}

interface RowProps {
  item: PublicCheckoutWaitlistItem
  onDrop: () => void
  disabled?: boolean
  /** Esta linha é a que está saindo. Com várias na fila, o `disabled` sozinho
   *  desabilita todas e não diz qual delas está processando. */
  busy?: boolean
}

function WaitingRow({ item, onDrop, disabled, busy }: RowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-white/70 p-3">
      <ProductThumb image={item.productImage} name={item.productName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {item.productName}
            </p>
            <p className="text-xs text-gray-500">
              {item.quantity}x · {formatPrice(item.unitPrice)}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            Posição #{item.position}
          </Badge>
        </div>
        <DropButton onClick={onDrop} disabled={disabled} busy={busy} compact />
      </div>
    </div>
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
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
        <Hourglass className="h-5 w-5" />
      </div>
    )
  }
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
      <Image src={image} alt={name} fill sizes="48px" className="object-cover" />
    </div>
  )
}

function DropButton({
  onClick,
  disabled,
  busy,
  compact,
}: {
  onClick: () => void
  disabled?: boolean
  busy?: boolean
  compact?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      className={cn(
        "h-7 self-start px-2 text-xs text-gray-500 hover:text-red-600",
        compact && "mt-2",
      )}
    >
      {busy ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <X className="mr-1 h-3.5 w-3.5" />
      )}
      {busy ? "Saindo..." : "Sair da fila"}
    </Button>
  )
}
