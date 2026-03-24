import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/register(.*)",
  "/cart/(.*)",
  "/api/webhooks/(.*)",
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

  // User is on onboarding page - allow access
  if (isOnboardingRoute(req)) {
    return NextResponse.next()
  }

  // Check if user has completed onboarding by checking our backend
  try {
    const token = await getToken()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // If user exists in our backend, they've completed onboarding
    if (response.ok) {
      return NextResponse.next()
    }

    // User doesn't exist in backend - redirect to onboarding
    if (response.status === 404 || response.status === 401) {
      const onboardingUrl = new URL("/onboarding", req.url)
      return NextResponse.redirect(onboardingUrl)
    }
  } catch {
    // On error, redirect to onboarding instead of allowing access
    const onboardingUrl = new URL("/onboarding", req.url)
    return NextResponse.redirect(onboardingUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
