import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Unplug,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { integrationConnectionState } from "@/lib/integration-presentation"
import type { Integration } from "@/types/integration.types"

interface IntegrationConnectionStatusProps {
  integration: Integration
}

const stateIcons = {
  active: CheckCircle2,
  error: AlertCircle,
  pending: Clock3,
  syncing: RefreshCw,
  disconnected: Unplug,
}

export function IntegrationConnectionStatus({
  integration,
}: IntegrationConnectionStatusProps) {
  const state = integrationConnectionState(integration)
  const Icon = stateIcons[state.kind]

  return (
    <Badge
      variant={
        state.kind === "error"
          ? "destructive"
          : state.kind === "active"
            ? "secondary"
            : "outline"
      }
      className="gap-1.5 whitespace-nowrap"
    >
      <Icon
        aria-hidden="true"
        className={
          state.kind === "syncing"
            ? "size-3.5 motion-safe:animate-spin"
            : "size-3.5"
        }
      />
      {state.label}
    </Badge>
  )
}
