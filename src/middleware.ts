import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

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

const isOnboardingRoute = createRouteMatcher(["/onboarding"])

// Billing continua acessível com a assinatura bloqueada — é onde o lojista
// paga e acompanha a ativação (mesma allowlist que o backend aplica em /billing).
// Sem isto, o retorno do Stripe Checkout (?billing=success) quica pro /paywall
// antes do webhook ativar a assinatura e o lojista nunca vê o feedback.
const isBillingRoute = createRouteMatcher(["/settings/billing(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken, redirectToSignIn } = await auth()

  // Landing page ("/") is public marketing for everyone — logged in or out.
  // Signed-in visitors see it too (the nav shows a "dashboard" link); we never
  // force a redirect here so the page is always reachable.
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Redirect signed-in users away from auth pages to dashboard
  if (userId && isAuthRoute(req)) {
    const dashboardUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Public routes - allow access
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Not signed in - redirect to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // User is on onboarding page - allow access (prevents redirect loop)
  if (isOnboardingRoute(req)) {
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
