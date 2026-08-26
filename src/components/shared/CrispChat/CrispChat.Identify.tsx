"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    $crisp?: unknown[]
  }
}

interface CrispIdentifyProps {
  email?: string | null
  name?: string | null
}

// Componente client "burro": só recebe email/nome já resolvidos e empurra
// pro Crisp. Existe separado do CrispUserSync porque a LP (livecart.com.br)
// não tem ClerkProvider no client — lá o e-mail vem do Clerk no servidor
// (currentUser) e desce como prop, sem precisar do hook useUser().
export function CrispIdentify({ email, name }: CrispIdentifyProps) {
  useEffect(() => {
    if (!email || typeof window === "undefined") return

    window.$crisp = window.$crisp || []
    window.$crisp.push(["set", "user:email", [email]])
    if (name) {
      window.$crisp.push(["set", "user:nickname", [name]])
    }
  }, [email, name])

  return null
}
