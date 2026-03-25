"use client"

import { Plug, ArrowRight, ArrowLeft, CreditCard, Package, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: "payment" | "erp"
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    description: "Receba pagamentos via Pix, cartão e boleto",
    icon: <CreditCard className="h-6 w-6" />,
    type: "payment",
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    description: "Sincronize produtos e pedidos com seu ERP",
    icon: <Package className="h-6 w-6" />,
    type: "erp",
  },
]

interface StepIntegrationsProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onConnect: (integrationId: string) => void
  isSubmitting?: boolean
}

export function StepIntegrations({
  onNext,
  onBack,
  onSkip,
  onConnect,
  isSubmitting,
}: StepIntegrationsProps) {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Plug className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Integrações</CardTitle>
        <CardDescription>
          Conecte serviços para pagamentos e gestão de estoque
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {AVAILABLE_INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {integration.icon}
              </div>
              <div>
                <h3 className="font-medium">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConnect(integration.id)}
              disabled={isSubmitting}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Conectar
            </Button>
          </div>
        ))}

        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Você pode configurar integrações depois em{" "}
            <span className="font-medium">Configurações &gt; Integrações</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting}>
          Pular
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={isSubmitting}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
