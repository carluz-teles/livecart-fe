"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { useUser } from "@/hooks/useUser"
import { useSubscription } from "./useBilling"

// Retorno do Stripe Checkout em /settings/billing (?billing=success|cancelled).
// A ativação é assíncrona (webhook), então após o success a assinatura ainda
// vem blocked/trialing por alguns segundos. Este hook faz polling do snapshot
// até virar active (ou desistir após o timeout) e então re-sincroniza o
// /users/sync — TrialBanner e middleware param de ver a conta como bloqueada.
const ACTIVATION_POLL_MS = 3000
const ACTIVATION_TIMEOUT_MS = 60_000

export function useBillingActivation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refetch: refetchUser } = useUser()
  const [activating, setActivating] = useState(false)

  const subscriptionQuery = useSubscription({
    refetchInterval: activating ? ACTIVATION_POLL_MS : false,
  })
  const status = subscriptionQuery.data?.status

  // Lê o resultado do checkout na URL (uma vez) e limpa o query param
  useEffect(() => {
    const result = searchParams.get("billing")
    if (result === "success") {
      toast.success("Pagamento configurado! Sua assinatura está sendo ativada.")
      setActivating(true)
      router.replace("/settings/billing")
    } else if (result === "cancelled") {
      toast.info("Pagamento cancelado. Você pode tentar de novo quando quiser.")
      router.replace("/settings/billing")
    }
  }, [searchParams, router])

  // Assinatura ativou: encerra o polling e avisa o resto do app
  useEffect(() => {
    if (!activating || status !== "active") return
    setActivating(false)
    toast.success("Assinatura ativada! Bem-vindo de volta.")
    void refetchUser()
  }, [activating, status, refetchUser])

  // Webhook demorou além do razoável: para o polling sem travar a página
  useEffect(() => {
    if (!activating) return
    const timeout = setTimeout(() => {
      setActivating(false)
      toast.info(
        "A ativação está demorando um pouco mais que o normal. Atualize a página em instantes."
      )
    }, ACTIVATION_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [activating])

  return {
    subscription: subscriptionQuery.data,
    isLoading: subscriptionQuery.isLoading,
    // true enquanto aguardamos o webhook confirmar a ativação
    isActivating: activating && status !== "active",
  }
}
