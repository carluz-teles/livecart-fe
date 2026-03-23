"use client"

import { useState } from "react"
import { Building2, Globe, MapPin, Phone, Mail, Link as LinkIcon, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Mock data - será substituído por dados reais da API
const organization = {
  id: "org_123456",
  name: "Minha Loja",
  slug: "minha-loja",
  logo: null,
  description: "Loja especializada em moda feminina e acessórios",
  email: "contato@minhaloja.com",
  phone: "(11) 99999-9999",
  website: "https://minhaloja.com",
  address: {
    street: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zip: "01234-567",
  },
  plan: "pro",
  createdAt: "2024-01-15T10:30:00Z",
}

export default function OrganizationPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const storeUrl = `https://livecart.app/${organization.slug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da loja</CardTitle>
          <CardDescription>
            Dados básicos da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={organization.logo || undefined} alt={organization.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button variant="outline" size="sm">
                Alterar logo
              </Button>
              <p className="text-xs text-muted-foreground">
                Recomendado: 256x256px, PNG ou JPG
              </p>
            </div>
          </div>

          <Separator />

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da loja</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  defaultValue={organization.name}
                  disabled={!isEditing}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL da loja</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="slug"
                    value={storeUrl}
                    disabled
                    className="pl-9 bg-muted font-mono text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                defaultValue={organization.description}
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de contato</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue={organization.email}
                    disabled={!isEditing}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={organization.phone}
                    disabled={!isEditing}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  defaultValue={organization.website}
                  disabled={!isEditing}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  Salvar alterações
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar informações
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>
            Localização física da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="street"
                defaultValue={organization.address.street}
                disabled={!isEditing}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                defaultValue={organization.address.city}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                defaultValue={organization.address.state}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">CEP</Label>
              <Input
                id="zip"
                defaultValue={organization.address.zip}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Plano e cobrança</CardTitle>
          <CardDescription>
            Informações sobre seu plano atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Plano atual:</span>
                <Badge variant="default" className="uppercase">
                  {organization.plan}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Loja criada em {new Date(organization.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button variant="outline">
              Gerenciar plano
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis para sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Transferir propriedade</p>
              <p className="text-sm text-muted-foreground">
                Transfira a propriedade desta loja para outro usuário
              </p>
            </div>
            <Button variant="outline" size="sm">
              Transferir
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Excluir organização</p>
              <p className="text-sm text-muted-foreground">
                Exclua permanentemente esta loja e todos os dados
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Excluir loja
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
