"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

import { ProgressBar } from "./components/progress-bar"
import { StepStore } from "./components/step-store"
import { StepCart } from "./components/step-cart"
import { StepIntegrations } from "./components/step-integrations"
import { StepTeam } from "./components/step-team"
import { completeOnboarding, finishOnboarding } from "./actions"
import type { StoreStepData, CartStepData } from "@/schemas/onboarding.schema"

const STEPS = [
  { id: 1, name: "Loja", description: "Informações básicas" },
  { id: 2, name: "Carrinho", description: "Configurações" },
  { id: 3, name: "Integrações", description: "Pagamentos e ERP" },
  { id: 4, name: "Equipe", description: "Convites" },
]

interface OnboardingData {
  store?: StoreStepData & { storeSlug: string }
  storeId?: string
  cart?: CartStepData
  invites?: Array<{ email: string; role: "admin" | "member" }>
}

export default function OnboardingPage() {
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({})

  // Step 1: Store info
  const handleStoreNext = async (storeData: StoreStepData & { storeSlug: string }) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("storeName", storeData.storeName)
      formData.append("storeSlug", storeData.storeSlug)

      // Add optional fields
      if (storeData.whatsappNumber) {
        formData.append("whatsappNumber", storeData.whatsappNumber)
      }
      if (storeData.emailAddress) {
        formData.append("emailAddress", storeData.emailAddress)
      }

      // Add address fields
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

      // Store created successfully, save data (including storeId) and move to next step
      setData((prev) => ({ ...prev, store: storeData, storeId: result.storeId }))
      setCurrentStep(2)
    } catch (error) {
      console.error("Store creation error:", error)
      toast.error("Erro ao criar loja")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: Cart settings
  const handleCartNext = async (cartData: CartStepData) => {
    setIsSubmitting(true)

    try {
      // Get token and update cart settings (pass storeId for store-scoped endpoint)
      const response = await fetch("/api/onboarding/cart-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cartData, storeId: data.storeId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || "Erro ao salvar configurações")
        setIsSubmitting(false)
        return
      }

      setData((prev) => ({ ...prev, cart: cartData }))
      setCurrentStep(3)
    } catch (error) {
      console.error("Cart settings error:", error)
      toast.error("Erro ao salvar configurações")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCartSkip = () => {
    setCurrentStep(3)
  }

  // Step 3: Integrations
  const handleIntegrationsNext = () => {
    setCurrentStep(4)
  }

  const handleIntegrationsConnect = (integrationId: string) => {
    // For now, just show a toast - actual connection would redirect to OAuth
    toast.info(`Conectando ${integrationId}... (em breve)`)
  }

  const handleIntegrationsSkip = () => {
    setCurrentStep(4)
  }

  // Step 4: Team
  const handleTeamFinish = async (invites: Array<{ email: string; role: "admin" | "member" }>) => {
    setIsSubmitting(true)

    try {
      // Send invites if any
      if (invites.length > 0) {
        const response = await fetch("/api/onboarding/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invites }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          toast.error(errorData.error || "Erro ao enviar convites")
          // Continue anyway, invites can be sent later
        }
      }

      // Mark onboarding as complete
      const result = await finishOnboarding()
      if (result.error) {
        console.error("Finish onboarding error:", result.error)
        // Continue to dashboard anyway
      }

      // Redirect to dashboard
      window.location.href = "/"
    } catch (error) {
      console.error("Team invites error:", error)
      // Continue to dashboard anyway
      window.location.href = "/"
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTeamSkip = async () => {
    // Mark onboarding as complete even when skipping
    try {
      await finishOnboarding()
    } catch (error) {
      console.error("Finish onboarding error:", error)
    }
    window.location.href = "/"
  }

  // Go back
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
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
            Vamos configurar sua loja em poucos passos
          </p>
        </div>

        {/* Progress bar */}
        <ProgressBar steps={STEPS} currentStep={currentStep} />

        {/* Step content */}
        {currentStep === 1 && (
          <StepStore
            defaultValues={data.store}
            onNext={handleStoreNext}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 2 && (
          <StepCart
            defaultValues={data.cart}
            onNext={handleCartNext}
            onBack={handleBack}
            onSkip={handleCartSkip}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 3 && (
          <StepIntegrations
            onNext={handleIntegrationsNext}
            onBack={handleBack}
            onSkip={handleIntegrationsSkip}
            onConnect={handleIntegrationsConnect}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 4 && (
          <StepTeam
            currentUser={{
              email: user?.primaryEmailAddress?.emailAddress || "",
              name: user?.fullName || null,
              avatarUrl: user?.imageUrl || null,
            }}
            onFinish={handleTeamFinish}
            onBack={handleBack}
            onSkip={handleTeamSkip}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}
