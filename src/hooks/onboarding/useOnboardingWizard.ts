"use client"

import { useState } from "react"
import { toast } from "sonner"

import { completeOnboarding } from "@/app/onboarding/actions"
import { formatCEP, formatPhoneBR, generateSlug } from "@/lib/br-format"
import type { CnpjResult } from "@/services/external/br-lookup.service"
import type {
  WizardAddressData,
  WizardContactData,
  WizardStoreData,
} from "@/schemas/onboarding.schema"

export type WizardStepID = "you" | "store" | "address" | "contact"

export const WIZARD_STEP_IDS: WizardStepID[] = ["you", "store", "address", "contact"]

// Orquestração do wizard: passo atual, dados acumulados (voltar preserva
// tudo), autofill em cascata do CNPJ e a submissão final. O page/steps só
// renderizam e delegam pra cá.
export function useOnboardingWizard() {
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [storeData, setStoreData] = useState<Partial<WizardStoreData>>({})
  const [addressData, setAddressData] = useState<Partial<WizardAddressData>>({})
  const [contactData, setContactData] = useState<Partial<WizardContactData>>({})

  const stepId = WIZARD_STEP_IDS[stepIndex]
  const goNext = () => setStepIndex((i) => Math.min(i + 1, WIZARD_STEP_IDS.length - 1))
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))

  // CNPJ do passo "loja" alimenta endereço e contato — sem sobrescrever o
  // que o usuário já digitou.
  const applyCnpjData = (data: CnpjResult) => {
    setAddressData((prev) => ({
      zip: prev.zip || formatCEP(data.address.zip),
      street: prev.street || data.address.street,
      number: prev.number || data.address.number,
      complement: prev.complement || data.address.complement,
      district: prev.district || data.address.district,
      city: prev.city || data.address.city,
      state: prev.state || data.address.state,
    }))
    setContactData((prev) => ({
      whatsappNumber: prev.whatsappNumber || formatPhoneBR(data.phone),
      emailAddress: prev.emailAddress || data.email,
    }))
  }

  const saveStore = (data: WizardStoreData) => {
    setStoreData(data)
    goNext()
  }

  const saveAddress = (data: WizardAddressData) => {
    setAddressData(data)
    goNext()
  }

  const finish = async (contact: WizardContactData) => {
    setContactData(contact)
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("storeName", storeData.storeName ?? "")
      formData.append("storeSlug", generateSlug(storeData.storeName ?? ""))
      if (storeData.cnpj) formData.append("cnpj", storeData.cnpj)
      if (contact.whatsappNumber) formData.append("whatsappNumber", contact.whatsappNumber)
      if (contact.emailAddress) formData.append("emailAddress", contact.emailAddress)
      if (addressData.street) formData.append("address.street", addressData.street)
      if (addressData.number) formData.append("address.number", addressData.number)
      if (addressData.complement) formData.append("address.complement", addressData.complement)
      if (addressData.district) formData.append("address.district", addressData.district)
      if (addressData.city) formData.append("address.city", addressData.city)
      if (addressData.state) formData.append("address.state", addressData.state)
      if (addressData.zip) formData.append("address.zip", addressData.zip)
      formData.append("address.country", "Brasil")

      const result = await completeOnboarding(formData)
      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success("Loja criada! Seus 7 dias grátis começaram. 🎉")
      window.location.href = "/dashboard"
    } catch {
      toast.error("Erro ao criar loja. Tente de novo.")
      setIsSubmitting(false)
    }
  }

  return {
    stepId,
    stepIndex,
    totalSteps: WIZARD_STEP_IDS.length,
    goNext,
    goBack,
    storeData,
    addressData,
    contactData,
    applyCnpjData,
    saveStore,
    saveAddress,
    finish,
    isSubmitting,
  }
}
