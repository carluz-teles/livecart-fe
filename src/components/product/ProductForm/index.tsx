"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
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
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductFormData,
  type UpdateProductFormData,
} from "@/schemas/product.schema"
import { useCreateProduct } from "@/hooks/product/useCreateProduct"
import { useUpdateProduct } from "@/hooks/product/useUpdateProduct"
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/types/product.types"

interface ProductFormProps {
  product?: Product
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
}

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

  const form = useForm<CreateProductFormData | UpdateProductFormData>({
    resolver: zodResolver(isEditing ? updateProductSchema : createProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      externalSource: "manual",
      externalId: "",
      ...(isEditing && { active: true }),
    },
  })

  // Reset form when product changes (for edit mode)
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
      })
    } else {
      form.reset({
        name: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        externalSource: "manual",
        externalId: "",
      })
    }
  }, [product, form])

  const externalSource = form.watch("externalSource")
  const isPending = createProduct.isPending || updateProduct.isPending

  async function onSubmit(data: CreateProductFormData | UpdateProductFormData) {
    if (isEditing) {
      const payload: UpdateProductPayload = {
        name: data.name,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || undefined,
        active: (data as UpdateProductFormData).active,
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
      }

      createProduct.mutate(payload, {
        onSuccess: () => {
          toast.success("Produto criado com sucesso!")
          form.reset()
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
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize os dados do produto."
              : "Preencha os dados do produto. A keyword será gerada automaticamente."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
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
                          value={
                            field.value > 0
                              ? (field.value / 100).toFixed(2).replace(".", ",")
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, "")
                            const normalized = value.replace(",", ".")
                            const cents = Math.round(parseFloat(normalized || "0") * 100)
                            field.onChange(isNaN(cents) ? 0 : cents)
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link direto para a imagem do produto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="externalSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Origem <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sourceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        De onde este produto foi importado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {externalSource !== "manual" && (
                  <FormField
                    control={form.control}
                    name="externalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Externo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`ID do produto no ${externalSource}`}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Identificador do produto no sistema de origem
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {isEditing && (
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
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? isEditing
                    ? "Salvando..."
                    : "Criando..."
                  : isEditing
                    ? "Salvar"
                    : "Criar Produto"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
