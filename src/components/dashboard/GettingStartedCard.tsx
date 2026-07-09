"use client"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  CreditCard,
  Instagram,
  Package,
  Radio,
  Rocket,
  Store,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus"

const itemIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  store: Store,
  instagram: Instagram,
  payment: CreditCard,
  product: Package,
  event: Radio,
}

// Card "Primeiros passos": renderização pura — passos, copy e progresso vêm
// do useOnboardingStatus (a MESMA fonte do checklist do Header). Some
// sozinho quando a loja completa a ativação.
export function GettingStartedCard() {
  const { tasks, completedCount, totalCount, isComplete, isLoading } = useOnboardingStatus()

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
                {completedCount} de {totalCount} passos concluídos
              </p>
            </div>
          </div>
          <div className="w-full max-w-[160px]">
            <Progress
              value={(completedCount / totalCount) * 100}
              aria-label={`${completedCount} de ${totalCount} passos concluídos`}
            />
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {tasks.map((task) => {
            const Icon = itemIcons[task.id] ?? Check
            const content = (
              <>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    task.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {task.completed ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Icon className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-medium leading-tight",
                      task.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </span>
                  {!task.completed && (
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {task.description}
                    </span>
                  )}
                </span>
                {!task.completed && task.href && (
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                )}
              </>
            )

            return (
              <li key={task.id}>
                {task.completed || !task.href ? (
                  <div className="flex items-center gap-3 rounded-lg border border-transparent p-2.5">
                    {content}
                    {task.completed && <span className="sr-only">(concluído)</span>}
                  </div>
                ) : (
                  <Link
                    href={task.href}
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
