"use client"

import { useEffect } from "react"
import { isStaleDeploymentError } from "@/lib/deployment-error"
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const staleVersion = isStaleDeploymentError(error)
  useEffect(() => {
    // Log error to console in development
    console.error("Dashboard error:", error)

    // TODO: Send to error tracking service (Sentry, etc.)
  }, [error])

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Erro ao carregar</CardTitle>
          <CardDescription>
            Ocorreu um erro ao carregar esta pagina. Tente novamente ou volte ao
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staleVersion && <p className="mb-4 text-sm text-muted-foreground">Esta aba usa uma versão anterior. Recarregue a página e confira o resultado da última ação antes de tentar novamente.</p>}
        {error.digest && (
            <p className="mb-4 text-center font-mono text-xs text-muted-foreground">
              Erro: {error.digest}
            </p>
          )}

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => staleVersion ? window.location.reload() : reset()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {staleVersion ? "Carregar versão atual" : "Tentar novamente"}
            </Button>

            <Button
              variant="default"
              onClick={() => window.location.href = "/dashboard"}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
