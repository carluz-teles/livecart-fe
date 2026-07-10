"use client"

import { Fragment, Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Check,
  ExternalLink,
  Unplug,
  Loader2,
  Zap,
  Info,
  User,
  Clock,
  Activity,
  CreditCard,
  Package,
  Share2,
  Truck,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Webhook,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Star,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useQueryClient } from "@tanstack/react-query"

import { IntegrationCard } from "@/components/integration/IntegrationCard"
import { CopyableURL } from "@/components/integration/CopyableURL"
import { PagarmeConnectWizard } from "@/components/integration/PagarmeConnectWizard"
import { WhatsAppConnectDialog } from "@/components/integration/WhatsAppConnectDialog"
import { PagarmeWebhookProbe } from "@/components/integration/PagarmeWebhookProbe"
import { TinyHealthCheckDialog } from "@/components/integration/TinyHealthCheck/TinyHealthCheckDialog"
import {
  useIntegrations,
  integrationKeys,
  useConnectOAuth,
  useConnectApiKey,
  useConnectTiny,
  useConnectSmartEnvios,
  useConnectPagarme,
  useDisconnectIntegration,
  useTestConnection,
  useUpdateIntegrationPriority,
  useProviderURLs,
  usePagarmeWebhookStatus,
} from "@/hooks/integration"
import type {
  Integration,
  IntegrationProvider,
  IntegrationType,
} from "@/types"
import type { ApiError } from "@/types/api.types"
import { cn } from "@/lib/utils"

interface ProviderConfig {
  id: IntegrationProvider
  name: string
  description: string
  features: string[]
  type: IntegrationType
  authType: "oauth" | "api_key" | "oauth_with_credentials" | "whatsapp"
  // Optional path to the step-by-step doc for this integration. When set, a
  // "Ver tutorial passo a passo" link appears on the card so admins can read
  // the guide before / while connecting.
  docHref?: string
}

const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    description: "Receba pagamentos via Pix e cartão de crédito",
    features: ["Pix", "Cartão de crédito"],
    type: "payment",
    authType: "oauth",
    docHref: "/docs/integrations/mercado-pago",
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Receba pagamentos via Pix e cartão de crédito",
    features: ["Pix", "Cartão de crédito"],
    type: "payment",
    authType: "api_key",
    docHref: "/docs/integrations/pagarme",
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    description: "Tiny (atual Olist) — sincronize produtos e pedidos automaticamente",
    features: ["Importar produtos", "Sincronizar estoque"],
    type: "erp",
    authType: "oauth_with_credentials",
    docHref: "/docs/integrations/tiny",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Capture comentários das suas lives em tempo real",
    features: ["Comentários em tempo real", "Detecção de pedidos", "DMs automáticas"],
    type: "social",
    authType: "oauth",
    docHref: "/docs/integrations/instagram",
  },
  {
    id: "melhor_envio",
    name: "Melhor Envio",
    description: "Cote frete no checkout com Correios, Jadlog e outras transportadoras",
    features: ["Cotação em tempo real", "Múltiplas transportadoras", "Prazo e preço reais"],
    type: "shipping",
    authType: "oauth",
    docHref: "/docs/integrations/melhor-envio",
  },
  {
    id: "smartenvios",
    name: "SmartEnvios",
    description: "Cote frete e gerencie envios com Jadlog, Total Express e outras",
    features: ["Cotação em tempo real", "Criação de envio", "Etiquetas e rastreio"],
    type: "shipping",
    authType: "api_key",
    docHref: "/docs/integrations/smartenvios",
  },
  // WhatsApp (PRD 006) fora do catálogo por ora — infra pronta, aguardando a
  // aprovação de ISV da Twilio. Pra reativar: descomentar esta entrada.
  // {
  //   id: "twilio_whatsapp",
  //   name: "WhatsApp",
  //   description: "Recupere carrinhos e envie lembretes pelo WhatsApp com o seu número",
  //   features: ["Recuperação de carrinho", "Lembrete de expiração", "Número próprio"],
  //   type: "communication",
  //   authType: "whatsapp",
  // },
]

const categoryConfig: Record<IntegrationType, { label: string; icon: React.ReactNode; description: string }> = {
  payment: {
    label: "Pagamentos",
    icon: <CreditCard className="h-4 w-4" />,
    description: "Receba pagamentos dos seus clientes",
  },
  erp: {
    label: "ERP",
    icon: <Package className="h-4 w-4" />,
    description: "Gerencie produtos e estoque",
  },
  social: {
    label: "Redes Sociais",
    icon: <Share2 className="h-4 w-4" />,
    description: "Conecte suas lives e capture pedidos",
  },
  shipping: {
    label: "Frete",
    icon: <Truck className="h-4 w-4" />,
    description: "Cote frete com transportadoras no checkout",
  },
  communication: {
    label: "Comunicação",
    icon: <MessageCircle className="h-4 w-4" />,
    description: "Mensagens automáticas para os seus clientes",
  },
}

