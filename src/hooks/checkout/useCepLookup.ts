"use client"

import { useMutation } from "@tanstack/react-query"

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface AddressFromCep {
  street: string
  neighborhood: string
  city: string
  state: string
}

async function fetchAddressFromCep(cep: string): Promise<AddressFromCep> {
  const cleanCep = cep.replace(/\D/g, "")

  if (cleanCep.length !== 8) {
    throw new Error("CEP deve ter 8 dígitos")
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

  if (!response.ok) {
    throw new Error("Erro ao buscar CEP")
  }

  const data: ViaCepResponse = await response.json()

  if (data.erro) {
    throw new Error("CEP não encontrado")
  }

  return {
    street: data.logradouro || "",
    neighborhood: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
  }
}

export function useCepLookup() {
  return useMutation({
    mutationFn: fetchAddressFromCep,
  })
}
