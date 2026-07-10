"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useCallback, forwardRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, ArrowLeft, Package, Layers, Lightbulb } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  createProductSchema,
  updateProductSchema,
  defaultShippingProfile,
  type CreateProductFormData,
  type UpdateProductFormData,
} from "@/schemas/product.schema"
import { useCreateProduct } from "@/hooks/product/useCreateProduct"
import { useUpdateProduct } from "@/hooks/product/useUpdateProduct"
import { useIntegrations } from "@/hooks/integration"
import { ProductFormERPSearch } from "./ProductForm.ERPSearch"
import { ProductFormShippingFields } from "./ProductForm.ShippingFields"
import { ProductFormGroup } from "./ProductForm.GroupForm"
import { cn } from "@/lib/utils"
import type { Product, CreateProductPayload, UpdateProductPayload, ProductSource } from "@/types/product.types"
import type { ERPProduct, Integration } from "@/types"

interface ProductFormProps {
  product?: Product
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
}

type Step = "origin" | "form"
type ProductType = "simple" | "variants"

const ERP_SOURCES: ProductSource[] = ["tiny", "bling", "shopify"]

const sourceOptions = [
  { value: "manual", label: "Manual" },
  { value: "bling", label: "Bling" },
  { value: "tiny", label: "Tiny" },
  { value: "shopify", label: "Shopify" },
]

