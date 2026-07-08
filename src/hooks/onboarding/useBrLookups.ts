"use client"

import { useState } from "react"

import { brLookupService, type CepResult, type CnpjResult } from "@/services/external/br-lookup.service"

export type LookupStatus = "idle" | "loading" | "hit" | "miss"

// Lookup de CNPJ (BrasilAPI): máquina de estados + resultado. O componente
// só renderiza `status`/`companyName` e chama `run` — zero regra na UI.
export function useCnpjLookup(onData: (data: CnpjResult) => void) {
  const [status, setStatus] = useState<LookupStatus>("idle")
  const [companyName, setCompanyName] = useState<string | null>(null)

  const run = async (cnpj: string) => {
    if (cnpj.replace(/\D/g, "").length !== 14 || status === "loading") return
    setStatus("loading")
    setCompanyName(null)
    const result = await brLookupService.cnpj(cnpj)
    if (!result) {
      setStatus("miss")
      return
    }
    setCompanyName(result.legalName)
    setStatus("hit")
    onData(result)
  }

  const reset = () => {
    setStatus("idle")
    setCompanyName(null)
  }

  return { status, companyName, run, reset }
}

// Lookup de CEP (ViaCEP): dispara quando o CEP completa 8 dígitos.
export function useCepLookup(onData: (data: CepResult) => void) {
  const [status, setStatus] = useState<LookupStatus>("idle")

  const run = async (cep: string) => {
    if (cep.replace(/\D/g, "").length !== 8) {
      setStatus("idle")
      return
    }
    setStatus("loading")
    const result = await brLookupService.cep(cep)
    if (!result) {
      setStatus("miss")
      return
    }
    setStatus("hit")
    onData(result)
  }

  return { status, run }
}
