"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { SessionProduct } from "@/types/event.types"
import { eventKeys } from "./useEvents"

/**
 * Os produtos que UMA transmissão pode vender.
 *
 * Lista vazia não é ausência de dado: significa que a transmissão vende todos
 * os produtos ativos da loja. Quem renderiza precisa dizer isso — um card vazio
 * e mudo faz o lojista achar que perdeu a configuração.
 */
export function useSessionProducts(eventId: string, sessionId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.sessionProducts(storeId ?? "", eventId, sessionId),
    queryFn: async (): Promise<SessionProduct[]> => {
      const token = await getToken()
      const response = await eventService.listSessionProducts(
        storeId!,
        eventId,
        sessionId,
        token
      )
      return response.data
    },
    enabled:
      isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId && !!sessionId,
  })
}
