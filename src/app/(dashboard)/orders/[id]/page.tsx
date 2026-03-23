import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface OrderDetailPageProps {
  params: { id: string }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pedido #{params.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detalhes do pedido
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Itens do Pedido</h2>
          <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              Lista de itens
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Informacoes do Cliente</h2>
          <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              Dados do cliente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
