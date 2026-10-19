"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TinyHealthCheckDialog } from "@/components/integration/TinyHealthCheck/TinyHealthCheckDialog"
import DashboardError from "@/app/(dashboard)/error"
import RootError from "@/app/error"

export default function ERPHealthFixture() {
  const [client] = useState(() => new QueryClient())
  const [visible, setVisible] = useState(true)
  const [failure, setFailure] = useState<"dashboard" | "root" | null>(null)
  const [error] = useState(() => new Error('Failed to find Server Action "old-deployment".'))

  if (failure === "dashboard") return <DashboardError error={error} reset={() => setFailure(null)} />
  if (failure === "root") return <RootError error={error} reset={() => setFailure(null)} />

  return (
    <QueryClientProvider client={client}>
      <main className="mx-auto max-w-xl space-y-4 p-6">
        <h1>Diagnóstico de integração</h1>
        <button onClick={() => setVisible(value => !value)}>
          {visible ? "Ocultar auditoria" : "Mostrar auditoria"}
        </button>
        {visible && <TinyHealthCheckDialog integrationId="audit-integration" />}
        <button onClick={() => setFailure("dashboard")}>Simular versão anterior no painel</button>
        <button onClick={() => setFailure("root")}>Simular versão anterior na página pública</button>
      </main>
    </QueryClientProvider>
  )
}
