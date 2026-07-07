import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { MobileCarousel } from "./mobile-carousel"

const plans = [
  {
    name: "Start",
    price: "R$ 147",
    gmv: "1,8%",
    description: "Pra quem está começando a vender nas lives.",
    highlighted: false,
    cta: "Começar grátis",
  },
  {
    name: "Grow",
    price: "R$ 297",
    gmv: "1,3%",
    description: "Pra quem vende ao vivo toda semana.",
    highlighted: true,
    cta: "Começar grátis",
  },
  {
    name: "Scale",
    price: "R$ 697",
    gmv: "1,0%",
    description: "Pra operações em ritmo acelerado.",
    highlighted: false,
    cta: "Começar grátis",
  },
  {
    name: "Enterprise",
    price: "Na medida",
    gmv: null,
    description: "Pra alto volume e times grandes.",
    highlighted: false,
    cta: "Falar com vendas",
  },
]

// Tudo incluído em todos os planos: sem limites, sem trava de funcionalidade.
const includedFeatures = [
  "Lives ilimitadas",
  "Pedidos ilimitados",
  "Usuários ilimitados",
  "Checkout com PIX e cartão em 12x",
  "Automações no direct e e-mail",
  "Upsell, order bump e cupons",
  "Recuperação de carrinho",
  "Retentativa transparente",
  "Lista de espera automática",
  "Integrações de pagamento, ERP e frete",
]

export function LandingPricing() {
  return (
    <section id="precos" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Planos
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Planos que crescem com as suas vendas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comece grátis e faça o upgrade só quando precisar. Escolha pela
            mensalidade e pela taxa sobre os pedidos pagos, com todos os
            recursos em todos os planos.
          </p>
        </div>

        {/* Plans */}
        <MobileCarousel
          wrapperClassName="mt-16"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 sm:pt-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex w-full min-w-full shrink-0 snap-start flex-col rounded-2xl border p-6 sm:w-auto sm:min-w-0",
                plan.highlighted
                  ? "border-primary bg-card shadow-lg ring-1 ring-primary"
                  : "border-border bg-card"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Mais popular
                </span>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.gmv && (
                  <span className="text-sm text-muted-foreground">/mês</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-primary">
                {plan.gmv
                  ? `+ ${plan.gmv} sobre pedidos pagos`
                  : "Mensalidade e taxa negociadas"}
              </p>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-6 w-full"
              >
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </MobileCarousel>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          A taxa sobre pedidos pagos (% do GMV) incide apenas sobre o valor dos
          pedidos efetivamente pagos. Sem taxa de setup.
        </p>

        {/* Everything included */}
        <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-8 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl font-bold">
              Tudo incluído, em qualquer plano
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sem limite de pedidos, usuários ou lives. Você só troca de plano
              quando quiser uma taxa menor sobre os pedidos pagos, nunca para
              liberar um recurso.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-x-8 gap-y-3 sm:grid-cols-2">
            {includedFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
