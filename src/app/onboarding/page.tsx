"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

import { StepStore } from "./components/step-store"
import { completeOnboarding, finishOnboarding } from "./actions"
import type { StoreStepData } from "@/schemas/onboarding.schema"

export default function OnboardingPage() {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStoreSubmit = async (storeData: StoreStepData & { storeSlug: string }) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("storeName", storeData.storeName)
      formData.append("storeSlug", storeData.storeSlug)

      // Add optional fields
      if (storeData.cnpj) {
        formData.append("cnpj", storeData.cnpj)
      }
      if (storeData.whatsappNumber) {
        formData.append("whatsappNumber", storeData.whatsappNumber)
      }
      if (storeData.emailAddress) {
        formData.append("emailAddress", storeData.emailAddress)
      }

      // Add address fields (city and state are required)
      if (storeData.address) {
        if (storeData.address.street) formData.append("address.street", storeData.address.street)
        if (storeData.address.city) formData.append("address.city", storeData.address.city)
        if (storeData.address.state) formData.append("address.state", storeData.address.state)
        if (storeData.address.zip) formData.append("address.zip", storeData.address.zip)
        if (storeData.address.country) formData.append("address.country", storeData.address.country)
      }

      const result = await completeOnboarding(formData)

      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      // Mark onboarding as complete
      await finishOnboarding()

      // Show success message
      toast.success("Loja criada com sucesso!")

      // Redirect to dashboard
      window.location.href = "/"
    } catch (error) {
      console.error("Store creation error:", error)
      toast.error("Erro ao criar loja")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl pt-8">
        {/* Welcome message */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo ao LiveCart{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure sua loja para começar a vender nas lives
          </p>
        </div>

        {/* Single step form */}
        <StepStore
          onNext={handleStoreSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Help text */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não se preocupe, você pode configurar integrações, equipe e outras opções depois no painel.
        </p>
      </div>
    </div>
  )
}
