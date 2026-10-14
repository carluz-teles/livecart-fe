import { Database, CreditCard, Truck, MessagesSquare } from "lucide-react"
import { IntegrationCardLogo } from "@/components/integration/IntegrationCard/IntegrationCard.Logo"
import type { IntegrationProvider } from "@/types/integration.types"

const categories = [
  {
    icon: Database,
    title: "ERP",
    description: "Conecte Tiny (Olist) ou Bling para sincronizar produtos, estoque e pedidos.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos",
    description: "Receba por Pix e cartão de crédito com Pagar.me ou Mercado Pago.",
  },
  {
    icon: Truck,
    title: "Frete",
    description: "Cote fretes e gerencie seus envios com Melhor Envio ou SmartEnvios.",
  },
  {
    icon: MessagesSquare,
    title: "Canais",
    description: "Venda pelo Instagram e recupere carrinhos pelo WhatsApp da sua loja.",
  },
]

const integrations: { provider: IntegrationProvider; name: string; src?: string }[] = [
  { provider: "tiny", name: "Tiny (Olist)", src: "/integrations/tiny.svg" },
  { provider: "bling", name: "Bling" },
  { provider: "pagarme", name: "Pagar.me", src: "/integrations/pagarme.svg" },
  { provider: "mercado_pago", name: "Mercado Pago" },
  { provider: "melhor_envio", name: "Melhor Envio", src: "/integrations/melhor-envio.svg" },
  { provider: "smartenvios", name: "SmartEnvios", src: "/integrations/smartenvios.png" },
  { provider: "instagram", name: "Instagram" },
  { provider: "twilio_whatsapp", name: "WhatsApp" },
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
            Suas vendas conectadas à sua operação
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Do primeiro comentário à entrega, conecte seus canais de venda,
            ERP, pagamentos e frete. Menos trabalho manual para a sua loja.
          </p>
        </div>

        <ul aria-label="Integrações disponíveis" className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {integrations.map((integration) => (
            <li key={integration.provider} className="flex min-h-24 min-w-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-4">
              {integration.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={integration.src}
                  alt={integration.name}
                  loading="lazy"
                  className="max-h-8 w-auto max-w-full object-contain"
                />
              ) : (
                <>
                  <span aria-hidden="true">
                    <IntegrationCardLogo provider={integration.provider} size="sm" />
                  </span>
                  <span className="text-sm font-semibold sm:text-base">{integration.name}</span>
                </>
              )}
            </li>
          ))}
        </ul>

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
          Escolha e conecte as integrações que fazem sentido para a sua loja.
        </p>
      </div>
    </section>
  )
}
