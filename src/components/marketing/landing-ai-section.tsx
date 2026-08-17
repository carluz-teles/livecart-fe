import { Ban, MessagesSquare, Brain, Cog } from "lucide-react"

const naturalMessages = [
  "Quero dois desse azul.",
  "Tem M?",
  "Quero esse, mas no tamanho 40.",
  "Me manda o link desse.",
  "Ainda tem?",
]

export function LandingAiSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60 via-neutral-950 to-neutral-950" />
      <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Inteligência artificial
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            IA que entende intenção de compra
          </h2>
          <p className="mt-4 text-lg text-neutral-300">
            A LiveCart não depende de comandos rígidos como &quot;digite 1
            para comprar&quot;. Seu cliente pode falar naturalmente.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-3">
          {naturalMessages.map((msg) => (
            <span
              key={msg}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-neutral-100"
            >
              &quot;{msg}&quot;
            </span>
          ))}
        </div>

        <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 text-xs font-medium text-neutral-500">
          <Ban className="size-3.5" />
          Nada de &quot;digite 1 para comprar&quot;
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <MessagesSquare className="mx-auto size-6 text-amber-400" />
            <p className="mt-3 font-semibold">Seu cliente conversa.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <Brain className="mx-auto size-6 text-amber-400" />
            <p className="mt-3 font-semibold">A LiveCart entende.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <Cog className="mx-auto size-6 text-amber-400" />
            <p className="mt-3 font-semibold">Sua operação executa.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
