"use client"

import { useState } from "react"
import { Check, ExternalLink, Instagram, ShoppingBag, Store, Unplug } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  connectedAt?: string
  accountName?: string
}

const initialIntegrations: Integration[] = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Conecte sua conta para capturar comentários das lives",
    icon: <Instagram className="h-6 w-6" />,
    connected: true,
    connectedAt: "2024-02-15T10:30:00Z",
    accountName: "@minhaloja",
  },
  {
    id: "bling",
    name: "Bling",
    description: "Sincronize produtos e pedidos com o Bling ERP",
    icon: <Store className="h-6 w-6" />,
    connected: false,
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    description: "Integração com o sistema Tiny para gestão de estoque",
    icon: <ShoppingBag className="h-6 w-6" />,
    connected: false,
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Conecte sua loja Shopify para sincronizar produtos",
    icon: <ShoppingBag className="h-6 w-6" />,
    connected: false,
  },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [disconnectId, setDisconnectId] = useState<string | null>(null)

  const handleConnect = (id: string) => {
    // TODO: Implement OAuth flow
    console.log("Connecting:", id)
  }

  const handleDisconnect = () => {
    if (!disconnectId) return

    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === disconnectId
          ? { ...integration, connected: false, connectedAt: undefined, accountName: undefined }
          : integration
      )
    )
    setDisconnectId(null)
  }

  const integrationToDisconnect = integrations.find((i) => i.id === disconnectId)

  return (
    <div className="space-y-6">
      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações conectadas</CardTitle>
          <CardDescription>
            Serviços atualmente conectados à sua loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.filter((i) => i.connected).length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Nenhuma integração conectada
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations
                .filter((i) => i.connected)
                .map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {integration.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{integration.name}</h3>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            <Check className="mr-1 h-3 w-3" />
                            Conectado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.accountName}
                          {integration.connectedAt && (
                            <> • Desde {new Date(integration.connectedAt).toLocaleDateString("pt-BR")}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisconnectId(integration.id)}
                    >
                      <Unplug className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações disponíveis</CardTitle>
          <CardDescription>
            Conecte novos serviços para expandir as funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {integrations
              .filter((i) => !i.connected)
              .map((integration) => (
                <div
                  key={integration.id}
                  className="flex flex-col gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleConnect(integration.id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Conectar
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso à API</CardTitle>
          <CardDescription>
            Integre sua própria aplicação usando nossa API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Chave de API</p>
              <p className="text-sm text-muted-foreground">
                Use para autenticar requisições à API do LiveCart
              </p>
            </div>
            <Button variant="outline">
              Gerar chave
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar {integrationToDisconnect?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              A integração com {integrationToDisconnect?.name} será removida.
              Você precisará reconectar para usar os recursos novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
