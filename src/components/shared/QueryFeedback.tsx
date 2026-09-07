"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function QueryFeedback({
  title,
  stale = false,
  retry,
  busy = false,
}: {
  title: string
  stale?: boolean
  retry: () => void
  busy?: boolean
}) {
  return (
    <Alert>
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {stale
            ? "Exibindo os últimos dados recebidos. Eles podem estar desatualizados."
            : "Os dados estão indisponíveis no momento. Tente carregar novamente."}
        </p>
        <Button variant="outline" size="sm" disabled={busy} onClick={retry}>
          <RefreshCw
            data-icon="inline-start"
            className={busy ? "animate-spin" : undefined}
          />
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  )
}
