import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-neutral-950 to-orange-950" />
      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Transforme suas redes sociais em canais de venda
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-300">
          Instagram. Lives. Stories. Mensagens. Onde seu cliente estiver, sua
          venda pode começar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="h-12 bg-amber-400 text-base font-semibold text-black hover:bg-amber-300"
          >
            <Link href="/register">
              Começar a vender com a LiveCart
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 border-white/20 bg-white/5 text-base text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
        <p className="mt-5 text-sm text-neutral-400">
          7 dias grátis, sem cartão — venda onde seus clientes já estão.
        </p>
      </div>
    </section>
  )
}
