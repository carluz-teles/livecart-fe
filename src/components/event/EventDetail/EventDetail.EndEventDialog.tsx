"use client"

import { use } from "react"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { formatarMinutos } from "@/components/shared/DurationField"
import { formatEventDate } from "@/components/event/EventWindowSummary"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailEndEventDialog() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event, endEventOpen, endEventPreview: preview, endEventError } = ctx.state
  const { setEndEventOpen, endEvent, isEndingEvent, refresh } = ctx.actions
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <AlertDialog open={endEventOpen} onOpenChange={setEndEventOpen}>
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar o evento inteiro?</AlertDialogTitle>
          <AlertDialogDescription>
            Todas as transmissões serão encerradas. Novos comentários deixarão
            de adicionar produtos e começará o prazo para pagar os carrinhos pendentes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="break-words font-semibold">{event.title}</p>
        {preview ? (
          <section aria-label="Resumo do encerramento" className="flex flex-col gap-3">
            <dl className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Prazo aplicado a este evento</dt>
                <dd className="font-semibold">{formatarMinutos(preview.expirationMinutes)} após o encerramento</dd>
                <dd className="mt-1 text-muted-foreground">Já considera a configuração deste evento e o padrão da loja quando herdado.</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Vencimento previsto ao finalizar agora</dt>
                <dd className="font-semibold">{formatEventDate(preview.deadline)}</dd>
              </div>
              {preview.waitlistDeadline && (
                <div>
                  <dt className="text-muted-foreground">Para quem ainda aguarda estoque ao encerrar</dt>
                  <dd>Mais {formatarMinutos(preview.extraMinutes)}: até {formatEventDate(preview.waitlistDeadline)}.</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Envio de links ao encerrar</dt>
                <dd className="font-medium">{preview.autoSendLinks ? "Ativado nesta loja" : "Desativado nesta loja"}</dd>
                <dd className="mt-1 text-muted-foreground">
                  {preview.autoSendLinks
                    ? "O LiveCart tentará enviar os links aos clientes elegíveis. A entrega depende das permissões e da janela de mensagens do Instagram."
                    : "Finalizar o evento não enviará novas mensagens de checkout. Os links já enviados continuam válidos até o vencimento do carrinho."}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Horários no fuso {timeZone}. A previsão acompanha o momento da confirmação.
              Carrinhos VIP e pagos não expiram. Prazos maiores já concedidos são preservados.
            </p>
            {preview.scheduledEndPassed && (
              <Alert>
                <AlertTitle>A data de encerramento já passou</AlertTitle>
                <AlertDescription>O prazo conta desde {formatEventDate(preview.closedAt)}. Finalizar agora não reinicia a contagem.</AlertDescription>
              </Alert>
            )}
          </section>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível consultar o prazo e o envio de links</AlertTitle>
            <AlertDescription>
              Atualize os dados para conferir as regras antes de finalizar.
              <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>Atualizar dados</Button>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground">
          Só terminou uma transmissão? Encerre essa sessão na aba Sessões para continuar vendendo no mesmo evento.
        </p>
        {endEventError && <p role="alert" className="text-sm text-destructive">{endEventError}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isEndingEvent}>
            Continuar evento
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(click) => { click.preventDefault(); endEvent() }}
            disabled={isEndingEvent || !preview}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isEndingEvent ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Finalizando…
              </>
            ) : (
              "Finalizar evento"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
