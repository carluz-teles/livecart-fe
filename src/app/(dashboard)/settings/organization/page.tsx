"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@clerk/nextjs"
import { useQueryClient } from "@tanstack/react-query"
import { Building2, Globe, MapPin, Phone, Mail, Link as LinkIcon, Copy, Check, Loader2, Camera, Truck, Package, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { useStore, storeKeys } from "@/hooks/store/useStore"
import { useUpdateStore } from "@/hooks/store/useUpdateStore"
import { useUpdateShippingDefaults } from "@/hooks/store/useUpdateShippingDefaults"
import { useCepLookup } from "@/hooks/checkout/useCepLookup"
import { useIntegrations } from "@/hooks/integration/useIntegrations"
import { useConnectOAuth } from "@/hooks/integration/useConnectIntegration"
import { useDisconnectIntegration } from "@/hooks/integration/useDisconnectIntegration"
import { uploadService } from "@/services/api/upload.service"
import { DEFAULT_SHIPPING_DEFAULTS } from "@/types/store.types"
import { formatDateTime } from "@/lib/format"
import type { ApiError } from "@/types/api.types"

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const cepRegex = /^\d{5}-?\d{3}$/

const organizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  emailAddress: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  cnpj: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || cnpjRegex.test(v),
      "CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX."
    ),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    state: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^[A-Za-z]{2}$/.test(v),
        "UF deve ter 2 letras"
      ),
    zip: z
      .string()
      .optional()
      .refine(
        (v) => !v || cepRegex.test(v),
        "CEP inválido. Use 8 dígitos."
      ),
    country: z.string().optional(),
    stateRegister: z.string().optional(),
  }),
  shippingDefaults: z
    .object({
      packageWeightGrams: z
        .number({ message: "Peso deve ser um número" })
        .int("Use um número inteiro")
        .nonnegative("Peso não pode ser negativo"),
      packageFormat: z.enum(["box", "roll", "letter"]),
      heightCm: z
        .number({ message: "Use um número inteiro positivo" })
        .int()
        .positive()
        .nullable(),
      widthCm: z
        .number({ message: "Use um número inteiro positivo" })
        .int()
        .positive()
        .nullable(),
      lengthCm: z
        .number({ message: "Use um número inteiro positivo" })
        .int()
        .positive()
        .nullable(),
    })
    .superRefine((data, ctx) => {
      // Backend persists the three import-fallback dims as a unit — partial
      // input gets stored as nulls anyway. Surface that contract in the
      // form so the user fixes it before saving instead of silently losing
      // their data on the server side.
      const dims = [data.heightCm, data.widthCm, data.lengthCm]
      const filled = dims.filter((v) => v !== null && v !== undefined).length
      if (filled !== 0 && filled !== 3) {
        const message =
          "Preencha os três (altura, largura e comprimento) ou deixe os três em branco."
        const fields: Array<keyof typeof data> = ["heightCm", "widthCm", "lengthCm"]
        for (const field of fields) {
          if (data[field] === null || data[field] === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [field],
              message,
            })
          }
        }
      }
    }),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

function formatCepInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function formatCnpjInput(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export default function OrganizationPage() {
  const { data: store, isLoading } = useStore()
  const updateStore = useUpdateStore()
  const updateShippingDefaults = useUpdateShippingDefaults()
  const cepLookup = useCepLookup()
  const { data: integrationsData } = useIntegrations()
  const connectOAuth = useConnectOAuth()
  const disconnectIntegration = useDisconnectIntegration()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const melhorEnvio = (integrationsData?.data ?? []).find(
    (i) => i.provider === "melhor_envio"
  )

  // Heuristic from backend spec: enough fields filled to originate a
  // shipment. Shown as a banner to nudge the user to complete setup.
  const shippingConfigIncomplete = !!store && (
    !store.cnpj ||
    !store.address?.zip ||
    !store.address?.street ||
    !store.address?.number ||
    !store.address?.district
  )
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      emailAddress: "",
      phone: "",
      website: "",
      cnpj: "",
      address: {
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        zip: "",
        country: "BR",
        stateRegister: "",
      },
      shippingDefaults: DEFAULT_SHIPPING_DEFAULTS,
    },
  })

  // Reset form when store data loads
  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        emailAddress: store.emailAddress || "",
        phone: store.whatsappNumber || "",
        website: store.website || "",
        cnpj: store.cnpj || "",
        address: {
          street: store.address?.street || "",
          number: store.address?.number || "",
          complement: store.address?.complement || "",
          district: store.address?.district || "",
          city: store.address?.city || "",
          state: store.address?.state || "",
          zip: store.address?.zip || "",
          country: store.address?.country || "BR",
          stateRegister: store.address?.stateRegister || "",
        },
        shippingDefaults: {
          ...DEFAULT_SHIPPING_DEFAULTS,
          ...(store.shippingDefaults ?? {}),
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

  // Handle CEP typing: format, then query ViaCEP when 8 digits are reached
  // and auto-fill the address fields. Preserves any value the user already
  // typed in number/complement.
  const handleCepChange = async (value: string) => {
    const formatted = formatCepInput(value)
    form.setValue("address.zip", formatted, { shouldValidate: true })

    const digits = formatted.replace(/\D/g, "")
    if (digits.length === 8) {
      try {
        const addr = await cepLookup.mutateAsync(digits)
        if (addr.street)
          form.setValue("address.street", addr.street, { shouldValidate: true })
        if (addr.neighborhood)
          form.setValue("address.district", addr.neighborhood, { shouldValidate: true })
        if (addr.city)
          form.setValue("address.city", addr.city, { shouldValidate: true })
        if (addr.state)
          form.setValue("address.state", addr.state.toUpperCase(), { shouldValidate: true })
      } catch {
        // Silent — user can still fill fields manually
      }
    }
  }

  // Map a backend 400 error message to the relevant field path.
  // The backend returns messages like "state must be a 2-letter UF code",
  // "zip must have 8 digits", "cnpj must have 14 digits". Pattern-match on
  // the keyword so users see errors inline.
  const applyBackendError = (err: ApiError): boolean => {
    const msg = (err.message || err.error || "").toLowerCase()
    if (!msg) return false

    if (msg.includes("state") && msg.includes("uf")) {
      form.setError("address.state", { message: "UF deve ter 2 letras (ex: SP)" })
      return true
    }
    if (msg.includes("zip")) {
      form.setError("address.zip", { message: "CEP deve ter 8 dígitos" })
      return true
    }
    if (msg.includes("cnpj")) {
      form.setError("cnpj", { message: "CNPJ deve ter 14 dígitos" })
      return true
    }
    return false
  }

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      // Store info + address go to PUT /stores/me. Shipping defaults have
      // their own dedicated endpoint — hit both in parallel when the form
      // saves.
      await Promise.all([
        updateStore.mutateAsync({
          name: data.name,
          emailAddress: data.emailAddress,
          whatsappNumber: data.phone,
          website: data.website,
          cnpj: data.cnpj,
          address: {
            street: data.address.street || "",
            number: data.address.number || "",
            complement: data.address.complement || "",
            district: data.address.district || "",
            city: data.address.city || "",
            state: (data.address.state || "").toUpperCase(),
            zip: data.address.zip || "",
            country: data.address.country || "BR",
            stateRegister: data.address.stateRegister || "",
          },
        }),
        updateShippingDefaults.mutateAsync(data.shippingDefaults),
      ])
      setIsEditing(false)
      toast.success("Alterações salvas", {
        description: "As informações da loja foram atualizadas.",
      })
    } catch (err) {
      const apiErr = err as ApiError
      const mapped = applyBackendError(apiErr)
      toast.error("Erro ao salvar", {
        description: mapped
          ? "Revise os campos destacados em vermelho."
          : apiErr?.message ||
            "Não foi possível salvar as alterações. Tente novamente.",
      })
    }
  }

  const handleCancel = () => {
    if (store) {
      form.reset({
        name: store.name,
        emailAddress: store.emailAddress || "",
        phone: store.whatsappNumber || "",
        website: store.website || "",
        cnpj: store.cnpj || "",
        address: {
          street: store.address?.street || "",
          number: store.address?.number || "",
          complement: store.address?.complement || "",
          district: store.address?.district || "",
          city: store.address?.city || "",
          state: store.address?.state || "",
          zip: store.address?.zip || "",
          country: store.address?.country || "BR",
          stateRegister: store.address?.stateRegister || "",
        },
        shippingDefaults: {
          ...DEFAULT_SHIPPING_DEFAULTS,
          ...(store.shippingDefaults ?? {}),
        },
      })
    }
    setIsEditing(false)
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido", {
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF ou WebP).",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "A imagem deve ter no máximo 2MB.",
      })
      return
    }

    setIsUploadingLogo(true)
    try {
      const token = await getToken()
      if (!token) {
        throw new Error("Not authenticated")
      }

      await uploadService.uploadStoreLogo(file, token)

      // Refetch store query to refresh the data immediately
      await queryClient.refetchQueries({ queryKey: storeKeys.current() })

      toast.success("Logo atualizado", {
        description: "O logo da loja foi alterado com sucesso.",
      })
    } catch (error) {
      console.error("Failed to upload logo:", error)
      toast.error("Erro ao enviar logo", {
        description: "Não foi possível atualizar o logo. Tente novamente.",
      })
    } finally {
      setIsUploadingLogo(false)
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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
                <AvatarImage src={store?.logoUrl || undefined} alt={store?.name} className="object-contain" />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleLogoClick}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  {isUploadingLogo ? "Enviando..." : "Alterar logo"}
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
                <label className="text-sm font-medium leading-none">URL da loja</label>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone de contato</FormLabel>
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
                  <Button
                    type="submit"
                    disabled={updateStore.isPending || updateShippingDefaults.isPending}
                  >
                    {(updateStore.isPending || updateShippingDefaults.isPending) && (
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

        {/* Shipping — sender address + CNPJ + package defaults */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Envio</CardTitle>
            </div>
            <CardDescription>
              Esses dados são usados como endereço de remetente nas etiquetas
              e na cotação de frete com transportadoras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {shippingConfigIncomplete && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <strong className="font-medium">
                    Configuração incompleta para emitir frete.
                  </strong>{" "}
                  Preencha CNPJ, CEP, rua, número e bairro para que as
                  transportadoras consigam retirar os pacotes.
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Dados da empresa</h3>

              <div className="grid gap-4 sm:grid-cols-[1fr_160px_160px]">
                <FormField
                  control={form.control}
                  name="address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        CEP <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            value={field.value ?? ""}
                            onChange={(e) => handleCepChange(e.target.value)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            disabled={!isEditing}
                            placeholder="01234-567"
                            maxLength={9}
                            inputMode="numeric"
                          />
                          {cepLookup.isPending && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(formatCnpjInput(e.target.value))
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          disabled={!isEditing}
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                          inputMode="numeric"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Rua / Avenida{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="pl-9"
                            placeholder="Rua das Flores"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Número <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="123"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address.complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Apto, bloco, sala..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bairro <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="Centro"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_120px_1fr]">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cidade <span className="text-destructive">*</span>
                      </FormLabel>
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
                      <FormLabel>
                        UF <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="SP"
                          maxLength={2}
                          className="uppercase"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.stateRegister"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição estadual</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isEditing}
                          placeholder="ISENTO"
                        />
                      </FormControl>
                      <FormDescription>
                        Use &quot;ISENTO&quot; se não possuir.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Embalagem padrão</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="shippingDefaults.packageWeightGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Peso da embalagem (g)
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help text-muted-foreground">
                                ⓘ
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Somamos isso ao peso dos produtos na hora de
                              cotar. Se você envia em saco simples, deixe 0.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const raw = e.target.value
                            field.onChange(raw === "" ? 0 : parseInt(raw, 10) || 0)
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingDefaults.packageFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato padrão</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="box">Caixa</SelectItem>
                          <SelectItem value="roll">Rolo / tubo</SelectItem>
                          <SelectItem value="letter">Envelope</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <ImportFallbackDimensionsFields
                form={form}
                isEditing={isEditing}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Conta Melhor Envio</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Conecte sua conta do Melhor Envio para cotar frete no
                  checkout com Correios, Jadlog e outras transportadoras.
                </p>
              </div>

              {melhorEnvio && melhorEnvio.status === "active" ? (
                <div className="flex items-start justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        Conectado
                      </Badge>
                      {typeof melhorEnvio.metadata?.environment === "string" && (
                        <Badge variant="outline" className="uppercase">
                          {melhorEnvio.metadata.environment as string}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conectado em {formatDateTime(melhorEnvio.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      disconnectIntegration.mutate(melhorEnvio.id, {
                        onSuccess: () =>
                          toast.success("Conta Melhor Envio desconectada"),
                        onError: () =>
                          toast.error("Erro ao desconectar", {
                            description: "Tente novamente mais tarde.",
                          }),
                      })
                    }}
                    disabled={disconnectIntegration.isPending}
                  >
                    {disconnectIntegration.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Desconectando...
                      </>
                    ) : (
                      "Desconectar"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {melhorEnvio?.status === "pending_auth"
                          ? "Aguardando autorização"
                          : melhorEnvio?.status === "error"
                            ? "Erro na conexão"
                            : "Não conectado"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Você será redirecionado para autorizar o LiveCart a cotar
                      fretes usando sua conta.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      connectOAuth.mutate("melhor_envio", {
                        onError: () =>
                          toast.error("Erro ao conectar", {
                            description:
                              "Não foi possível iniciar a conexão. Tente novamente.",
                          }),
                      })
                    }}
                    disabled={connectOAuth.isPending}
                  >
                    {connectOAuth.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      "Conectar conta"
                    )}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions — same wiring as the Store info card so a user who
                scrolled past it can still edit shipping data. */}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" type="button" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateStore.isPending || updateShippingDefaults.isPending}
                  >
                    {(updateStore.isPending || updateShippingDefaults.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar alterações
                  </Button>
                </>
              ) : (
                <Button variant="outline" type="button" onClick={() => setIsEditing(true)}>
                  Editar dados de envio
                </Button>
              )}
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
          <CardContent>
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

// =============================================================================
// IMPORT FALLBACK DIMENSIONS — H/W/L used when ERP imports come weight-only
// =============================================================================

interface ImportFallbackDimensionsFieldsProps {
  form: ReturnType<typeof useForm<OrganizationFormData>>
  isEditing: boolean
}

function ImportFallbackDimensionsFields({
  form,
  isEditing,
}: ImportFallbackDimensionsFieldsProps) {
  const dims = form.watch("shippingDefaults")
  const hasAnyDim =
    dims?.heightCm !== null ||
    dims?.widthCm !== null ||
    dims?.lengthCm !== null

  const clearDims = () => {
    form.setValue("shippingDefaults.heightCm", null, { shouldValidate: true })
    form.setValue("shippingDefaults.widthCm", null, { shouldValidate: true })
    form.setValue("shippingDefaults.lengthCm", null, { shouldValidate: true })
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            Caixa padrão para importações automáticas
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Quando você importa produtos do ERP que vêm só com peso, usamos
            estas dimensões pra completar o frete sem precisar editar cada
            produto. Para camisetas dobradas, algo como 5×25×30 cm é comum.
          </p>
        </div>
        {hasAnyDim && isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs"
            onClick={clearDims}
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FallbackDimField
          control={form.control}
          name="shippingDefaults.heightCm"
          label="Altura (cm)"
          placeholder="5"
          disabled={!isEditing}
        />
        <FallbackDimField
          control={form.control}
          name="shippingDefaults.widthCm"
          label="Largura (cm)"
          placeholder="25"
          disabled={!isEditing}
        />
        <FallbackDimField
          control={form.control}
          name="shippingDefaults.lengthCm"
          label="Comprimento (cm)"
          placeholder="30"
          disabled={!isEditing}
        />
      </div>
    </div>
  )
}

interface FallbackDimFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  name: string
  label: string
  placeholder: string
  disabled: boolean
}

function FallbackDimField({
  control,
  name,
  label,
  placeholder,
  disabled,
}: FallbackDimFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === "") {
                  field.onChange(null)
                  return
                }
                const n = parseInt(raw, 10)
                field.onChange(Number.isNaN(n) ? null : n)
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
