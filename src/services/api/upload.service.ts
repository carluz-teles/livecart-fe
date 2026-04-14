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
}
