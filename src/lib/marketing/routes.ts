export const MARKETING_ORIGIN = "https://livecart.com.br"
export const APP_ORIGIN = "https://app.livecart.com.br"

// Segment boundaries matter: /guias-internas must not become a public route.
const marketingRoots = ["/integracoes", "/recursos", "/guias", "/casos", "/precos", "/demonstracao", "/sobre"]

export function isMarketingPath(pathname: string) {
  return pathname === "/" || marketingRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`))
}

export function marketingRedirect(host: string, pathname: string, search: string) {
  if ((host === "app.livecart.com.br" || host === "www.livecart.com.br") && isMarketingPath(pathname)) {
    return `${MARKETING_ORIGIN}${pathname}${search}`
  }
  return null
}
