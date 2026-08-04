// Destino pedido via ?redirect_url=. Só aceita caminho relativo à própria app:
// URL absoluta ("https://…") ou protocol-relative ("//host") viraria open
// redirect. Compartilhado pelo middleware e pelas telas de login/cadastro, que
// precisam concordar sobre o que é um destino aceitável.
export function safeRedirectPath(
  value: string | string[] | null | undefined
): string | null {
  const target = Array.isArray(value) ? value[0] : value

  if (!target?.startsWith("/") || target.startsWith("//")) {
    return null
  }

  return target
}
