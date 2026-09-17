import { PlugZap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface IntegrationOverviewHeaderProps {
  activeCount: number
  attentionCount: number
}

export function IntegrationOverviewHeader({
  activeCount,
  attentionCount,
}: IntegrationOverviewHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <PlugZap className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <h2
            id="integration-overview-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Conexões da loja
          </h2>
          <p className="text-sm text-muted-foreground">
            Seus serviços e o que precisa da sua atenção.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {activeCount} {activeCount === 1 ? "ativa" : "ativas"}
        </Badge>
        {attentionCount > 0 ? (
          <Badge variant="outline">{attentionCount} para revisar</Badge>
        ) : null}
      </div>
    </header>
  )
}
