import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewLivePage() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Nova Live</h1>
          <p className="text-sm text-muted-foreground">
            Configure os detalhes da sua live
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">
            Formulario de criacao de live
          </p>
        </div>
      </div>
    </div>
  )
}
