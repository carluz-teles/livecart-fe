import Link from "next/link"
import { Store, Sparkles, Video, Radio } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MobileCarousel } from "./mobile-carousel"

const segments = [
  {
    icon: Store,
    title: "Lojas e e-commerces",
    description:
      "Venda através dos canais onde seus clientes já estão e automatize o trabalho operacional.",
    cta: "Vender para minha loja",
  },
  {
    icon: Sparkles,
    title: "Marcas",
    description:
      "Transforme campanhas, lançamentos e conteúdos em experiências de compra.",
    cta: "Vender mais com minha marca",
  },
  {
    icon: Video,
    title: "Criadores e influenciadores",
    description:
      "Monetize sua audiência sem precisar transformar cada venda em um atendimento manual.",
    cta: "Monetizar minha audiência",
  },
  {
    icon: Radio,
    title: "Live sellers",
    description:
      "Faça lives de vendas sem precisar acompanhar e registrar cada pedido manualmente.",
    cta: "Automatizar minhas lives",
  },
]

export function LandingIcpSection() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Para quem é
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Feito para quem vende nas redes sociais
          </h2>
        </div>

        <MobileCarousel
          wrapperClassName="mt-16"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
        >
          {segments.map((segment) => (
            <div
              key={segment.title}
              className="flex w-full min-w-full shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 sm:min-w-0"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <segment.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{segment.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {segment.description}
              </p>
              <Button variant="outline" asChild className="mt-6 w-full">
                <Link href="/register">{segment.cta}</Link>
              </Button>
            </div>
          ))}
        </MobileCarousel>
      </div>
    </section>
  )
}
