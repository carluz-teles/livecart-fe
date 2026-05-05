"use client"

import { useState } from "react"
import {
  ListChecks,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useERPHealthCheck } from "@/hooks/integration"
import { cn } from "@/lib/utils"

import { TinyHealthCheck } from "./index"

interface TinyHealthCheckDialogProps {
  integrationId: string
}

// Banner inline (cliente do card de integração) que mostra o estado da
// auditoria de cadastros do Tiny. Sempre presente quando a integração
// está conectada — durante a primeira carga aparece como skeleton para
// que o lojista perceba que tem algo sendo verificado, mesmo se passar
// rápido pela tela. Estados:
//   - loading        → barra com pulse animado + texto "Verificando…"
//   - error          → barra vermelha discreta com tentar de novo
//   - unsupported    → escondido (ERP não expõe a auditoria)
//   - all OK         → barra verde "X cadastros OK"
//   - has missing    → barra âmbar "X cadastros faltando" + chevron
// Click em qualquer estado terminal abre o modal com o checklist completo.
export function TinyHealthCheckDialog({ integrationId }: TinyHealthCheckDialogProps) {
  const [open, setOpen] = useState(false)
  const query = useERPHealthCheck(integrationId)

  // 1. LOADING — skeleton banner com pulse pra ser visível durante a carga.
  // Sai DEPOIS dos demais estados pra não piscar quando o cache devolve sync.
  if (query.isLoading) {
    return <TinyHealthCheckSkeleton />
  }

  // 2. ERROR — banner vermelho discreto. O dialog ainda abre pra mostrar o
  // estado de erro detalhado (TinyHealthCheck também trata isError).
  if (query.isError) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex w-full items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-left text-xs transition-colors hover:bg-destructive/10"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-destructive" />
          <span className="flex-1 font-medium text-destructive">
            Erro ao verificar cadastros do Tiny
          </span>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-destructive/60 transition-transform group-hover:translate-x-0.5" />
        </button>

        <DialogShell open={open} onOpenChange={setOpen} integrationId={integrationId} />
      </>
    )
  }

  const data = query.data
  // 3. UNSUPPORTED — esconde silenciosamente (ERP futuro sem audit endpoints).
  if (!data || !data.supported) return null

  const missingCount = data.items.filter((i) => i.status === "missing").length
  const totalCount = data.items.length
  const allOk = missingCount === 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          allOk
            ? `Auditar ${totalCount} cadastros do Tiny`
            : `${missingCount} cadastros do Tiny faltando — abrir checklist`
        }
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-all duration-150",
          allOk
            ? "border-emerald-200/70 bg-emerald-50/40 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
            : "border-amber-300/80 bg-amber-50/70 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
            allOk
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-amber-200 text-amber-800 dark:bg-amber-800/60 dark:text-amber-100"
          )}
        >
          {allOk ? (
            <ShieldCheck className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-medium leading-tight",
              allOk
                ? "text-emerald-900 dark:text-emerald-100"
                : "text-amber-900 dark:text-amber-100"
            )}
          >
            {allOk
              ? `${totalCount} cadastros do Tiny OK`
              : `${missingCount} cadastro${missingCount > 1 ? "s" : ""} do Tiny faltando`}
          </span>
          <span
            className={cn(
              "block leading-tight",
              allOk
                ? "text-emerald-700/80 dark:text-emerald-400/80"
                : "text-amber-800/80 dark:text-amber-300/80"
            )}
          >
            {allOk
              ? "Pedidos vão entrar categorizados"
              : "Pedidos podem cair em “Conta a Receber” genérica"}
          </span>
        </span>

        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5",
            allOk
              ? "text-emerald-700/60 dark:text-emerald-400/60"
              : "text-amber-800/70 dark:text-amber-300/70"
          )}
        />
      </button>

      <DialogShell open={open} onOpenChange={setOpen} integrationId={integrationId} />
    </>
  )
}

// Skeleton do banner — réplica fiel do banner final em altura/padding/borda
// pra zerar layout shift quando a request termina. Em vez de barras
// pulsando (que exigem leitura) usamos um spinner + texto explícito;
// o usuário entende o estado em meio segundo, mesmo passando rápido.
function TinyHealthCheckSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Verificando cadastros do Tiny"
      className="flex w-full items-center gap-2.5 rounded-lg border border-muted bg-muted/30 px-3 py-2 text-xs"
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight text-foreground">
          Verificando cadastros do Tiny
        </span>
        <span className="block leading-tight text-muted-foreground">
          Conferindo formas de pagamento, recebimento e envio
        </span>
      </span>
    </div>
  )
}

// Wraper do Dialog isolado pra reusar entre estados (error + ok). Evita
// duplicar markup do header e mantém o slot único do body como
// TinyHealthCheck (que já trata loading/error internamente).
function DialogShell({
  open,
  onOpenChange,
  integrationId,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  integrationId: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            Cadastros do Tiny
          </DialogTitle>
          <DialogDescription>
            Auditoria das formas de pagamento, recebimento e envio que o LiveCart consulta na hora
            de criar um pedido. Os faltantes precisam ser cadastrados manualmente no painel do
            Tiny — a API pública deles não permite criar via integração.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <TinyHealthCheck integrationId={integrationId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Botão de "voltar"/cancelar exposto pro consumidor caso queira fechar
// programaticamente — não usado hoje, mas mantém a API extensível.
export { Button as TinyHealthCheckCloseButton }
