import { Database, CreditCard, Truck, LayoutGrid } from "lucide-react"

const categories = [
  {
    icon: Database,
    title: "ERP",
    description: "Sincronize produtos, estoque, pedidos e informações da operação.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos",
    description: "Envie o cliente para um checkout preparado para finalizar a compra.",
  },
  {
    icon: Truck,
    title: "Frete",
    description: "Integre a etapa de entrega à jornada do pedido.",
  },
  {
    icon: LayoutGrid,
    title: "Catálogo",
    description: "Use os produtos e informações que você já tem para alimentar as vendas.",
  },
]

const logos = [
  { alt: "Pagar.me", src: "/integrations/pagarme.svg" },
  { alt: "olist", src: "/integrations/tiny.svg" },
  { alt: "Melhor Envio", src: "/integrations/melhor-envio.svg" },
  { alt: "SmartEnvios", src: "/integrations/smartenvios.png" },
]

export function LandingIntegrationsSection() {
  return (
    <section id="integracoes" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Integrações
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Conecta com tudo que a sua loja usa
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Do pagamento à entrega, a LiveCart já vem com as integrações que a
            sua operação precisa. Ligue pagamento, ERP e frete e pare de
            digitar o mesmo pedido duas vezes.
          </p>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {logos.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="h-7 w-auto object-contain opacity-75"
            />
          ))}
        </div>

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <category.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{category.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          Novas integrações de pagamento, ERP, frete e catálogo chegando toda
          semana.
        </p>
      </div>
    </section>
  )
}
