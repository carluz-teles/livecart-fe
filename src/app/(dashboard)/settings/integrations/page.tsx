"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, CreditCard, ExternalLink, Instagram, Package, Unplug, Loader2, Zap, Info, User, Clock, Activity } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  useIntegrations,
  useConnectOAuth,
  useConnectApiKey,
  useConnectTiny,
  useDisconnectIntegration,
  useTestConnection,
} from "@/hooks/integration"
import type { Integration, IntegrationProvider } from "@/types"

interface ProviderConfig {
  id: IntegrationProvider
  name: string
  description: string
  icon: React.ReactNode
  type: "payment" | "erp" | "social"
  authType: "oauth" | "api_key" | "oauth_with_credentials"
}

const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    description: "Receba pagamentos via Pix, cartão e boleto",
    icon: <CreditCard className="h-6 w-6" />,
    type: "payment",
    authType: "oauth",
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    description: "Sincronize produtos e pedidos com seu ERP",
    icon: <Package className="h-6 w-6" />,
    type: "erp",
    authType: "oauth_with_credentials",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Receba comentários e mensagens de lives",
    icon: <Instagram className="h-6 w-6" />,
    type: "social",
    authType: "oauth",
  },
]

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const { data, isLoading } = useIntegrations()
  const connectOAuth = useConnectOAuth()
  const connectApiKey = useConnectApiKey()
  const connectTiny = useConnectTiny()
  const disconnectIntegration = useDisconnectIntegration()
  const testConnection = useTestConnection()

  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [apiKeyDialog, setApiKeyDialog] = useState<IntegrationProvider | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [testingId, setTestingId] = useState<string | null>(null)
  const [tinyDialog, setTinyDialog] = useState(false)
  const [tinyClientId, setTinyClientId] = useState("")
  const [tinyClientSecret, setTinyClientSecret] = useState("")
  const [detailsSheet, setDetailsSheet] = useState<{ integration: Integration; provider: ProviderConfig } | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsData, setDetailsData] = useState<{ success: boolean; message: string; latencyMs: number; accountInfo?: Record<string, unknown>; testedAt: string } | null>(null)

  const integrations = data?.data ?? []

  // Handle OAuth callback results
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "mercado_pago_connected") {
      toast.success("Mercado Pago conectado com sucesso!")
      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations")
    }

    if (success === "tiny_connected") {
      toast.success("Tiny ERP conectado com sucesso!")
      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations")
    }

    if (success === "instagram_connected") {
      toast.success("Instagram conectado com sucesso!")
      // Clean URL
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

  const handleConnectApiKey = () => {
    if (!apiKeyDialog || !apiKey.trim()) return

    const provider = AVAILABLE_PROVIDERS.find((p) => p.id === apiKeyDialog)
    if (!provider) return

    connectApiKey.mutate(
      {
        type: provider.type,
        provider: apiKeyDialog,
        credentials: { api_key: apiKey },
      },
      {
        onSuccess: () => {
          toast.success(`${provider.name} conectado com sucesso!`)
          setApiKeyDialog(null)
          setApiKey("")
        },
        onError: () => {
          toast.error("Falha ao conectar. Verifique a chave de API.")
        },
      }
    )
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

  const connectedProviders = AVAILABLE_PROVIDERS.filter((p) => getConnectedIntegration(p.id))
  const availableProviders = AVAILABLE_PROVIDERS.filter((p) => !getConnectedIntegration(p.id))

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
    <div className="space-y-6">
      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações conectadas</CardTitle>
          <CardDescription>Serviços atualmente conectados à sua loja</CardDescription>
        </CardHeader>
        <CardContent>
          {connectedProviders.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">Nenhuma integração conectada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedProviders.map((provider) => {
                const integration = getConnectedIntegration(provider.id)!
                return (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {provider.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{provider.name}</h3>
                          {integration.status === "active" ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              <Check className="mr-1 h-3 w-3" />
                              Conectado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Conectado em{" "}
                          {new Date(integration.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(integration, provider)}
                      >
                        <Info className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(integration.id, provider.name)}
                        disabled={testingId === integration.id}
                      >
                        {testingId === integration.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        Testar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDisconnectId(integration.id)}
                        disabled={disconnectIntegration.isPending}
                      >
                        <Unplug className="mr-2 h-4 w-4" />
                        Desconectar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações disponíveis</CardTitle>
          <CardDescription>Conecte novos serviços para expandir as funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          {availableProviders.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Todas as integrações disponíveis estão conectadas
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableProviders.map((provider) => (
                <div key={provider.id} className="flex flex-col gap-4 rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {provider.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleConnect(provider)}
                    disabled={connectOAuth.isPending}
                  >
                    {connectOAuth.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Conectar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar {providerToDisconnect?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              A integração com {providerToDisconnect?.name} será removida. Você precisará reconectar
              para usar os recursos novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={disconnectIntegration.isPending}
            >
              {disconnectIntegration.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* API Key Dialog (for non-OAuth providers) */}
      <Dialog open={!!apiKeyDialog} onOpenChange={() => setApiKeyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Conectar {AVAILABLE_PROVIDERS.find((p) => p.id === apiKeyDialog)?.name}
            </DialogTitle>
            <DialogDescription>
              Insira a chave de API para conectar esta integração
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Chave de API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Insira sua chave de API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConnectApiKey} disabled={connectApiKey.isPending || !apiKey}>
              {connectApiKey.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Conectar
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {detailsSheet?.provider.icon}
              </div>
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
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      <Check className="mr-1 h-3 w-3" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                      Pendente
                    </Badge>
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
                    {detailsData.accountInfo.username && (
                      <>
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Usuário</p>
                            <p className="font-medium">@{String(detailsData.accountInfo.username)}</p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    {detailsData.accountInfo.name && (
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
                    )}
                    {detailsData.accountInfo.id && (
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">ID da Conta</p>
                          <p className="font-mono text-sm">{String(detailsData.accountInfo.id)}</p>
                        </div>
                      </div>
                    )}
                    {/* Mercado Pago specific fields */}
                    {detailsData.accountInfo.email && (
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
                    )}
                    {detailsData.accountInfo.nickname && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Apelido</p>
                            <p className="font-medium">{String(detailsData.accountInfo.nickname)}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : detailsData?.success === false ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-destructive">{detailsData.message}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Não foi possível carregar as informações</p>
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
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        <Check className="mr-1 h-3 w-3" />
                        Sucesso
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-600">
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
