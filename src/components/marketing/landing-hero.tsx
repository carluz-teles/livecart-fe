import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Send,
  Check,
  Hash,
  Radio,
} from "lucide-react"

import { Button } from "@/components/ui/button"

type Bubble =
  | { side: "start" | "end"; variant: "comment"; user: string; text: string }
  | { side: "start" | "end"; variant: "system" | "dm" | "checkout"; text: string }

const bubbles: Bubble[] = [
  { side: "start", variant: "comment", user: "@ana.reis", text: "2x 1001" },
  { side: "end", variant: "system", text: "1001 · 2 unidades no carrinho" },
  { side: "start", variant: "dm", text: "Link do carrinho enviado no Direct" },
  { side: "end", variant: "checkout", text: "A cliente abre o link e finaliza a compra" },
]

function BubbleContent({ bubble }: { bubble: Bubble }) {
  if (bubble.variant === "comment") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-xl">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <Radio className="size-3.5" aria-hidden="true" />
        </span>
        <div>
          <span className="block text-xs text-neutral-600">{bubble.user} comentou</span>
          <strong className="font-mono text-lg">{bubble.text}</strong>
        </div>
      </div>
    )
  }

  if (bubble.variant === "system") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-black shadow-xl">
        <Zap className="size-4 shrink-0" aria-hidden="true" />
        {bubble.text}
      </div>
    )
  }

  if (bubble.variant === "dm") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white shadow-xl ring-1 ring-white/10">
        <Send className="size-4 shrink-0 text-amber-300" aria-hidden="true" />
        {bubble.text}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white">
      <Check className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
      {bubble.text}
    </div>
  )
}

export function LandingHero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-neutral-950 text-white">
      <style>{`
        @keyframes lc-hero-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lc-hero-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .lc-hero-bubble{animation:lc-hero-in .6s ease-out both}
        .lc-hero-stack{animation:lc-hero-float 5s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){
          .lc-hero-bubble,.lc-hero-stack{animation:none}
        }
      `}</style>

      {/* Amber gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-neutral-950 to-orange-950" />

      {/* Animated mesh blobs */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 blur-3xl" />
        <div
          className="absolute -bottom-1/3 -right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-3xl"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
            <Sparkles className="size-3.5" />
            Instagram e lives, em uma só operação
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Transforme comentários das lives do Instagram em{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              pedidos.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-neutral-300">
            Você divulga o código do produto. O cliente comenta esse código
            no Instagram ou na live, e a LiveCart adiciona o item ao carrinho
            e organiza os pedidos por cliente. Conecte sua operação ao Tiny ou ao Bling e escolha como fechar as vendas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-12 bg-amber-400 text-base font-semibold text-black hover:bg-amber-300"
            >
              <Link href="/register">
                Testar 7 dias grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-white/20 bg-white/5 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/demonstracao">Ver a demonstração</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-neutral-400">
            7 dias grátis · Sem cartão de crédito
          </p>
        </div>

        <figure aria-labelledby="purchase-example-title" className="relative w-full min-w-0 max-w-lg justify-self-center">
          {/* glow */}
          <div className="absolute inset-0 -z-10 mx-auto my-auto h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />

          <figcaption id="purchase-example-title" className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-amber-200">
            Exemplo ilustrativo · Compra por código
          </figcaption>

          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
            <div>
              <p className="text-xs text-neutral-400">Produto anunciado na live</p>
              <p className="mt-1 font-semibold">Caneca artesanal</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs text-amber-200">Código do produto</span>
              <span className="mt-1 flex items-center justify-end gap-1 font-mono text-2xl font-bold text-amber-300">
                <Hash className="size-4" aria-hidden="true" />1001
              </span>
            </div>
          </div>

          {/* the whole stack floats together, so gaps stay uniform */}
          <ol aria-label="Etapas da compra por código" className="lc-hero-stack flex flex-col gap-4">
            {bubbles.map((bubble, i) => (
              <li
                key={bubble.variant}
                className={
                  bubble.side === "end"
                    ? "lc-hero-bubble self-end"
                    : "lc-hero-bubble self-start"
                }
                style={{
                  maxWidth: "88%",
                  animationDelay: `${i * 0.16}s`,
                }}
              >
                <BubbleContent bubble={bubble} />
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400">
            <span className="font-mono text-neutral-200">1001</span> para uma unidade.
            {" "}<span className="font-mono text-neutral-200">2x 1001</span> para duas.
          </p>
        </figure>
      </div>
    </section>
  )
}
