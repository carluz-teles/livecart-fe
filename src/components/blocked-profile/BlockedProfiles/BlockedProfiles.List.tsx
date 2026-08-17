"use client"

import { ShieldOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BlockProfileButton } from "@/components/shared/BlockProfileButton"
import { useBlockedHandles } from "@/hooks/customer"
import { formatDateTime } from "@/lib/format"

// Lista dos perfis bloqueados hoje.
//
// Esta lista SIM aparece inteira, ao contrário da busca: o volume é de unidades
// (as contas da própria loja mais alguns casos), e ver o que está bloqueado é a
// única forma de a lojista descobrir por que um pedido esperado não entrou.
export function BlockedProfilesList() {
  const { data, isLoading, isError } = useBlockedHandles()
  const bloqueados = data?.data ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ShieldOff className="h-4 w-4" />
          Bloqueados agora
          {!isLoading && bloqueados.length > 0 && (
            <span className="tabular-nums text-muted-foreground">
              ({bloqueados.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {!isLoading && isError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Não conseguimos carregar a lista. Recarregue a página.
          </p>
        )}

        {!isLoading && !isError && bloqueados.length === 0 && (
          <div className="rounded-md border border-dashed px-4 py-8 text-center">
            <p className="text-sm font-medium">Nenhum perfil bloqueado</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              Todas as mensagens que chegarem nas suas lives podem virar pedido.
            </p>
          </div>
        )}

        {!isLoading && bloqueados.length > 0 && (
          <ul className="divide-y rounded-md border">
            {bloqueados.map((perfil) => (
              <li
                key={perfil.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-medium">
                    @{perfil.handle}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Bloqueado em {formatDateTime(perfil.blockedAt)}
                  </p>
                  {perfil.reason && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      “{perfil.reason}”
                    </p>
                  )}
                </div>
                <BlockProfileButton handle={perfil.handle} blocked />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
