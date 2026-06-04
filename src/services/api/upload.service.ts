import type { Store } from "@/types/store.types"

interface UploadLogoResponse {
  logoUrl: string
  store: Store
}

// Uploads a multipart body via XHR so we can report real upload progress —
// fetch() cannot observe `upload.onprogress`. Resolves with the envelope's
// `data`. onProgress receives 0–100 as the body is sent; once it reaches 100
// the server is still working (publish/processing), which the caller surfaces
// as an indeterminate "processing" phase.
function xhrUpload<T>(
  url: string,
  formData: FormData,
  token: string,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    // Intentionally no Content-Type: the browser sets the multipart boundary.
    xhr.timeout = 10 * 60 * 1000 // large videos + Instagram processing

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)))
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).data as T)
        } catch {
          reject(new Error("Resposta inválida do servidor"))
        }
        return
      }
      let message = "Falha no envio"
      try {
        const err = JSON.parse(xhr.responseText)
        message = err.message || err.error || message
      } catch {
        /* keep default */
      }
      reject(Object.assign(new Error(message), { status: xhr.status }))
    }
    xhr.onerror = () => reject(new Error("Erro de rede durante o envio"))
    xhr.ontimeout = () => reject(new Error("O envio demorou demais. Tente novamente."))
    xhr.send(formData)
  })
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
    token: string,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; key: string }> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const formData = new FormData()
    formData.append("file", file)
    return xhrUpload<{ url: string; key: string }>(
      `${apiUrl}/stores/${storeId}/integrations/instagram/media/upload`,
      formData,
      token,
      onProgress
    )
  },

  // Streams a video to Instagram as a Reel and creates the bound post event.
  // The backend uploads the bytes directly to Instagram (no hosting).
  createInstagramReel: async (
    storeId: string,
    formData: FormData,
    token: string,
    onProgress?: (percent: number) => void
  ): Promise<unknown> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    return xhrUpload<unknown>(
      `${apiUrl}/stores/${storeId}/integrations/instagram/reels`,
      formData,
      token,
      onProgress
    )
  },

  // Publishes a Story (photo or video) and creates the bound story event. The
  // backend auto-detects image vs video from the file's content type.
  createInstagramStory: async (
    storeId: string,
    formData: FormData,
    token: string,
    onProgress?: (percent: number) => void
  ): Promise<unknown> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    return xhrUpload<unknown>(
      `${apiUrl}/stores/${storeId}/integrations/instagram/stories`,
      formData,
      token,
      onProgress
    )
  },
}
