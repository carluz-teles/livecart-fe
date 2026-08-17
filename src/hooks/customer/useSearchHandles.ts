"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { customerService } from "@/services/api/customer.service"
import { useStoreId } from "@/hooks/useUser"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { customerKeys } from "./useCustomers"
import type { SeenHandle } from "@/types"

// Piso do termo, espelhando o backend: abaixo de 2 caracteres ele recusa com
// 422. Guardar aqui evita disparar uma requisição que já sabemos que volta erro
// enquanto a lojista digita a primeira letra.
export const HANDLE_SEARCH_MIN_TERM = 2

// normalizeTerm reproduz a normalização do backend (sem @, minúsculo) para o
// piso ser medido no MESMO texto que vai ser buscado — "@a" parece ter dois
// caracteres e não tem nenhum de arroba.
function normalizeTerm(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase()
}

interface UseSearchHandlesOptions {
  exact?: boolean
}

// useSearchHandles busca arrobas na plateia das lives da loja.
//
// Não existe listagem completa: sem termo o hook fica desabilitado e a tela
// mostra o estado inicial. Foi decisão de produto — a plateia de uma live tem
// centenas de arrobas, e escolher o perfil certo numa parede desse tamanho é
// mais arriscado do que buscar.
export function useSearchHandles(
  rawTerm: string,
  { exact = false }: UseSearchHandlesOptions = {},
) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  // Debounce no texto CRU: normalizar antes mudaria a identidade da query a
  // cada tecla de pontuação sem necessidade.
  const debouncedRaw = useDebounce(rawTerm, 350)
  const term = normalizeTerm(debouncedRaw)
  const longEnough = term.length >= HANDLE_SEARCH_MIN_TERM

  const query = useQuery({
    queryKey: customerKeys.handleSearch(storeId ?? "", term, exact),
    queryFn: async (): Promise<SeenHandle[]> => {
      const token = await getToken()
      return customerService.searchHandles(storeId!, { search: term, exact }, token)
    },
    enabled:
      isLoaded && isSignedIn && !storeLoading && !!storeId && longEnough,
    // A plateia de uma live não muda enquanto a lojista decide quem bloquear.
    staleTime: 30_000,
  })

  return {
    ...query,
    term,
    // `searching` distingue "esperando o debounce" de "sem busca": sem isso a
    // tela pisca o estado inicial entre a tecla e a requisição.
    searching: longEnough && (query.isFetching || debouncedRaw !== rawTerm),
    hasTerm: longEnough,
  }
}
