"use client"

import { useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { completeOnboarding } from "./actions"

function generateSlug(name: string): string {
  if (!name.trim()) return ""
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50)
}

export default function OnboardingPage() {
  const { user } = useUser()
  const [storeName, setStoreName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const storeSlug = useMemo(() => generateSlug(storeName), [storeName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!storeSlug) {
      setError("Nome inválido para gerar URL da loja")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("storeName", storeName)
      formData.append("storeSlug", storeSlug)

      const result = await completeOnboarding(formData)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Force a full page reload to refresh session claims from Clerk
      window.location.href = "/"
    } catch (err) {
      console.error("Form submission error:", err)
      setError("Erro inesperado ao criar loja")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Bem-vindo ao LiveCart
          </CardTitle>
          <CardDescription>
            {user?.firstName ? `Olá, ${user.firstName}! ` : ""}
            Vamos configurar sua loja para começar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="storeName" className="text-sm font-medium">
                Nome da Loja <span className="text-destructive">*</span>
              </label>
              <Input
                id="storeName"
                placeholder="Minha Loja"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={isSubmitting}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            {storeSlug && (
              <div className="space-y-2">
                <p className="text-sm font-medium">URL da Loja</p>
                <div className="flex items-center gap-1 rounded-md border bg-muted/50 px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    livecart.com/
                  </span>
                  <span className="text-sm font-medium">{storeSlug}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gerada automaticamente a partir do nome da loja
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !storeSlug}
            >
              {isSubmitting ? "Criando..." : "Criar Loja"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
