"use server"

import { auth } from "@clerk/nextjs/server"

interface CompleteOnboardingResult {
  success?: boolean
  error?: string
}

export async function completeOnboarding(formData: FormData): Promise<CompleteOnboardingResult> {
  const { userId, getToken } = await auth()

  if (!userId) {
    return { error: "Usuário não autenticado" }
  }

  const storeName = formData.get("storeName") as string
  const storeSlug = formData.get("storeSlug") as string

  if (!storeName || !storeSlug) {
    return { error: "Nome da loja é obrigatório" }
  }

  // Sync user with our backend - this creates the user and store
  const token = await getToken()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      store_name: storeName,
      store_slug: storeSlug,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    return { error: errorData.error || "Erro ao criar loja" }
  }

  return { success: true }
}
