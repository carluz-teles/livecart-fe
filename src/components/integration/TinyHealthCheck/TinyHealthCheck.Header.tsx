import { ShieldCheck, RefreshCw, Loader2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TinyHealthCheckHeaderProps {
  missingCount: number
  totalCount: number
  checkedAt: string | null
  isRefreshing: boolean
  onRefresh: () => void
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.valueOf())) return ""
  const diffMs = Date.now() - date.valueOf()
  const diffSec = Math.round(diffMs / 1000)
  if (diffSec < 60) return "há instantes"
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `há ${diffH} h`
  return date.toLocaleDateString("pt-BR")
}

export function TinyHealthCheckHeader({
  missingCount,
  totalCount,
  checkedAt,
  isRefreshing,
  onRefresh,
}: TinyHealthCheckHeaderProps) {
  const allOk = missingCount === 0 && totalCount > 0

  return (
    <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex items-start gap-3">
        <div
          className={
            allOk
              ? "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }
        >
          {allOk ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">Cadastros do Tiny</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {allOk
              ? "Todas as formas de pagamento, recebimento e envio que o LiveCart usa estão cadastradas. Pedidos vão entrar no Tiny já categorizados."
              : missingCount > 0
                ? `${missingCount} cadastro${missingCount > 1 ? "s" : ""} faltando — sem eles o pedido entra no Tiny como "Conta a Receber" genérica ou com transportadora padrão.`
                : "Auditoria dos cadastros que o LiveCart consulta na hora de criar um pedido."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-shrink-0">
        {checkedAt ? (
          <span className="text-[11px] text-muted-foreground">
            Verificado {formatRelative(checkedAt)}
          </span>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3 w-3" />
          )}
          Verificar de novo
        </Button>
      </div>
    </header>
  )
}
