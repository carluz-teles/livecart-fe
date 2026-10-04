"use client"

import { CalendarClock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatarMinutos } from "@/components/shared/DurationField"

interface EventWindowSummaryProps {
  title: string
  startsAt?: string | null
  endsAt: string
  cartExpirationMinutes?: number | null
  waitlistNotifiedTtlMinutes?: number | null
  previousEndsAt?: string | null
  existingEvent?: boolean
  ended?: boolean
}

export function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value))
}

export function EventWindowSummary({
  title, startsAt, endsAt, cartExpirationMinutes, waitlistNotifiedTtlMinutes,
  previousEndsAt, existingEvent = false, ended = false,
}: EventWindowSummaryProps) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const earlier = previousEndsAt && new Date(endsAt) < new Date(previousEndsAt)
  const deadline = cartExpirationMinutes != null
    ? new Date(new Date(endsAt).getTime() + cartExpirationMinutes * 60_000).toISOString()
    : null

  return (
    <section aria-label="Resumo das datas" className="flex flex-col gap-4">
      <p className="break-words font-semibold">{title}</p>
      <dl className="flex flex-col gap-4 rounded-lg border p-4">
        <div>
          <dt className="text-sm text-muted-foreground">Começa a receber compras</dt>
          <dd className="font-medium">{startsAt ? formatEventDate(startsAt) : existingEvent ? "Sem início agendado" : "Assim que o evento for criado"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Último dia e horário para comentar e comprar</dt>
          <dd className="font-semibold">{formatEventDate(endsAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Prazo para finalizar o carrinho após o evento</dt>
          <dd>{cartExpirationMinutes != null ? formatarMinutos(cartExpirationMinutes) : "Padrão da loja"}</dd>
          {deadline && !existingEvent && <dd className="mt-1 text-sm">Previsto até {formatEventDate(deadline)}.</dd>}
        </div>
        {(waitlistNotifiedTtlMinutes ?? 0) > 0 && (
          <div>
            <dt className="text-sm text-muted-foreground">Adicional para quem aguarda estoque ao encerrar</dt>
            <dd>{formatarMinutos(waitlistNotifiedTtlMinutes!)}</dd>
          </div>
        )}
      </dl>
      <p className="text-xs text-muted-foreground">Horários no fuso {timeZone}. Carrinhos VIP não expiram.</p>
      <Alert>
        <CalendarClock className="size-4" />
        <AlertTitle>{ended ? "O evento continua encerrado" : earlier ? "Você está antecipando o encerramento" : "Comentários têm prazo para virar compra"}</AlertTitle>
        <AlertDescription>
          {ended
            ? "Alterar as datas de um evento encerrado não o reabre nem recupera comentários anteriores."
            : "Após o encerramento, novos comentários não adicionam produtos aos carrinhos, mesmo que o cliente ainda tenha prazo para finalizar a compra."}
          {earlier && !ended && " Confira se a nova data cobre todos os dias da sua campanha."}
          {existingEvent && " Os prazos já concedidos aos carrinhos são preservados."}
        </AlertDescription>
      </Alert>
    </section>
  )
}
