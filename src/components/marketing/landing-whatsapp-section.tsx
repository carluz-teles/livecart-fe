import Link from "next/link"
import { ArrowRight, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChannelChatPreview } from "./channel-chat-preview"

const less = [
  "copiar e colar links",
  "procurar produtos",
  "consultar estoque manualmente",
  "cadastrar pedidos",
  "responder as mesmas perguntas",
  "perder vendas por demora",
]

export function LandingWhatsappSection() {
  return (
    <section id="whatsapp" className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div className="min-w-0">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            WhatsApp
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Venda pelo WhatsApp sem responder cada pedido manualmente
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            O WhatsApp já faz parte da rotina de compra de milhões de
            consumidores. Com a LiveCart, seu cliente inicia a conversa,
            encontra o produto, tira dúvidas e avança para o checkout.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Menos
              </h3>
              <ul className="mt-3 space-y-2">
                {less.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Mais
              </h3>
              <div className="mt-3 flex items-start gap-2 text-sm font-medium text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>conversas → pedidos → pagamentos → vendas</span>
              </div>
            </div>
          </div>

          <Button size="lg" asChild className="mt-8 h-auto min-h-12 w-full sm:w-auto">
            <Link href="/register">
              <span className="text-wrap text-center">
                Automatizar minhas vendas no WhatsApp
              </span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </Button>
        </div>

        <ChannelChatPreview
          channel="whatsapp"
          title="Sua loja"
          subtitle="online"
          messages={[
            { side: "start", text: "Oi! Vocês tem esse vestido no P?" },
            { side: "end", text: "Temos sim 😊 Aqui está o checkout: livecart.app/p/abc" },
            { side: "start", text: "Perfeito, já vou pagar" },
          ]}
        />
      </div>
    </section>
  )
}
