"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"

interface UpdateERPStockSourceArgs {
  integrationId: string
  useAvailableStock: boolean
}

export function useUpdateERPStockSource() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      integrationId,
      useAvailableStock,
    }: UpdateERPStockSourceArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.updateERPStockSource(
        storeId,
        integrationId,
        useAvailableStock,
        token,
      )
    },
    onSuccess: (_data, { useAvailableStock }) => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: integrationKeys.list(storeId) })
      }
      // A mensagem nomeia o efeito, não a configuração: "salvo com sucesso" não
      // diz ao lojista o que passou a acontecer com o estoque dele.
      toast.success(
        useAvailableStock
          ? "O LiveCart passa a usar o estoque disponível do ERP"
          : "O LiveCart volta a usar o estoque físico do ERP",
      )
    },
    onError: () => {
      toast.error("Não foi possível alterar a origem do estoque")
    },
  })
}
