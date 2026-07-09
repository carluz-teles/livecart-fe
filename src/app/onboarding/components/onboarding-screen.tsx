"use client"

import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { MapPin, MessageCircle, Store, User } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useOnboardingWizard,
  type WizardDraft,
  type WizardStepID,
} from "@/hooks/onboarding"
import { Stepper, type StepDef } from "./stepper"
import { StepUser } from "./step-user"
import { StepStore } from "./step-store"
import { StepAddress } from "./step-address"
import { StepContact } from "./step-contact"

const steps: StepDef[] = [
  { id: "you", label: "Você", icon: User },
  { id: "store", label: "Sua loja", icon: Store },
  { id: "address", label: "Endereço", icon: MapPin },
  { id: "contact", label: "Contato", icon: MessageCircle },
]

const stepCopy: Record<WizardStepID, { title: string; description: string }> = {
  you: { title: "Sobre você", description: "Como devemos te chamar por aqui" },
  store: { title: "Sua loja", description: "Pessoa física ou empresa — você escolhe" },
  address: { title: "Endereço da loja", description: "Digite o CEP e deixe o resto com a gente" },
  contact: { title: "Contato da loja", description: "Opcional — dá pra configurar depois" },
}

interface OnboardingScreenProps {
  initialDraft: WizardDraft | null
}

// Tela do onboarding: renderização pura. O rascunho inicial chega do SSR
// (cookie lido no page server component) — primeiro paint já no passo certo.
export function OnboardingScreen({ initialDraft }: OnboardingScreenProps) {
  const { user } = useUser()
  const wizard = useOnboardingWizard(initialDraft)
  const copy = stepCopy[wizard.stepId]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50/80 via-background to-background">
      {/* brilho suave da marca */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/25 via-orange-300/20 to-amber-300/25 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center px-4 py-10">
        <Image
          src="/livecart/logotipo-header.png"
          alt="LiveCart"
          width={140}
          height={36}
          className="h-8 w-auto"
          priority
        />

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo{user?.firstName ? `, ${user.firstName}` : ""}! 👋
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Sua loja e seus <strong className="text-foreground">7 dias grátis</strong> começam agora
          </p>
        </div>

        <div className="mt-8 w-full">
          <Stepper steps={steps} current={wizard.stepIndex} />
        </div>

        {/* Anúncio de passo para leitores de tela */}
        <p className="sr-only" role="status">
          Passo {wizard.stepIndex + 1} de {wizard.totalSteps}: {copy.title}
        </p>

        <Card
          key={wizard.stepId}
          className="mt-6 w-full shadow-lg shadow-amber-100/60 duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          <CardHeader>
            <CardTitle className="text-lg">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {wizard.stepId === "you" && <StepUser onNext={wizard.goNext} />}
            {wizard.stepId === "store" && (
              <StepStore
                defaultValues={wizard.storeData}
                onCnpjData={wizard.applyCnpjData}
                onBack={wizard.goBack}
                onNext={wizard.saveStore}
              />
            )}
            {wizard.stepId === "address" && (
              <StepAddress
                defaultValues={wizard.addressData}
                onBack={wizard.goBack}
                onNext={wizard.saveAddress}
              />
            )}
            {wizard.stepId === "contact" && (
              <StepContact
                defaultValues={wizard.contactData}
                onBack={wizard.goBack}
                onSubmit={wizard.finish}
                isSubmitting={wizard.isSubmitting}
              />
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Integrações, produtos e equipe você configura depois, no painel.
        </p>
      </div>
    </div>
  )
}
