import type { ApiError } from "@/types"

const CART_MERGED_MESSAGE = "Este carrinho foi incorporado a um carrinho VIP. Fale com a loja para receber o link do carrinho VIP."

// Used by both the initial server response and client-side refetch failures.
export function getCheckoutLoadError(err: Pick<ApiError, "status" | "reason" | "error" | "message"> | null) {
  if (err?.reason === "CART_MERGED") {
    return {
      title: "Carrinho incorporado ao VIP",
      message: CART_MERGED_MESSAGE,
      canRetry: false,
      showBrowserHelp: false,
    }
  }
  if (err?.reason === "CART_EXPIRED") {
    return {
      title: "Carrinho expirado",
      message: "O prazo deste carrinho terminou. Fale com a loja para conferir sua compra.",
      canRetry: false,
      showBrowserHelp: false,
    }
  }
  return {
    title: "Erro ao carregar",
    message: err?.error || err?.message || "Carrinho não encontrado",
    canRetry: true,
    showBrowserHelp: true,
  }
}

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  customerName: "Nome",
  customerDocument: "CPF",
  customerPhone: "Telefone",
  "shippingAddress.zipCode": "CEP",
  "shippingAddress.street": "Rua",
  "shippingAddress.number": "Número",
  "shippingAddress.complement": "Complemento",
  "shippingAddress.neighborhood": "Bairro",
  "shippingAddress.city": "Cidade",
  "shippingAddress.state": "UF",
  token: "Cartão",
  installments: "Parcelas",
}

export function getCheckoutErrorMessage(
  err: unknown,
  fallback = "Não foi possível processar o pagamento. Tente novamente."
): string {
  const apiError = err as ApiError | undefined
  if (!apiError || typeof apiError !== "object") return fallback

  if (apiError.reason === "CART_MERGED") return CART_MERGED_MESSAGE

  if (apiError.status === 422) {
    const fieldEntries = apiError.fields ? Object.entries(apiError.fields) : []
    if (fieldEntries.length > 0) {
      const formatted = fieldEntries.map(([field, msg]) => {
        const label = FIELD_LABELS[field] ?? field
        return `${label}: ${msg}`
      })
      return formatted.join(" · ")
    }
    return (
      apiError.error ||
      apiError.message ||
      "Preencha todos os campos obrigatórios para continuar."
    )
  }

  if (apiError.status === 408) return "A conexão demorou demais. Tente novamente."
  if (apiError.status === 404) return "Carrinho não encontrado ou expirado."
  if (apiError.status && apiError.status >= 500) {
    return "Erro no servidor. Tente novamente em instantes."
  }

  return apiError.error || apiError.message || fallback
}
