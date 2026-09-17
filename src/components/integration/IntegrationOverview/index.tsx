"use client"

import { ArrowDown, Cable } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { integrationOverview } from "@/lib/integration-presentation"
import type { Integration } from "@/types/integration.types"
import { IntegrationOverviewHeader } from "./IntegrationOverview.Header"
import { IntegrationOverviewConnection } from "./IntegrationOverview.Connection"
import { IntegrationOverviewSkeleton } from "./IntegrationOverview.Skeleton"

interface IntegrationOverviewProps {
  integrations: Integration[]
  onDetails: (integration: Integration) => void
}

function IntegrationOverview({
  integrations,
  onDetails,
}: IntegrationOverviewProps) {
  const { configured, activeCount, attentionCount } =
    integrationOverview(integrations)

  return (
    <section
      aria-labelledby="integration-overview-heading"
      className="flex flex-col gap-5"
    >
      <IntegrationOverview.Header
        activeCount={activeCount}
        attentionCount={attentionCount}
      />
      <div className="overflow-hidden rounded-xl border bg-card">
        {configured.length > 0 ? (
          <ul aria-label="Serviços configurados" className="divide-y">
            {configured.map((integration) => (
              <IntegrationOverview.Connection
                key={integration.id}
                integration={integration}
                onDetails={onDetails}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Cable}
            title="Comece pela sua primeira conexão"
            description="Escolha abaixo o serviço que sua loja já usa. Você pode conectar os demais quando precisar."
            className="px-6 py-8"
          >
            <Button asChild variant="outline">
              <a href="#integration-catalog">
                Explorar serviços <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </EmptyState>
        )}
      </div>
    </section>
  )
}

IntegrationOverview.Header = IntegrationOverviewHeader
IntegrationOverview.Connection = IntegrationOverviewConnection
IntegrationOverview.Skeleton = IntegrationOverviewSkeleton

export { IntegrationOverview }
