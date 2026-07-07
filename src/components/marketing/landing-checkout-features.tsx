import {
  RefreshCcw,
  RotateCcw,
  Ticket,
  PlusCircle,
  MousePointerClick,
  Users,
} from "lucide-react"

import { MobileCarousel } from "./mobile-carousel"

const features = [
  {
    icon: RefreshCcw,
    title: "Retentativa Transparente",
    description:
      "Quando o cartão é recusado, a LiveCart tenta de novo por outro gateway, sem o cliente perceber. Você recupera até 30% das vendas negadas.",
    highlighted: true,
  },
  {
    icon: RotateCcw,
    title: "Recuperação de carrinhos",
    description:
      "Quem abandonou volta com um novo link de checkout gerado na hora, antes da venda esfriar.",
  },
  {
    icon: Ticket,
    title: "Cupom personalizado",
    description:
      "Percentual, valor fixo ou frete grátis, com limite de uso, valor mínimo e validade.",
  },
  {
    icon: PlusCircle,
    title: "Order Bump",
    description:
      "Um produto extra com um clique, direto no resumo da compra. Ticket médio lá em cima.",
  },
  {
    icon: MousePointerClick,
    title: "Upsell 1-click",
    description:
      "Ofertas aceitas com um clique após o pagamento, sem redigitar nada do cartão.",
  },
  {
    icon: Users,
    title: "Lista de espera automática",
    description:
      "Produto esgotou? O cliente entra na fila e é avisado assim que abre uma vaga, sem perder a venda.",
  },
]

export function LandingCheckoutFeatures() {
  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Recursos
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que o seu checkout precisa pra vender mais
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ferramentas de conversão prontas pra usar, do cupom à venda
            recuperada no cartão.
          </p>
        </div>

        <MobileCarousel
          wrapperClassName="mt-16"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className={
                f.highlighted
                  ? "w-full min-w-full shrink-0 snap-start rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-6 sm:min-w-0"
                  : "w-full min-w-full shrink-0 snap-start rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md sm:min-w-0"
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    f.highlighted
                      ? "flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                      : "flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  }
                >
                  <f.icon className="size-5" />
                </span>
                {f.highlighted && (
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    Exclusivo LiveCart
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </MobileCarousel>
      </div>
    </section>
  )
}