export function ProductForm({ product, open, onOpenChange, onSuccess, trigger }: ProductFormProps) {
  const isEditing = !!product
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const { data: integrationsData } = useIntegrations()

  const [step, setStep] = useState<Step>(isEditing ? "form" : "origin")
  const [selectedSource, setSelectedSource] = useState<ProductSource>("manual")
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  // Only meaningful when source is "manual" — ERP imports always go through
  // the simple flow because the backend models the variants on its end.
  const [productType, setProductType] = useState<ProductType>("simple")

  // Get active ERP integrations
  const activeERPIntegrations = (integrationsData?.data ?? []).filter(
    (i) => i.type === "erp" && i.status === "active"
  )

  // Build source options dynamically based on active integrations
  const availableSourceOptions = sourceOptions.filter((opt) => {
    if (opt.value === "manual") return true
    return activeERPIntegrations.some((i) => i.provider === opt.value)
  })

  const form = useForm<CreateProductFormData | UpdateProductFormData>({
    resolver: zodResolver(isEditing ? updateProductSchema : createProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      externalSource: "manual",
      externalId: "",
      shipping: defaultShippingProfile,
      ...(isEditing && { active: true }),
    },
  })

  // Reset form when product changes (edit mode)
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || "",
        externalSource: product.externalSource,
        externalId: product.externalId || "",
        active: product.active,
        shipping: product.shipping ?? defaultShippingProfile,
      })
    }
  }, [product, form])

  // Reset state when sheet opens/closes
  useEffect(() => {
    if (!open && !isEditing) {
      setStep("origin")
      setSelectedSource("manual")
      setSelectedIntegration(null)
      setProductType("simple")
      form.reset({
        name: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        externalSource: "manual",
        externalId: "",
        shipping: defaultShippingProfile,
      })
    }
  }, [open, isEditing, form])

  // Auto-progress past the origin step when "manual" is the default. Radix's
  // Select doesn't fire onValueChange when the user re-picks the value that's
  // already selected, so without this the form fields never appear for the
  // most common path. We auto-skip only once per sheet-open so users with ERP
  // integrations can use the "Trocar origem" action in ManualFormStep to go
  // back without immediately bouncing to form again.
  const autoSkippedRef = useRef(false)
  useEffect(() => {
    if (!open) {
      autoSkippedRef.current = false
      return
    }
    if (
      !isEditing &&
      step === "origin" &&
      selectedSource === "manual" &&
      !autoSkippedRef.current
    ) {
      autoSkippedRef.current = true
      setStep("form")
    }
  }, [open, isEditing, step, selectedSource])

  const isPending = createProduct.isPending || updateProduct.isPending

  const handleSourceChange = useCallback(
    (value: string) => {
      const source = value as ProductSource
      setSelectedSource(source)

      if (source === "manual") {
        setSelectedIntegration(null)
        form.setValue("externalSource", "manual")
        setStep("form")
      } else {
        const integration = activeERPIntegrations.find((i) => i.provider === source)
        if (integration) {
          setSelectedIntegration(integration)
          form.setValue("externalSource", source)
        }
      }
    },
    [activeERPIntegrations, form]
  )

  const handleERPProductSelect = useCallback(
    (erpProduct: ERPProduct) => {
      // Spread ERP shipping over the defaults so anything the ERP didn't send
      // (sku, insurance) keeps its empty default — but weight + dimensions
      // come pre-filled when present. Partial ERP shipping (e.g. weight only)
      // still falls under the schema's all-or-nothing rule, so the user is
      // prompted to complete it before saving.
      const shipping = erpProduct.shipping
        ? { ...defaultShippingProfile, ...erpProduct.shipping }
        : defaultShippingProfile

      form.reset({
        name: erpProduct.name,
        price: erpProduct.price,
        stock: erpProduct.stock,
        imageUrl: erpProduct.imageUrl || "",
        externalSource: selectedSource,
        externalId: erpProduct.id,
        shipping,
      })
      setStep("form")
    },
    [form, selectedSource]
  )

  const handleBack = useCallback(() => {
    setStep("origin")
    form.reset({
      name: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      externalSource: selectedSource,
      externalId: "",
      shipping: defaultShippingProfile,
    })
  }, [form, selectedSource])

  async function onSubmit(data: CreateProductFormData | UpdateProductFormData) {
    // Backend treats shipping as all-or-nothing — sending dims as null mixed
    // with packageFormat returns 400. Omit the whole object when no dimension
    // was filled in. The schema already forbids partial dimensions.
    const hasShippingDims =
      data.shipping.weightGrams != null ||
      data.shipping.heightCm != null ||
      data.shipping.widthCm != null ||
      data.shipping.lengthCm != null

    if (isEditing) {
      const payload: UpdateProductPayload = {
        name: data.name,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || undefined,
        active: (data as UpdateProductFormData).active,
        ...(hasShippingDims ? { shipping: data.shipping } : {}),
      }

      updateProduct.mutate(
        { id: product.id, payload },
        {
          onSuccess: () => {
            toast.success("Produto atualizado com sucesso!")
            onOpenChange?.(false)
            onSuccess?.()
          },
          onError: (error) => {
            toast.error("Erro ao atualizar produto", {
              description: error.message || "Tente novamente mais tarde.",
            })
          },
        }
      )
    } else {
      const payload: CreateProductPayload = {
        name: data.name,
        price: data.price,
        stock: data.stock,
        externalSource: data.externalSource,
        imageUrl: data.imageUrl || undefined,
        externalId: data.externalId || undefined,
        ...(hasShippingDims ? { shipping: data.shipping } : {}),
      }

      createProduct.mutate(payload, {
        onSuccess: () => {
          toast.success("Produto criado com sucesso!")
          form.reset()
          setStep("origin")
          setSelectedSource("manual")
          setSelectedIntegration(null)
          onOpenChange?.(false)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error("Erro ao criar produto", {
            description: error.message || "Tente novamente mais tarde.",
          })
        },
      })
    }
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Novo Produto
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
      )}
      {/* Largura FIXA (a maior, do modo variações): alternar Simples ↔ Com
          variações não fica mais redimensionando o sheet */}
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        {isEditing ? (
          <EditView
            form={form}
            isPending={isPending}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange?.(false)}
          />
        ) : step === "origin" ? (
          <OriginStep
            selectedSource={selectedSource}
            availableSourceOptions={availableSourceOptions}
            selectedIntegration={selectedIntegration}
            onSourceChange={handleSourceChange}
            onERPProductSelect={handleERPProductSelect}
            onCancel={() => onOpenChange?.(false)}
          />
        ) : selectedSource === "manual" ? (
          <ManualFormStep
            form={form}
            productType={productType}
            onProductTypeChange={setProductType}
            isPending={isPending}
            canChangeOrigin={availableSourceOptions.length > 1}
            showERPHint={!isEditing && activeERPIntegrations.length === 0}
            onChangeOrigin={() => setStep("origin")}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange?.(false)}
            onSuccess={() => {
              onOpenChange?.(false)
              onSuccess?.()
            }}
          />
        ) : (
          <FormStep
            form={form}
            selectedSource={selectedSource}
            isPending={isPending}
            onSubmit={onSubmit}
            onBack={handleBack}
            onCancel={() => onOpenChange?.(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

// =============================================================================
// ORIGIN STEP
// =============================================================================

interface OriginStepProps {
  selectedSource: ProductSource
  availableSourceOptions: { value: string; label: string }[]
  selectedIntegration: Integration | null
  onSourceChange: (value: string) => void
  onERPProductSelect: (product: ERPProduct) => void
  onCancel: () => void
}

function OriginStep({
  selectedSource,
  availableSourceOptions,
  selectedIntegration,
  onSourceChange,
  onERPProductSelect,
  onCancel,
}: OriginStepProps) {
  const isERPSource = ERP_SOURCES.includes(selectedSource)

  return (
    <>
      <SheetHeader>
        <SheetTitle>Novo Produto</SheetTitle>
        <SheetDescription>
          Selecione a origem do produto para começar.
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Origem <span className="text-destructive">*</span>
          </label>
          <Select value={selectedSource} onValueChange={onSourceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a origem" />
            </SelectTrigger>
            <SelectContent>
              {availableSourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            De onde este produto será importado
          </p>
        </div>

        {isERPSource && selectedIntegration && (
          <>
            <Separator />
            <ProductFormERPSearch
              integrationId={selectedIntegration.id}
              onSelect={onERPProductSelect}
              onImported={onCancel}
            />
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </>
  )
}

// =============================================================================
// MANUAL FORM STEP (with type selector at top)
// =============================================================================

interface ManualFormStepProps {
  form: ReturnType<typeof useForm<CreateProductFormData | UpdateProductFormData>>
  productType: ProductType
  onProductTypeChange: (type: ProductType) => void
  isPending: boolean
  canChangeOrigin: boolean
  // Loja sem ERP ativo: mostra a dica de que importação automática existe
  showERPHint: boolean
  onChangeOrigin: () => void
  onSubmit: (data: CreateProductFormData | UpdateProductFormData) => void
  onCancel: () => void
  onSuccess: () => void
}

function ManualFormStep({
  form,
  showERPHint,
  productType,
  onProductTypeChange,
  isPending,
  canChangeOrigin,
  onChangeOrigin,
  onSubmit,
  onCancel,
  onSuccess,
}: ManualFormStepProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Novo Produto</SheetTitle>
        <SheetDescription>
          {productType === "simple"
            ? "Preencha os dados do produto. A keyword será gerada automaticamente."
            : "Defina as opções (cor, tamanho, etc.) e gere as variantes em uma só tela."}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {showERPHint && (
          <div className="flex items-start gap-2.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">Importação automática:</strong> conecte seu
              ERP (Tiny) pra importar produtos com preço e estoque direto de lá.{" "}
              <Link
                href="/settings/integrations"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Conectar integração
              </Link>
            </span>
          </div>
        )}
        {canChangeOrigin && (
          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Origem: <strong className="text-foreground">Manual</strong>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={onChangeOrigin}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Trocar origem
            </Button>
          </div>
        )}

        <ProductTypeSelector value={productType} onChange={onProductTypeChange} />

        {productType === "simple" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <ProductFormFields form={form} />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Criando..." : "Criar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <ProductFormGroup onCancel={onCancel} onSuccess={onSuccess} />
        )}
      </div>
    </>
  )
}

interface ProductTypeSelectorProps {
  value: ProductType
  onChange: (type: ProductType) => void
}

function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <TypeOption
        active={value === "simple"}
        icon={<Package className="h-4 w-4" />}
        title="Simples"
        description="Um único SKU vendável"
        onClick={() => onChange("simple")}
      />
      <TypeOption
        active={value === "variants"}
        icon={<Layers className="h-4 w-4" />}
        title="Com variações"
        description="Cor, tamanho, etc."
        onClick={() => onChange("variants")}
      />
    </div>
  )
}

interface TypeOptionProps {
  active: boolean
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}

function TypeOption({ active, icon, title, description, onClick }: TypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "hover:border-foreground/20 hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
          active ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  )
}

// =============================================================================
// FORM STEP
// =============================================================================

interface FormStepProps {
  form: ReturnType<typeof useForm<CreateProductFormData | UpdateProductFormData>>
  selectedSource: ProductSource
  isPending: boolean
  onSubmit: (data: CreateProductFormData | UpdateProductFormData) => void
  onBack?: () => void
  onCancel: () => void
}

function FormStep({ form, selectedSource, isPending, onSubmit, onBack, onCancel }: FormStepProps) {
  const isFromERP = ERP_SOURCES.includes(selectedSource)

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <SheetTitle>Novo Produto</SheetTitle>
            <SheetDescription>
              {isFromERP
                ? "Revise os dados importados e ajuste se necessário."
                : "Preencha os dados do produto. A keyword será gerada automaticamente."}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <ProductFormFields form={form} />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Criando..." : "Criar Produto"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

// =============================================================================
// EDIT VIEW
// =============================================================================

interface EditViewProps {
  form: ReturnType<typeof useForm<CreateProductFormData | UpdateProductFormData>>
  isPending: boolean
  onSubmit: (data: CreateProductFormData | UpdateProductFormData) => void
  onCancel: () => void
}

function EditView({ form, isPending, onSubmit, onCancel }: EditViewProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Editar Produto</SheetTitle>
        <SheetDescription>Atualize os dados do produto.</SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <ProductFormFields form={form} />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Produto ativo</FormLabel>
                  <FormDescription>
                    Produtos inativos não aparecem para compra
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

// =============================================================================
// SHARED FORM FIELDS
// =============================================================================

interface ProductFormFieldsProps {
  form: ReturnType<typeof useForm<CreateProductFormData | UpdateProductFormData>>
}

function ProductFormFields({ form }: ProductFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nome <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: Camiseta Básica Preta" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <CurrencyInput
              value={field.value as number}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Estoque <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => {
          // Produto importado do ERP: a imagem vem de lá — mostra a imagem em
          // si, sem campo de URL editável
          const isImported = form.watch("externalSource") !== "manual"
          if (isImported) {
            return (
              <FormItem>
                <FormLabel>Imagem do produto</FormLabel>
                {field.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={field.value}
                    alt="Imagem do produto importado"
                    className="h-28 w-28 rounded-lg border object-cover"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    O produto importado não tem imagem cadastrada no ERP.
                  </p>
                )}
                <FormDescription>Importada do ERP — gerencie a imagem por lá.</FormDescription>
              </FormItem>
            )
          }
          return (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>Link direto para a imagem do produto</FormDescription>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      <ProductFormShippingFields form={form} />
    </>
  )
}

// =============================================================================
// CURRENCY INPUT
// =============================================================================

interface CurrencyInputProps {
  value: number
  onChange: (cents: number) => void
  onBlur: () => void
  name: string
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, onBlur, name }, ref) {
    const [displayValue, setDisplayValue] = useState(() =>
      value > 0 ? (value / 100).toFixed(2).replace(".", ",") : ""
    )

    // Sync display when form resets (e.g. ERP product select)
    const [prevValue, setPrevValue] = useState(value)
    if (value !== prevValue) {
      setPrevValue(value)
      setDisplayValue(value > 0 ? (value / 100).toFixed(2).replace(".", ",") : "")
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/[^\d,]/g, "")

      // Allow only one comma
      const parts = raw.split(",")
      const sanitized = parts.length > 2
        ? parts[0] + "," + parts.slice(1).join("")
        : raw

      // Limit decimal places to 2
      const [integer, decimal] = sanitized.split(",")
      const limited = decimal !== undefined
        ? integer + "," + decimal.slice(0, 2)
        : sanitized

      setDisplayValue(limited)

      const normalized = limited.replace(",", ".")
      const cents = Math.round(parseFloat(normalized || "0") * 100)
      onChange(isNaN(cents) ? 0 : cents)
    }

    function handleBlur() {
      if (displayValue) {
        const normalized = displayValue.replace(",", ".")
        const num = parseFloat(normalized)
        if (!isNaN(num) && num > 0) {
          setDisplayValue(num.toFixed(2).replace(".", ","))
        } else {
          setDisplayValue("")
        }
      }
      onBlur()
    }

    return (
      <FormItem>
        <FormLabel>
          Preço <span className="text-destructive">*</span>
        </FormLabel>
        <FormControl>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className="pl-10"
              value={displayValue}
              onChange={handleChange}
              onBlur={handleBlur}
              name={name}
              ref={ref}
            />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )
  }
)
