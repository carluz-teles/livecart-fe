"use client"

import Link from "next/link"
import { Sparkles, AlertTriangle } from "lucide-react"

import { useUser } from "@/hooks/useUser"

// TrialBanner (PRD 007): dias restantes do trial, aviso de grace period, ou
// aviso de assinatura cancelada (acesso até o fim do ciclo). Some quando a
// assinatura está ativa e vigente (ou sem dados de assinatura).
export function TrialBanner() {
  const { user } = useUser()
  const sub = user?.subscription

  // Kill switch: paywall desativado = sem banners de pressão
  if (!sub || !sub.enforced) return null

  if (sub.status === "trialing" && sub.trialDaysLeft > 0) {
    const endDate = sub.trialEndsAt
      ? new Date(sub.trialEndsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      : null

    // Reta final (<= 2 dias): urgência real — assine antes de perder o acesso
    if (sub.trialDaysLeft <= 2) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-sm font-medium text-white print:hidden">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Seu teste grátis está terminando
            {endDate ? ` (${sub.trialDaysLeft === 1 ? "amanhã" : endDate})` : ""} — assine antes
            de perder o acesso.
          </span>
          <Link
            href="/settings/billing"
            className="rounded-md bg-white/15 px-2.5 py-0.5 underline-offset-2 transition-colors hover:bg-white/25"
          >
            Assinar agora
          </Link>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center gap-2 bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground print:hidden">
        <Sparkles className="size-4 shrink-0" />
        <span>
          {sub.trialDaysLeft} dias de teste grátis restantes
          {endDate ? ` — termina em ${endDate}` : ""}
        </span>
        <Link href="/settings/billing" className="underline underline-offset-2 hover:opacity-80">
          Escolher plano
        </Link>
      </div>
    )
  }

  // Assinatura cancelada mas ainda vigente: informa até quando o acesso vale.
  if (sub.cancelAtPeriodEnd) {
    const accessUntil = sub.currentPeriodEnd
      ? new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-sm font-medium text-white print:hidden">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          Sua assinatura foi cancelada
          {accessUntil ? ` — você tem acesso até ${accessUntil}` : ""}.
        </span>
        <Link
          href="/settings/billing"
          className="rounded-md bg-white/15 px-2.5 py-0.5 underline-offset-2 transition-colors hover:bg-white/25"
        >
          Reativar assinatura
        </Link>
      </div>
    )
  }

  if (sub.status === "past_due") {
    return (
      <div className="flex items-center justify-center gap-2 bg-destructive px-4 py-1.5 text-sm font-medium text-destructive-foreground print:hidden">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Não conseguimos cobrar seu cartão. Atualize o pagamento pra manter o acesso.</span>
        <Link href="/paywall" className="underline underline-offset-2 hover:opacity-80">
          Resolver agora
        </Link>
      </div>
    )
  }

  return null
}
