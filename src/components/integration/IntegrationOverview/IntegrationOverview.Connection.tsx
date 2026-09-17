import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IntegrationCardLogo } from "@/components/integration/IntegrationCard/IntegrationCard.Logo"
import { IntegrationConnectionStatus } from "@/components/integration/IntegrationConnectionStatus"
import {
  integrationConnectionState,
  integrationName,
  integrationRoles,
} from "@/lib/integration-presentation"
import type { Integration } from "@/types/integration.types"
import { cn } from "@/lib/utils"

interface IntegrationOverviewConnectionProps {
  integration: Integration
  onDetails: (integration: Integration) => void
}

export function IntegrationOverviewConnection({
  integration,
  onDetails,
}: IntegrationOverviewConnectionProps) {
  const state = integrationConnectionState(integration)
  const name = integrationName(integration)

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5",
        state.attention && "bg-accent/40",
      )}
    >
      <div aria-hidden="true">
        <IntegrationCardLogo provider={integration.provider} size="sm" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {integrationRoles[integration.type]}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <IntegrationConnectionStatus integration={integration} />
          {state.attention ? (
            <p className="max-w-xs text-xs text-muted-foreground sm:text-right">
              {state.detail}
            </p>
          ) : null}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Ver detalhes de ${name}`}
        onClick={() => onDetails(integration)}
      >
        <span className="hidden md:inline">Detalhes</span>
        <ChevronRight aria-hidden="true" />
      </Button>
    </li>
  )
}
