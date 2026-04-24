"use client"

import { Suspense, useEffect, useState } from "react"
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
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { IntegrationCard } from "@/components/integration/IntegrationCard"
import {
  useIntegrations,
  useConnectOAuth,
  useConnectApiKey,
  useConnectTiny,
  useConnectSmartEnvios,
  useDisconnectIntegration,
  useTestConnection,
} from "@/hooks/integration"
import type {
  Integration,
  IntegrationProvider,
  IntegrationType,
  SmartEnviosEnv,
} from "@/types"
import type { ApiError } from "@/types/api.types"
import { cn } from "@/lib/utils"

interface ProviderConfig {
  id: IntegrationProvider
  name: string
  description: string
  features: string[]
  type: IntegrationType
  authType: "oauth" | "api_key" | "oauth_with_credentials"
}

const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    description: "Receba pagamentos via Pix, cartão e boleto",
    features: ["Pix instantâneo", "Cartão de crédito", "Boleto bancário"],
    type: "payment",
    authType: "oauth",
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Gateway de pagamentos completo",
    features: ["Pix", "Cartão", "Boleto", "Split de pagamento"],
    type: "payment",
    authType: "api_key",
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    description: "Sincronize produtos e pedidos automaticamente",
    features: ["Importar produtos", "Sincronizar estoque", "Gerar notas fiscais"],
    type: "erp",
    authType: "oauth_with_credentials",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Capture comentários das suas lives em tempo real",
    features: ["Comentários em tempo real", "Detecção de pedidos", "DMs automáticas"],
    type: "social",
    authType: "oauth",
  },
  {
    id: "melhor_envio",
    name: "Melhor Envio",
    description: "Cote frete no checkout com Correios, Jadlog e outras transportadoras",
    features: ["Cotação em tempo real", "Múltiplas transportadoras", "Prazo e preço reais"],
    type: "shipping",
    authType: "oauth",
  },
  {
    id: "smartenvios",
    name: "SmartEnvios",
    description: "Cote frete e gerencie envios com Jadlog, Total Express e outras",
    features: ["Cotação em tempo real", "Criação de envio", "Etiquetas e rastreio"],
    type: "shipping",
    authType: "api_key",
  },
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
}

