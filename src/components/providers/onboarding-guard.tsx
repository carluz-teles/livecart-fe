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

  // Sem loja, mas com convite esperando: a escolha entre aceitar o convite e
  // abrir loja própria é do usuário, então ele vai para a tela de convite e não
  // direto para o onboarding.
  const destination =
    user?.state === "pending_invitation"
      ? "/pending-invite"
      : user?.state === "no_store"
        ? "/onboarding"
        : null

  const needsRedirect = !isLoading && destination !== null

  useEffect(() => {
    if (!isLoading && destination && pathname !== destination) {
      router.replace(destination)
    }
  }, [isLoading, destination, pathname, router])

  if (needsRedirect) return null

  return <>{children}</>
}
