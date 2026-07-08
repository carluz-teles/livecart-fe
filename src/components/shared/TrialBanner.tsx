"use client"

import Link from "next/link"
import { Sparkles, AlertTriangle } from "lucide-react"

import { useUser } from "@/hooks/useUser"

// TrialBanner (PRD 007): dias restantes do trial ou aviso de grace period.
// Some quando a assinatura está ativa (ou sem dados de assinatura).
export function TrialBanner() {
  const { user } = useUser()
  const sub = user?.subscription

  // Kill switch: paywall desativado = sem banners de pressão
  if (!sub || !sub.enforced) return null

  if (sub.status === "trialing" && sub.trialDaysLeft > 0) {
    return (
      <div className="flex items-center justify-center gap-2 bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground print:hidden">
        <Sparkles className="size-4 shrink-0" />
        <span>
          {sub.trialDaysLeft === 1
            ? "Último dia de teste grátis"
            : `${sub.trialDaysLeft} dias de teste grátis restantes`}
        </span>
        <Link href="/paywall" className="underline underline-offset-2 hover:opacity-80">
          Escolher plano
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
