"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

import { notificationService } from "@/services/api/notification.service"
import { useStoreId } from "@/hooks/useUser"
import type { UndeliveredResponse } from "@/types/notification.types"

import { communicationsKeys } from "./keys"

/**
 * Compradores que não puderam ser avisados nesta campanha (RN-38).
 *
 * A janela do Instagram para responder um comentário é de 7 dias e vale uma
 * vez por comentário. Numa campanha longa, quem comentou no primeiro dia pode
 * estar fora do prazo quando ela encerrar. Quando isso acontece o LiveCart
 * **não envia** — registra o motivo. Esta lista é o que transforma esse
 * registro em ação do lojista.
 */
export function useUndelivered(eventId: string) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  return useQuery<UndeliveredResponse>({
    queryKey: communicationsKeys.undelivered(storeId ?? "", eventId),
    queryFn: async () => {
      const token = await getToken()
      return notificationService.listUndelivered(storeId!, eventId, token)
    },
    enabled: !!storeId && !!eventId,
  })
}
