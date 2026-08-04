"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { useUser } from "@/hooks/useUser"
import { useAcceptInvitation } from "./useAcceptInvitation"
import type { PendingInvitation } from "@/types"

// Regras da tela de convite pendente: quem já resolveu a situação não pode
// ficar preso nela, e o aceite precisa refazer o sync antes de navegar (o
// dashboard lê a membership do UserProvider — sem refetch ele ainda veria
// "sem loja" e a guarda mandaria o usuário de volta pra cá).
export function usePendingInvite() {
  const { user, isLoading, refetch } = useUser()
  const acceptInvitation = useAcceptInvitation()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const invitations: PendingInvitation[] = user?.pendingInvitations ?? []

  const accept = useCallback(
    async (inviteToken: string) => {
      setError(null)
      try {
        await acceptInvitation.mutateAsync(inviteToken)
        await refetch()
        router.replace("/dashboard")
      } catch (err) {
        const apiError = err as { status?: number }
        setError(messageForStatus(apiError.status))
      }
    },
    [acceptInvitation, refetch, router]
  )

  const createOwnStore = useCallback(() => {
    router.push("/onboarding")
  }, [router])

  return {
    invitations,
    isLoading,
    isAccepting: acceptInvitation.isPending,
    error,
    accept,
    createOwnStore,
  }
}

function messageForStatus(status?: number) {
  switch (status) {
    case 403:
      return "O e-mail do convite não corresponde à sua conta."
    case 409:
      return "Você já é dono de uma loja em uso. Para aceitar este convite, exclua sua loja atual primeiro."
    case 410:
      return "Este convite expirou ou já foi utilizado."
    default:
      return "Não foi possível aceitar o convite. Tente novamente."
  }
}
