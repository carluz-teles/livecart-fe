"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function LiveDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/lives"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Live #{id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento em tempo real
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Feed de Comentarios</h2>
          <div className="mt-4 flex h-96 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              LiveMonitor.Feed
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Estatisticas</h2>
            <div className="mt-4 flex h-32 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                LiveMonitor.Stats
              </p>
            </div>
          </div>

          <Link
            href={`/lives/${id}/report`}
            className="rounded-lg border bg-card p-6 text-center transition-colors hover:bg-accent"
          >
            <p className="font-medium">Ver Relatorio</p>
            <p className="text-sm text-muted-foreground">
              Analise detalhada da live
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
