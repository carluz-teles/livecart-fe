"use client"

import { use } from "react"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderDetailContext } from "./OrderDetailContext"
import { orderWorkflow } from "./order-workflow"

const ICONS = {
  done: CheckCircle2,
  attention: AlertCircle,
  waiting: Clock,
  unknown: CircleHelp,
}
export function OrderDetailWorkflow() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { steps, next } = orderWorkflow(ctx.state.order)
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Acompanhamento do pedido</CardTitle>
        <CardDescription>
          Do pagamento à entrega, com as confirmações recebidas até agora.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = ICONS[step.state]
            return (
              <li key={step.title} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    0{index + 1} · {step.title}
                  </span>
                  <span className="text-sm font-medium">{step.detail}</span>
                </div>
              </li>
            )
          })}
        </ol>
        <Separator />
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{next.text}</p>
          <Button asChild variant="outline" size="sm">
            <a href={`#${next.target}`}>
              {next.label}
              <ArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
