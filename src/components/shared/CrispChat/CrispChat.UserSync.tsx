"use client"

import { useEffect } from "react"
import { useUser } from "@/hooks/user/useUser"

declare global {
  interface Window {
    $crisp?: unknown[]
  }
}

export function CrispUserSync() {
  const { user } = useUser()

  useEffect(() => {
    const membership = user?.membership
    if (!membership || typeof window === "undefined") return

    window.$crisp = window.$crisp || []
    window.$crisp.push(["set", "user:email", [membership.email]])
    if (membership.name) {
      window.$crisp.push(["set", "user:nickname", [membership.name]])
    }
  }, [user])

  return null
}
