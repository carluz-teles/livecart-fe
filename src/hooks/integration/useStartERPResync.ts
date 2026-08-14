"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "@/hooks/product/useProducts"

export function useStartERPResync() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrationId: string) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.startERPResync(storeId, integrationId, token)
    },
    onSuccess: ({ products }) => {
      // Zero produtos não é erro: é uma loja que ainda não importou nada desse
      // ERP. Dizer "sincronização iniciada" ali seria mentira educada.
      if (products === 0) {
        toast.info("Nenhum produto vinculado a este ERP para sincronizar")
        return
      }
      toast.success(
        `${products} ${products === 1 ? "produto entrou" : "produtos entraram"} na sincronização`,
        {
          description:
            "O trabalho corre em segundo plano, no ritmo que o ERP permite. Atualize a lista em alguns minutos para ver os saldos corrigidos.",
          duration: 8000,
        },
      )
      // A varredura é assíncrona: isto não traz os saldos novos, só garante que
      // a lista não fique presa num cache antigo quando o lojista voltar.
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      }
    },
    onError: () => {
      toast.error("Não foi possível iniciar a sincronização")
    },
  })
}
