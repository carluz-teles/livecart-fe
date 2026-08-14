"use client"

import { Loader2, PackageSearch } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useUpdateERPStockSource } from "@/hooks/integration"
import { cn } from "@/lib/utils"

interface ERPStockSourceProps {
  integrationId: string
  /** Estado atual, vindo do metadata da integração. Ausente = desligado. */
  useAvailableStock: boolean
}

/**
 * Escolha de qual saldo do ERP o LiveCart espelha.
 *
 * O informativo não é enfeite: "estoque físico" e "estoque disponível" são
 * termos do Tiny que o lojista vê no painel dele, e a diferença entre os dois só
 * aparece quando ele já tem documento aberto. Sem explicar o efeito, o toggle
 * vira adivinhação sobre o número que decide o que a loja vende.
 */
export function ERPStockSource({
  integrationId,
  useAvailableStock,
}: ERPStockSourceProps) {
  const mutation = useUpdateERPStockSource()
  const pending = mutation.isPending

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
      <div className="flex items-start gap-3">
        <PackageSearch className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

        <div className="min-w-0 flex-1">
          <Label
            htmlFor={`stock-source-${integrationId}`}
            className="text-sm font-medium text-gray-900"
          >
            Descontar o que já está reservado no ERP
          </Label>

          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            O Tiny guarda dois números: o{" "}
            <span className="font-medium text-gray-800">físico</span>, que é tudo
            o que está no depósito, e o{" "}
            <span className="font-medium text-gray-800">disponível</span>, que é
            o físico menos as peças já comprometidas em orçamentos salvos e
            pedidos em aberto.
          </p>

          <p
            className={cn(
              "mt-2 rounded-md px-2 py-1.5 text-xs leading-relaxed",
              useAvailableStock
                ? "bg-emerald-50 text-emerald-900"
                : "bg-amber-50 text-amber-900",
            )}
          >
            {useAvailableStock ? (
              <>
                O LiveCart está usando o <strong>disponível</strong>: peça
                reservada no ERP não é oferecida na live.
              </>
            ) : (
              <>
                O LiveCart está usando o <strong>físico</strong>: uma peça
                reservada em orçamento ainda pode ser vendida na live, e aí o
                pedido não terá como ser atendido.
              </>
            )}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Ligar custa uma consulta a mais ao Tiny por produto sincronizado, o
            que pode deixar a atualização de estoque um pouco mais lenta durante
            uma live movimentada. Se o Tiny não responder, o LiveCart mantém o
            saldo físico em vez de arriscar um número errado.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {pending && (
            <Loader2
              className="h-3.5 w-3.5 animate-spin text-gray-400"
              aria-hidden="true"
            />
          )}
          <Switch
            id={`stock-source-${integrationId}`}
            checked={useAvailableStock}
            disabled={pending}
            aria-busy={pending}
            onCheckedChange={(checked) =>
              mutation.mutate({ integrationId, useAvailableStock: checked })
            }
          />
        </div>
      </div>
    </div>
  )
}
