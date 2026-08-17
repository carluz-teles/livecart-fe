import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Send,
  Check,
  Instagram,
  Package,
  MessageCircle,
  Radio,
} from "lucide-react"

import { Button } from "@/components/ui/button"

type Bubble =
  | { side: "start" | "end"; variant: "comment"; channel: "live" | "instagram"; user: string; text: string }
  | { side: "start" | "end"; variant: "whatsapp"; user: string; text: string }
  | { side: "start" | "end"; variant: "system" | "dm" | "paid" | "shipped"; text: string }
  | { side: "start" | "end"; variant: "typing"; user: string }

const bubbles: Bubble[] = [
  { side: "start", variant: "comment", channel: "live", user: "@ana.reis", text: "quero 2 do BONE 🔥" },
  { side: "end", variant: "whatsapp", user: "Ju Costa", text: "tem esse na M? me manda o link" },
  { side: "start", variant: "comment", channel: "instagram", user: "@pedro.alves", text: "tem no tamanho GG? 👀" },
  { side: "end", variant: "system", text: "3 carrinhos criados na hora" },
  { side: "start", variant: "dm", text: "Checkout enviado no direct" },
  { side: "end", variant: "paid", text: "@ana.reis pagou · R$ 119,80" },
  { side: "start", variant: "shipped", text: "Pedido a caminho" },
  { side: "end", variant: "typing", user: "@bia.santos" },
]

function BubbleContent({ bubble }: { bubble: Bubble }) {
  if (bubble.variant === "comment") {
    const isLive = bubble.channel === "live"
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-xl">
        <span
          className={
            isLive
              ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
              : "flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white"
          }
        >
          {isLive ? <Radio className="size-3.5" /> : <Instagram className="size-3.5" />}
        </span>
        <span>
          <strong className="text-neutral-900">{bubble.user}</strong>{" "}
          <span className="text-neutral-600">{bubble.text}</span>
        </span>
      </div>
    )
  }

  if (bubble.variant === "whatsapp") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-xl">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <MessageCircle className="size-3.5" />
        </span>
        <span>
          <strong className="text-neutral-900">{bubble.user}</strong>{" "}
          <span className="text-neutral-600">{bubble.text}</span>
        </span>
      </div>
    )
  }

  if (bubble.variant === "typing") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-sm text-neutral-900 shadow-xl">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white">
          <Instagram className="size-3.5" />
        </span>
        <strong className="text-neutral-900">{bubble.user}</strong>
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="lc-hero-typing-dot size-1.5 rounded-full bg-neutral-400"
              style={{ animationDelay: `${d * 0.2}s` }}
            />
          ))}
        </span>
      </div>
    )
  }

  if (bubble.variant === "system") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-black shadow-xl">
        <Zap className="size-4 shrink-0" />
        {bubble.text}
      </div>
    )
  }

  if (bubble.variant === "dm") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white shadow-xl ring-1 ring-white/10">
        <Send className="size-4 shrink-0 text-amber-300" />
        {bubble.text}
        <span className="ml-1 text-xs font-normal text-sky-300">✓✓</span>
      </div>
    )
  }

  if (bubble.variant === "shipped") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-xl">
        <Package className="size-4 shrink-0 text-amber-500" />
        {bubble.text}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
      <Check className="size-4 shrink-0" strokeWidth={3} />
      {bubble.text}
    </div>
  )
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <style>{`
        @keyframes lc-hero-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lc-hero-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes lc-hero-dot{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}
        .lc-hero-bubble{animation:lc-hero-in .6s ease-out both}
        .lc-hero-stack{animation:lc-hero-float 5s ease-in-out infinite}
        .lc-hero-typing-dot{animation:lc-hero-dot 1.2s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){
          .lc-hero-bubble,.lc-hero-stack,.lc-hero-typing-dot{animation:none}
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
            Instagram, WhatsApp e lives, em uma só operação
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Venda onde seus clientes{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              já estão.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-neutral-300">
            A LiveCart transforma conversas no Instagram, WhatsApp e lives em
            pedidos, checkout e vendas — sem precisar responder cada mensagem
            manualmente.
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
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>

          <p className="mt-5 text-sm text-neutral-400">
            7 dias grátis · Sem cartão de crédito · Configure em minutos
          </p>
        </div>

        {/* Bubble flow (hidden on mobile) */}
        <div className="relative hidden lg:block">
          {/* glow */}
          <div className="absolute inset-0 -z-10 mx-auto my-auto h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />

          {/* multi-canal pill */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
              <span className="size-2 animate-pulse rounded-full bg-amber-400" />
              PRÉVIA ILUSTRATIVA · INSTAGRAM, WHATSAPP E LIVE
            </span>
          </div>

          {/* the whole stack floats together, so gaps stay uniform */}
          <div className="lc-hero-stack flex flex-col gap-4">
            {bubbles.map((bubble, i) => (
              <div
                key={i}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
