"use client"

import { useState } from "react"
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
            Um único plano. Todos os recursos.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Escolha o intervalo de cobrança que faz mais sentido pra você — sem
            comissão sobre vendas, nunca.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <PlanCard
            interval={billingInterval}
            onIntervalChange={setBillingInterval}
            ctaLabel="Testar 7 dias grátis"
            onCtaClick={() => router.push("/register")}
            features={features}
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Precisa de mais volume? Fale com a gente sobre o plano Enterprise.
        </p>
      </div>
    </section>
  )
}
