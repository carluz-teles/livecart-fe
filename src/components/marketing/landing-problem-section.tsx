import { Clock, Instagram, Radio } from "lucide-react"

const messages = [
  { channel: "live", user: "@ana.reis", text: "quero 2 do preto 🔥" },
  { channel: "instagram", user: "@ju.costa", text: "tem esse na M? me manda o link" },
  { channel: "instagram", user: "@pedro.alves", text: "tem no tamanho GG? 👀" },
  { channel: "live", user: "@lu.martins", text: "quero esse, quanto fica?" },
  { channel: "instagram", user: "@bia.santos", text: "me manda o link 🙏" },
] as const

const manualSteps = [
  "Responder",
  "Identificar o produto",
  "Consultar estoque",
  "Montar o pedido",
  "Enviar o checkout",
  "Acompanhar o pagamento",
  "Registrar a venda",
  "Atualizar o ERP",
]

export function LandingProblemSection() {
  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            O problema
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Seus clientes já estão nas redes sociais. Sua loja também deveria
            estar.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A compra quase nunca começa na sua loja virtual. Ela começa numa
            conversa.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl items-center gap-10 sm:grid-cols-2 sm:gap-14">
          {/* Mensagens de hoje */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mensagens de hoje
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                ao vivo
              </span>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {messages.map((m) => (
                <div key={m.user} className="flex items-center gap-2.5">
                  <span
                    className={
                      m.channel === "live"
                        ? "flex size-[30px] shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
                        : "flex size-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white"
                    }
                  >
                    {m.channel === "live" ? (
                      <Radio className="size-3.5" />
                    ) : (
                      <Instagram className="size-3.5" />
                    )}
                  </span>
                  <span className="rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2 text-sm">
                    <strong>{m.user}</strong>{" "}
                    <span className="text-muted-foreground">{m.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custo do manual */}
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight sm:text-[32px]">
              Seus clientes já querem comprar.
            </h3>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted-foreground">
              Gerar interesse não é o problema. O difícil é transformar cada
              conversa em venda sem precisar de uma equipe inteira
              respondendo, procurando produto, montando pedido e cobrando.
            </p>
            <div className="mb-3 mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="size-[15px] text-destructive" />
              O caminho manual, hoje
            </div>
            <div className="flex flex-wrap gap-2">
              {manualSteps.map((step) => (
                <span
                  key={step}
                  className="rounded-full border border-border bg-secondary/50 px-3.5 py-1.5 text-sm font-medium text-muted-foreground"
                >
                  {step}
                </span>
              ))}
            </div>
            <p className="mt-7 text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">
              A <span className="text-primary">LiveCart</span> automatiza esse
              processo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