type AccountFieldIcon = React.ComponentType<{ className?: string }>

interface AccountField {
  label: string
  value: string
  icon: AccountFieldIcon
  mono?: boolean
}

// Provider-specific copy for the Webhook / Redirect URL panel inside the
// "Ver detalhes" sheet. Each provider gets its own hints because the merchant
// has to paste these URLs into a different panel for each one — surfacing
// "no app da Tiny" inside a Mercado Pago integration was confusing.
//
// `showHealth` flips the green/amber badge: only Tiny pings us when the URL
// is saved correctly, so for the others we hide the "ativo / não confirmado"
// affordance and rely on the URL display + provider-specific hint.
type ProviderWebhookCopy = {
  showHealth: boolean
  healthHint: string
  webhookHint?: string
  redirectHint?: string
}

const PROVIDER_WEBHOOK_COPY: Record<string, ProviderWebhookCopy> = {
  tiny: {
    showHealth: true,
    healthHint:
      "Confira se a URL abaixo está cadastrada no app da Tiny. Assim que ela for salva, a Tiny envia um ping de validação e este status fica verde.",
    webhookHint:
      "Cole no app da Tiny em Configurações → API → Webhooks. Eventos: estoque, produto e nota_fiscal.",
    redirectHint: "Use para reconfigurar o callback no painel da Tiny.",
  },
  mercado_pago: {
    showHealth: false,
    healthHint: "",
    webhookHint:
      "Cole nas configurações da aplicação no Mercado Pago em Notificações → Webhooks. Eventos: payment.",
    redirectHint:
      "Use para reconfigurar o callback OAuth no painel do Mercado Pago.",
  },
  pagarme: {
    showHealth: true,
    healthHint:
      "Ainda não recebemos nenhum evento. Confira se a URL e as credenciais estão corretas no painel da Pagar.me.",
    webhookHint:
      "Cole no painel da Pagar.me em Webhooks. Eventos recomendados: order.paid, order.payment_failed, order.canceled. Se o webhook tiver basic auth, atualize as credenciais ao reconectar.",
  },
  melhor_envio: {
    showHealth: false,
    healthHint: "",
    webhookHint:
      "Cole no painel do Melhor Envio em Aplicação → Webhooks. Eventos: order.created, order.released, order.posted, order.delivered, order.cancelled.",
    redirectHint:
      "Use para reconfigurar o callback OAuth no painel do Melhor Envio.",
  },
  instagram: {
    showHealth: false,
    healthHint: "",
    redirectHint:
      "Use para reconfigurar o callback OAuth do app Instagram no Meta for Developers.",
  },
  smartenvios: {
    showHealth: false,
    healthHint: "",
  },
}

function providerWebhookCopy(provider: string): ProviderWebhookCopy {
  return (
    PROVIDER_WEBHOOK_COPY[provider] ?? {
      showHealth: false,
      healthHint: "",
    }
  )
}

