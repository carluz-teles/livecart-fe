"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function LiveReportPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/lives/${id}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Relatorio da Live #{id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Analise detalhada de vendas e engajamento
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {["Total Vendas", "Pedidos", "Viewers", "Taxa Conversao"].map((title) => (
          <div key={title} className="rounded-lg border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">--</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Produtos Mais Vendidos</h2>
        <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">
            LiveReport.ProductBreakdown
          </p>
        </div>
      </div>
    </div>
  )
}
