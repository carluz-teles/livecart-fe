import { MapPinOff, MessageCircleOff, ClipboardX, Layers } from "lucide-react"

const changes = [
  {
    icon: MapPinOff,
    title: "Você não precisa mandar todo mundo para sua loja.",
    description: "O cliente pode começar a compra onde descobriu o produto.",
  },
  {
    icon: MessageCircleOff,
    title: "Você não precisa responder cada pergunta manualmente.",
    description: "A automação assume as interações repetitivas.",
  },
  {
    icon: ClipboardX,
    title: "Você não precisa cadastrar cada pedido.",
    description: "A venda pode seguir automaticamente para sua operação.",
  },
  {
    icon: Layers,
    title: "Você não precisa escolher entre conteúdo e vendas.",
    description: "Seu conteúdo pode ser o próprio ponto de partida da compra.",
  },
]

export function LandingBenefitsSection() {
  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Benefícios
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            O que muda quando suas redes sociais viram canais de venda?
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {changes.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold leading-snug">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting copy — aproveitado de "Venda mais. Responda menos." */}
        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-10">
          <h3 className="text-2xl font-bold tracking-tight">
            Venda mais. Responda menos.
          </h3>
          <p className="mt-3 text-muted-foreground">
            Você não criou sua marca para passar o dia copiando links de
            produtos e cadastrando pedidos. Deixe a LiveCart cuidar da
            operação repetitiva.
          </p>
          <p className="mt-4 text-base font-semibold tracking-tight">
            Você cria. Você vende. Você cresce.{" "}
            <span className="text-primary">A LiveCart automatiza o resto.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
