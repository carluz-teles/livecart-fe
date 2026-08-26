"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { useState } from "react"
import { toast } from "sonner"

import { PlanCard } from "@/components/billing/PlanCard"
import { useStartCheckout, useSubscription } from "@/hooks/billing"
import type { ApiError, BillingInterval } from "@/types"

const included = [
  "Lives, pedidos e usuários ilimitados",
  "Checkout com PIX e cartão em 12x",
  "Automações no direct e e-mail",
  "Recuperação de carrinho no WhatsApp",
]

export default function PaywallPage() {
  const { signOut } = useClerk()
  const { data: subscription } = useSubscription()
  const checkout = useStartCheckout()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly")

  const trialEnded = subscription?.status === "trialing" || subscription?.status === "paused"

  const handleSubscribe = () => {
    checkout.mutate(billingInterval, {
      onError: (err) => {
        toast.error(
          (err as unknown as ApiError)?.message || "Falha ao abrir o pagamento. Tente novamente."
        )
      },
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* fundo da marca (mesmo gradiente do hero da LP) */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-neutral-950 to-orange-950" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 blur-3xl" />
        <div className="absolute -bottom-1/3 -right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Image
          src="/livecart/logotipo-footer.png"
          alt="LiveCart"
          width={170}
          height={45}
          className="h-9 w-auto"
          priority
        />

        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {trialEnded ? "Seu período de teste terminou 👋" : "Assine o plano Pro pra continuar"}
        </h1>
        <p className="mt-3 max-w-xl text-center text-neutral-300">
          Escolha o intervalo de cobrança e continue de onde parou. Seus dados,
          produtos e histórico estão guardados.
        </p>

        <div className="mt-10 w-full">
          <PlanCard
            variant="dark"
            interval={billingInterval}
            onIntervalChange={setBillingInterval}
            ctaLabel="Assinar Pro"
            ctaLoading={checkout.isPending}
            ctaDisabled={checkout.isPending}
            onCtaClick={handleSubscribe}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {included.map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-sm text-neutral-300">
              <Check className="size-4 text-amber-400" />
              {item}
            </span>
          ))}
        </div>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="mt-10 text-sm text-neutral-500 underline-offset-4 hover:text-neutral-300 hover:underline"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
