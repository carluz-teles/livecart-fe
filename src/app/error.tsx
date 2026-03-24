"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error)

    // TODO: Send to error tracking service (Sentry, etc.)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Algo deu errado
        </h1>

        <p className="mb-6 text-muted-foreground">
          Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos
          trabalhando para resolver.
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            Erro: {error.digest}
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>

          <Button variant="default" onClick={() => window.location.href = "/"}>
            <Home className="mr-2 h-4 w-4" />
            Voltar ao inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
