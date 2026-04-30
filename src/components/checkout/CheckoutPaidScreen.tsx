import Image from "next/image"
import {
  CheckCircle,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Sparkles,
  Truck,
  User,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { resolveCarrierLogo } from "@/lib/carriers"
import { CheckoutHeader } from "./CheckoutHeader"
import type { PublicCheckoutCart } from "@/types"

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCpf(digits: string): string {
  const v = digits.replace(/\D/g, "")
  if (v.length !== 11) return digits
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
}

function formatPhone(digits: string): string {
  const v = digits.replace(/\D/g, "")
  if (v.length === 11) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  if (v.length === 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  return digits
}

function formatZip(digits: string): string {
  const v = digits.replace(/\D/g, "")
  if (v.length !== 8) return digits
  return `${v.slice(0, 5)}-${v.slice(5)}`
}

const CARD_BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  master: "Mastercard",
  mastercard: "Mastercard",
  amex: "American Express",
  elo: "Elo",
  hipercard: "Hipercard",
  diners: "Diners",
  discover: "Discover",
}

function brandLabel(brand?: string): string {
  if (!brand) return "Cartão de crédito"
  const key = brand.toLowerCase()
  return CARD_BRAND_LABELS[key] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
}

interface CheckoutPaidScreenProps {
  cart: PublicCheckoutCart
}

export function CheckoutPaidScreen({ cart }: CheckoutPaidScreenProps) {
  const { customer, shippingAddress, shipping, payment, summary, items, store } = cart
  const paidAtIso = payment?.paidAt ?? cart.paidAt
  const total = summary.hasShippingQuote ? summary.total : summary.subtotal
  const shippingCost = summary.hasShippingQuote ? summary.shippingCost : 0
  const isFreeShipping = shipping?.freeShipping ?? false

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <CheckoutHeader storeName={store.name} logoUrl={store.logoUrl} />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 border-emerald-100 shadow-xl shadow-emerald-100/50 duration-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-emerald-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
              Pagamento confirmado!
            </h2>
            <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-gray-500">
              Obrigado pela sua compra. Você receberá um email com os detalhes
              do pedido em instantes.
            </p>
            {paidAtIso && (
              <p className="mt-6 text-xs text-gray-400">
                Pago em {formatDateTime(paidAtIso)}
              </p>
            )}
          </CardContent>
        </Card>

        <Section icon={Package} title="Itens do pedido">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity}× {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-gray-900">
                  {formatCurrency(item.totalPrice)}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {(customer || shippingAddress) && (
          <Section icon={MapPin} title="Endereço de entrega">
            <div className="space-y-4">
              {customer && (
                <div className="space-y-2">
                  {customer.name && <Field icon={User} value={customer.name} />}
                  {customer.document && (
                    <Field icon={FileText} value={formatCpf(customer.document)} />
                  )}
                  {customer.phone && (
                    <Field icon={Phone} value={formatPhone(customer.phone)} />
                  )}
                  <Field icon={Mail} value={customer.email} />
                </div>
              )}

              {customer && shippingAddress && (
                <Separator className="bg-gray-100" />
              )}

              {shippingAddress && (
                <div className="text-sm leading-relaxed text-gray-700">
                  <p>
                    {shippingAddress.street}, {shippingAddress.number}
                    {shippingAddress.complement
                      ? ` — ${shippingAddress.complement}`
                      : ""}
                  </p>
                  <p>
                    {shippingAddress.neighborhood} · {shippingAddress.city}/
                    {shippingAddress.state}
                  </p>
                  <p className="text-gray-500">
                    CEP {formatZip(shippingAddress.zipCode)}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {shipping && (
          <Section icon={Truck} title="Frete">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                {(() => {
                  const logo = resolveCarrierLogo(shipping.carrier)
                  return logo ? (
                    <Image
                      src={logo}
                      alt={shipping.carrier}
                      fill
                      unoptimized
                      sizes="48px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <Truck className="h-5 w-5 text-gray-400" />
                  )
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {shipping.serviceName}
                </p>
                <p className="text-xs text-gray-500">
                  {shipping.carrier} · chega em até{" "}
                  <strong className="text-gray-700">{shipping.deadlineDays}</strong>{" "}
                  {shipping.deadlineDays === 1 ? "dia útil" : "dias úteis"}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {isFreeShipping ? (
                  <>
                    {shipping.realCostCents > 0 && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatCurrency(shipping.realCostCents)}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-emerald-600">
                      Grátis
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold tabular-nums text-gray-900">
                    {formatCurrency(shipping.costCents)}
                  </span>
                )}
              </div>
            </div>
          </Section>
        )}

        {payment && (
          <Section icon={CreditCard} title="Pagamento">
            <div className="space-y-3">
              {payment.method === "pix" ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">PIX</span>
                  <span className="text-gray-500">Pagamento à vista</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {brandLabel(payment.cardBrand)}
                    </span>
                    {payment.lastFourDigits && (
                      <span className="font-mono text-gray-500">
                        •••• {payment.lastFourDigits}
                      </span>
                    )}
                  </div>
                  {payment.installments && payment.installments > 0 && (
                    <p className="text-xs text-gray-500">
                      {payment.installments}x de{" "}
                      {formatCurrency(Math.round(total / payment.installments))}
                      {payment.installments === 1 ? " à vista" : ""}
                    </p>
                  )}
                </div>
              )}

              <Separator className="bg-gray-100" />

              <dl className="space-y-1.5 text-xs">
                {payment.authorizationCode && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-500">Código de autorização</dt>
                    <dd className="truncate font-mono text-gray-700">
                      {payment.authorizationCode}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">ID da transação</dt>
                  <dd className="truncate font-mono text-gray-700">
                    {payment.paymentId}
                  </dd>
                </div>
              </dl>
            </div>
          </Section>
        )}

        <Section icon={Receipt} title="Resumo">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">
                Subtotal · {summary.totalItems}{" "}
                {summary.totalItems === 1 ? "item" : "itens"}
              </dt>
              <dd className="tabular-nums text-gray-900">
                {formatCurrency(summary.subtotal)}
              </dd>
            </div>
            {summary.hasShippingQuote && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Frete</dt>
                <dd className="tabular-nums text-gray-900">
                  {isFreeShipping ? (
                    <span className="font-medium text-emerald-600">Grátis</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </dd>
              </div>
            )}
            <Separator className="my-3 bg-gray-100" />
            <div className="flex items-baseline justify-between">
              <dt className="font-medium text-gray-900">Total pago</dt>
              <dd className="text-lg font-bold tabular-nums text-gray-900">
                {formatCurrency(total)}
              </dd>
            </div>
          </dl>
        </Section>

        <div className="flex items-center justify-center gap-2 pb-4 text-emerald-600">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Compra realizada com sucesso</span>
        </div>
      </div>
    </main>
  )
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-2 border-gray-100 shadow-sm duration-500">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold tracking-tight text-gray-900">
            {title}
          </h3>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>
  value: string
}

function Field({ icon: Icon, value }: FieldProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
      <span className="truncate">{value}</span>
    </div>
  )
}
