"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useIntegrations, useStartERPResync } from "@/hooks/integration"

/**
 * Relê no ERP todos os produtos vinculados da loja.
 *
 * Existe porque mudar de qual saldo o LiveCart espelha só afeta as próximas
 * sincronizações — não reescreve o que já está gravado. Sem este botão, cada
 * produto importado com o saldo físico só se corrigiria quando o lojista
 * mexesse nele no ERP, um por um.
 *
 * Só aparece quando há ERP ativo: sem integração não existe de onde reler, e um
 * botão que não faz nada é pior que botão nenhum.
 */
export function ERPResyncButton() {
  const [confirming, setConfirming] = useState(false)
  const { data } = useIntegrations()
  const resync = useStartERPResync()

  const erp = data?.data?.find(
    (i) => i.type === "erp" && i.status === "active",
  )
  if (!erp) return null

  const pending = resync.isPending

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirming(true)}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Sincronizar com o ERP
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sincronizar todos os produtos?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm leading-relaxed">
                <p>
                  O LiveCart vai reler cada produto vinculado ao ERP e atualizar
                  estoque, preço e dados de envio com o que estiver lá agora.
                </p>
                <p>
                  É o que corrige de uma vez os produtos importados antes de você
                  escolher qual saldo o LiveCart usa — a configuração vale para
                  as próximas sincronizações, mas não reescreve sozinha o que já
                  estava salvo.
                </p>
                <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                  A varredura corre em segundo plano e respeita o limite de
                  requisições do ERP, então pode levar alguns minutos. Prefira
                  rodar fora de uma live: durante a transmissão ela divide a
                  mesma cota com as atualizações de estoque das vendas.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirming(false)
                resync.mutate(erp.id)
              }}
            >
              Sincronizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
