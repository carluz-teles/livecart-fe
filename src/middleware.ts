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

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken, redirectToSignIn } = await auth()

  // Redirect signed-in users away from auth pages to dashboard
  if (userId && isAuthRoute(req)) {
    const dashboardUrl = new URL("/", req.url)
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
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
