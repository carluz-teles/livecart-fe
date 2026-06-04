"use client"

import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import type { ApiError } from "@/types"

// Error messages for common HTTP status codes
const ERROR_MESSAGES: Record<number, string> = {
  400: "Dados invalidos",
  401: "Sessao expirada. Faca login novamente.",
  403: "Voce nao tem permissao para esta acao",
  404: "Recurso nao encontrado",
  409: "Conflito: este recurso ja existe",
  422: "Dados invalidos",
  429: "Muitas requisicoes. Aguarde um momento.",
  500: "Erro interno do servidor",
  502: "Servidor indisponivel",
  503: "Servico temporariamente indisponivel",
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as ApiError
    // Use the API error message if available, otherwise use generic message
    if (apiError.message && apiError.message !== "An error occurred") {
      return apiError.message
    }
    return ERROR_MESSAGES[apiError.status] || "Erro ao processar requisicao"
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Erro desconhecido"
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time of 30 seconds
            staleTime: 30 * 1000,
            // Cache time of 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            // Log error for debugging
            console.error("Mutation error:", {
              mutationKey: mutation.options.mutationKey,
              error,
            })

            // Only show toast if the mutation doesn't have its own onError handler
            // This allows individual mutations to override the default behavior
            if (!mutation.options.onError) {
              toast.error(getErrorMessage(error))
            }
          },
          // Cache-level success toast driven by mutation `meta`. Cache callbacks
          // fire even after the triggering component unmounts — so long-running
          // mutations (e.g. publishing a post/Reel) still notify the user when
          // they closed the dialog before it finished. Opt in per mutation by
          // setting meta.successMessage.
          onSuccess: (_data, _variables, _context, mutation) => {
            const meta = mutation.meta as
              | { successMessage?: string; successDescription?: string }
              | undefined
            if (meta?.successMessage) {
              toast.success(
                meta.successMessage,
                meta.successDescription ? { description: meta.successDescription } : undefined
              )
            }
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
