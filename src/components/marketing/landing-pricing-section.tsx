"use client"

import { useState } from "react"
import Link from "next/link"
import { trackMarketingEvent } from "@/lib/marketing/analytics"
import { useRouter } from "next/navigation"

import { PlanCard } from "@/components/billing/PlanCard"
import type { BillingInterval } from "@/types"

const features = [
  "Instagram e lives",
  "Carrinho e checkout automáticos",
  "Recuperação de vendas e carrinhos",
  "Integrações de pagamento, ERP e frete",
]

export function LandingPricingSection() {
  const router = useRouter()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly")

  return (
    <section id="precos" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Preços
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Plano Pro para sua operação de vendas.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Escolha o intervalo de cobrança que faz mais sentido pra você — sem
            comissão do LiveCart sobre as vendas. Tarifas dos provedores são cobradas separadamente.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <PlanCard
            interval={billingInterval}
            onIntervalChange={setBillingInterval}
            ctaLabel="Testar 7 dias grátis"
            onCtaClick={() => { trackMarketingEvent("lc_trial_click", { placement: "pricing" }); router.push("/register") }}
            features={features}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/precos" className="underline underline-offset-4">Veja os períodos de cobrança, custos dos provedores e condições de volume.</Link>
        </p>
      </div>
    </section>
  )
}
