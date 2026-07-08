// Camada de SERVICE: comunicação com APIs públicas brasileiras (ViaCEP e
// BrasilAPI — gratuitas, sem key, CORS liberado). Sem estado e fail-safe:
// erro/timeout retorna null; quem decide o que fazer é o hook.

export interface CepResult {
  street: string
  district: string
  city: string
  state: string // UF
}

export interface CnpjResult {
  legalName: string // razão social
  tradeName: string // nome fantasia (pode ser vazio)
  email: string
  phone: string
  address: {
    zip: string
    street: string
    number: string
    complement: string
    district: string
    city: string
    state: string
  }
}

const onlyDigits = (v: string) => v.replace(/\D/g, "")

async function fetchJSON<T>(url: string, timeoutMs = 6000): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export const brLookupService = {
  // ViaCEP — https://viacep.com.br
  async cep(cep: string): Promise<CepResult | null> {
    const digits = onlyDigits(cep)
    if (digits.length !== 8) return null

    const data = await fetchJSON<{
      erro?: boolean
      logradouro?: string
      bairro?: string
      localidade?: string
      uf?: string
    }>(`https://viacep.com.br/ws/${digits}/json/`)

    if (!data || data.erro) return null
    return {
      street: data.logradouro ?? "",
      district: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    }
  },

  // BrasilAPI CNPJ — https://brasilapi.com.br/docs#tag/CNPJ
  // Razão social, nome fantasia, endereço completo e contato em uma chamada.
  async cnpj(cnpj: string): Promise<CnpjResult | null> {
    const digits = onlyDigits(cnpj)
    if (digits.length !== 14) return null

    const data = await fetchJSON<{
      razao_social?: string
      nome_fantasia?: string
      email?: string | null
      ddd_telefone_1?: string | null
      cep?: string | null
      logradouro?: string | null
      numero?: string | null
      complemento?: string | null
      bairro?: string | null
      municipio?: string | null
      uf?: string | null
      descricao_tipo_de_logradouro?: string | null
    }>(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, 8000)

    if (!data || !data.razao_social) return null

    const streetType = data.descricao_tipo_de_logradouro?.trim() ?? ""
    const streetName = data.logradouro?.trim() ?? ""
    return {
      legalName: data.razao_social ?? "",
      tradeName: data.nome_fantasia ?? "",
      email: data.email ?? "",
      phone: data.ddd_telefone_1 ?? "",
      address: {
        zip: data.cep ? onlyDigits(data.cep) : "",
        street: [streetType, streetName].filter(Boolean).join(" "),
        number: data.numero?.trim() ?? "",
        complement: data.complemento?.trim() ?? "",
        district: data.bairro ?? "",
        city: data.municipio ?? "",
        state: data.uf ?? "",
      },
    }
  },
}
