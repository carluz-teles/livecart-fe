import Link from "next/link"
import { ArrowRight, ArrowDown, MessageSquare, Sparkles, ShoppingCart, Send, CreditCard, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChannelChatPreview } from "./channel-chat-preview"

const flow = [
  { icon: MessageSquare, label: "Comentário" },
  { icon: Sparkles, label: "Produto identificado" },
  { icon: ShoppingCart, label: "Carrinho criado" },
  { icon: Send, label: "Checkout enviado" },
  { icon: CreditCard, label: "Pagamento" },
  { icon: Package, label: "Pedido" },
]

export function LandingLiveCommerceSection() {
  return (
    <section id="live-commerce" className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Live commerce
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Venda durante suas lives sem anotar um único pedido
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Durante uma live, seus clientes comentam &quot;quero 2 do
            preto&quot; ou &quot;tem tamanho M?&quot;. A LiveCart lê essas
            mensagens e transforma a intenção de compra em uma ação.
          </p>

          <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {flow.map((step, i) => (
              <div key={step.label} className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                  <step.icon className="size-3.5 text-primary" />
                  {step.label}
                </span>
                {i < flow.length - 1 && (
                  <>
                    <ArrowDown className="ml-3 size-3.5 text-muted-foreground sm:hidden" aria-hidden />
                    <ArrowRight className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden />
                  </>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-lg font-semibold tracking-tight">
            Você faz a live. A LiveCart cuida das vendas.
          </p>

          <Button size="lg" asChild className="mt-6 h-12">
            <Link href="/register">
              Quero vender nas minhas lives
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <ChannelChatPreview
          channel="live"
          title="Live de hoje"
          subtitle="1.2k assistindo"
          messages={[
            { side: "start", text: "@ana.reis: quero 2 do preto 🔥" },
            { side: "start", text: "@ju_costa: tem tamanho M?" },
            { side: "end", text: "Carrinho criado para @ana.reis" },
            { side: "end", text: "Checkout enviado no direct" },
          ]}
        />
      </div>
    </section>
  )
}
