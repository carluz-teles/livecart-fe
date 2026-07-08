"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

import type { WizardUserData } from "@/schemas/onboarding.schema"

// Passo "Sobre você": lê o que o Clerk já sabe (social login traz nome/foto;
// cadastro por e-mail chega vazio) e grava de volta no Clerk — o /users/sync
// espelha no nosso banco sozinho no próximo request.
export function useProfileSetup() {
  const { user } = useUser()
  const [isSavingName, setIsSavingName] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const defaults: WizardUserData = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
  }

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "🙂"

  // Retorna true quando salvou (ou nada mudou); false = erro já notificado.
  const saveName = async (data: WizardUserData): Promise<boolean> => {
    if (!user) return false
    if (data.firstName === user.firstName && data.lastName === user.lastName) {
      return true
    }
    try {
      setIsSavingName(true)
      await user.update({ firstName: data.firstName, lastName: data.lastName })
      return true
    } catch {
      toast.error("Não foi possível salvar seu nome. Tente de novo.")
      return false
    } finally {
      setIsSavingName(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return
    try {
      setIsUploadingAvatar(true)
      await user.setProfileImage({ file })
      toast.success("Foto atualizada!")
    } catch {
      toast.error("Não foi possível enviar a foto. Tente de novo.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return {
    imageUrl: user?.imageUrl,
    initials,
    defaults,
    saveName,
    uploadAvatar,
    isSavingName,
    isUploadingAvatar,
  }
}
