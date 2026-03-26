"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, Globe, MapPin, Phone, Mail, Link as LinkIcon, Copy, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { useStore } from "@/hooks/store/useStore"
import { useUpdateStore } from "@/hooks/store/useUpdateStore"

const organizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  description: z.string().optional(),
  emailAddress: z.string().email("E-mail inválido").optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

export default function OrganizationPage() {
  const { data: store, isLoading } = useStore()
  const updateStore = useUpdateStore()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      description: "",
      emailAddress: "",
      whatsappNumber: "",
      website: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "Brasil",
      },
    },
  })

  // Reset form when store data loads
  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        description: store.description || "",
        emailAddress: store.emailAddress || "",
        whatsappNumber: store.whatsappNumber || "",
        website: store.website || "",
        address: {
          street: store.address?.street || "",
          city: store.address?.city || "",
          state: store.address?.state || "",
          zip: store.address?.zip || "",
          country: store.address?.country || "Brasil",
        },
      })
    }
  }, [store, form])

  const storeUrl = store ? `https://livecart.app/${store.slug}` : ""

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      await updateStore.mutateAsync({
        name: data.name,
        description: data.description,
        emailAddress: data.emailAddress,
        whatsappNumber: data.whatsappNumber,
        website: data.website,
        address: {
          street: data.address.street || "",
          city: data.address.city || "",
          state: data.address.state || "",
          zip: data.address.zip || "",
          country: data.address.country || "Brasil",
        },
      })
      setIsEditing(false)
      toast.success("Alterações salvas", {
        description: "As informações da loja foram atualizadas.",
      })
    } catch {
      toast.error("Erro ao salvar", {
        description: "Não foi possível salvar as alterações. Tente novamente.",
      })
    }
  }

  const handleCancel = () => {
    if (store) {
      form.reset({
        name: store.name,
        description: store.description || "",
        emailAddress: store.emailAddress || "",
        whatsappNumber: store.whatsappNumber || "",
        website: store.website || "",
        address: {
          street: store.address?.street || "",
          city: store.address?.city || "",
          state: store.address?.state || "",
          zip: store.address?.zip || "",
          country: store.address?.country || "Brasil",
        },
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <AvatarImage src={store?.logoUrl || undefined} alt={store?.name} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Button variant="outline" size="sm" type="button" disabled>
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da loja <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          disabled={!isEditing}
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>URL da loja</FormLabel>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={storeUrl}
                      disabled
                      className="pl-9 bg-muted font-mono text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Descreva sua loja..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail de contato</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            disabled={!isEditing}
                            className="pl-9"
                            placeholder="contato@minhaloja.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type="tel"
                            disabled={!isEditing}
                            className="pl-9"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="url"
                          disabled={!isEditing}
                          className="pl-9"
                          placeholder="https://minhaloja.com"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" type="button" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateStore.isPending}>
                    {updateStore.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar alterações
                  </Button>
                </>
              ) : (
                <Button variant="outline" type="button" onClick={() => setIsEditing(true)}>
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
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="pl-9"
                        placeholder="Rua das Flores, 123"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="São Paulo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="SP"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="01234-567"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    {store?.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Loja criada em {store?.createdAt ? new Date(store.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) : "-"}
                </p>
              </div>
              <Button variant="outline" type="button" disabled>
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
              <Button variant="outline" size="sm" type="button" disabled>
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
              <Button variant="destructive" size="sm" type="button" disabled>
                Excluir loja
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
