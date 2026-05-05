import { CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ERPHealthCheckItem } from "@/types"

interface TinyHealthCheckItemProps {
  item: ERPHealthCheckItem
}

// Single-row audit result. Green when matched, amber when missing —
// amber instead of red because "missing" is a cadastro-the-merchant-can-fix
// situation, not a hard failure of the integration.
export function TinyHealthCheckItem({ item }: TinyHealthCheckItemProps) {
  const isOk = item.status === "ok"

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        isOk
          ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10"
          : "border-amber-200/70 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
          isOk
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
        )}
      >
        {isOk ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium leading-tight">{item.expected_name}</span>
          {isOk && item.matched_id ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              id #{item.matched_id}
            </span>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>

        {!isOk && (
          <div className="flex items-center gap-1 pt-0.5 text-xs">
            <ArrowUpRight className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-400">
              Cadastre em{" "}
              <span className="font-medium text-amber-900 dark:text-amber-200">
                {item.panel_path}
              </span>{" "}
              dentro do Tiny.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
