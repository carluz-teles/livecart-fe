"use client"

import Link from "next/link"
import { ArrowRight, Check, CreditCard, Instagram, Package, Rocket, Store } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useGettingStarted, type GettingStartedItemID } from "@/hooks/dashboard/useGettingStarted"

const itemCopy: Record<
  GettingStartedItemID,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  store: {
    label: "Criar sua loja",
    description: "Loja configurada e pronta",
    icon: Store,
  },
  instagram: {
    label: "Conectar o Instagram",
    description: "Pra detectar os pedidos nos comentários da live",
    icon: Instagram,
  },
  payment: {
    label: "Conectar um meio de pagamento",
    description: "PIX e cartão no checkout (Mercado Pago ou Pagar.me)",
    icon: CreditCard,
  },
  product: {
    label: "Cadastrar o primeiro produto",
    description: "Com a palavra-chave que o público comenta na live",
    icon: Package,
  },
}

// Card "Primeiros passos": renderização pura — o progresso vem do
// useGettingStarted. Some sozinho quando a loja completa a ativação.
export function GettingStartedCard() {
  const { items, doneCount, total, isComplete, isLoading } = useGettingStarted()

  if (isLoading || isComplete) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="size-4.5 text-primary" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold leading-tight">
                Deixe sua loja pronta pra primeira live
              </h2>
              <p className="text-xs text-muted-foreground">
                {doneCount} de {total} passos concluídos
              </p>
            </div>
          </div>
          <div className="w-full max-w-[160px]">
            <Progress
              value={(doneCount / total) * 100}
              aria-label={`${doneCount} de ${total} passos concluídos`}
            />
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const copy = itemCopy[item.id]
            const content = (
              <>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    item.done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {item.done ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <copy.icon className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-medium leading-tight",
                      item.done && "text-muted-foreground line-through"
                    )}
                  >
                    {copy.label}
                  </span>
                  {!item.done && (
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {copy.description}
                    </span>
                  )}
                </span>
                {!item.done && (
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                )}
              </>
            )

            return (
              <li key={item.id}>
                {item.done ? (
                  <div className="flex items-center gap-3 rounded-lg border border-transparent p-2.5">
                    {content}
                    <span className="sr-only">(concluído)</span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg border bg-card p-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {content}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