// Pulls the presentable fields out of whatever the provider returned in
// accountInfo. Missing / empty values are skipped so the caller can omit
// the whole card when the result is empty.
function buildAccountFields(
  info: Record<string, unknown> | undefined
): AccountField[] {
  if (!info) return []

  const str = (k: string): string | null => {
    const v = info[k]
    if (typeof v !== "string") return null
    const trimmed = v.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const fields: AccountField[] = []

  const username = str("username")
  if (username) fields.push({ label: "Usuário", value: `@${username}`, icon: User })

  const name = str("name")
  if (name) fields.push({ label: "Nome", value: name, icon: User })

  const id = str("id")
  if (id) fields.push({ label: "ID da Conta", value: id, icon: Activity, mono: true })

  const email = str("email")
  if (email) fields.push({ label: "Email", value: email, icon: User })

  const nickname = str("nickname")
  if (nickname) fields.push({ label: "Apelido", value: nickname, icon: User })

  return fields
}

function IntegrationsContent() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { data, isLoading } = useIntegrations()
  const connectOAuth = useConnectOAuth()
  const connectApiKey = useConnectApiKey()
  const connectTiny = useConnectTiny()
  const connectSmartEnvios = useConnectSmartEnvios()
  const connectPagarme = useConnectPagarme()
  const disconnectIntegration = useDisconnectIntegration()
  const testConnection = useTestConnection()
  const updatePriority = useUpdateIntegrationPriority()

  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [apiKeyDialog, setApiKeyDialog] = useState<IntegrationProvider | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [smartEnviosRotating, setSmartEnviosRotating] = useState(false)
  const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [tinyDialog, setTinyDialog] = useState(false)
  const [tinyClientId, setTinyClientId] = useState("")
  const [tinyClientSecret, setTinyClientSecret] = useState("")
  const tinyProviderURLs = useProviderURLs("tiny", tinyDialog)
  const [pagarmeDialog, setPagarmeDialog] = useState(false)
  const [whatsappDialog, setWhatsappDialog] = useState(false)
  const [pagarmeSecretKey, setPagarmeSecretKey] = useState("")
  const [pagarmePublicKey, setPagarmePublicKey] = useState("")
  const [pagarmeWebhookUser, setPagarmeWebhookUser] = useState("")
  const [pagarmeWebhookPass, setPagarmeWebhookPass] = useState("")
  const [pagarmeError, setPagarmeError] = useState<string | null>(null)
  const pagarmeProviderURLs = useProviderURLs("pagarme", pagarmeDialog)
  const [detailsSheet, setDetailsSheet] = useState<{
    integration: Integration
    provider: ProviderConfig
  } | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsData, setDetailsData] = useState<{
    success: boolean
    message: string
    latencyMs: number
    accountInfo?: Record<string, unknown>
    testedAt: string
  } | null>(null)

  const integrations = data?.data ?? []

  // Active payment integrations sorted by priority — drives the "Primário"
  // badge and the ↑↓ reorder controls on payment cards. Mirrors the BE's
  // GetStorePaymentIntegration ordering so the merchant sees exactly which
  // provider the checkout will pick. Only computed once per render.
  const paymentChain = integrations
    .filter((i) => i.type === "payment" && i.status === "active")
    .sort(
      (a, b) =>
        a.priority - b.priority || a.createdAt.localeCompare(b.createdAt),
    )
  const primaryPaymentId = paymentChain[0]?.id

  const handleReorderPayment = (integrationId: string, direction: "up" | "down") => {
    const idx = paymentChain.findIndex((p) => p.id === integrationId)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= paymentChain.length) return
    const a = paymentChain[idx]
    const b = paymentChain[swapIdx]
    // Swap priorities — keep their numerical distance so the UI feels
    // predictable instead of normalising to 10/20/30 on every move.
    updatePriority.mutate({ integrationId: a.id, priority: b.priority })
    updatePriority.mutate({ integrationId: b.id, priority: a.priority })
  }

  // Read the live integration from the list so the details sheet picks up
  // refetched fields (e.g. webhookLastPingAt) without having to be reopened.
  // Falls back to the snapshot captured when the sheet was opened in case
  // the list is mid-refetch.
  const currentDetailsIntegration =
    (detailsSheet &&
      integrations.find((i) => i.id === detailsSheet.integration.id)) ||
    detailsSheet?.integration

  // Handle OAuth callback results
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "mercado_pago_connected") {
      toast.success("Mercado Pago conectado com sucesso!")
      window.history.replaceState({}, "", "/settings/integrations")
    }

    if (success === "tiny_connected") {
      toast.success("Tiny ERP conectado com sucesso!")
      window.history.replaceState({}, "", "/settings/integrations")
    }

    if (success === "instagram_connected") {
      toast.success("Instagram conectado com sucesso!")
      window.history.replaceState({}, "", "/settings/integrations")
    }

    if (success === "melhor_envio_connected") {
      toast.success("Melhor Envio conectado com sucesso!")
      window.history.replaceState({}, "", "/settings/integrations")
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        missing_code: "Código de autorização não encontrado",
        missing_state: "Parâmetro de estado não encontrado",
        oauth_failed: "Falha na autenticação OAuth",
        instagram_denied: "Acesso ao Instagram foi negado pelo usuário",
      }
      toast.error(errorMessages[error] || "Erro ao conectar integração")
      window.history.replaceState({}, "", "/settings/integrations")
    }
  }, [searchParams])

  const handleConnect = (provider: ProviderConfig) => {
    switch (provider.authType) {
      case "oauth":
        connectOAuth.mutate(provider.id)
        break
      case "oauth_with_credentials":
        if (provider.id === "tiny") {
          setTinyDialog(true)
        }
        break
      case "api_key":
        // Pagar.me has its own dialog (secret + public + webhook auth);
        // the generic single-key dialog only fits Tiny / SmartEnvios.
        if (provider.id === "pagarme") {
          setPagarmeDialog(true)
          break
        }
        setApiKeyDialog(provider.id)
        break
      case "whatsapp":
        setWhatsappDialog(true)
        break
    }
  }

  const closePagarmeDialog = () => {
    setPagarmeDialog(false)
    setPagarmeSecretKey("")
    setPagarmePublicKey("")
    setPagarmeWebhookUser("")
    setPagarmeWebhookPass("")
    setPagarmeError(null)
  }

  const handleConnectPagarme = () => {
    const secret = pagarmeSecretKey.trim()
    const publicKey = pagarmePublicKey.trim()
    if (!secret || !publicKey) return

    setPagarmeError(null)

    const secretEnv = secret.startsWith("sk_test_")
      ? "test"
      : secret.startsWith("sk_live_")
        ? "live"
        : null
    const publicEnv = publicKey.startsWith("pk_test_")
      ? "test"
      : publicKey.startsWith("pk_live_")
        ? "live"
        : null
    if (!secretEnv) {
      setPagarmeError("Chave secreta deve começar com sk_test_ ou sk_live_.")
      return
    }
    if (!publicEnv) {
      setPagarmeError("Chave pública deve começar com pk_test_ ou pk_live_.")
      return
    }
    if (secretEnv !== publicEnv) {
      setPagarmeError(
        "As chaves precisam ser do mesmo ambiente (ambas test ou ambas live)."
      )
      return
    }

    connectPagarme.mutate(
      {
        secretKey: secret,
        publicKey,
        webhookUsername: pagarmeWebhookUser.trim() || undefined,
        webhookPassword: pagarmeWebhookPass.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Pagar.me conectada com sucesso!")
          closePagarmeDialog()
        },
        onError: (err) => {
          const apiErr = err as unknown as ApiError
          const fallback =
            apiErr?.status === 422
              ? "Chaves inválidas. Confira os valores e tente novamente."
              : "Falha ao conectar Pagar.me. Tente novamente."
          setPagarmeError(apiErr?.message || fallback)
        },
      }
    )
  }

  const closeApiKeyDialog = () => {
    setApiKeyDialog(null)
    setApiKey("")
    setApiKeyError(null)
    setSmartEnviosRotating(false)
  }

  const handleConnectApiKey = () => {
    if (!apiKeyDialog || !apiKey.trim()) return

    const provider = AVAILABLE_PROVIDERS.find((p) => p.id === apiKeyDialog)
    if (!provider) return

    setApiKeyError(null)

    // SmartEnvios uses a dedicated endpoint that validates the token in real
    // time (422 means the token is invalid) and also serves rotation.
    if (apiKeyDialog === "smartenvios") {
      connectSmartEnvios.mutate(
        { token: apiKey.trim(), env: "production" },
        {
          onSuccess: () => {
            toast.success(
              smartEnviosRotating
                ? "Token da SmartEnvios atualizado."
                : "SmartEnvios conectado com sucesso!"
            )
            closeApiKeyDialog()
          },
          onError: (err) => {
            const apiErr = err as unknown as ApiError
            const fallback =
              apiErr?.status === 422
                ? "Token inválido. Confira o valor e tente novamente."
                : "Falha ao conectar SmartEnvios. Tente novamente."
            setApiKeyError(apiErr?.message || fallback)
          },
        }
      )
      return
    }

    connectApiKey.mutate(
      {
        type: provider.type,
        provider: apiKeyDialog,
        credentials: { api_key: apiKey },
      },
      {
        onSuccess: () => {
          toast.success(`${provider.name} conectado com sucesso!`)
          closeApiKeyDialog()
        },
        onError: () => {
          setApiKeyError("Falha ao conectar. Verifique a chave de API.")
        },
      }
    )
  }

  const handleRotateSmartEnvios = () => {
    setApiKey("")
    setApiKeyError(null)
    setSmartEnviosRotating(true)
    setApiKeyDialog("smartenvios")
  }

  // Confirmation flow: closes the details sheet and opens the rotation form
  // dialog with the current state cleared.
  const handleConfirmRotate = () => {
    setRotateConfirmOpen(false)
    handleCloseDetails()
    handleRotateSmartEnvios()
  }

  const handleConnectTiny = () => {
    if (!tinyClientId.trim() || !tinyClientSecret.trim()) return

    connectTiny.mutate(
      { clientId: tinyClientId, clientSecret: tinyClientSecret },
      {
        onSuccess: () => {
          setTinyDialog(false)
          setTinyClientId("")
          setTinyClientSecret("")
        },
      }
    )
  }

  const handleDisconnect = () => {
    if (!disconnectId) return

    disconnectIntegration.mutate(disconnectId, {
      onSuccess: () => {
        toast.success("Integração desconectada")
        setDisconnectId(null)
      },
      onError: () => {
        toast.error("Falha ao desconectar")
      },
    })
  }

  const handleTestConnection = (integrationId: string, providerName: string) => {
    setTestingId(integrationId)
    testConnection.mutate(integrationId, {
      onSuccess: (result) => {
        setTestingId(null)
        if (result.success) {
          toast.success(`${providerName}: ${result.message}`, {
            description: `Latência: ${result.latencyMs}ms`,
          })
        } else {
          toast.error(`${providerName}: ${result.message}`)
        }
      },
      onError: () => {
        setTestingId(null)
        toast.error("Falha ao testar conexão")
      },
    })
  }

  const handleOpenDetails = (integration: Integration, provider: ProviderConfig) => {
    setDetailsSheet({ integration, provider })
    setDetailsLoading(true)
    setDetailsData(null)

    // Refetch the integrations list so webhookLastPingAt reflects the
    // latest ping (Tiny pings the URL as soon as the merchant saves it).
    queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })

    testConnection.mutate(integration.id, {
      onSuccess: (result) => {
        setDetailsLoading(false)
        setDetailsData(result)
      },
      onError: () => {
        setDetailsLoading(false)
        setDetailsData(null)
      },
    })
  }

  const handleCloseDetails = () => {
    setDetailsSheet(null)
    setDetailsData(null)
  }

  const getConnectedIntegration = (providerId: IntegrationProvider): Integration | undefined => {
    return integrations.find(
      (i) => i.provider === providerId && (i.status === "active" || i.status === "pending_auth")
    )
  }

  const getProvidersByType = (type: IntegrationType) =>
    AVAILABLE_PROVIDERS.filter((p) => p.type === type)

  const integrationToDisconnect = disconnectId
    ? integrations.find((i) => i.id === disconnectId)
    : null
  const providerToDisconnect = integrationToDisconnect
    ? AVAILABLE_PROVIDERS.find((p) => p.id === integrationToDisconnect.provider)
    : null

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Available Integrations by Category */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold tracking-tight">Adicionar Integrações</h2>
          <p className="text-sm text-muted-foreground">
            Conecte novos serviços para expandir as funcionalidades
          </p>
        </div>

        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="mb-6 h-auto w-full justify-start border-b bg-transparent p-0">
            {(Object.keys(categoryConfig) as IntegrationType[]).map((type) => {
              const config = categoryConfig[type]
              const providersInCategory = getProvidersByType(type)
              const connectedCount = providersInCategory.filter((p) =>
                getConnectedIntegration(p.id)
              ).length

              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className={cn(
                    "relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2",
                    "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                    "data-[state=active]:shadow-none"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                    {connectedCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {connectedCount}/{providersInCategory.length}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {(Object.keys(categoryConfig) as IntegrationType[]).map((type) => {
            const config = categoryConfig[type]
            const providers = getProvidersByType(type)

            return (
              <TabsContent key={type} value={type} className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">{config.description}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {providers.map((provider) => {
                    const connected = getConnectedIntegration(provider.id)
                    const isConnected = !!connected
                    const showReorder =
                      type === "payment" && paymentChain.length > 1
                    const chainIdx = showReorder
                      ? paymentChain.findIndex((p) => p.id === connected?.id)
                      : -1
                    const isPrimary =
                      type === "payment" && connected?.id === primaryPaymentId

                    return (
                      <IntegrationCard
                        key={provider.id}
                        provider={provider.id}
                        connected={isConnected}
                      >
                        <div className="flex h-full flex-col p-5">
                          <div className="flex items-start gap-4">
                            <IntegrationCard.Logo provider={provider.id} size="lg" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">{provider.name}</h3>
                                {isConnected && (
                                  <IntegrationCard.Status
                                    status={connected.status === "active" ? "active" : "pending"}
                                  />
                                )}
                                {isConnected &&
                                  connected.status === "active" &&
                                  connected.webhookStatus === "pending" && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                      <AlertTriangle className="h-3 w-3" />
                                      Webhook pendente
                                    </span>
                                  )}
                                {isPrimary && (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                    Primário
                                  </span>
                                )}
                                {showReorder && chainIdx >= 0 && !isPrimary && (
                                  <span className="text-[11px] font-medium text-muted-foreground">
                                    Fallback #{chainIdx + 1}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {provider.description}
                              </p>

                              {/* Features */}
                              <div className="mt-3 flex min-h-[52px] flex-wrap content-start gap-1.5">
                                {provider.features.map((feature) => (
                                  <span
                                    key={feature}
                                    className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto space-y-2 pt-4">
                            {isConnected ? (
                              <>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleOpenDetails(connected, provider)}
                                  >
                                    <Info className="mr-1.5 h-3.5 w-3.5" />
                                    Ver detalhes
                                  </Button>
                                  {showReorder && chainIdx >= 0 && (
                                    <div className="flex items-center gap-0.5 rounded-md border border-border bg-background">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={
                                          chainIdx === 0 || updatePriority.isPending
                                        }
                                        onClick={() =>
                                          handleReorderPayment(connected.id, "up")
                                        }
                                        title="Promover prioridade"
                                      >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={
                                          chainIdx === paymentChain.length - 1 ||
                                          updatePriority.isPending
                                        }
                                        onClick={() =>
                                          handleReorderPayment(connected.id, "down")
                                        }
                                        title="Reduzir prioridade"
                                      >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => setDisconnectId(connected.id)}
                                  >
                                    <Unplug className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                {provider.id === "tiny" && connected.status === "active" ? (
                                  <TinyHealthCheckDialog integrationId={connected.id} />
                                ) : null}
                              </>
                            ) : (
                              <div className="space-y-2">
                                <Button
                                  className="w-full"
                                  onClick={() => handleConnect(provider)}
                                  disabled={connectOAuth.isPending}
                                >
                                  {connectOAuth.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                  )}
                                  Conectar {provider.name}
                                </Button>
                                {provider.docHref && (
                                  <Link
                                    href={provider.docHref}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Ver tutorial passo a passo
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </IntegrationCard>
                    )
                  })}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </section>

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar {providerToDisconnect?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              A integração com {providerToDisconnect?.name} será removida. Você precisará
              reconectar para usar os recursos novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={disconnectIntegration.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectIntegration.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* API Key Dialog */}
      <Dialog
        open={!!apiKeyDialog}
        onOpenChange={(open) => {
          if (!open) closeApiKeyDialog()
        }}
      >
        <DialogContent className="overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {apiKeyDialog === "smartenvios" && smartEnviosRotating
                ? "Rotacionar token da SmartEnvios"
                : `Conectar ${AVAILABLE_PROVIDERS.find((p) => p.id === apiKeyDialog)?.name ?? ""}`}
            </DialogTitle>
            <DialogDescription>
              {apiKeyDialog === "smartenvios"
                ? "Cole o token do embarcador. O token é validado em tempo real."
                : "Insira a chave de API para conectar esta integração"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">
                {apiKeyDialog === "smartenvios" ? "Token do embarcador" : "Chave de API"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder={
                  apiKeyDialog === "smartenvios"
                    ? "Cole o token fornecido pela SmartEnvios"
                    : "Insira sua chave de API"
                }
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  if (apiKeyError) setApiKeyError(null)
                }}
                aria-invalid={!!apiKeyError}
              />
            </div>

            {apiKeyError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{apiKeyError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeApiKeyDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleConnectApiKey}
              disabled={
                !apiKey.trim() ||
                connectApiKey.isPending ||
                connectSmartEnvios.isPending
              }
            >
              {connectApiKey.isPending || connectSmartEnvios.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {apiKeyDialog === "smartenvios" && smartEnviosRotating
                ? "Atualizar token"
                : "Conectar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp connect wizard (PRD 006) */}
      <WhatsAppConnectDialog open={whatsappDialog} onOpenChange={setWhatsappDialog} />

      {/* Tiny OAuth Credentials Dialog */}
      <Dialog open={tinyDialog} onOpenChange={() => setTinyDialog(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Conectar Tiny ERP</DialogTitle>
            <DialogDescription>
              Cadastre seu aplicativo em{" "}
              <a
                href="https://erp.tiny.com.br/configuracoes#checks=gestao_aplicativos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Configurações → Aplicativos
              </a>{" "}
              da Tiny e cole as URLs abaixo nos campos correspondentes antes
              de continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* URLs to register in the Tiny app */}
            <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    URLs para configurar no app da Tiny
                  </p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                    Cole estas URLs nos campos correspondentes do app na Tiny
                    e salve antes de continuar. Sem isso, o OAuth falha e os
                    webhooks de estoque/produto não chegam na Livecart.
                  </p>
                </div>
              </div>

              {tinyProviderURLs.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando URLs...
                </div>
              ) : tinyProviderURLs.isError ? (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    Não foi possível carregar as URLs. Recarregue a página e
                    tente novamente.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {tinyProviderURLs.data?.redirectUrl && (
                    <CopyableURL
                      label="URL de Redirecionamento (OAuth)"
                      value={tinyProviderURLs.data.redirectUrl}
                    />
                  )}
                  {tinyProviderURLs.data?.webhookUrl && (
                    <CopyableURL
                      label="URL de Webhooks"
                      value={tinyProviderURLs.data.webhookUrl}
                    />
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="tiny-client-id">
                Client ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tiny-client-id"
                placeholder="tiny-api-..."
                value={tinyClientId}
                onChange={(e) => setTinyClientId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiny-client-secret">
                Client Secret <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tiny-client-secret"
                type="password"
                placeholder="Insira o Client Secret"
                value={tinyClientSecret}
                onChange={(e) => setTinyClientSecret(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTinyDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConnectTiny}
              disabled={connectTiny.isPending || !tinyClientId || !tinyClientSecret}
            >
              {connectTiny.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Continuar com OAuth
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagar.me API Keys Dialog */}
      <Dialog
        open={pagarmeDialog}
        onOpenChange={(open) => {
          if (!open) closePagarmeDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Conectar Pagar.me</DialogTitle>
            <DialogDescription>
              Cole as chaves de API encontradas em{" "}
              <a
                href="https://dashboard.pagar.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Configurações → Chaves de API
              </a>{" "}
              da Pagar.me. O ambiente (sandbox / produção) é detectado pelo
              prefixo da chave.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <PagarmeConnectWizard webhookUrl={pagarmeProviderURLs.data?.webhookUrl} />

            {pagarmeProviderURLs.isError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Não foi possível carregar a URL do webhook. Recarregue a
                  página e tente novamente.
                </span>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="pagarme-secret">
                Chave secreta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pagarme-secret"
                type="password"
                placeholder="sk_test_... ou sk_live_..."
                value={pagarmeSecretKey}
                onChange={(e) => {
                  setPagarmeSecretKey(e.target.value)
                  if (pagarmeError) setPagarmeError(null)
                }}
                aria-invalid={!!pagarmeError}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pagarme-public">
                Chave pública <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pagarme-public"
                placeholder="pk_test_... ou pk_live_..."
                value={pagarmePublicKey}
                onChange={(e) => {
                  setPagarmePublicKey(e.target.value)
                  if (pagarmeError) setPagarmeError(null)
                }}
                aria-invalid={!!pagarmeError}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pagarme-webhook-user">Webhook · usuário</Label>
                <Input
                  id="pagarme-webhook-user"
                  placeholder="Opcional"
                  value={pagarmeWebhookUser}
                  onChange={(e) => setPagarmeWebhookUser(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagarme-webhook-pass">Webhook · senha</Label>
                <Input
                  id="pagarme-webhook-pass"
                  type="password"
                  placeholder="Opcional"
                  value={pagarmeWebhookPass}
                  onChange={(e) => setPagarmeWebhookPass(e.target.value)}
                />
              </div>
            </div>

            {pagarmeError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{pagarmeError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closePagarmeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleConnectPagarme}
              disabled={
                !pagarmeSecretKey.trim() ||
                !pagarmePublicKey.trim() ||
                connectPagarme.isPending
              }
            >
              {connectPagarme.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Details Sheet */}
      <Sheet open={!!detailsSheet} onOpenChange={handleCloseDetails}>
        <SheetContent className="w-[400px] overflow-y-auto overflow-x-hidden sm:w-[540px]">
          <SheetHeader>
            <div className="flex items-center gap-3">
              {detailsSheet && (
                <IntegrationCard.Logo provider={detailsSheet.provider.id} size="md" />
              )}
              <div>
                <SheetTitle>{detailsSheet?.provider.name}</SheetTitle>
                <SheetDescription>{detailsSheet?.provider.description}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Status Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Status da Conexão</h4>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  {currentDetailsIntegration?.status === "active" ? (
                    <IntegrationCard.Status status="active" />
                  ) : (
                    <IntegrationCard.Status status="pending" />
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conectado em</span>
                  <span className="text-sm text-muted-foreground">
                    {currentDetailsIntegration?.createdAt
                      ? new Date(currentDetailsIntegration.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Webhook + setup URLs — surfaced only for providers that
                expose redirectUrl / webhookUrl on the integration record.
                The copy is provider-aware: each provider has its own panel
                name (Tiny, Pagar.me, Mercado Pago, Melhor Envio) so a Tiny
                tip never shows up under a Mercado Pago integration. */}
            {currentDetailsIntegration && detailsSheet && (() => {
              const { redirectUrl, webhookUrl, webhookStatus, webhookLastPingAt } =
                currentDetailsIntegration
              const hasAny = !!(redirectUrl || webhookUrl)
              if (!hasAny) return null

              const providerCopy = providerWebhookCopy(detailsSheet.provider.id)
              const isActive = webhookStatus === "active"
              const lastPingLabel = webhookLastPingAt
                ? formatDistanceToNow(new Date(webhookLastPingAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                : null

              return (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Webhook
                  </h4>
                  <div className="space-y-3 rounded-lg border p-4">
                    {/* Webhook health — only meaningful when the provider
                        actually pings us back (Tiny). For providers that
                        don't ping on save we hide the badge so the section
                        doesn't read "não confirmado" forever. */}
                    {providerCopy.showHealth && isActive ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                          <Webhook className="h-3 w-3 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">Webhook ativo</p>
                          {lastPingLabel && (
                            <p className="text-xs text-muted-foreground">
                              Último sinal {lastPingLabel}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : providerCopy.showHealth ? (
                      <div className="flex items-start gap-3 rounded-md border border-red-300 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                            Webhook não configurado — os pedidos não vão sincronizar
                          </p>
                          <ol className="list-decimal space-y-1 pl-4 text-xs text-red-800/90 dark:text-red-200/80">
                            <li>Copie a <strong>URL de Webhook</strong> logo abaixo</li>
                            <li>{providerCopy.healthHint}</li>
                            <li>
                              Cole a URL, clique em <strong>Salvar</strong> no painel do
                              provedor e volte aqui — a confirmação aparece sozinha após o
                              primeiro sinal
                            </li>
                          </ol>
                        </div>
                      </div>
                    ) : null}

                    {providerCopy.showHealth && (webhookUrl || redirectUrl) && (
                      <Separator />
                    )}

                    {/* Pagar.me-specific probe: queries the gateway's hooks
                        history to confirm the merchant cadastrou a URL no
                        painel. Other providers either ping us back on save
                        (Tiny) or rely on the live event reception. */}
                    {detailsSheet.provider.id === "pagarme" &&
                      currentDetailsIntegration?.id && (
                        <PagarmeWebhookProbe
                          integrationId={currentDetailsIntegration.id}
                        />
                      )}

                    {webhookUrl && (
                      <CopyableURL
                        label="URL de Webhook"
                        value={webhookUrl}
                        description={providerCopy.webhookHint}
                      />
                    )}

                    {redirectUrl && (
                      <CopyableURL
                        label="URL de Redirecionamento (OAuth)"
                        value={redirectUrl}
                        description={providerCopy.redirectHint}
                      />
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Account Info — omitted entirely when the provider returns no
                usable fields. Failures are already surfaced by the "Último
                Teste" card below, so no fallback copy is needed here. */}
            {(() => {
              const fields = buildAccountFields(detailsData?.accountInfo)
              if (!detailsLoading && fields.length === 0) return null
              return (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Informações da Conta
                  </h4>
                  <div className="rounded-lg border p-4">
                    {detailsLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {fields.map((f, i) => (
                          <Fragment key={f.label}>
                            {i > 0 && <Separator />}
                            <div className="flex items-start gap-3">
                              <f.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">
                                  {f.label}
                                </p>
                                <p
                                  className={cn(
                                    "font-medium break-words",
                                    f.mono && "font-mono text-sm break-all"
                                  )}
                                >
                                  {f.value}
                                </p>
                              </div>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Token rotation — only for static-token providers (SmartEnvios).
                Lives inside Ver detalhes (not on the card) and gates the form
                behind a confirmation alert so it's not a one-click footgun. */}
            {detailsSheet?.provider.id === "smartenvios" && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Token de acesso
                </h4>
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Use apenas se você gerou um novo token no painel da
                    SmartEnvios ou suspeita que o atual foi comprometido. O
                    token salvo será substituído.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotateConfirmOpen(true)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Rotacionar token
                  </Button>
                </div>
              </div>
            )}

            {/* Connection Test Section */}
            {detailsData && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Último Teste</h4>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resultado</span>
                    {detailsData.success ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Sucesso
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-600 border-red-500/20"
                      >
                        Falha
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Latência</span>
                    </div>
                    <span className="text-sm font-mono">{detailsData.latencyMs}ms</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Testado em</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(detailsData.testedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Rotate Token Confirmation */}
      <AlertDialog
        open={rotateConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setRotateConfirmOpen(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Rotacionar token da SmartEnvios?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A rotação substitui o token atualmente salvo pelo que você
              informar a seguir. Use só quando você já tem o novo token em
              mãos — gerado no painel da SmartEnvios — ou se suspeita que o
              atual foi comprometido. Enquanto você não confirmar o novo
              token, o atual continua valendo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRotate}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  )
}
