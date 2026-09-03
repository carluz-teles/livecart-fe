"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventComment } from "@/types/event.types"
import { eventKeys } from "./useEvents"

/** Teto do servidor por página. Pedir mais é clamped lá para 100, então este
 *  número não é preferência: é o que a API realmente entrega. */
export const FALAS_POR_PAGINA = 200

/**
 * As falas de UMA transmissão, ou da campanha inteira quando `sessionId` é
 * vazio.
 *
 * Infinita porque uma live de verdade passa de mil comentários e o servidor
 * corta em 200. Antes isto era uma query simples: pegava a primeira página e
 * calava — a tela mostrava 100 de 768 sem nada dizendo que havia mais, e o
 * seletor de transmissão, montado sobre essas 100, concluía que a campanha
 * tinha uma transmissão só.
 */
export function useEventComments(eventId: string, sessionId?: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useInfiniteQuery({
    queryKey: eventKeys.detailComments(storeId ?? "", eventId, sessionId),
    queryFn: async ({ pageParam }): Promise<EventComment[]> => {
      const token = await getToken()
      const response = await eventService.listComments(
        storeId!,
        eventId,
        { sessionId, limit: FALAS_POR_PAGINA, offset: pageParam },
        token,
      )
      return response.data
    },
    initialPageParam: 0,
    // Página cheia é o único sinal honesto de "tem mais": o endpoint não
    // devolve total, e adivinhar pelo totalComments da sessão erraria sempre
    // que uma fala fosse apagada.
    getNextPageParam: (ultima, todas) =>
      ultima.length < FALAS_POR_PAGINA ? undefined : todas.length * FALAS_POR_PAGINA,
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
