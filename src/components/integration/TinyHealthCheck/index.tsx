"use client"

import { Loader2, AlertCircle } from "lucide-react"

import { useERPHealthCheck } from "@/hooks/integration"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ERPHealthCheckCategory, ERPHealthCheckItem } from "@/types"
import { erpHealthCheckSummary } from "@/lib/integration-presentation"

import { TinyHealthCheckHeader } from "./TinyHealthCheck.Header"
import { TinyHealthCheckCategorySection } from "./TinyHealthCheck.CategorySection"
import { TinyHealthCheckItem } from "./TinyHealthCheck.Item"

interface TinyHealthCheckProps {
  integrationId: string
}

const CATEGORY_ORDER: ERPHealthCheckCategory[] = [
  "forma_pagamento",
  "forma_recebimento",
  "forma_envio",
]

// Body do checklist de cadastros do Tiny — sem chrome exterior, pensado
// pra ser embutido em qualquer container (hoje: TinyHealthCheckDialog).
// Estados internos: loading (skeleton compacto), erro (com retry),
// unsupported (esconde via null), all-ok / com-pendências (lista
// agrupada por categoria).
//
// Esconde silenciosamente quando o backend reporta `supported: false` —
// ERPs que não expõem a auditoria (Bling, Omie, etc.) não devem aparecer
// como "todos os cadastros OK", isso seria informação enganosa.
function TinyHealthCheck({ integrationId }: TinyHealthCheckProps) {
  const query = useERPHealthCheck(integrationId)

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="font-medium">Não foi possível auditar os cadastros do Tiny.</p>
          <p className="text-xs leading-relaxed text-destructive/80">
            A consulta pode ter demorado ou o Tiny pode estar indisponível. Tente novamente.
            Se persistir, use &ldquo;Testar conexão&rdquo; para verificar o acesso.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => query.refetch({ cancelRefetch: false })}
            disabled={query.isFetching}
          >
            {query.isFetching ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            Tentar de novo
          </Button>
        </div>
      </div>
    )
  }

  const data = query.data
  if (!data || !data.supported) return null

  const itemsByCategory = groupByCategory(data.items)
  const summary = erpHealthCheckSummary(data.items)

  return (
    <div className="space-y-5">
      <TinyHealthCheckHeader
        {...summary}
        checkedAt={data.checkedAt}
        isRefreshing={query.isFetching}
        onRefresh={() => query.refetch({ cancelRefetch: false })}
      />

      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const items = itemsByCategory[category] ?? []
          if (items.length === 0) return null
          return (
            <TinyHealthCheckCategorySection
              key={category}
              category={category}
              items={items}
            />
          )
        })}
      </div>
    </div>
  )
}

function groupByCategory(
  items: ERPHealthCheckItem[]
): Record<ERPHealthCheckCategory, ERPHealthCheckItem[]> {
  return items.reduce(
    (acc, item) => {
      acc[item.category] = acc[item.category] ?? []
      acc[item.category].push(item)
      return acc
    },
    {
      forma_pagamento: [],
      forma_recebimento: [],
      forma_envio: [],
    } as Record<ERPHealthCheckCategory, ERPHealthCheckItem[]>
  )
}

TinyHealthCheck.Header = TinyHealthCheckHeader
TinyHealthCheck.CategorySection = TinyHealthCheckCategorySection
TinyHealthCheck.Item = TinyHealthCheckItem

export { TinyHealthCheck }
