import Link from "next/link"
import { Ticket, Info, ShieldCheck, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

const stats = [
  { value: "99,9%", label: "de uptime, mesmo nos picos" },
  { value: "PIX", label: "aprovado na hora" },
  { value: "12x", label: "parcelado no cartão" },
]

export function LandingCheckoutHero() {
  return (
    <section
      id="checkout"
      className="relative overflow-hidden bg-neutral-950 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-neutral-950 to-neutral-950" />
      <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Checkout
          </span>
          <h2 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            O checkout que aguenta a sua{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              maior live
            </span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-300">
            Feito para o consumidor brasileiro e preparado pra não cair quando a
            sua live viraliza. Mesmo com os pedidos chegando de montão, o
            checkout continua no ar e rápido.
          </p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.value}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <dt className="text-2xl font-bold text-amber-400">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-neutral-400">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>

          <Button
            size="lg"
            asChild
            className="mt-8 h-12 bg-amber-400 text-base font-semibold text-black hover:bg-amber-300"
          >
            <Link href="/register">Criar conta grátis</Link>
          </Button>
        </div>

        {/* Layered checkout mock */}
        <div className="relative mx-auto w-full max-w-md">
          {/* Uptime pill (floating) */}
          <div className="absolute -left-3 -top-5 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-xl sm:-left-8">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            99,98% no ar · últimos 90 dias
          </div>

          {/* Card */}
          <div className="relative rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-amber-400/20">
            <h3 className="text-lg font-bold text-neutral-900">
              Resumo da compra
            </h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-400">
                <Ticket className="size-4" />
                Código do cupom
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                Aplicar
              </span>
            </div>

            <div className="mt-4 rounded-lg bg-neutral-50 p-4">
              <div className="flex items-center justify-between py-1 text-sm text-neutral-600">
                <span>Produtos</span>
                <span>R$ 69,90</span>
              </div>
              <div className="flex items-center justify-between py-1 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  Descontos <Info className="size-3.5 text-neutral-400" />
                </span>
                <span>− R$ 6,99</span>
              </div>
              <div className="flex items-center justify-between py-1 text-sm text-neutral-600">
                <span>Frete</span>
                <span className="font-semibold text-amber-600">GRÁTIS</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3">
                <span className="text-base font-bold text-neutral-900">
                  Total
                </span>
                <span className="text-xl font-bold text-amber-600">
                  R$ 62,91
                </span>
              </div>
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 py-3 text-sm font-semibold text-white">
              <ShieldCheck className="size-4 text-amber-400" />
              Finalizar compra
            </button>
          </div>

          {/* Approved toast (floating) */}
          <div className="absolute -bottom-5 -right-2 z-20 flex items-center gap-2.5 rounded-xl border border-white/10 bg-neutral-900 px-3.5 py-2.5 shadow-xl sm:-right-8">
            <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500">
              <Check className="size-4 text-white" strokeWidth={3} />
            </span>
            <div className="text-xs">
              <p className="font-semibold text-white">Pedido aprovado</p>
              <p className="text-neutral-400">R$ 154,20 · PIX</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
