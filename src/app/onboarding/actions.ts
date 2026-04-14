"use server"

import { auth } from "@clerk/nextjs/server"

interface ActionResult {
  success?: boolean
  error?: string
  storeId?: string
}

interface StoreAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

// Create a new store (onboarding step)
export async function createStore(formData: FormData): Promise<ActionResult> {
  const { userId, getToken } = await auth()

  if (!userId) {
    return { error: "Usuário não autenticado" }
  }

  const storeName = formData.get("storeName") as string
  const storeSlug = formData.get("storeSlug") as string
  const whatsappNumber = formData.get("whatsappNumber") as string | null
  const emailAddress = formData.get("emailAddress") as string | null

  // Parse address fields
  const addressStreet = formData.get("address.street") as string | null
  const addressCity = formData.get("address.city") as string | null
  const addressState = formData.get("address.state") as string | null
  const addressZip = formData.get("address.zip") as string | null
  const addressCountry = formData.get("address.country") as string | null

  if (!storeName || !storeSlug) {
    return { error: "Nome e slug da loja são obrigatórios" }
  }

  // Validate slug format (alphanumeric only)
  if (!/^[a-z0-9]+$/i.test(storeSlug)) {
    return { error: "Slug deve conter apenas letras e números" }
  }

  const token = await getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Create the store via POST /stores
  const response = await fetch(`${apiUrl}/stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: storeName,
      slug: storeSlug,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // Handle specific errors
    if (response.status === 409) {
      return { error: "Uma loja com esse slug já existe" }
    }

    return { error: errorData.error || "Erro ao criar loja" }
  }

  const { data } = await response.json()
  const storeId = data.id

  // Select the newly created store as the active store
  const selectResponse = await fetch(`${apiUrl}/users/me/select-store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storeId }),
  })

  if (!selectResponse.ok) {
    console.error("Failed to select store:", await selectResponse.text())
    // Continue anyway - store was created successfully
  }

  // Update store with additional info (whatsapp, email, address)
  const hasAdditionalInfo = whatsappNumber || emailAddress || addressStreet || addressCity || addressState || addressZip

  if (hasAdditionalInfo) {
    const address: StoreAddress = {}
    if (addressStreet) address.street = addressStreet
    if (addressCity) address.city = addressCity
    if (addressState) address.state = addressState
    if (addressZip) address.zip = addressZip
    if (addressCountry) address.country = addressCountry

    const updatePayload: Record<string, unknown> = {
      name: storeName,
    }

    if (whatsappNumber) updatePayload.whatsappNumber = whatsappNumber
    if (emailAddress) updatePayload.emailAddress = emailAddress
    if (Object.keys(address).length > 0) updatePayload.address = address

    const updateResponse = await fetch(`${apiUrl}/stores/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    })

    if (!updateResponse.ok) {
      console.error("Failed to update store with additional info:", await updateResponse.text())
      // Continue anyway - store was created successfully
    }
  }

  return { success: true, storeId }
}

// Legacy aliases for backward compatibility
export async function updateStore(formData: FormData): Promise<ActionResult> {
  return createStore(formData)
}

export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  return createStore(formData)
}

// No-op for backward compatibility - onboarding is complete when store is created
export async function finishOnboarding(): Promise<ActionResult> {
  return { success: true }
}
