"use client"

import { Suspense, useState } from "react"
import { CreditCard, ExternalLink, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PlanCard } from "@/components/billing/PlanCard"
import { formatCurrency } from "@/lib/format"
import { BILLING_INTERVAL_LABELS, PRO_PLAN_PRICE_CENTS } from "@/lib/constants"
import { useBillingActivation, useOpenPortal, useStartCheckout } from "@/hooks/billing"
import type { ApiError, BillingInterval } from "@/types"

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  trialing: { label: "Período de teste", variant: "secondary" },
  active: { label: "Ativa", variant: "default" },
  past_due: { label: "Pagamento pendente", variant: "destructive" },
  paused: { label: "Pausada", variant: "destructive" },
  unpaid: { label: "Inadimplente", variant: "destructive" },
  canceled: { label: "Cancelada", variant: "outline" },
}

function BillingContent() {
  // Retorno do Stripe Checkout (?billing=success): o hook cuida do toast,
  // do polling até a ativação e do re-sync do usuário.
  const { subscription: sub, isLoading, isActivating } = useBillingActivation()
  const checkout = useStartCheckout()
  const portal = useOpenPortal()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly")

  const badge = statusBadge[sub?.status ?? ""] ?? { label: sub?.status ?? "—", variant: "outline" as const }
  const isTrial = sub?.status === "trialing" || sub?.status === "paused"
  const isSubscribed = sub?.plan === "pro" && !isTrial
  const planName = sub?.plan === "enterprise" ? "Enterprise" : isSubscribed ? "Pro" : "—"

  const handleSubscribe = () => {
    checkout.mutate(billingInterval, {
      onError: (err) =>
        toast.error((err as unknown as ApiError)?.message || "Falha ao abrir o pagamento."),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Assinatura atual */}
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Seu plano e status de cobrança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold">
              {isTrial ? "Teste grátis" : planName}
            </span>
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {isActivating && (
              <Badge variant="secondary" className="gap-1.5">
                <Loader2 className="size-3 animate-spin" />
                Ativando assinatura…
              </Badge>
            )}
            {sub?.cancelAtPeriodEnd && (
              <Badge variant="outline">Cancela no fim do ciclo</Badge>
            )}
          </div>

          {isActivating && (
            <p className="text-sm text-muted-foreground">
              Pagamento configurado! Estamos confirmando sua assinatura com a
              operadora — isso leva só alguns segundos.
            </p>
          )}

          {isTrial && !isActivating && (
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                {sub?.status === "trialing" && sub.trialDaysLeft > 0 ? (
                  <span>
                    Seu teste grátis termina em{" "}
                    <strong>
                      {sub.trialEndsAt
                        ? new Date(sub.trialEndsAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                          })
                        : `${sub.trialDaysLeft} dias`}
                    </strong>
                    {sub.trialEndsAt
                      ? ` (${sub.trialDaysLeft === 1 ? "amanhã" : `${sub.trialDaysLeft} dias`})`
                      : ""}
                    , com todos os recursos liberados até lá.
                  </span>
                ) : (
                  <span>Seu período de teste terminou.</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Você ainda não tem um plano contratado — assine abaixo pra não perder o acesso
                quando o teste acabar.
              </p>
            </div>
          )}
          {isSubscribed && (
            <p className="text-sm text-muted-foreground">
              {formatCurrency(PRO_PLAN_PRICE_CENTS[sub!.billingInterval])} · cobrança{" "}
              {BILLING_INTERVAL_LABELS[sub!.billingInterval].toLowerCase()}
            </p>
          )}
          {sub?.currentPeriodEnd &&
            sub.status === "active" &&
            (sub.cancelAtPeriodEnd ? (
              <p className="text-sm text-muted-foreground">
                Assinatura cancelada — você tem acesso até{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")} (sem
                renovação).
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Próxima cobrança em{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            ))}

          {sub?.hasPaymentMethod && (
            <Button
              variant="outline"
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
            >
              {portal.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Gerenciar assinatura
              <ExternalLink className="size-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plano */}
      {isSubscribed ? (
        <Card>
          <CardHeader>
            <CardTitle>Plano</CardTitle>
            <CardDescription>
              Sem comissão sobre vendas. Para trocar o intervalo de cobrança, use o
              portal de assinatura acima — ele cuida da proração automaticamente.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Plano Pro</CardTitle>
            <CardDescription>
              Todos os recursos incluídos, sem comissão sobre vendas. Escolha o
              intervalo de cobrança.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm">
              <PlanCard
                interval={billingInterval}
                onIntervalChange={setBillingInterval}
                ctaLabel="Assinar Pro"
                ctaLoading={checkout.isPending}
                ctaDisabled={checkout.isPending}
                onCtaClick={handleSubscribe}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


// useSearchParams() exige Suspense boundary no build de produção (CSR bailout).
export default function BillingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <BillingContent />
    </Suspense>
  )
}
