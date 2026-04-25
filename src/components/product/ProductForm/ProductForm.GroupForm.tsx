"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  createProductGroupSchema,
  defaultProductGroupForm,
  type CreateProductGroupFormData,
} from "@/schemas/product.schema"
import { useCreateProductGroup } from "@/hooks/product-group"
import {
  ProductFormOptionsBuilder,
  type OptionDraft,
} from "./ProductForm.OptionsBuilder"
import {
  ProductFormVariantMatrix,
  type VariantDraft,
} from "./ProductForm.VariantMatrix"
import { ProductFormShippingFields } from "./ProductForm.ShippingFields"
import type { CreateProductGroupPayload } from "@/types"

interface ProductFormGroupProps {
  onCancel: () => void
  onSuccess: () => void
}

export function ProductFormGroup({ onCancel, onSuccess }: ProductFormGroupProps) {
  const createGroup = useCreateProductGroup()

  const form = useForm<CreateProductGroupFormData>({
    resolver: zodResolver(createProductGroupSchema),
    defaultValues: defaultProductGroupForm,
    mode: "onSubmit",
  })

  const options = form.watch("options")
  const variants = form.watch("variants")
  const groupImages = form.watch("groupImages") ?? []

  // Regenerate the variants array whenever options change. Existing rows are
  // preserved by combo key so user-entered prices/stocks/SKUs aren't lost when
  // a sibling value is added or removed.
  useEffect(() => {
    const next = syncVariantsToOptions(options, variants)
    if (variantsChanged(variants, next)) {
      form.setValue("variants", next, { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options.map((o) => ({ values: o.values })))])

  const optionNames = options.map((o) => o.name).filter(Boolean)

  const handleOptionsChange = (next: OptionDraft[]) => {
    form.setValue("options", next, { shouldValidate: false })
  }

  const handleVariantsChange = (next: VariantDraft[]) => {
    form.setValue("variants", next, { shouldValidate: false })
  }

  const handleAddImage = (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    form.setValue("groupImages", [...groupImages, trimmed], {
      shouldValidate: false,
    })
  }

  const handleRemoveImage = (index: number) => {
    form.setValue(
      "groupImages",
      groupImages.filter((_, i) => i !== index),
      { shouldValidate: false }
    )
  }

  const onSubmit = (data: CreateProductGroupFormData) => {
    const hasShippingDims =
      data.shipping.weightGrams != null ||
      data.shipping.heightCm != null ||
      data.shipping.widthCm != null ||
      data.shipping.lengthCm != null

    const payload: CreateProductGroupPayload = {
      name: data.name,
      ...(data.description ? { description: data.description } : {}),
      externalSource: "manual",
      options: data.options.map((o) => ({
        name: o.name.trim(),
        values: o.values,
      })),
      ...(data.groupImages && data.groupImages.length > 0
        ? { groupImages: data.groupImages }
        : {}),
      variants: data.variants.map((v) => ({
        optionValues: v.optionValues,
        price: v.price,
        stock: v.stock,
        ...(v.sku?.trim() ? { sku: v.sku.trim() } : {}),
        ...(v.imageUrl?.trim() ? { imageUrl: v.imageUrl.trim() } : {}),
        // Single shipping profile for the whole group — applied to each
        // variant on submit. Backend accepts per-variant shipping for
        // future variation, this just flattens for the v1 form.
        ...(hasShippingDims ? { shipping: data.shipping } : {}),
      })),
    }

    createGroup.mutate(payload, {
      onSuccess: (result) => {
        toast.success("Produto com variações criado", {
          description: `${result.variants.length} variantes geradas (keywords ${result.variants[0]?.keyword}–${result.variants[result.variants.length - 1]?.keyword})`,
        })
        form.reset(defaultProductGroupForm)
        onSuccess()
      },
      onError: (error) => {
        toast.error("Erro ao criar grupo de variantes", {
          description: error.message || "Tente novamente.",
        })
      },
    })
  }

  // Surface optionsBuilder errors from RHF formState.
  const optionsErrors = form.formState.errors.options
  const builderErrors = optionsErrors
    ? {
        options: options.map((_, i) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (optionsErrors as any)?.[i]?.name?.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          values: (optionsErrors as any)?.[i]?.values?.message,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: (optionsErrors as any)?.message,
      }
    : undefined

  // Variant-level errors, mapped to the matrix's expected shape.
  const variantErrors = variants.map((_, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ve = (form.formState.errors.variants as any)?.[i]
    if (!ve) return {}
    return {
      price: ve.price?.message,
      stock: ve.stock?.message,
      imageUrl: ve.imageUrl?.message,
      sku: ve.sku?.message,
    }
  })

  const isPending = createGroup.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex: Camiseta Básica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes do produto (opcional)"
                  rows={2}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <ProductFormOptionsBuilder
          options={options}
          onChange={handleOptionsChange}
          errors={builderErrors}
        />

        <Separator />

        <ProductFormVariantMatrix
          optionNames={optionNames}
          variants={variants}
          onChange={handleVariantsChange}
          errors={variantErrors}
        />

        <Separator />

        <GroupImagesField
          images={groupImages}
          onAdd={handleAddImage}
          onRemove={handleRemoveImage}
        />

        <Separator />

        <ProductFormShippingFields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form={form as any}
        />
        <p className="text-xs text-muted-foreground">
          O frete preenchido aqui será aplicado a todas as variantes. Você
          pode ajustar individualmente depois.
        </p>

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
            {isPending ? "Criando..." : "Criar grupo"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface GroupImagesFieldProps {
  images: string[]
  onAdd: (url: string) => void
  onRemove: (index: number) => void
}

function GroupImagesField({ images, onAdd, onRemove }: GroupImagesFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Galeria do produto</Label>
      <p className="text-xs text-muted-foreground">
        Imagens do grupo (foto de modelo, tabela de medidas, etc.) — opcional.
      </p>

      {images.length > 0 && (
        <ul className="space-y-1.5">
          {images.map((url, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs"
            >
              <span className="flex-1 truncate font-mono">{url}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remover imagem"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ImageUrlInput onAdd={onAdd} />
    </div>
  )
}

function ImageUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const input = e.currentTarget.elements.namedItem(
          "url"
        ) as HTMLInputElement
        if (input.value.trim()) {
          onAdd(input.value)
          input.value = ""
        }
      }}
      className="flex gap-2"
    >
      <Input
        type="url"
        name="url"
        placeholder="https://..."
        className="h-9 text-sm"
      />
      <Button type="submit" variant="outline" size="sm">
        Adicionar
      </Button>
    </form>
  )
}

// =============================================================================
// Variant <-> options sync
// =============================================================================

function cartesian(values: string[][]): string[][] {
  if (values.length === 0) return []
  if (values.some((v) => v.length === 0)) return []
  return values.reduce<string[][]>(
    (acc, vs) => acc.flatMap((combo) => vs.map((v) => [...combo, v])),
    [[]]
  )
}

function syncVariantsToOptions(
  options: OptionDraft[],
  current: VariantDraft[]
): VariantDraft[] {
  const combos = cartesian(options.map((o) => o.values))
  const existingByKey = new Map(
    current.map((v) => [v.optionValues.join("⟂"), v])
  )
  return combos.map((combo) => {
    const key = combo.join("⟂")
    const existing = existingByKey.get(key)
    if (existing) {
      // Same combination — keep user-entered values.
      return { ...existing, optionValues: combo }
    }
    return {
      optionValues: combo,
      price: 0,
      stock: 0,
      sku: "",
      imageUrl: "",
    }
  })
}

function variantsChanged(a: VariantDraft[], b: VariantDraft[]): boolean {
  if (a.length !== b.length) return true
  for (let i = 0; i < a.length; i++) {
    if (a[i].optionValues.join("⟂") !== b[i].optionValues.join("⟂")) {
      return true
    }
  }
  return false
}
