"use client"

import { createContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { userService } from "@/services/api/user.service"
import type { User } from "@/types"

interface UserContextValue {
  user: User | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const UserContext = createContext<UserContextValue | null>(null)

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false)
      setUser(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const token = await getToken()
      const data = await userService.sync(token)
      setUser(data)
    } catch (err: unknown) {
      const apiError = err as { status?: number; message?: string; error?: string }
      // 404/401 means user not synced yet - expected for new users
      if (apiError.status === 404 || apiError.status === 401) {
        setUser(null)
        setError(null)
      } else {
        setError(apiError.message || apiError.error || "Failed to fetch user")
      }
    } finally {
      setIsLoading(false)
    }
  }, [getToken, isLoaded, isSignedIn])

  // Fetch user when auth state changes
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const contextValue: UserContextValue = {
    user,
    isLoading: !isLoaded || isLoading,
    error,
    refetch: fetchUser,
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}
