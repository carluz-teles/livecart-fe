"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Loader2, Truck, Unplug, Zap } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IntegrationCard } from "@/components/integration/IntegrationCard"
import {
  useIntegrations,
  useTestConnection,
  useDisconnectIntegration,
} from "@/hooks/integration"
import { useShippingCarriers } from "@/hooks/shipping"
import { PROVIDERS } from "@/types/integration.types"
import type { Integration, IntegrationProvider, ProviderInfo } from "@/types"

const providerInfo = (id: IntegrationProvider): ProviderInfo | undefined =>
  PROVIDERS.find((p) => p.id === id)

export default function ShippingSettingsPage() {
  const { data, isLoading } = useIntegrations()
  const testConnection = useTestConnection()
  const disconnectIntegration = useDisconnectIntegration()

  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  const shippingIntegrations = (data?.data ?? []).filter(
    (i) =>
      i.type === "shipping" &&
      (i.status === "active" || i.status === "pending_auth")
  )

  const integrationToDisconnect = disconnectId
    ? shippingIntegrations.find((i) => i.id === disconnectId)
    : null
  const providerToDisconnect = integrationToDisconnect
    ? providerInfo(integrationToDisconnect.provider)
    : null

  const handleTest = (integration: Integration) => {
    const info = providerInfo(integration.provider)
    const name = info?.name ?? integration.provider
    setTestingId(integration.id)
    testConnection.mutate(integration.id, {
      onSuccess: (result) => {
        setTestingId(null)
        if (result.success) {
          toast.success(`${name}: ${result.message}`, {
            description: `Latência: ${result.latencyMs}ms`,
          })
        } else {
          toast.error(`${name}: ${result.message}`)
        }
      },
      onError: () => {
        setTestingId(null)
        toast.error("Falha ao testar conexão")
      },
    })
  }

  const handleDisconnect = () => {
    if (!disconnectId) return
    disconnectIntegration.mutate(disconnectId, {
      onSuccess: () => {
        toast.success("Provedor desconectado")
        setDisconnectId(null)
      },
      onError: () => toast.error("Falha ao desconectar"),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold tracking-tight">Frete</h2>
        <p className="text-sm text-muted-foreground">
          Provedores de frete ativos na sua loja e serviços habilitados em cada
          um. Conecte novos provedores em{" "}
          <Link
            href="/settings/integrations"
            className="text-primary underline underline-offset-2"
          >
            Integrações
          </Link>
          .
        </p>
      </div>

      {shippingIntegrations.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="rounded-full bg-muted p-3">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Nenhum provedor de frete conectado</p>
            <p className="text-sm text-muted-foreground">
              Conecte um provedor para cotar frete e gerenciar envios pelo
              checkout.
            </p>
          </div>
          <Button asChild size="sm" className="mt-2">
            <Link href="/settings/integrations">
              Ir para Integrações
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {shippingIntegrations.map((integration) => (
            <ShippingProviderCard
              key={integration.id}
              integration={integration}
              onTest={() => handleTest(integration)}
              onDisconnect={() => setDisconnectId(integration.id)}
              testing={testingId === integration.id}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!disconnectId}
        onOpenChange={(open) => {
          if (!open) setDisconnectId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Desconectar {providerToDisconnect?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os serviços de frete desse provedor deixarão de aparecer no
              checkout. Você precisará reconectar para voltar a usá-los.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={disconnectIntegration.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectIntegration.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface ShippingProviderCardProps {
  integration: Integration
  onTest: () => void
  onDisconnect: () => void
  testing: boolean
}

function ShippingProviderCard({
  integration,
  onTest,
  onDisconnect,
  testing,
}: ShippingProviderCardProps) {
  const info = providerInfo(integration.provider)
  const carriers = useShippingCarriers(integration.provider, {
    enabled: integration.status === "active",
  })

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <IntegrationCard.Logo provider={integration.provider} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{info?.name ?? integration.provider}</h3>
            <IntegrationCard.Status
              status={integration.status === "active" ? "active" : "pending"}
            />
          </div>
          {info?.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {info.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-sm font-medium">Serviços habilitados</p>
        <ShippingCarriersList
          isLoading={carriers.isLoading}
          isError={carriers.isError}
          data={carriers.data ?? []}
          onRetry={() => carriers.refetch()}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onTest} disabled={testing}>
          {testing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Zap className="mr-1.5 h-3.5 w-3.5" />
          )}
          Testar conexão
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDisconnect}
        >
          <Unplug className="mr-1.5 h-3.5 w-3.5" />
          Desconectar
        </Button>
      </div>
    </Card>
  )
}

interface ShippingCarriersListProps {
  isLoading: boolean
  isError: boolean
  data: {
    serviceId: string
    service: string
    carrier: string
    carrierLogoUrl?: string | null
  }[]
  onRetry: () => void
}

function ShippingCarriersList({
  isLoading,
  isError,
  data,
  onRetry,
}: ShippingCarriersListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-md" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
        Não foi possível carregar os serviços.{" "}
        <button
          type="button"
          onClick={onRetry}
          className="text-primary underline underline-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum serviço habilitado pelo embarcador.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((c) => (
        <span
          key={c.serviceId}
          className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
        >
          {c.carrierLogoUrl ? (
            <Image
              src={c.carrierLogoUrl}
              alt={c.carrier}
              width={14}
              height={14}
              unoptimized
              className="h-3.5 w-3.5 object-contain"
            />
          ) : null}
          <span className="font-medium">{c.service}</span>
          <span className="text-muted-foreground">· {c.carrier}</span>
        </span>
      ))}
    </div>
  )
}