function IntegrationsContent() {
  const searchParams = useSearchParams()
  const { data, isLoading } = useIntegrations()
  const connectOAuth = useConnectOAuth()
  const connectApiKey = useConnectApiKey()
  const connectTiny = useConnectTiny()
  const connectSmartEnvios = useConnectSmartEnvios()
  const disconnectIntegration = useDisconnectIntegration()
  const testConnection = useTestConnection()

  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [apiKeyDialog, setApiKeyDialog] = useState<IntegrationProvider | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [smartEnviosEnv, setSmartEnviosEnv] =
    useState<SmartEnviosEnv>("production")
  const [smartEnviosRotating, setSmartEnviosRotating] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [tinyDialog, setTinyDialog] = useState(false)
  const [tinyClientId, setTinyClientId] = useState("")
  const [tinyClientSecret, setTinyClientSecret] = useState("")
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
        setApiKeyDialog(provider.id)
        break
    }
  }

  const closeApiKeyDialog = () => {
    setApiKeyDialog(null)
    setApiKey("")
    setApiKeyError(null)
    setSmartEnviosEnv("production")
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
        { token: apiKey.trim(), env: smartEnviosEnv },
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
    setSmartEnviosEnv("production")
    setSmartEnviosRotating(true)
    setApiKeyDialog("smartenvios")
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
          <TabsList className="mb-6 w-full justify-start border-b bg-transparent p-0">
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
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{provider.name}</h3>
                                {isConnected && (
                                  <IntegrationCard.Status
                                    status={connected.status === "active" ? "active" : "pending"}
                                  />
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

                          <div className="mt-auto pt-4">
                            {isConnected ? (
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
                                {provider.id === "smartenvios" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRotateSmartEnvios}
                                  >
                                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                    Rotacionar token
                                  </Button>
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
                            ) : (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {apiKeyDialog === "smartenvios" && smartEnviosRotating
                ? "Rotacionar token da SmartEnvios"
                : `Conectar ${AVAILABLE_PROVIDERS.find((p) => p.id === apiKeyDialog)?.name ?? ""}`}
            </DialogTitle>
            <DialogDescription>
              {apiKeyDialog === "smartenvios"
                ? "Cole o token do embarcador e escolha o ambiente. O token é validado em tempo real."
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

            {apiKeyDialog === "smartenvios" && (
              <div className="space-y-2">
                <Label>
                  Ambiente <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={smartEnviosEnv}
                  onValueChange={(v) => setSmartEnviosEnv(v as SmartEnviosEnv)}
                  className="grid grid-cols-2 gap-2"
                >
                  <Label
                    htmlFor="smartenvios-env-prod"
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm",
                      smartEnviosEnv === "production" && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem id="smartenvios-env-prod" value="production" />
                    Produção
                  </Label>
                  <Label
                    htmlFor="smartenvios-env-sandbox"
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm",
                      smartEnviosEnv === "sandbox" && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem id="smartenvios-env-sandbox" value="sandbox" />
                    Sandbox
                  </Label>
                </RadioGroup>
              </div>
            )}

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

      {/* Tiny OAuth Credentials Dialog */}
      <Dialog open={tinyDialog} onOpenChange={() => setTinyDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Tiny ERP</DialogTitle>
            <DialogDescription>
              Insira as credenciais do seu aplicativo Tiny. Você pode criar um aplicativo em{" "}
              <a
                href="https://erp.tiny.com.br/configuracoes#checks=gestao_aplicativos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Configurações → Aplicativos
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tiny-client-id">Client ID</Label>
              <Input
                id="tiny-client-id"
                placeholder="tiny-api-..."
                value={tinyClientId}
                onChange={(e) => setTinyClientId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiny-client-secret">Client Secret</Label>
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

      {/* Integration Details Sheet */}
      <Sheet open={!!detailsSheet} onOpenChange={handleCloseDetails}>
        <SheetContent className="w-[400px] sm:w-[540px]">
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
                  {detailsSheet?.integration.status === "active" ? (
                    <IntegrationCard.Status status="active" />
                  ) : (
                    <IntegrationCard.Status status="pending" />
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conectado em</span>
                  <span className="text-sm text-muted-foreground">
                    {detailsSheet?.integration.createdAt
                      ? new Date(detailsSheet.integration.createdAt).toLocaleDateString("pt-BR", {
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

            {/* Account Info Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Informações da Conta</h4>
              <div className="rounded-lg border p-4">
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : detailsData?.accountInfo ? (
                  <div className="space-y-3">
                    {"username" in detailsData.accountInfo && detailsData.accountInfo.username ? (
                      <>
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Usuário</p>
                            <p className="font-medium">
                              @{String(detailsData.accountInfo.username)}
                            </p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    ) : null}
                    {"name" in detailsData.accountInfo && detailsData.accountInfo.name ? (
                      <>
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Nome</p>
                            <p className="font-medium">{String(detailsData.accountInfo.name)}</p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    ) : null}
                    {"id" in detailsData.accountInfo && detailsData.accountInfo.id ? (
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">ID da Conta</p>
                          <p className="font-mono text-sm">
                            {String(detailsData.accountInfo.id)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {"email" in detailsData.accountInfo && detailsData.accountInfo.email ? (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{String(detailsData.accountInfo.email)}</p>
                          </div>
                        </div>
                      </>
                    ) : null}
                    {"nickname" in detailsData.accountInfo && detailsData.accountInfo.nickname ? (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Apelido</p>
                            <p className="font-medium">
                              {String(detailsData.accountInfo.nickname)}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : detailsData?.success === false ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-destructive">{detailsData.message}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Não foi possível carregar as informações
                    </p>
                  </div>
                )}
              </div>
            </div>

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
