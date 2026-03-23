import Link from "next/link"
import { Plus } from "lucide-react"

export default function LivesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lives</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas lives e acompanhe as vendas em tempo real
          </p>
        </div>
        <Link
          href="/lives/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova Live
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Voce ainda nao tem nenhuma live
            </p>
            <Link
              href="/lives/new"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              Criar primeira live
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
