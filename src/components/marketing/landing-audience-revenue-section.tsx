import { Users, Heart, MessagesSquare, ShoppingCart, CreditCard, TrendingUp } from "lucide-react"

const funnel = [
  { icon: Users, label: "Audiência" },
  { icon: Heart, label: "Interesse" },
  { icon: MessagesSquare, label: "Conversa" },
  { icon: ShoppingCart, label: "Intenção de compra" },
  { icon: CreditCard, label: "Checkout" },
  { icon: TrendingUp, label: "Venda" },
]

const assets = [
  "seguidores",
  "audiência",
  "comunidade",
  "conteúdo",
  "lives",
  "influência",
  "relacionamento",
]

export function LandingAudienceRevenueSection() {
  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Audiência → Receita
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Sua audiência pode virar seu próximo canal de receita
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Você já investe para construir {assets.join(", ")}. Mas audiência
            não é receita. A LiveCart conecta os dois.
          </p>
        </div>

        <div className="mx-auto mt-14 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {funnel.map((step, i) => (
            <span key={step.label} className="flex items-center gap-3">
              <span className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-4 text-center">
                <step.icon className="size-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{step.label}</span>
              </span>
              {i < funnel.length - 1 && (
                <span aria-hidden className="text-lg text-muted-foreground">
                  →
                </span>
              )}
            </span>
          ))}
        </div>

        <p className="mt-12 text-center text-xl font-bold tracking-tight sm:text-2xl">
          Transforme atenção em receita.
        </p>
      </div>
    </section>
  )
}
