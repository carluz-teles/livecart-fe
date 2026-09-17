"use client"

import { useERPResyncRunning } from "@/hooks/integration"
import { QueryFeedback } from "@/components/shared/QueryFeedback"
import { Skeleton } from "@/components/ui/skeleton"
import { ERPResyncProgress } from "./ERPResyncProgress"
export { integrationDate } from "./ERPResyncProgress"

export function ERPResyncStatus() {
  const { integration, progress, error, isPending, isFetching, refetch } = useERPResyncRunning()
  if (isPending) return <Skeleton className="h-40 w-full" aria-label="Consultando sincronização" />
  return (
    <div className="space-y-3">
      {error ? (
        <QueryFeedback title="Não foi possível atualizar o progresso da sincronização"
          stale={!!integration} retry={() => void refetch()} busy={isFetching} />
      ) : null}
      {integration ? <ERPResyncProgress progress={progress} lastSyncedAt={integration.lastSyncedAt} /> : null}
    </div>
  )
}
