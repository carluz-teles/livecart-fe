import type { Store } from "@/types/store.types"

interface UploadLogoResponse {
  logoUrl: string
  store: Store
}

export const uploadService = {
  uploadStoreLogo: async (file: File, token: string): Promise<UploadLogoResponse> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${apiUrl}/stores/me/logo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to upload logo")
    }

    const { data } = await response.json()
    return data as UploadLogoResponse
  },

  // Uploads a JPEG to storage and returns a public URL Instagram can fetch
  // when publishing the post.
  uploadInstagramMedia: async (
    file: File,
    storeId: string,
    token: string
  ): Promise<{ url: string; key: string }> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(
      `${apiUrl}/stores/${storeId}/integrations/instagram/media/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || err.error || "Falha ao enviar a imagem")
    }

    const { data } = await response.json()
    return data as { url: string; key: string }
  },

  // Streams a video to Instagram as a Reel and creates the bound post event.
  // The backend uploads the bytes directly to Instagram (no hosting).
  createInstagramReel: async (
    storeId: string,
    formData: FormData,
    token: string
  ): Promise<unknown> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(
      `${apiUrl}/stores/${storeId}/integrations/instagram/reels`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    )
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || err.error || "Falha ao publicar o reel")
    }
    const { data } = await response.json()
    return data
  },
}
