"use client"

import { Loader2, AlertCircle } from "lucide-react"

import { useERPHealthCheck } from "@/hooks/integration"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ERPHealthCheckCategory, ERPHealthCheckItem } from "@/types"

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

// Auditoria das três cadastros do Tiny que o LiveCart consulta na hora de
// criar pedido (formas de pagamento, recebimento e envio). Mostra um
// checklist com link pro caminho exato dentro do painel Tiny pra cada
// cadastro faltando, e oferece um "Verificar de novo" que dispensa o
// reload da página.
//
// Esconde silenciosamente quando o backend reporta `supported: false` —
// ERPs que não expõem a auditoria (Bling, Omie, etc.) não devem aparecer
// como "todos os cadastros OK", isso seria informação enganosa.
function TinyHealthCheck({ integrationId }: TinyHealthCheckProps) {
  const query = useERPHealthCheck(integrationId)

  if (query.isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3 border-b pb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="font-medium">Não foi possível auditar os cadastros do Tiny.</p>
          <p className="text-xs leading-relaxed text-destructive/80">
            Verifique se o token do Tiny está válido em &ldquo;Testar conexão&rdquo;. Se persistir,
            tente reconectar a integração.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => query.refetch()}
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
  const missingCount = data.items.filter((i) => i.status === "missing").length

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <TinyHealthCheckHeader
        missingCount={missingCount}
        totalCount={data.items.length}
        checkedAt={data.checkedAt}
        isRefreshing={query.isFetching}
        onRefresh={() => query.refetch()}
      />

      <div className="mt-5 space-y-6">
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
