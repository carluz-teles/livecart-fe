import { Instagram, Mail, Zap, Palette, BellRing, Send, ChevronLeft, Info } from "lucide-react"

const editorFeatures = [
  {
    icon: Zap,
    title: "Disparadas automaticamente",
    description:
      "Do carrinho criado ao pedido enviado, cada mensagem sai na hora certa sem você tocar em nada.",
  },
  {
    icon: Palette,
    title: "Personalização completa",
    description:
      "Variáveis dinâmicas, negrito, itálico e emoji. Cada mensagem com a cara da sua loja.",
  },
  {
    icon: BellRing,
    title: "Nenhum cliente esquecido",
    description:
      "Quem demonstrou interesse recebe o lembrete certo e volta pra finalizar a compra.",
  },
]

export function LandingAutomationsSection() {
  return (
    <section id="automacoes" className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Automações
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Mensagens que vendem sozinhas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A LiveCart conversa com o cliente em cada etapa da compra, no direct
            do Instagram e por e-mail. Você escreve a mensagem uma vez e ela
            dispara sozinha.
          </p>

          <div className="mt-8 space-y-5">
            {editorFeatures.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

        </div>

        {/* Phone mock */}
        <div className="relative mx-auto w-full max-w-[320px]">
          <div className="absolute -inset-6 rounded-[3rem] bg-amber-400/20 blur-3xl" />

          <div className="relative rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-2.5 shadow-2xl">
            <div className="overflow-hidden rounded-[2rem] bg-white">
              {/* IG DM header */}
              <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
                <ChevronLeft className="size-5 text-neutral-700" />
                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white">
                  <Instagram className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-neutral-900">sualoja</p>
                  <p className="text-[11px] text-neutral-400">Ativo agora</p>
                </div>
                <Info className="ml-auto size-5 text-neutral-400" />
              </div>

              {/* Messages */}
              <div className="space-y-2.5 px-3 py-4">
                <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  Enviado automaticamente
                </p>

                <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-neutral-100 px-3.5 py-2 text-[13px] leading-snug text-neutral-800">
                  Oi <strong>@ana.reis</strong>! 🛒 Separei seu carrinho:{" "}
                  <strong>2x Boné LiveCart</strong>.
                </div>

                {/* Link preview */}
                <div className="max-w-[82%] overflow-hidden rounded-2xl border border-neutral-200">
                  <div className="h-14 bg-gradient-to-br from-amber-300 to-orange-400" />
                  <div className="px-3 py-2">
                    <p className="text-[13px] font-semibold text-neutral-900">
                      Finalizar compra · R$ 119,80
                    </p>
                    <p className="text-[11px] text-neutral-400">livecart.app</p>
                  </div>
                </div>

                <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-neutral-100 px-3.5 py-2 text-[13px] leading-snug text-neutral-800">
                  ⏰ Faltam <strong>15 min</strong> pro seu carrinho expirar!
                </div>

                <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#833AB4] to-[#F77737] px-3.5 py-2 text-[13px] leading-snug text-white">
                  Paguei no PIX! ✅
                </div>

                <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-neutral-100 px-3.5 py-2 text-[13px] leading-snug text-neutral-800">
                  Pagamento confirmado! 🎉 Já tô preparando seu pedido.
                </div>
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 border-t border-neutral-100 px-3 py-2.5">
                <div className="flex-1 rounded-full border border-neutral-200 px-3 py-1.5 text-[12px] text-neutral-400">
                  Mensagem...
                </div>
                <Send className="size-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Floating e-mail card */}
          <div className="absolute -bottom-5 -left-3 flex w-56 items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-xl sm:-left-10">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-4" />
            </span>
            <div className="min-w-0 text-xs">
              <p className="font-semibold text-foreground">Pedido enviado 📦</p>
              <p className="truncate text-muted-foreground">
                Rastreie: BR123456789
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
