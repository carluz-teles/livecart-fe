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

// A landing page resolve a identidade no servidor, sem ClerkProvider no client.
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
