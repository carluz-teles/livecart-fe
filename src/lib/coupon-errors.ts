import type { ApiError } from "@/types"

// Maps the literal messages returned by the coupon BE service into clearer
// PT-BR copy for the buyer-facing checkout. The matching is substring-based
// because some messages embed dynamic data (e.g. minimum purchase amount in
// BRL) and we want the friendly translation regardless of the suffix.
//
// Order matters: more specific phrases must come before broader ones so a
// "coupon already fully redeemed" message doesn't get swallowed by a generic
// "coupon" rule.
const RULES: Array<{ match: RegExp; copy: (raw: string) => string }> = [
  {
    match: /cart already has a coupon/i,
    copy: () =>
      "Já existe um cupom aplicado. Remova-o antes de adicionar outro.",
  },
  { match: /cart already paid/i, copy: () => "Pagamento já confirmado, o cupom não pode mais ser alterado." },
  { match: /cart expired/i, copy: () => "Carrinho expirado." },
  { match: /cart is empty/i, copy: () => "Carrinho vazio." },
  { match: /cart not found/i, copy: () => "Carrinho não encontrado." },

  { match: /invalid coupon code/i, copy: () => "Cupom inválido." },
  { match: /coupon is not active/i, copy: () => "Cupom desativado pela loja." },
  { match: /coupon is not valid yet/i, copy: () => "Cupom ainda não está disponível." },
  { match: /coupon expired/i, copy: () => "Cupom expirado." },
  { match: /coupon already fully redeemed/i, copy: () => "Cupom esgotado." },
  {
    match: /minimum purchase of ([\d.]+) BRL/i,
    copy: (raw) => {
      const m = /minimum purchase of ([\d.]+) BRL/i.exec(raw)
      const amount = m ? Number(m[1]) : NaN
      if (Number.isFinite(amount)) {
        return `Compra mínima de ${amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })} não atingida.`
      }
      return "Valor mínimo de compra não atingido."
    },
  },
  {
    match: /select shipping before applying a free-shipping coupon/i,
    copy: () => "Selecione o frete antes de aplicar um cupom de frete grátis.",
  },
  { match: /coupon code is required/i, copy: () => "Informe o código do cupom." },
  { match: /invalid coupon type/i, copy: () => "Tipo de cupom inválido." },
]

// getCouponErrorMessage normalizes API errors thrown from
// checkoutService.applyCoupon / removeCoupon into a single short PT-BR string
// the inline alert can display. Validation 422s with a `fields` map (the BE
// returns this for `code` length violations) are flattened to a single line.
export function getCouponErrorMessage(
  err: unknown,
  fallback = "Não foi possível aplicar o cupom. Tente novamente.",
): string {
  if (err == null) return fallback

  const apiError = err as ApiError
  const raw = apiError.error || apiError.message || ""

  // Validator-driven 422 with `fields` — BE only validates `code` (min/max len),
  // so we don't need a per-field map here.
  if (apiError.status === 422 && apiError.fields && Object.keys(apiError.fields).length > 0) {
    return "Código inválido (mínimo 2 e máximo 40 caracteres)."
  }

  if (apiError.status === 408) return "A conexão demorou demais. Tente novamente."

  for (const rule of RULES) {
    if (rule.match.test(raw)) return rule.copy(raw)
  }

  if (apiError.status && apiError.status >= 500) {
    return "Erro no servidor. Tente novamente em instantes."
  }

  // No status (network failure) or unmatched 4xx — surface the BE copy when
  // we have one, otherwise the caller's fallback.
  return raw || fallback
}
