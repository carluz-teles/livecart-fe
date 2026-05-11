"use client"

import Image from "next/image"
import { Clock, Hourglass, Sparkles, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckoutExpirationTimer } from "./CheckoutExpirationTimer"
import { useDropFromWaitlist } from "@/hooks/checkout"
import { cn } from "@/lib/utils"
import type { PublicCheckoutWaitlistItem } from "@/types"

interface CheckoutWaitlistSectionProps {
  token: string
  items: PublicCheckoutWaitlistItem[]
  /** Disparado quando o timer de qualquer item 'notified' expira — o pai
   *  invalida o cart pra que a UI reflita o estado pós-expiração (item
   *  voltou para 'waiting' ou foi promovido outro cliente). */
  onNotifiedExpired?: () => void
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
  onNotifiedExpired,
}: CheckoutWaitlistSectionProps) {
  const dropMutation = useDropFromWaitlist()

  if (items.length === 0) return null

  const notified = items.filter((i) => i.status === "notified")
  const waiting = items.filter((i) => i.status === "waiting")

  return (
    <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-sm font-medium text-amber-900">
            Produtos em fila de espera
          </CardTitle>
        </div>
        <p className="text-xs leading-relaxed text-amber-800/80">
          Estes itens estavam esgotados quando você pediu. Você pode finalizar a
          compra apenas com os itens disponíveis acima — avisaremos no Instagram
          assim que liberar.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {notified.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Disponíveis para finalizar agora
            </div>
            {notified.map((item) => (
              <NotifiedRow
                key={item.id}
                token={token}
                item={item}
                onExpired={onNotifiedExpired}
                onDrop={() =>
                  dropMutation.mutate({ token, waitlistItemId: item.id })
                }
                disabled={dropMutation.isPending}
              />
            ))}
          </div>
        )}

        {notified.length > 0 && waiting.length > 0 && <Separator />}

        {waiting.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
              <Clock className="h-3.5 w-3.5" />
              Aguardando estoque
            </div>
            {waiting.map((item) => (
              <WaitingRow
                key={item.id}
                item={item}
                onDrop={() =>
                  dropMutation.mutate({ token, waitlistItemId: item.id })
                }
                disabled={dropMutation.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RowProps {
  item: PublicCheckoutWaitlistItem
  onDrop: () => void
  disabled?: boolean
}

interface NotifiedRowProps extends RowProps {
  token: string
  onExpired?: () => void
}

function NotifiedRow({ item, onExpired, onDrop, disabled }: NotifiedRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-white p-3">
      <div className="flex items-start gap-3">
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
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              Disponível!
            </Badge>
          </div>
        </div>
      </div>
      {item.expiresAt && (
        <CheckoutExpirationTimer
          expiresAt={item.expiresAt}
          onExpired={onExpired}
        />
      )}
      <DropButton onClick={onDrop} disabled={disabled} />
    </div>
  )
}

function WaitingRow({ item, onDrop, disabled }: RowProps) {
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
        <DropButton onClick={onDrop} disabled={disabled} compact />
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
  compact,
}: {
  onClick: () => void
  disabled?: boolean
  compact?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-7 self-start px-2 text-xs text-gray-500 hover:text-red-600",
        compact && "mt-2",
      )}
    >
      <X className="mr-1 h-3.5 w-3.5" />
      Sair da fila
    </Button>
  )
}
