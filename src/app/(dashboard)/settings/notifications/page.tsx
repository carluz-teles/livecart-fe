"use client"

import { useState } from "react"
import { Bell, Mail, Smartphone } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
}

const initialSettings: NotificationSetting[] = [
  {
    id: "orders",
    title: "Novos pedidos",
    description: "Receba notificações quando um novo pedido for realizado",
    email: true,
    push: true,
  },
  {
    id: "live_start",
    title: "Live iniciada",
    description: "Seja notificado quando uma live começar",
    email: false,
    push: true,
  },
  {
    id: "live_comments",
    title: "Comentários na live",
    description: "Receba alertas de comentários com keywords de produtos",
    email: false,
    push: true,
  },
  {
    id: "stock_low",
    title: "Estoque baixo",
    description: "Alerta quando um produto estiver com estoque baixo",
    email: true,
    push: false,
  },
  {
    id: "reports",
    title: "Relatórios semanais",
    description: "Resumo semanal de vendas e métricas",
    email: true,
    push: false,
  },
  {
    id: "team",
    title: "Atualizações da equipe",
    description: "Novos membros ou alterações na organização",
    email: true,
    push: false,
  },
]

export default function NotificationsPage() {
  const [settings, setSettings] = useState(initialSettings)

  const updateSetting = (id: string, field: "email" | "push", value: boolean) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Notificações por e-mail</CardTitle>
              <CardDescription>
                Escolha quais notificações deseja receber por e-mail
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting, index) => (
            <div key={setting.id}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`email-${setting.id}`} className="font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={`email-${setting.id}`}
                  checked={setting.email}
                  onCheckedChange={(value) => updateSetting(setting.id, "email", value)}
                />
              </div>
              {index < settings.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Notificações push</CardTitle>
              <CardDescription>
                Receba alertas em tempo real no seu navegador
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting, index) => (
            <div key={setting.id}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`push-${setting.id}`} className="font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={`push-${setting.id}`}
                  checked={setting.push}
                  onCheckedChange={(value) => updateSetting(setting.id, "push", value)}
                />
              </div>
              {index < settings.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Som de notificação</CardTitle>
              <CardDescription>
                Configure o som das notificações durante as lives
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound" className="font-medium">
                Ativar sons
              </Label>
              <p className="text-sm text-muted-foreground">
                Tocar som quando detectar um pedido durante a live
              </p>
            </div>
            <Switch id="sound" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
