"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useUser } from "@/hooks/useUser"

// Rede de segurança client-side do onboarding. O middleware já redireciona
// state=no_store para /onboarding, mas ele FALHA ABERTO quando o /users/sync
// dá erro (BE fora, timeout, 401 de instância Clerk desalinhada) — e aí um
// usuário sem loja cai num dashboard quebrado. Esta guarda roda no client,
// com o sync do UserProvider, e fecha essa brecha.
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const needsOnboarding = !isLoading && user?.state === "no_store"

  useEffect(() => {
    if (needsOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding")
    }
  }, [needsOnboarding, pathname, router])

  if (needsOnboarding) return null

  return <>{children}</>
}
