import Link from "next/link"
import { ArrowRight, Camera, Send, MessageSquareText, Rss } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChannelChatPreview } from "./channel-chat-preview"

const features = [
  {
    icon: Camera,
    title: "Stories",
    description:
      "Publique seu produto. O cliente responde. A LiveCart identifica a intenção e conduz a compra.",
  },
  {
    icon: Send,
    title: "Direct",
    description:
      "O cliente pergunta “tem tamanho 38?” e a automação consulta as informações disponíveis e continua a conversa.",
  },
  {
    icon: Rss,
    title: "Posts",
    description: "Transforme comentários e interações em oportunidades de venda.",
  },
  {
    icon: MessageSquareText,
    title: "Mensagens",
    description:
      "Conduza o cliente da dúvida até o checkout sem depender de atendimento manual em cada conversa.",
  },
]

export function LandingInstagramSection() {
  return (
    <section id="instagram" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <ChannelChatPreview
          channel="instagram"
          title="sualoja"
          subtitle="Ativo agora"
          className="order-2 lg:order-1"
          messages={[
            { side: "start", text: "Tem tamanho 38? 👀" },
            { side: "end", text: "Temos sim! Separei o link do checkout pra você 🛒" },
            { side: "start", text: "Perfeito, comprando agora" },
          ]}
        />

        <div className="order-1 lg:order-2">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Instagram
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Venda pelo Instagram sem transformar seu Direct em um SAC
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Seus clientes já perguntam sobre produtos no Instagram. Agora eles
            também podem comprar por lá.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-lg font-semibold tracking-tight">
            Seu Instagram deixa de ser apenas uma vitrine. Ele passa a ser um
            canal de vendas.
          </p>

          <Button size="lg" asChild className="mt-6 h-12">
            <Link href="/register">
              Vender pelo Instagram
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
