import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse, type NextRequest } from "next/server"

import { safeRedirectPath } from "@/lib/redirect"

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/register(.*)",
  "/cart/(.*)",
  "/api/webhooks/(.*)",
  "/accept-invite(.*)",
  "/privacy",
  "/terms",
])

const isAuthRoute = createRouteMatcher(["/login(.*)", "/register(.*)"])

// Telas de quem ainda não tem loja. Precisam passar sem o redirect por estado,
// senão o usuário fica em loop entre o redirect e a própria tela.
const isStorelessRoute = createRouteMatcher(["/onboarding", "/pending-invite"])

// Billing continua acessível com a assinatura bloqueada — é onde o lojista
// paga e acompanha a ativação (mesma allowlist que o backend aplica em /billing).
// Sem isto, o retorno do Stripe Checkout (?billing=success) quica pro /paywall
// antes do webhook ativar a assinatura e o lojista nunca vê o feedback.
const isBillingRoute = createRouteMatcher(["/settings/billing(.*)"])

// Prefixos dos cookies de sessão do Clerk. É prefixo e não nome exato porque
// instâncias de desenvolvimento sufixam com um hash (ex.: __session_a1b2c3).
const CLERK_SESSION_COOKIE_PREFIXES = ["__session", "__client_uat", "__clerk_db_jwt"]

// Um cookie emitido por OUTRA instância do Clerk (troca de instância, ambiente
// reaproveitando domínio) faz o handshake falhar com jwk-kid-mismatch. Em
// instância de desenvolvimento o SDK lança a exceção em vez de responder, ela
// escapa do middleware e o app inteiro devolve 500/ERR_HTTP_HEADERS_SENT — sem
// error boundary possível, porque erro de middleware não passa por error.tsx.
// Limpar a sessão e mandar pro login é o único caminho de volta do usuário.
function resetClerkSession(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?auth_reset=1", req.url))

  for (const { name } of req.cookies.getAll()) {
    if (CLERK_SESSION_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      response.cookies.delete({ name, path: "/" })
    }
  }

  return response
}

export default clerkMiddleware(async (auth, req) => {
  const session = await auth().catch((error: unknown) => {
    console.error("[middleware] clerk auth failed, clearing session:", error)
    return null
  })

  if (!session) {
    // Já viemos de um reset: os cookies foram limpos no request anterior e ainda
    // assim falhou (cookie preso em outro domínio, por exemplo). Insistir no
    // redirect viraria loop — seguir e deixar o usuário ver a tela de login.
    if (req.nextUrl.searchParams.has("auth_reset")) {
      return NextResponse.next()
    }
    return resetClerkSession(req)
  }

  const { userId, getToken, redirectToSignIn } = session

  // Landing page ("/") is public marketing for everyone — logged in or out.
  // Signed-in visitors see it too (the nav shows a "dashboard" link); we never
  // force a redirect here so the page is always reachable.
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Redirect signed-in users away from auth pages. Respeitar o redirect_url é o
  // que mantém o convite vivo quando o login acontece no meio do fluxo de
  // aceite — mandar todo mundo pro /dashboard descartava o destino.
  if (userId && isAuthRoute(req)) {
    const target = safeRedirectPath(req.nextUrl.searchParams.get("redirect_url")) ?? "/dashboard"
    return NextResponse.redirect(new URL(target, req.url))
  }

  // Public routes - allow access
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Not signed in - redirect to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // User is on onboarding / pending-invite page - allow access (prevents redirect loop)
  if (isStorelessRoute(req)) {
    return NextResponse.next()
  }

  // Sync user with backend and check onboarding state
  try {
    const token = await getToken()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const { data } = await response.json()
      // Convite pendente vence o onboarding: quem foi convidado por email mas
      // autenticou por fora do link (ex.: "Login com Google" com o mesmo email)
      // criaria uma loja própria sem saber do convite — e depois ficaria travado
      // no 409 de "dono de outra loja" ao tentar aceitá-lo.
      if (data.state === "pending_invitation") {
        return NextResponse.redirect(new URL("/pending-invite", req.url))
      }
      // Redirect to onboarding if user has no store
      if (data.state === "no_store") {
        const onboardingUrl = new URL("/onboarding", req.url)
        return NextResponse.redirect(onboardingUrl)
      }
      // Paywall (PRD 007): assinatura bloqueada prende o usuário no /paywall
      const blocked = data.subscription?.blocked === true
      const onPaywall = req.nextUrl.pathname === "/paywall"
      if (blocked && !onPaywall && !isBillingRoute(req)) {
        return NextResponse.redirect(new URL("/paywall", req.url))
      }
      if (!blocked && onPaywall && data.subscription?.status === "active") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    // On error, allow access (don't block user)
    console.error("[middleware] Error syncing user:", response.status)
    return NextResponse.next()
  } catch (error) {
    console.error("[middleware] Error syncing user:", error)
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and fully-public routes that
    // never touch Clerk (cart checkout, marketing pages). Excluding them
    // here avoids the Clerk handshake redirect on first visit, which is
    // critical for shopper-facing checkout LCP.
    "/((?!_next|cart|privacy|terms|robots\\.txt|sitemap\\.xml|favicon\\.ico|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
