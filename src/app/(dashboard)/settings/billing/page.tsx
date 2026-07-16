"use client"

import { Suspense } from "react"
import { Check, CreditCard, ExternalLink, Loader2, Sparkles } from "lucide-react"
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
import { cn } from "@/lib/utils"
import {
  useBillingActivation,
  useChangePlan,
  useOpenPortal,
  useStartCheckout,
} from "@/hooks/billing"
import type { ApiError } from "@/types"

type PlanID = "start" | "grow" | "scale"

const plans: { id: PlanID; name: string; price: string; gmv: string; flatCents: number }[] = [
  { id: "start", name: "Start", price: "R$ 147", gmv: "1,8%", flatCents: 14700 },
  { id: "grow", name: "Grow", price: "R$ 297", gmv: "1,3%", flatCents: 29700 },
  { id: "scale", name: "Scale", price: "R$ 697", gmv: "1,0%", flatCents: 69700 },
]

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
  const changePlan = useChangePlan()

  const badge = statusBadge[sub?.status ?? ""] ?? { label: sub?.status ?? "—", variant: "outline" as const }
  const isTrial = sub?.status === "trialing" || sub?.status === "paused"
  const currentFlat = plans.find((p) => p.id === sub?.plan)?.flatCents ?? 0
  // Durante o trial o BE ancora a assinatura no Grow, mas o lojista ainda não
  // escolheu nada — não exibir isso como "plano contratado".
  const planName =
    sub?.plan === "enterprise"
      ? "Enterprise"
      : plans.find((p) => p.id === sub?.plan)?.name ?? "—"

  const handlePlanAction = (plan: PlanID) => {
    if (isTrial || !sub?.hasPaymentMethod) {
      checkout.mutate(plan, {
        onError: (err) =>
          toast.error((err as unknown as ApiError)?.message || "Falha ao abrir o pagamento."),
      })
      return
    }
    const target = plans.find((p) => p.id === plan)!
    changePlan.mutate(plan, {
      onSuccess: () =>
        toast.success(
          target.flatCents > currentFlat
            ? `Upgrade para o ${target.name} aplicado!`
            : `Mudança para o ${target.name} agendada para o próximo ciclo.`
        ),
      onError: (err) =>
        toast.error((err as unknown as ApiError)?.message || "Falha ao mudar de plano."),
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
          {sub?.currentPeriodEnd && sub.status === "active" && (
            <p className="text-sm text-muted-foreground">
              Próxima cobrança em{" "}
              {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
            </p>
          )}

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
              Gerenciar pagamento e faturas
              <ExternalLink className="size-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Planos</CardTitle>
          <CardDescription>
            Todos os recursos em todos os planos. A diferença é a mensalidade e a
            taxa sobre pedidos pagos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = sub?.plan === plan.id && !isTrial
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-xl border p-5",
                    isCurrent ? "border-primary ring-1 ring-primary" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {isCurrent && (
                      <Badge variant="default" className="gap-1">
                        <Check className="size-3" /> Atual
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-primary">
                    + {plan.gmv} sobre pedidos pagos
                  </p>
                  <Button
                    className="mt-4 w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || checkout.isPending || changePlan.isPending}
                    onClick={() => handlePlanAction(plan.id)}
                  >
                    {checkout.isPending || changePlan.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isCurrent ? (
                      "Plano atual"
                    ) : isTrial || !sub?.hasPaymentMethod ? (
                      `Assinar ${plan.name}`
                    ) : plan.flatCents > currentFlat ? (
                      `Fazer upgrade`
                    ) : (
                      `Mudar no próximo ciclo`
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Upgrades são aplicados na hora (com cobrança proporcional). Downgrades
            valem a partir do próximo ciclo. Precisa de volume Enterprise? Fale com
            a gente.
          </p>
        </CardContent>
      </Card>
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
