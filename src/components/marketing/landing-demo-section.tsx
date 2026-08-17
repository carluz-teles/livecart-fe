import Link from "next/link"
import { ArrowRight, Check, ShoppingCart, Send, CreditCard, FileCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

const checklist = [
  "Produto identificado",
  "2 unidades",
  "Tamanho M",
  "Cor azul",
]

const flowSteps = [
  { icon: ShoppingCart, label: "Carrinho criado" },
  { icon: Send, label: "Checkout enviado" },
  { icon: CreditCard, label: "Pagamento aprovado" },
  { icon: FileCheck, label: "Pedido registrado" },
]

const noMore = ["Sem planilha.", "Sem copiar e colar.", "Sem cadastrar pedido manualmente."]

export function LandingDemoSection() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <style>{`
        @keyframes lc-demo-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .lc-demo-item{animation:lc-demo-in .5s ease-out both}
        @media (prefers-reduced-motion: reduce){.lc-demo-item{animation:none}}
      `}</style>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Demonstração
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Veja a LiveCart em ação
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Uma mensagem pode virar uma venda em segundos.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Simulação ilustrativa · não é uma gravação real
          </p>

          {/* Cliente */}
          <div className="lc-demo-item flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
              &quot;Quero 2 do azul tamanho M.&quot;
            </div>
          </div>

          {/* Checklist */}
          <div
            className="lc-demo-item mt-4 ml-auto grid max-w-[85%] grid-cols-2 gap-2 rounded-2xl rounded-br-sm bg-primary/10 p-4"
            style={{ animationDelay: "0.2s" }}
          >
            {checklist.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Check className="size-3.5 shrink-0" strokeWidth={3} />
                {item}
              </span>
            ))}
          </div>

          {/* Flow */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {flowSteps.map((step, i) => (
              <div
                key={step.label}
                className="lc-demo-item flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center"
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <step.icon className="size-5 text-primary" />
                <span className="text-xs font-medium leading-snug">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground">
            {noMore.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button size="lg" asChild className="h-12">
            <Link href="/register">
              Ver demonstração
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
