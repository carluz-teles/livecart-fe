export function paymentMethodLabel(
  method?: string,
  installments?: number,
): string | null {
  switch (method) {
    case "pix":
      return "PIX"
    case "card":
    case "credit_card":
      return installments && installments > 1
        ? `Cartão de crédito · ${installments}x`
        : "Cartão de crédito"
    case "debit_card":
      return "Cartão de débito"
    case "boleto":
      return "Boleto"
    case "manual":
    case "erp_manual":
      return "Pagamento confirmado pela loja"
    default:
      return null
  }
}
