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

// Tira o tom geral do checklist no topo (verde / âmbar) e oferece o
// "Verificar de novo" — sem repetir o título, isso fica no DialogTitle.
export function TinyHealthCheckHeader({
  missingCount,
  totalCount,
  checkedAt,
  isRefreshing,
  onRefresh,
}: TinyHealthCheckHeaderProps) {
  const allOk = missingCount === 0 && totalCount > 0
  const tone = allOk
    ? "border-emerald-200/70 bg-emerald-50/40 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100"
    : "border-amber-200/70 bg-amber-50/40 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100"

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tone}`}
    >
      <div className="flex items-start gap-2.5">
        {allOk ? (
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        )}
        <p className="text-xs leading-relaxed">
          {allOk
            ? "Todas as formas de pagamento, recebimento e envio estão cadastradas. Pedidos vão entrar no Tiny já categorizados."
            : `${missingCount} cadastro${missingCount > 1 ? "s" : ""} faltando — sem eles o pedido entra no Tiny como "Conta a Receber" genérica ou com transportadora padrão.`}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:flex-shrink-0">
        {checkedAt ? (
          <span className="text-[11px] opacity-70">
            Verificado {formatRelative(checkedAt)}
          </span>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-7 bg-background/60 px-2.5 text-xs"
        >
          {isRefreshing ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-3 w-3" />
          )}
          Verificar
        </Button>
      </div>
    </div>
  )
}
