import type { ApiError } from "@/types"

export function getApiErrorMessage(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  const apiError = err as ApiError | undefined
  if (!apiError || typeof apiError !== "object") return fallback
  return apiError.error || apiError.message || fallback
}

export function getERPSearchErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined
  const status = apiError?.status
  const raw = (apiError?.error || apiError?.message || "").toLowerCase()

  switch (status) {
    case 401:
      return "Sessão expirada. Faça login novamente."
    case 403:
      return "Você não tem permissão para acessar esta integração."
    case 404:
      if (raw.includes("integration")) {
        return "Integração não encontrada. Reconecte o ERP nas configurações."
      }
      return "Nenhum produto encontrado no ERP."
    case 422:
      if (raw.includes("erp provider")) {
        return "Esta integração não é um ERP. Verifique as configurações."
      }
      if (raw.includes("estoque")) {
        return "Produto encontrado, mas sem estoque disponível no momento."
      }
      return apiError?.error || "Não foi possível completar a busca."
    case 408:
      return "A busca demorou demais. Tente novamente."
    case 500:
      return "Erro interno do servidor. Tente novamente em instantes."
    case 503:
      // Estrangulamento do ERP. Antes a busca devolvia lista vazia e a tela
      // dizia "nada encontrado" — o lojista concluía que o produto não existia
      // e clicava de novo, somando pressão no limitador. "Não achei" e "não
      // posso olhar agora" pedem ações opostas dele.
      return (
        apiError?.error ||
        "O ERP está limitando as consultas neste momento. Aguarde alguns segundos e busque de novo."
      )
    default:
      return apiError?.error || apiError?.message || "Erro ao buscar produtos no ERP."
  }
}
