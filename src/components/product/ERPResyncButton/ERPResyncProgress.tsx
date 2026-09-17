import { CheckCircle2, Clock3, Database, TriangleAlert } from "lucide-react"
import type { ResyncProgressView } from "@/hooks/integration/resync-progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function integrationDate(value?: string | null) {
  if (!value) return "Ainda não registrada"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Data indisponível"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date)
}

const number = new Intl.NumberFormat("pt-BR")

interface ERPResyncProgressProps {
  progress: ResyncProgressView
  lastSyncedAt?: string
}

export function ERPResyncProgress({ progress, lastSyncedAt }: ERPResyncProgressProps) {
  const Icon = progress.running
    ? Clock3
    : progress.status === "completed"
      ? CheckCircle2
      : progress.status === "idle" ? Database : TriangleAlert

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Sincronização do catálogo</CardTitle>
          <Badge variant="outline" className="gap-1.5">
            <Icon className="size-3.5" aria-hidden="true" />
            {progress.label}
          </Badge>
        </div>
        <CardDescription>{progress.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress.total > 0 ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2" role="status" aria-live="polite">
              <p className="text-sm">
                <span className="font-medium tabular-nums">{number.format(progress.done)}</span> de{" "}
                <span className="tabular-nums">{number.format(progress.total)}</span> produtos processados
              </p>
              <p className="text-2xl font-semibold tabular-nums">{number.format(progress.percent ?? 0)}%</p>
            </div>
            <Progress value={progress.percent} aria-label="Progresso do processamento do catálogo" />
            <dl className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/30 p-3">
              {[
                ["Atualizados", progress.succeeded],
                ["Com falha", progress.failed],
                ["Restantes", progress.remaining],
              ].map(([label, count]) => (
                <div key={label} className="space-y-1">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{typeof count === "number" ? number.format(count) : "—"}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : progress.running ? <p role="status" className="text-sm">Aguardando a contagem dos produtos…</p> : null}
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            {progress.updatedAt
              ? `Progresso salvo em ${integrationDate(progress.updatedAt)}.`
              : `Última atualização registrada pela integração: ${integrationDate(lastSyncedAt)}.`}
          </p>
          {progress.nextAttemptAt ? <p>Próxima tentativa a partir de {integrationDate(progress.nextAttemptAt)}.</p> : null}
          {progress.running ? <p>O acompanhamento é atualizado automaticamente. O avanço é preservado entre tentativas.</p> : null}
          {progress.failed ? <p>O percentual inclui produtos com falha; consulte a quantidade de produtos atualizados.</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
