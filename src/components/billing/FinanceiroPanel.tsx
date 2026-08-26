"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  MessageCircle,
  ReceiptText,
  Settings2,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { BILLING_INTERVAL_LABELS, PRO_PLAN_PRICE_CENTS } from "@/lib/constants"
import { usePeriodUsage, useStatement, useSubscription } from "@/hooks/billing"
import { useRevenueByPayment } from "@/hooks/dashboard"
import { PaymentMethodChart } from "@/components/analytics/PaymentMethodChart"
import { useWhatsAppRecoveryStats } from "@/hooks/integration"
import { cn } from "@/lib/utils"

export function FinanceiroPanel() {
  const [page, setPage] = useState(1)
  const { data: usage, isLoading: usageLoading } = usePeriodUsage()
  const { data: sub } = useSubscription()
  const { data: statement, isLoading: stmtLoading } = useStatement(page)
  const { data: recovery } = useWhatsAppRecoveryStats()
  const { data: revenueByPayment, isLoading: paymentLoading } = useRevenueByPayment()

  const flat = sub?.billingInterval ? PRO_PLAN_PRICE_CENTS[sub.billingInterval] : 0
  const isTrial = sub?.status === "trialing"
  const nextTotal = flat

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Suas vendas e o extrato do ciclo — sem surpresa na fatura.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/billing">
            <Settings2 className="size-4" />
            Plano e cobrança
          </Link>
        </Button>
      </div>

      {/* Hero: a história do sucesso */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" />
              Vendas do ciclo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(usage?.gmvCents ?? 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {usage?.sales ?? 0} pedidos pagos
                  {usage && usage.refunds > 0 ? ` · ${usage.refunds} estornos` : ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <MessageCircle className="size-4 text-primary" />
              Gerado pelo LiveCart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(recovery?.revenueRecoveredCents ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              recuperados pelo WhatsApp nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ReceiptText className="size-4 text-primary" />
              Próxima fatura {sub?.currentPeriodEnd && !isTrial
                ? `(${new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")})`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTrial ? (
              <>
                <p className="text-3xl font-bold">R$ 0,00</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Período de teste — sem cobrança até o fim do trial.
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">{formatCurrency(nextTotal)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Plano Pro · cobrança {sub?.billingInterval ? BILLING_INTERVAL_LABELS[sub.billingInterval].toLowerCase() : ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Assinatura fixa, sem comissão sobre vendas — o que você vende é 100% seu.
      </p>

      {/* Mix de pagamento (movido da Visão geral — assunto de dinheiro) */}
      <PaymentMethodChart data={revenueByPayment?.data ?? []} isLoading={paymentLoading} />

      {/* Extrato */}
      <Card>
        <CardHeader>
          <CardTitle>Extrato</CardTitle>
          <CardDescription>
            Cada venda e estorno do ciclo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stmtLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !statement || statement.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma movimentação ainda — as vendas das suas lives aparecem aqui.
            </p>
          ) : (
            <div className="divide-y">
              {statement.map((entry) => {
                const isSale = entry.type === "sale"
                const isRefund = entry.type === "refund_credit"
                const who = entry.customerName || entry.handle || "Cliente"
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        isSale ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {isSale ? (
                        <ArrowUpRight className="size-4" />
                      ) : (
                        <ArrowDownLeft className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {isSale ? `Venda · ${who}` : isRefund ? `Estorno · ${who}` : `Ajuste · ${who}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          entry.amountCents >= 0 ? "text-emerald-600" : "text-foreground"
                        )}
                      >
                        {entry.amountCents >= 0 ? "+" : "−"}
                        {formatCurrency(Math.abs(entry.amountCents))}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {statement && statement.length >= 30 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
