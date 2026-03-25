"use server"

import { auth } from "@clerk/nextjs/server"

interface ActionResult {
  success?: boolean
  error?: string
  storeId?: string
}

// Update store name and slug (step 1 of onboarding)
export async function updateStore(formData: FormData): Promise<ActionResult> {
  const { userId, getToken } = await auth()

  if (!userId) {
    return { error: "Usuário não autenticado" }
  }

  const storeName = formData.get("storeName") as string
  const storeSlug = formData.get("storeSlug") as string

  if (!storeName || !storeSlug) {
    return { error: "Nome da loja é obrigatório" }
  }

  const token = await getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // First, get the storeId from /users/me
  const userRes = await fetch(`${apiUrl}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!userRes.ok) {
    return { error: "Erro ao buscar dados do usuário" }
  }

  const { data: userData } = await userRes.json()
  const storeId = userData.storeId

  // Update store with name and slug
  const updateRes = await fetch(`${apiUrl}/stores/${storeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: storeName,
      // Note: slug update requires a different endpoint if we want to change it
    }),
  })

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}))
    return { error: errorData.error || "Erro ao atualizar loja" }
  }

  return { success: true, storeId }
}

// Mark onboarding as complete (final step)
export async function finishOnboarding(): Promise<ActionResult> {
  const { userId, getToken } = await auth()

  if (!userId) {
    return { error: "Usuário não autenticado" }
  }

  const token = await getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Get storeId
  const userRes = await fetch(`${apiUrl}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!userRes.ok) {
    return { error: "Erro ao buscar dados do usuário" }
  }

  const { data: userData } = await userRes.json()
  const storeId = userData.storeId

  // Mark onboarding as complete
  const response = await fetch(`${apiUrl}/stores/${storeId}/complete-onboarding`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    return { error: errorData.error || "Erro ao finalizar onboarding" }
  }

  return { success: true }
}

// Legacy alias for backward compatibility (step 1)
export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  return updateStore(formData)
}
