"use client"

import { useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { uploadService } from "@/services/api/upload.service"
import { useStoreId } from "@/hooks/useUser"

interface ImageUploadButtonProps {
  onUploaded: (url: string) => void
  size?: "sm" | "default"
  label?: string
  className?: string
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024

// Reusable file-input + upload control for product/variant/group images.
// Validates (image/*, max 5MB), uploads via uploadProductImage, and hands the
// returned permanent URL back to the caller. Mirrors the store-logo UX.
export function ImageUploadButton({
  onUploaded,
  size = "sm",
  label = "Enviar imagem",
  className,
}: ImageUploadButtonProps) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido", {
        description: "Por favor, selecione uma imagem.",
      })
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Arquivo muito grande", {
        description: "A imagem deve ter no máximo 5MB.",
      })
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setIsUploading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error("Not authenticated")
      if (!storeId) throw new Error("Store ID is required")

      const url = await uploadService.uploadProductImage(file, storeId, token)
      onUploaded(url)
      toast.success("Imagem enviada")
    } catch (error) {
      console.error("Failed to upload product image:", error)
      toast.error("Erro ao enviar imagem", {
        description: "Não foi possível enviar a imagem. Tente novamente.",
      })
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isUploading ? "Enviando..." : label}
      </Button>
    </>
  )
}
