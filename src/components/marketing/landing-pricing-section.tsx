import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"

const sharedFeatures = [
  "Instagram e lives",
  "Carrinho e checkout automáticos",
  "Recuperação de vendas e carrinhos",
  "Integrações de pagamento, ERP e frete",
]

const plans = [
  {
    name: "Start",
    price: "R$ 147",
    period: "/mês",
    description: "+ 1,6% sobre pedidos pagos. Para quem está começando a vender nas redes.",
    features: sharedFeatures,
    cta: "Testar 7 dias grátis",
    highlighted: false,
  },
  {
    name: "Grow",
    price: "R$ 297",
    period: "/mês",
    description: "+ 1,2% sobre pedidos pagos. Para operações com lives e vendas recorrentes.",
    features: sharedFeatures,
    cta: "Testar 7 dias grátis",
    highlighted: true,
    badge: "Recomendado",
  },
  {
    name: "Scale",
    price: "R$ 697",
    period: "/mês",
    description: "+ 0,8% sobre pedidos pagos. Para alto volume e times maiores.",
    features: sharedFeatures,
    cta: "Testar 7 dias grátis",
    highlighted: false,
  },
]

export function LandingPricingSection() {
  return (
    <section id="precos" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Preços
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Comece grátis. Escale quando vender mais.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Todos os recursos em todos os planos. A diferença é a mensalidade
            e a taxa sobre pedidos pagos.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? "flex flex-col gap-4 rounded-2xl border-[1.5px] border-primary bg-card p-7 shadow-[0_16px_34px_-16px] shadow-primary/45"
                  : "flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm"
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.badge && (
                  <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="flex min-h-12 items-baseline gap-1.5">
                <span
                  className={
                    plan.period
                      ? "text-3xl font-extrabold tracking-tight"
                      : "text-2xl font-extrabold tracking-tight"
                  }
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>

              <p className="min-h-10 text-sm leading-snug text-muted-foreground">
                {plan.description}
              </p>

              <div className="h-px bg-border" />

              <div className="flex flex-col gap-2.5 text-sm">
                {plan.features.map((feature) => (
                  <span key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    {feature}
                  </span>
                ))}
              </div>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-auto h-11"
              >
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Precisa de mais volume? Fale com a gente sobre o plano Enterprise.
        </p>
      </div>
    </section>
  )
}
