"use client"

import Image from "next/image"
import { Check, Loader2 } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStartCheckout, useSubscription } from "@/hooks/billing"
import type { ApiError } from "@/types"

type PlanID = "start" | "grow" | "scale"

const plans: {
  id: PlanID
  name: string
  price: string
  gmv: string
  description: string
  highlighted?: boolean
}[] = [
  {
    id: "start",
    name: "Start",
    price: "R$ 147",
    gmv: "1,8%",
    description: "Pra quem está começando a vender nas lives.",
  },
  {
    id: "grow",
    name: "Grow",
    price: "R$ 297",
    gmv: "1,3%",
    description: "Pra quem vende ao vivo toda semana.",
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "R$ 697",
    gmv: "1,0%",
    description: "Pra operações em ritmo acelerado.",
  },
]

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
  const [chosen, setChosen] = useState<PlanID | null>(null)

  const trialEnded = subscription?.status === "trialing" || subscription?.status === "paused"

  const handleChoose = (plan: PlanID) => {
    setChosen(plan)
    checkout.mutate(plan, {
      onError: (err) => {
        setChosen(null)
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

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Image
          src="/livecart/logotipo-footer.png"
          alt="LiveCart"
          width={170}
          height={45}
          className="h-9 w-auto"
          priority
        />

        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {trialEnded ? "Seu período de teste terminou 👋" : "Escolha um plano pra continuar"}
        </h1>
        <p className="mt-3 max-w-xl text-center text-neutral-300">
          Escolha o plano que combina com o seu volume de vendas e continue de
          onde parou. Seus dados, produtos e histórico estão guardados.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white/[0.04] p-6 backdrop-blur",
                plan.highlighted ? "border-amber-400 ring-1 ring-amber-400" : "border-white/10"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-0.5 text-xs font-semibold text-black">
                  Mais popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-1 min-h-10 text-sm text-neutral-400">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-neutral-400">/mês</span>
              </div>
              <p className="mt-1 text-sm font-medium text-amber-300">
                + {plan.gmv} sobre pedidos pagos
              </p>
              <Button
                className={cn(
                  "mt-6 w-full",
                  plan.highlighted
                    ? "bg-amber-400 text-black hover:bg-amber-300"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
                disabled={checkout.isPending}
                onClick={() => handleChoose(plan.id)}
              >
                {checkout.isPending && chosen === plan.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Assinar ${plan.name}`
                )}
              </Button>
            </div>
          ))}
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
