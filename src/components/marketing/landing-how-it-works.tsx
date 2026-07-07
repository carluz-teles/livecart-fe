import { MessagesSquare, ShoppingCart, Send, RefreshCw, ArrowDown } from "lucide-react"

const steps = [
  {
    icon: MessagesSquare,
    title: "O público comenta",
    caption: "A palavra-chave vira pedido",
  },
  {
    icon: ShoppingCart,
    title: "O carrinho monta sozinho",
    caption: "Produto reservado na hora",
  },
  {
    icon: Send,
    title: "O checkout vai pro direct",
    caption: "PIX ou cartão, em segundos",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="bg-background py-20 sm:py-28">
      <style>{`@keyframes lc-flow{to{background-position:24px 0}}`}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Como funciona
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Um fluxo que não para de vender
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Do comentário ao pagamento, tudo acontece em sequência, enquanto
            você foca em vender ao vivo.
          </p>
        </div>

        <div className="relative mt-20 grid gap-14 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              {/* Flowing connector to the next step (desktop) */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-1/2 top-8 hidden h-0.5 w-[calc(100%+2rem)] -translate-y-1/2 lg:block"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, hsl(var(--primary)) 0 12px, transparent 12px 24px)",
                    backgroundSize: "24px 2px",
                    animation: "lc-flow 1s linear infinite",
                  }}
                />
              )}

              {/* Node */}
              <div className="relative z-10">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg ring-8 ring-background">
                  <step.icon className="size-6" />
                </div>
                <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                {step.caption}
              </p>

              {/* Down arrow between steps (mobile) */}
              {i < steps.length - 1 && (
                <ArrowDown className="mt-8 size-5 animate-bounce text-primary/50 lg:hidden" />
              )}
            </div>
          ))}
        </div>

        {/* Continuous loop hint */}
        <div className="mt-16 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <RefreshCw className="size-4" />
            A cada nova live, o ciclo recomeça sozinho
          </span>
        </div>
      </div>
    </section>
  )
}
