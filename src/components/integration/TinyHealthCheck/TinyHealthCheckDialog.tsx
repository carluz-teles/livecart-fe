"use client"

import { useState } from "react"
import { ListChecks, ShieldCheck, AlertTriangle } from "lucide-react"

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
  // Opcional: classes do botão pra alinhar com outros CTAs do card.
  triggerClassName?: string
}

// Botão + Dialog que substitui o painel inline. O botão mostra o status
// agregado (verde/âmbar/cinza) + contador de pendências. Clicando abre o
// modal com o checklist completo (TinyHealthCheck). Esconde silenciosamente
// se o backend reportar `supported: false` ou ainda estiver carregando o
// primeiro fetch sem dados.
export function TinyHealthCheckDialog({
  integrationId,
  triggerClassName,
}: TinyHealthCheckDialogProps) {
  const [open, setOpen] = useState(false)
  const query = useERPHealthCheck(integrationId)

  const data = query.data
  // Esconde o botão antes de carregar OU quando o ERP não suporta —
  // evita "piscar" um estado neutro que vira vermelho/verde.
  if (!data || !data.supported) return null

  const missingCount = data.items.filter((i) => i.status === "missing").length
  const allOk = missingCount === 0

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "flex-1 justify-center gap-1.5",
          allOk
            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            : "border-amber-300 text-amber-800 hover:bg-amber-50 hover:text-amber-900 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-950/30",
          triggerClassName
        )}
      >
        {allOk ? (
          <ShieldCheck className="h-3.5 w-3.5" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5" />
        )}
        <span>Cadastros</span>
        <span
          className={cn(
            "inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
            allOk
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-amber-200 text-amber-900 dark:bg-amber-800/60 dark:text-amber-100"
          )}
        >
          {allOk ? data.items.length : missingCount}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              Cadastros do Tiny
            </DialogTitle>
            <DialogDescription>
              Auditoria das formas de pagamento, recebimento e envio que o LiveCart consulta na
              hora de criar um pedido. Os faltantes precisam ser cadastrados manualmente no
              painel do Tiny — a API pública deles não permite criar via integração.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <TinyHealthCheck integrationId={integrationId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
