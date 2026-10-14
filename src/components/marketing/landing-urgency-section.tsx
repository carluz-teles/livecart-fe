import { Clock, Zap, X, Check } from "lucide-react"

const withoutLiveCart = [
  "Você monta os carrinhos um a um, no meio da live",
  "Comentários somem antes de você chegar",
  "Quem esperou muito desiste da compra",
]

const withLiveCart = [
  "O cliente digita o código do produto",
  "A LiveCart adiciona o produto ao carrinho",
  "O link de compra é enviado pelo Direct",
]

export function LandingUrgencySection() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-neutral-950 to-orange-950" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-amber-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-300">
            O custo da demora
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Quantas vendas você já perdeu por demorar a responder?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            No pico da live, vários clientes comentam os códigos ao mesmo
            tempo. Anotar cada pedido e enviar cada link manualmente cria
            uma fila. Quem espera pelo carrinho pode desistir da compra.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-red-300">
              <Clock className="size-4" />
              Sem a LiveCart
            </div>
            <ul className="mt-4 flex flex-col gap-3.5 text-[15px] leading-snug text-neutral-300">
              {withoutLiveCart.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <X className="size-[18px] shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-400/35 bg-amber-400/[0.06] p-7">
            <div className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
              <Zap className="size-4" />
              Com a LiveCart
            </div>
            <ul className="mt-4 flex flex-col gap-3.5 text-[15px] leading-snug text-white">
              {withLiveCart.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check className="size-[18px] shrink-0 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-xl font-bold tracking-tight sm:text-2xl">
          O cliente comenta o código. A{" "}
          <span className="text-amber-300">LiveCart</span> cuida do carrinho e
          do link de compra.
        </p>
      </div>
    </section>
  )
}
