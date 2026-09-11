import { Radio, Instagram } from "lucide-react"

const channels = [
  {
    icon: Radio,
    iconClassName: "bg-red-500",
    title: "Lives",
    description:
      "Você anuncia o código de cada produto durante a live. Quem digita o código no comentário recebe o carrinho na hora, sem espera.",
    tags: ["Comentário", "Carrinho", "Checkout", "Pagamento"],
  },
  {
    icon: Instagram,
    iconClassName: "bg-gradient-to-br from-[#833AB4] to-[#F77737]",
    title: "Instagram",
    description:
      "Poste o código nos Stories, no Direct ou nos posts. Quem responde com o código recebe o link de compra na hora.",
    tags: ["Stories", "Direct", "Posts", "Mensagens"],
  },
]

export function LandingChannelsSection() {
  return (
    <section id="canais" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Canais
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Uma venda que começa onde o cliente estiver
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No Instagram ou nas lives, o cliente conversa no canal que já usa
            e a LiveCart leva a conversa até o checkout.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-xl text-white ${channel.iconClassName}`}
              >
                <channel.icon className="size-5" />
              </span>
              <h3 className="text-xl font-bold tracking-tight">
                {channel.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {channel.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {channel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
