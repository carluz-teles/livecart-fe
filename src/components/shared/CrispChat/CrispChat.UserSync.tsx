"use client"

import { useUser } from "@/hooks/user/useUser"
import { CrispIdentify } from "@/components/shared/CrispChat/CrispChat.Identify"

// Usado dentro do dashboard (dentro de ClerkProvider/UserProvider).
export function CrispUserSync() {
  const { user } = useUser()
  const membership = user?.membership

  return <CrispIdentify email={membership?.email} name={membership?.name} />
}
